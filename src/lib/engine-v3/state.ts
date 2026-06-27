import { nanoid } from "nanoid";
import type {
  CampaignCompletionData,
  DeathId,
  DeathRecord,
  DynastyRecord,
  EraId,
  EraStateConfig,
  GameResult,
  GameState,
  Legacy,
  GameMode,
  StateTrackId,
  TerminalOutcomeSeed,
} from "@/lib/engine-v3/event.schema";

export const QUEEN_STATE_CONFIG: EraStateConfig = {
  era: "queen",
  startYear: 1560,
  targetRoundsForVictory: 30,
  tracks: [
    {
      id: "nobility",
      label: "Nobility",
      initial: 50,
      min: 0,
      max: 100,
      lowDeathAt: 0,
      highDeathAt: 100,
      lowDeathId: "queen_noble_revolt",
      highDeathId: "queen_aristocratic_coup",
    },
    {
      id: "people",
      label: "People",
      initial: 50,
      min: 0,
      max: 100,
      lowDeathAt: 0,
      highDeathAt: 100,
      lowDeathId: "queen_popular_uprising",
      highDeathId: "queen_mob_rule",
    },
    {
      id: "army",
      label: "Army",
      initial: 50,
      min: 0,
      max: 100,
      lowDeathAt: 0,
      highDeathAt: 100,
      lowDeathId: "queen_foreign_occupation",
      highDeathId: "queen_military_regency",
    },
    {
      id: "treasury",
      label: "Treasury",
      initial: 50,
      min: 0,
      max: 100,
      lowDeathAt: 0,
      highDeathAt: 100,
      lowDeathId: "queen_bankruptcy",
      highDeathId: "queen_merchant_oligarchy",
    },
  ],
};

export const NAPOLEON_STATE_CONFIG: EraStateConfig = {
  era: "napoleon",
  startYear: 1796,
  targetRoundsForVictory: 30,
  tracks: [
    {
      id: "army",
      label: "Army",
      initial: 55,
      min: 0,
      max: 100,
      lowDeathAt: 0,
      highDeathAt: 100,
      lowDeathId: "napoleon_army_mutiny",
      highDeathId: "napoleon_marshal_coup",
    },
    {
      id: "treasury",
      label: "Treasury",
      initial: 45,
      min: 0,
      max: 100,
      lowDeathAt: 0,
      highDeathAt: 100,
      lowDeathId: "napoleon_state_bankruptcy",
      highDeathId: "napoleon_profiteer_capture",
    },
    {
      id: "diplomacy",
      label: "Diplomacy",
      initial: 45,
      min: 0,
      max: 100,
      lowDeathAt: 0,
      highDeathAt: 100,
      lowDeathId: "napoleon_coalition_invasion",
      highDeathId: "napoleon_puppet_emperor",
    },
    {
      id: "publicSupport",
      label: "Public Support",
      initial: 50,
      min: 0,
      max: 100,
      lowDeathAt: 0,
      highDeathAt: 100,
      lowDeathId: "napoleon_public_abdication",
      highDeathId: "napoleon_populist_cult",
    },
  ],
};

const ERA_CONFIGS: Record<EraId, EraStateConfig> = {
  queen: QUEEN_STATE_CONFIG,
  napoleon: NAPOLEON_STATE_CONFIG,
};

const DEATH_LABELS: Record<DeathId, string> = {
  queen_noble_revolt: "Noble Revolt",
  queen_aristocratic_coup: "Aristocratic Coup",
  queen_popular_uprising: "Popular Uprising",
  queen_mob_rule: "Mob Rule",
  queen_foreign_occupation: "Foreign Occupation",
  queen_military_regency: "Military Regency",
  queen_bankruptcy: "Bankruptcy",
  queen_merchant_oligarchy: "Merchant Oligarchy",
  napoleon_army_mutiny: "Army Mutiny",
  napoleon_marshal_coup: "Marshal Coup",
  napoleon_state_bankruptcy: "State Bankruptcy",
  napoleon_profiteer_capture: "Profiteer Capture",
  napoleon_coalition_invasion: "Coalition Invasion",
  napoleon_puppet_emperor: "Puppet Emperor",
  napoleon_public_abdication: "Public Abdication",
  napoleon_populist_cult: "Populist Cult",
  scripted_death: "Scripted Death",
};

const DEATH_EPITAPHS: Partial<Record<DeathId, string>> = {
  queen_bankruptcy: "{{rulerName}} spent the crown into silence.",
  napoleon_army_mutiny: "{{rulerName}} heard the army choose another future.",
  scripted_death: "{{rulerName}} vanished into a disputed chronicle.",
};

export interface CreateInitialGameStateInput {
  era: EraId;
  rulerName: string;
  runId?: string;
  now?: Date;
  inheritedLegacies?: Legacy[];
  llmCallsThisRun?: number;
  mode?: GameMode;
  fatesDiscovered?: string[];
  isPaid?: boolean;
  campaignNumber?: number;
  campaignStartGen?: number;
  isUnlimitedPaid?: boolean;
}

