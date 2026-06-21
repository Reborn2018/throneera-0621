import { describe, expect, it } from "vitest";
import { createMemoryStore } from "@/lib/adapters/local-store";
import {
  createReplayRun,
  createRestoreToken,
  createRun,
  restoreRunFromToken,
  submitChoice,
  submitIdentity,
} from "@/lib/engine/runs";

const fixedNow = () => new Date("2026-06-21T00:00:00.000Z");

describe("run engine", () => {
  it("creates a new identity-stage run for a simulator", async () => {
    const store = createMemoryStore();

    const run = await createRun({
      store,
      simulator: "queen",
      runId: "run-1",
      now: fixedNow,
    });

    expect(run).toMatchObject({
      id: "run-1",
      simulator: "queen",
      status: "identity",
      currentSceneId: "identity",
    });
    expect(await store.getRun("run-1")).toMatchObject({ id: "run-1" });
  });

  it("submits identity and moves to the first prologue scene", async () => {
    const store = createMemoryStore();
    await createRun({ store, simulator: "queen", runId: "run-1", now: fixedNow });

    const run = await submitIdentity({
      store,
      runId: "run-1",
      name: "Aurelia",
      dispositionId: "cunning",
      originId: "exile",
      now: fixedNow,
    });

    expect(run).toMatchObject({
      status: "prologue",
      currentSceneId: "oath",
      identity: {
        name: "Aurelia",
        dispositionId: "cunning",
        originId: "exile",
      },
    });
  });

  it("advances through the free prologue and stops at the paywall", async () => {
    const store = createMemoryStore();
    await createRun({ store, simulator: "queen", runId: "run-1", now: fixedNow });
    await submitIdentity({
      store,
      runId: "run-1",
      name: "Aurelia",
      dispositionId: "merciful",
      originId: "heir",
      now: fixedNow,
    });

    for (const choiceId of [
      "protect",
      "trial",
      "read-note",
      "take-letter",
      "face-dawn",
    ]) {
      await submitChoice({ store, runId: "run-1", choiceId, now: fixedNow });
    }

    expect(await store.getRun("run-1")).toMatchObject({
      status: "paywalled",
      currentSceneId: "crown-in-peril",
    });
  });

  it("prevents paid scene progression without an active paid run", async () => {
    const store = createMemoryStore();
    await createRun({ store, simulator: "queen", runId: "run-1", now: fixedNow });
    await store.updateRun("run-1", (run) => ({
      ...run,
      status: "paywalled",
      currentSceneId: "war-council",
    }));

    await expect(
      submitChoice({ store, runId: "run-1", choiceId: "hold", now: fixedNow }),
    ).rejects.toThrow("Run requires payment");
  });

  it("advances paid scenes and completes at the final paid choice", async () => {
    const store = createMemoryStore();
    await createRun({ store, simulator: "queen", runId: "run-1", now: fixedNow });
    await store.updateRun("run-1", (run) => ({
      ...run,
      status: "paid",
      currentSceneId: "war-council",
      paidAt: fixedNow().toISOString(),
    }));

    for (const choiceId of ["hold", "open", "show-court", "corridor", "plate", "judgment"]) {
      await submitChoice({ store, runId: "run-1", choiceId, now: fixedNow });
    }

    expect(await store.getRun("run-1")).toMatchObject({
      status: "completed",
      currentSceneId: "traitors-name",
      completedAt: fixedNow().toISOString(),
    });
  });

  it("creates replay as a separate unpaid run", async () => {
    const store = createMemoryStore();
    await createRun({ store, simulator: "queen", runId: "run-1", now: fixedNow });
    await store.updateRun("run-1", (run) => ({
      ...run,
      status: "completed",
      completedAt: fixedNow().toISOString(),
    }));

    const replay = await createReplayRun({
      store,
      sourceRunId: "run-1",
      runId: "run-2",
      now: fixedNow,
    });

    expect(replay).toMatchObject({
      id: "run-2",
      simulator: "queen",
      status: "identity",
      runType: "replay",
      sourceRunId: "run-1",
    });
  });

  it("restores a run from an unexpired one-time token", async () => {
    const store = createMemoryStore();
    await createRun({ store, simulator: "queen", runId: "run-1", now: fixedNow });

    const token = await createRestoreToken({
      store,
      runId: "run-1",
      token: "plain-token",
      now: fixedNow,
      expiresInMinutes: 10,
    });

    expect(token).toBe("plain-token");
    expect(await restoreRunFromToken({ store, token: "plain-token", now: fixedNow })).toMatchObject({
      id: "run-1",
    });
    await expect(
      restoreRunFromToken({ store, token: "plain-token", now: fixedNow }),
    ).rejects.toThrow("Restore token has already been used");
  });

  it("rejects expired restore tokens", async () => {
    const store = createMemoryStore();
    await createRun({ store, simulator: "queen", runId: "run-1", now: fixedNow });
    await createRestoreToken({
      store,
      runId: "run-1",
      token: "expired-token",
      now: fixedNow,
      expiresInMinutes: 10,
    });

    await expect(
      restoreRunFromToken({
        store,
        token: "expired-token",
        now: () => new Date("2026-06-21T00:11:00.000Z"),
      }),
    ).rejects.toThrow("Restore token has expired");
  });
});
