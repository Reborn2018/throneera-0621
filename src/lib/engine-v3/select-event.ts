import { EVENT_POOL, FALLBACK_EVENT_BY_ERA, findEventById } from "@/lib/engine-v3/events";
import {
  applyScriptedOverrides,
  getScriptedEntryForState,
  isScriptedEventId,
} from "@/lib/engine-v3/scripted";
import type {
  EngineEvent,
  EventExcludes,
  EventRequirements,
  EventTrigger,
  GameState,
  Legacy,
  StateCondition,
} from "@/lib/engine-v3/event.schema";

export interface SelectEventOptions {
  pool?: EngineEvent[];
  rng?: () => number;
}

interface ScoredEvent {
  event: EngineEvent;
  score: number;
}

export function selectNextEvent(gameState: GameState, options: SelectEventOptions = {}): EngineEvent {
  const pool = options.pool ?? EVENT_POOL;
  const scriptedEvent = findScriptedEventForState(gameState, pool);
  if (scriptedEvent) {
    return scriptedEvent;
  }

  const rng = options.rng ?? Math.random;
  const legalEvents = pool
    .filter((event) => !isScriptedEventId(event.id))
    .filter((event) => isEventLegal(gameState, event))
    .map((event): ScoredEvent => ({ event, score: Math.max(0, event.weight ?? 1) }))
    .filter((candidate) => candidate.score > 0);

  if (legalEvents.length === 0) {
    return FALLBACK_EVENT_BY_ERA[gameState.era];
  }

  const total = legalEvents.reduce((sum, candidate) => sum + candidate.score, 0);
  let cursor = rng() * total;
  for (const candidate of legalEvents) {
    cursor -= candidate.score;
    if (cursor <= 0) return candidate.event;
  }

  return legalEvents[legalEvents.length - 1].event;
}

export function findEventForState(
  gameState: GameState,
  eventId: string,
  pool: EngineEvent[] = EVENT_POOL,
): EngineEvent | null {
  const scriptedEntry = getScriptedEntryForState(gameState);
  if (scriptedEntry) {
    if (scriptedEntry.eventId !== eventId) {
      return null;
    }

    const scriptedEvent = findEventById(eventId, pool);
    return scriptedEvent ? applyScriptedOverrides(scriptedEvent, scriptedEntry) : null;
  }

  return findEventById(eventId, pool);
}

export function isEventLegal(gameState: GameState, event: EngineEvent): boolean {
  if (gameState.phase !== "active") return false;
  if (event.era !== gameState.era) return false;
  if ((gameState.cooldowns.events[event.id] ?? 0) > 0) return false;
  if (event.tags.some((tag) => (gameState.cooldowns.tags[tag] ?? 0) > 0)) return false;
  if (!matchesTrigger(gameState, event.trigger)) return false;
  if (!matchesRequirements(gameState, event.requires)) return false;
  if (matchesExcludes(gameState, event.excludes)) return false;
  return true;
}

function matchesTrigger(gameState: GameState, trigger: EventTrigger): boolean {
  const nextRound = gameState.round + 1;
  if (trigger.minRound !== undefined && nextRound < trigger.minRound) return false;
  if (trigger.maxRound !== undefined && nextRound > trigger.maxRound) return false;
  if (trigger.requiredFlags?.some((flag) => !gameState.flags.includes(flag))) return false;
  if (trigger.blockedFlags?.some((flag) => gameState.flags.includes(flag))) return false;
  if (trigger.all?.some((condition) => !matchesCondition(gameState, condition))) return false;
  if (trigger.any && trigger.any.length > 0 && !trigger.any.some((condition) => matchesCondition(gameState, condition))) {
    return false;
  }
  if (trigger.none?.some((condition) => matchesCondition(gameState, condition))) return false;
  return true;
}

function matchesRequirements(gameState: GameState, requirements: EventRequirements): boolean {
  const legacyIds = new Set([
    ...gameState.inheritedLegacies.map(legacyId),
    ...gameState.pendingLegacies.map(legacyId),
  ]);

  if (requirements.events?.some((eventId) => !gameState.occurredEventIds.includes(eventId))) return false;
  if (requirements.flags?.some((flag) => !gameState.flags.includes(flag))) return false;
  if (requirements.legacies?.some((legacy) => !legacyIds.has(legacy))) return false;
  return true;
}

function matchesExcludes(gameState: GameState, excludes: EventExcludes): boolean {
  const legacyIds = new Set([
    ...gameState.inheritedLegacies.map(legacyId),
    ...gameState.pendingLegacies.map(legacyId),
  ]);

  return Boolean(
    excludes.events?.some((eventId) => gameState.occurredEventIds.includes(eventId)) ||
      excludes.flags?.some((flag) => gameState.flags.includes(flag)) ||
      excludes.legacies?.some((legacy) => legacyIds.has(legacy)),
  );
}

function matchesCondition(gameState: GameState, condition: StateCondition): boolean {
  const value = gameState.bars[condition.track] ?? 0;
  switch (condition.operator) {
    case "<":
      return value < condition.value;
    case "<=":
      return value <= condition.value;
    case ">":
      return value > condition.value;
    case ">=":
      return value >= condition.value;
    case "==":
      return value === condition.value;
    case "!=":
      return value !== condition.value;
  }
}

function legacyId(legacy: Legacy): string {
  return legacy.id;
}

function findScriptedEventForState(gameState: GameState, pool: EngineEvent[]): EngineEvent | null {
  const scriptedEntry = getScriptedEntryForState(gameState);
  if (!scriptedEntry) {
    return null;
  }

  const event = findEventById(scriptedEntry.eventId, pool);
  return event ? applyScriptedOverrides(event, scriptedEntry) : null;
}
