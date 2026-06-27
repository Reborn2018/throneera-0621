import type {
  ApplyChoiceResult,
  CooldownState,
  EngineEvent,
  EventTag,
  GameState,
  KeyChoiceRecord,
  Legacy,
  LegacySeed,
  StateTrackId,
} from "@/lib/engine-v3/event.schema";
import {
  applyDelta,
  buildDynastyRecord,
  createNextGenerationState,
  evaluateTerminalOutcome,
  mergeHighs,
  mergeLows,
  outcomeFromForcedSeed,
} from "@/lib/engine-v3/state";

export function applyChoice(
  gameState: GameState,
  event: EngineEvent,
  choiceIndex: number,
  now: Date = new Date(),
): ApplyChoiceResult {
  if (gameState.phase !== "active") {
    throw new Error("Cannot apply a choice to a terminal game state");
  }
  if (event.era !== gameState.era) {
    throw new Error(`Event ${event.id} does not belong to era ${gameState.era}`);
  }

  const choice = event.choices[choiceIndex];
  if (!choice) {
    throw new Error(`Choice index out of range: ${choiceIndex}`);
  }

  const effect = event.effects[choice.id];
  if (!effect) {
    throw new Error(`Effect missing for choice ${choice.id}`);
  }

  const bars = applyDelta(gameState.bars, effect.delta, gameState.era);
  const round = gameState.round + 1;
  const year = gameState.year + 1;
  const nextFlags = applyFlags(gameState.flags, effect.addFlags, effect.removeFlags);
  const nextPendingLegacies = effect.addLegacy
    ? [...gameState.pendingLegacies, toLegacy(effect.addLegacy, gameState.generation)]
    : [...gameState.pendingLegacies];
  const nextKeyChoices = effect.keyChoice
    ? [...gameState.keyChoices, buildKeyChoiceRecord(round, event.id, choice.id, choice.labelTemplate, choice.intent, bars)]
    : [...gameState.keyChoices];

  const advancedState: GameState = {
    ...gameState,
    round,
    year,
    updatedAt: now.toISOString(),
    bars,
    highestBars: mergeHighs(gameState.highestBars, bars),
    lowestBars: mergeLows(gameState.lowestBars, bars),
    occurredEventIds: [...gameState.occurredEventIds, event.id],
    lastEventId: event.id,
    lastEventTags: event.tags,
    cooldowns: applyCooldown(tickCooldowns(gameState.cooldowns), event),
    flags: nextFlags,
    pendingLegacies: nextPendingLegacies,
    keyChoices: nextKeyChoices,
  };

  const forced = effect.forceOutcome ? outcomeFromForcedSeed(effect.forceOutcome, advancedState, now) : null;
  const evaluated = forced ?? evaluateTerminalOutcome(advancedState, now);

  if (evaluated.type === "continue") {
    return {
      gameState: advancedState,
      result: { type: "continue" },
    };
  }

  const terminalState: GameState = {
    ...advancedState,
    phase: "terminal",
    fatesDiscovered: addDiscoveredFate(advancedState.fatesDiscovered, evaluated),
    updatedAt: now.toISOString(),
  };
  const dynastyRecord = buildDynastyRecord(terminalState, evaluated, now);
  const nextGenerationState = createNextGenerationState(terminalState, dynastyRecord, now);

  return {
    gameState: {
      ...terminalState,
      dynastyRecords: [...terminalState.dynastyRecords, dynastyRecord],
    },
    result: {
      ...evaluated,
      dynastyRecord,
      nextGenerationState,
    },
  };
}

function buildKeyChoiceRecord(
  round: number,
  eventId: string,
  choiceId: string,
  choiceLabel: string,
  intent: string,
  barsAfter: Partial<Record<StateTrackId, number>>,
): KeyChoiceRecord {
  return {
    round,
    eventId,
    choiceId,
    choiceLabel,
    summary: `${intent}: ${choiceLabel}`,
    barsAfter,
  };
}

function applyFlags(flags: string[], add: string[] = [], remove: string[] = []): string[] {
  const next = new Set(flags);
  for (const flag of add) next.add(flag);
  for (const flag of remove) next.delete(flag);
  return [...next];
}

function tickCooldowns(cooldowns: CooldownState): CooldownState {
  return {
    events: decrementRecord(cooldowns.events) as Record<string, number>,
    tags: decrementRecord(cooldowns.tags) as Partial<Record<EventTag, number>>,
  };
}

function applyCooldown(cooldowns: CooldownState, event: EngineEvent): CooldownState {
  const events = { ...cooldowns.events, [event.id]: event.cooldown.event };
  const tags = { ...cooldowns.tags };
  for (const [tag, rounds] of Object.entries(event.cooldown.tags ?? {}) as [EventTag, number][]) {
    tags[tag] = Math.max(tags[tag] ?? 0, rounds);
  }
  return { events, tags };
}

function decrementRecord<T extends string>(
  record: Partial<Record<T, number>>,
): Partial<Record<T, number>> {
  const next: Partial<Record<T, number>> = {};
  for (const [key, value] of Object.entries(record) as [T, number][]) {
    if (value > 1) {
      next[key] = value - 1;
    }
  }
  return next;
}

function toLegacy(seed: LegacySeed, generation: number): Legacy {
  return {
    ...seed,
    gainedAtGeneration: generation,
    remainingGenerations: seed.expiresAfterGenerations,
  };
}

function addDiscoveredFate(fates: string[], result: ApplyChoiceResult["result"]): string[] {
  const fateId = result.death?.id ?? (result.type === "victory" ? result.terminalId : undefined);
  if (!fateId || fates.includes(fateId)) {
    return [...fates];
  }
  return [...fates, fateId];
}