export function getEraStateConfig(era: EraId): EraStateConfig {
  return ERA_CONFIGS[era];
}

export function createInitialGameState(input: CreateInitialGameStateInput): GameState {
  const now = input.now ?? new Date();
  const config = getEraStateConfig(input.era);
  const baseBars = Object.fromEntries(
    config.tracks.map((track) => [track.id, track.initial]),
  ) as Partial<Record<StateTrackId, number>>;
  const bars = (input.inheritedLegacies ?? []).reduce(
    (current, legacy) => applyDelta(current, legacy.statBias ?? {}, input.era),
    baseBars,
  );

  return {
    runId: input.runId ?? `engine-v3-${nanoid()}`,
    era: input.era,
    rulerName: input.rulerName,
    generation: 1,
    phase: "active",
    round: 0,
    year: config.startYear,
    startedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    mode: input.mode ?? (input.isPaid ? "freeplay" : "scripted"),
    fatesDiscovered: input.fatesDiscovered ?? [],
    isPaid: input.isPaid ?? false,
    campaignNumber: input.campaignNumber ?? 1,
    campaignStartGen: input.campaignStartGen ?? 1,
    isUnlimitedPaid: input.isUnlimitedPaid ?? false,
    bars,
    highestBars: { ...bars },
    lowestBars: { ...bars },
    occurredEventIds: [],
    lastEventTags: [],
    cooldowns: { events: {}, tags: {} },
    flags: [],
    inheritedLegacies: input.inheritedLegacies ?? [],
    pendingLegacies: [],
    dynastyRecords: [],
    keyChoices: [],
    llmCallsThisRun: input.llmCallsThisRun ?? 0,
  };
}

export function evaluateTerminalOutcome(gameState: GameState, now: Date = new Date()): GameResult {
  void now;
  const config = getEraStateConfig(gameState.era);

  for (const track of config.tracks) {
    const value = gameState.bars[track.id] ?? track.initial;
    if (value <= track.lowDeathAt) {
      return {
        type: "death",
        terminalId: track.lowDeathId,
        death: buildDeathRecord(track.lowDeathId, track.id, "too_low", gameState),
      };
    }
    if (value >= track.highDeathAt) {
      return {
        type: "death",
        terminalId: track.highDeathId,
        death: buildDeathRecord(track.highDeathId, track.id, "too_high", gameState),
      };
    }
  }

  if (gameState.round >= config.targetRoundsForVictory) {
    return { type: "victory", terminalId: `${gameState.era}_stable_reign` };
  }

  return { type: "continue" };
}

export function outcomeFromForcedSeed(
  seed: TerminalOutcomeSeed,
  gameState: GameState,
  now: Date,
): GameResult {
  void now;
  if (seed.type === "death") {
    return {
      type: "death",
      terminalId: seed.id,
      death: buildDeathRecord(seed.id as DeathId, undefined, "forced", gameState),
    };
  }

  return { type: seed.type, terminalId: seed.id };
}

export function buildDynastyRecord(
  state: GameState,
  result: GameResult,
  now: Date = new Date(),
): DynastyRecord {
  if (result.type === "continue") {
    throw new Error("Cannot build a dynasty record for a continuing run");
  }

  const startYear = state.year - state.round;
  return {
    id: `dynasty-${state.generation}-${result.terminalId ?? result.type}-${now.getTime()}`,
    generation: state.generation,
    rulerName: state.rulerName,
    era: state.era,
    startYear,
    endYear: state.year,
    rulingYears: Math.max(0, state.year - startYear),
    terminalType: result.type,
    terminalId: result.terminalId ?? result.type,
    death: result.death,
    highestBars: { ...state.highestBars },
    lowestBars: { ...state.lowestBars },
    keyChoices: [...state.keyChoices],
    inheritedLegacies: [...state.inheritedLegacies],
    gainedLegacies: [...state.pendingLegacies],
    createdAt: now.toISOString(),
  };
}

export function createNextGenerationState(
  terminalState: GameState,
  record: DynastyRecord,
  now: Date = new Date(),
): GameState {
  const config = getEraStateConfig(terminalState.era);
  const inherited = decayLegacies([
    ...terminalState.inheritedLegacies,
    ...terminalState.pendingLegacies,
    ...legacyFromTerminal(record),
  ]);
  const baseBars = Object.fromEntries(
    config.tracks.map((track) => [track.id, track.initial]),
  ) as Partial<Record<StateTrackId, number>>;
  const bars = inherited.reduce(
    (current, legacy) => applyDelta(current, legacy.statBias ?? {}, terminalState.era),
    baseBars,
  );

  return {
    runId: terminalState.runId,
    era: terminalState.era,
    rulerName: terminalState.rulerName,
    generation: terminalState.generation + 1,
    phase: "active",
    round: 0,
    year: terminalState.year + 1,
    startedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    mode: terminalState.isPaid ? "freeplay" : "scripted",
    fatesDiscovered: [...terminalState.fatesDiscovered],
    isPaid: terminalState.isPaid,
    campaignNumber: terminalState.campaignNumber,
    campaignStartGen: terminalState.campaignStartGen,
    isUnlimitedPaid: terminalState.isUnlimitedPaid,
    bars,
    highestBars: { ...bars },
    lowestBars: { ...bars },
    occurredEventIds: [],
    lastEventTags: [],
    cooldowns: { events: {}, tags: {} },
    flags: [],
    inheritedLegacies: inherited,
    pendingLegacies: [],
    dynastyRecords: [...terminalState.dynastyRecords, record],
    keyChoices: [],
    llmCallsThisRun: 0,
  };
}

