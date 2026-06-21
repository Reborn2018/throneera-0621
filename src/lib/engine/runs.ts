import { nanoid } from "nanoid";
import type { RunStore } from "@/lib/adapters/store";
import { addMinutes, hashRestoreToken } from "@/lib/engine/restore";
import { findChoice, getCurrentScene, getNextScene } from "@/lib/engine/scenes";
import { getSimulatorConfig } from "@/lib/simulators";
import type {
  RealmState,
  RestoreTokenRecord,
  RunDecision,
  RunRecord,
  SimulatorSlug,
} from "@/lib/types";

type Clock = () => Date;

interface EngineOptions {
  store: RunStore;
  now?: Clock;
}

interface CreateRunOptions extends EngineOptions {
  simulator: SimulatorSlug;
  runId?: string;
  runType?: RunRecord["runType"];
  sourceRunId?: string;
}

interface SubmitIdentityOptions extends EngineOptions {
  runId: string;
  name: string;
  dispositionId: string;
  originId: string;
}

interface SubmitChoiceOptions extends EngineOptions {
  runId: string;
  choiceId: string;
}

interface CreateReplayOptions extends EngineOptions {
  sourceRunId: string;
  runId?: string;
}

interface CreateRestoreTokenOptions extends EngineOptions {
  runId: string;
  token?: string;
  expiresInMinutes: number;
}

interface RestoreRunOptions extends EngineOptions {
  token: string;
}

const defaultNow: Clock = () => new Date();

export async function createRun(options: CreateRunOptions): Promise<RunRecord> {
  const now = (options.now ?? defaultNow)().toISOString();
  const config = getSimulatorConfig(options.simulator);
  const run: RunRecord = {
    id: options.runId ?? nanoid(),
    simulator: options.simulator,
    status: "identity",
    currentSceneId: "identity",
    runType: options.runType ?? "first_campaign",
    sourceRunId: options.sourceRunId,
    identity: {
      name: config.identity.defaultName,
      dispositionId: config.identity.dispositions[0]?.id ?? "default",
      originId: config.identity.origins[0]?.id ?? "default",
    },
    realm: { ...config.initialRealm },
    decisions: [],
    createdAt: now,
    updatedAt: now,
  };

  await options.store.saveRun(run);
  return run;
}

export async function submitIdentity(options: SubmitIdentityOptions): Promise<RunRecord> {
  const run = await requireRun(options.store, options.runId);
  const config = getSimulatorConfig(run.simulator);
  const disposition = config.identity.dispositions.find(
    (candidate) => candidate.id === options.dispositionId,
  );
  const origin = config.identity.origins.find((candidate) => candidate.id === options.originId);

  if (!disposition) {
    throw new Error(`Disposition not found: ${options.dispositionId}`);
  }

  if (!origin) {
    throw new Error(`Origin not found: ${options.originId}`);
  }

  const firstScene = config.prologueScenes[0];
  if (!firstScene) {
    throw new Error(`Simulator has no prologue scenes: ${run.simulator}`);
  }

  return options.store.updateRun(options.runId, (current) => ({
    ...current,
    status: "prologue",
    currentSceneId: firstScene.id,
    identity: {
      name: options.name.trim() || config.identity.defaultName,
      dispositionId: disposition.id,
      originId: origin.id,
    },
    updatedAt: (options.now ?? defaultNow)().toISOString(),
  }));
}

export async function submitChoice(options: SubmitChoiceOptions): Promise<RunRecord> {
  const run = await requireRun(options.store, options.runId);

  if (run.status === "identity") {
    throw new Error("Run requires identity");
  }

  if (run.status === "paywalled" || run.status === "checkout_pending") {
    throw new Error("Run requires payment");
  }

  if (run.status !== "prologue" && run.status !== "paid") {
    throw new Error(`Run is not accepting choices: ${run.status}`);
  }

  const scene = getCurrentScene(run);
  if (!scene) {
    throw new Error(`Scene not found: ${run.currentSceneId}`);
  }

  const choice = findChoice(scene, options.choiceId);
  const now = (options.now ?? defaultNow)().toISOString();
  const nextScene = getNextScene(run, scene);
  const decision: RunDecision = {
    sceneId: scene.id,
    choiceId: choice.id,
    intent: choice.intent,
    label: choice.label,
    createdAt: now,
  };

  const nextRealm = applyRealmDelta(run.realm, choice.delta ?? {});

  return options.store.updateRun(options.runId, (current) => ({
    ...current,
    status: nextStatus(current.status, nextScene),
    currentSceneId: nextScene?.id ?? scene.id,
    realm: nextRealm,
    decisions: [...current.decisions, decision],
    updatedAt: now,
    completedAt:
      current.status === "paid" && !nextScene ? now : current.completedAt,
  }));
}

export async function createReplayRun(options: CreateReplayOptions): Promise<RunRecord> {
  const sourceRun = await requireRun(options.store, options.sourceRunId);
  if (sourceRun.status !== "completed") {
    throw new Error("Replay requires a completed source run");
  }

  return createRun({
    store: options.store,
    simulator: sourceRun.simulator,
    runId: options.runId,
    runType: "replay",
    sourceRunId: sourceRun.id,
    now: options.now,
  });
}

export async function createRestoreToken(options: CreateRestoreTokenOptions): Promise<string> {
  const run = await requireRun(options.store, options.runId);
  const now = options.now ?? defaultNow;
  const token = options.token ?? nanoid(32);
  const createdAt = now();
  const record: RestoreTokenRecord = {
    id: nanoid(),
    runId: run.id,
    tokenHash: hashRestoreToken(token),
    expiresAt: addMinutes(createdAt, options.expiresInMinutes).toISOString(),
    createdAt: createdAt.toISOString(),
  };

  await options.store.saveRestoreToken(record);
  return token;
}

export async function restoreRunFromToken(options: RestoreRunOptions): Promise<RunRecord> {
  const now = options.now ?? defaultNow;
  const token = await options.store.getRestoreTokenByHash(hashRestoreToken(options.token));

  if (!token) {
    throw new Error("Restore token not found");
  }

  if (token.usedAt) {
    throw new Error("Restore token has already been used");
  }

  if (new Date(token.expiresAt).getTime() <= now().getTime()) {
    throw new Error("Restore token has expired");
  }

  await options.store.updateRestoreToken(token.id, (current) => ({
    ...current,
    usedAt: now().toISOString(),
  }));

  return requireRun(options.store, token.runId);
}

function nextStatus(status: RunRecord["status"], nextScene: unknown): RunRecord["status"] {
  if (status === "prologue" && !nextScene) {
    return "paywalled";
  }

  if (status === "paid" && !nextScene) {
    return "completed";
  }

  return status;
}

function applyRealmDelta(realm: RealmState, delta: Partial<RealmState>): RealmState {
  return {
    legitimacy: clamp(realm.legitimacy + (delta.legitimacy ?? 0)),
    treasury: clamp(realm.treasury + (delta.treasury ?? 0)),
    military: clamp(realm.military + (delta.military ?? 0)),
    publicSupport: clamp(realm.publicSupport + (delta.publicSupport ?? 0)),
  };
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

async function requireRun(store: RunStore, runId: string): Promise<RunRecord> {
  const run = await store.getRun(runId);
  if (!run) {
    throw new Error(`Run not found: ${runId}`);
  }

  return run;
}