export function applyDelta(
  bars: Partial<Record<StateTrackId, number>>,
  delta: Partial<Record<StateTrackId, number>>,
  era?: EraId,
): Partial<Record<StateTrackId, number>> {
  const next = { ...bars };
  const config = era ? getEraStateConfig(era) : undefined;
  for (const [track, amount] of Object.entries(delta) as [StateTrackId, number][]) {
    const trackConfig = config?.tracks.find((candidate) => candidate.id === track);
    const min = trackConfig?.min ?? 0;
    const max = trackConfig?.max ?? 100;
    next[track] = Math.min(max, Math.max(min, (next[track] ?? 0) + amount));
  }
  return next;
}

export function mergeHighs(
  previous: Partial<Record<StateTrackId, number>>,
  current: Partial<Record<StateTrackId, number>>,
): Partial<Record<StateTrackId, number>> {
  const next = { ...previous };
  for (const [track, value] of Object.entries(current) as [StateTrackId, number][]) {
    next[track] = Math.max(next[track] ?? value, value);
  }
  return next;
}

export function mergeLows(
  previous: Partial<Record<StateTrackId, number>>,
  current: Partial<Record<StateTrackId, number>>,
): Partial<Record<StateTrackId, number>> {
  const next = { ...previous };
  for (const [track, value] of Object.entries(current) as [StateTrackId, number][]) {
    next[track] = Math.min(next[track] ?? value, value);
  }
  return next;
}

export function isCampaignComplete(
  state: GameState,
  result: Pick<GameResult, "type">,
): boolean {
  if (result.type === "victory") {
    return true;
  }

  const campaignStartGen = state.campaignStartGen ?? 1;
  const campaignGenerations = state.generation - campaignStartGen + 1;
  return campaignGenerations >= 8;
}

export function buildCampaignCompletionData(
  state: GameState,
  dynastyRecords: DynastyRecord[],
): CampaignCompletionData {
  const nonEmptyRecords =
    dynastyRecords.length > 0
      ? dynastyRecords
      : [
          buildDynastyRecord(
            state,
            { type: "special", terminalId: `${state.era}_campaign_complete` },
            new Date(state.updatedAt),
          ),
        ];
  const longest = nonEmptyRecords.reduce((best, record) =>
    record.rulingYears > best.rulingYears ? record : best,
  );
  const shortest = nonEmptyRecords.reduce((best, record) =>
    record.rulingYears < best.rulingYears ? record : best,
  );

  return {
    dynastyRecords: nonEmptyRecords,
    fatesDiscovered: [...state.fatesDiscovered],
    totalGenerations: nonEmptyRecords.length,
    longestReign: {
      rulerName: longest.rulerName,
      years: longest.rulingYears,
    },
    shortestReign: {
      rulerName: shortest.rulerName,
      years: shortest.rulingYears,
    },
    campaignNumber: state.campaignNumber,
  };
}

function buildDeathRecord(
  id: DeathId,
  causeTrack: StateTrackId | undefined,
  direction: DeathRecord["direction"],
  gameState: GameState,
): DeathRecord {
  return {
    id,
    label: DEATH_LABELS[id] ?? id,
    causeTrack,
    direction,
    round: gameState.round,
    year: gameState.year,
    epitaphTemplate: DEATH_EPITAPHS[id] ?? "{{rulerName}} vanished into a disputed chronicle.",
  };
}

function decayLegacies(legacies: Legacy[]): Legacy[] {
  return legacies
    .map((legacy) => ({
      ...legacy,
      remainingGenerations:
        legacy.remainingGenerations === undefined ? undefined : legacy.remainingGenerations - 1,
    }))
    .filter((legacy) => legacy.remainingGenerations === undefined || legacy.remainingGenerations > 0);
}

function legacyFromTerminal(record: DynastyRecord): Legacy[] {
  if (!record.death) return [];

  return [
    {
      id: `legacy_${record.death.id}`,
      label: record.death.label,
      description: `The next ruler inherits the shadow of ${record.death.label}.`,
      gainedAtGeneration: record.generation,
      remainingGenerations: 2,
      statBias: record.death.causeTrack
        ? { [record.death.causeTrack]: record.death.direction === "too_high" ? -6 : 6 }
        : {},
    },
  ];
}
