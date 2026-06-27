export type EraId = "queen" | "napoleon";

export type LlmRenderMode = "none" | "flavor" | "climax";

export type EventTag =
  | "governance"
  | "court"
  | "military"
  | "treasury"
  | "people"
  | "diplomacy"
  | "religion"
  | "betrayal"
  | "crisis"
  | "npc"
  | "death"
  | "legacy"
  | "rare";

export type StateTrackId =
  | "nobility"
  | "people"
  | "army"
  | "treasury"
  | "diplomacy"
  | "publicSupport";

export interface StateCondition {
  track: StateTrackId;
  operator: "<" | "<=" | ">" | ">=" | "==" | "!=";
  value: number;
}

export interface EventTrigger {
  minRound?: number;
  maxRound?: number;
  any?: StateCondition[];
  all?: StateCondition[];
  none?: StateCondition[];
  requiredFlags?: string[];
  blockedFlags?: string[];
}

export interface EventRequirements {
  events?: string[];
  flags?: string[];
  legacies?: string[];
}

export interface EventExcludes {
  events?: string[];
  flags?: string[];
  legacies?: string[];
}

export interface EventCooldown {
  event: number;
  tags?: Partial<Record<EventTag, number>>;
}

export interface EventChoice {
  id: string;
  labelTemplate: string;
  intent: string;
  previewTracks: StateTrackId[];
}

export interface ChoiceEffect {
  delta: Partial<Record<StateTrackId, number>>;
  addFlags?: string[];
  removeFlags?: string[];
  addLegacy?: LegacySeed;
  keyChoice?: boolean;
  forceOutcome?: TerminalOutcomeSeed;
}

export type ChoiceEffectsById = Record<string, ChoiceEffect>;

export interface EventTemplate {
  title: string;
  body: string;
  npcName?: string;
  npcLine?: string;
}

export interface EngineEvent {
  id: string;
  era: EraId;
  tags: EventTag[];
  trigger: EventTrigger;
  choices: EventChoice[];
  effects: ChoiceEffectsById;
  requires: EventRequirements;
  excludes: EventExcludes;
  cooldown: EventCooldown;
  llmRenderMode: LlmRenderMode;
  weight?: number;
  template: EventTemplate;
}

export interface LegacySeed {
  id: string;
  label: string;
  description: string;
  statBias?: Partial<Record<StateTrackId, number>>;
  expiresAfterGenerations?: number;
}

export interface TerminalOutcomeSeed {
  type: "death" | "abdication" | "victory" | "special";
  id: string;
}

export interface EventPoolFile {
  schemaVersion: 3;
  events: EngineEvent[];
}

export type GamePhase = "active" | "terminal" | "campaign_complete";

export type GameMode = "scripted" | "freeplay";

export interface GameState {
  runId: string;
  era: EraId;
  rulerName: string;
  generation: number;
  phase: GamePhase;
  round: number;
  year: number;
  startedAt: string;
  updatedAt: string;
  mode: GameMode;
  fatesDiscovered: string[];
  isPaid: boolean;
  campaignNumber: number;
  campaignStartGen: number;
  isUnlimitedPaid: boolean;
  bars: Partial<Record<StateTrackId, number>>;
  highestBars: Partial<Record<StateTrackId, number>>;
  lowestBars: Partial<Record<StateTrackId, number>>;
  occurredEventIds: string[];
  lastEventId?: string;
  lastEventTags: EventTag[];
  cooldowns: CooldownState;
  flags: string[];
  inheritedLegacies: Legacy[];
  pendingLegacies: Legacy[];
  dynastyRecords: DynastyRecord[];
  keyChoices: KeyChoiceRecord[];
  llmCallsThisRun: number;
}

export interface CooldownState {
  events: Record<string, number>;
  tags: Partial<Record<EventTag, number>>;
}

export interface Legacy extends LegacySeed {
  gainedAtGeneration: number;
  remainingGenerations?: number;
}

export interface KeyChoiceRecord {
  round: number;
  eventId: string;
  choiceId: string;
  choiceLabel: string;
  summary: string;
  barsAfter: Partial<Record<StateTrackId, number>>;
}

export interface DynastyRecord {
  id: string;
  generation: number;
  rulerName: string;
  era: EraId;
  startYear: number;
  endYear: number;
  rulingYears: number;
  terminalType: TerminalType;
  terminalId: string;
  death?: DeathRecord;
  highestBars: Partial<Record<StateTrackId, number>>;
  lowestBars: Partial<Record<StateTrackId, number>>;
  keyChoices: KeyChoiceRecord[];
  inheritedLegacies: Legacy[];
  gainedLegacies: Legacy[];
  createdAt: string;
}

export type TerminalType = "continue" | "death" | "abdication" | "victory" | "special";

export type DeathId =
  | "queen_noble_revolt"
  | "queen_aristocratic_coup"
  | "queen_popular_uprising"
  | "queen_mob_rule"
  | "queen_foreign_occupation"
  | "queen_military_regency"
  | "queen_bankruptcy"
  | "queen_merchant_oligarchy"
  | "napoleon_army_mutiny"
  | "napoleon_marshal_coup"
  | "napoleon_state_bankruptcy"
  | "napoleon_profiteer_capture"
  | "napoleon_coalition_invasion"
  | "napoleon_puppet_emperor"
  | "napoleon_public_abdication"
  | "napoleon_populist_cult"
  | "scripted_death";

export interface DeathRecord {
  id: DeathId;
  label: string;
  causeTrack?: StateTrackId;
  direction?: "too_low" | "too_high" | "forced";
  round: number;
  year: number;
  epitaphTemplate: string;
}

export interface StateTrackConfig {
  id: StateTrackId;
  label: string;
  initial: number;
  min: number;
  max: number;
  lowDeathAt: number;
  highDeathAt: number;
  lowDeathId: DeathId;
  highDeathId: DeathId;
}

export interface EraStateConfig {
  era: EraId;
  startYear: number;
  targetRoundsForVictory: number;
  tracks: StateTrackConfig[];
}

export type GameResultType = TerminalType;

export interface GameResult {
  type: GameResultType;
  terminalId?: string;
  death?: DeathRecord;
  dynastyRecord?: DynastyRecord;
  nextGenerationState?: GameState;
}

export interface ApplyChoiceResult {
  gameState: GameState;
  result: GameResult;
}

export interface ScriptedEvent {
  eventId: string;
  overrideEffects?: Partial<ChoiceEffectsById>;
}

export interface ScriptedReign {
  generation: 1 | 2;
  events: ScriptedEvent[];
  forcedDeathAfter?: number;
}

export interface RestartPaywallData {
  dynastyRecords: DynastyRecord[];
  fatesDiscovered: string[];
  nextGeneration: number;
}

export interface CampaignCompletionData {
  dynastyRecords: DynastyRecord[];
  fatesDiscovered: string[];
  totalGenerations: number;
  longestReign: {
    rulerName: string;
    years: number;
  };
  shortestReign: {
    rulerName: string;
    years: number;
  };
  campaignNumber: number;
}

export interface RestartResponse {
  status: "ok" | "paywall" | "campaign_complete";
  paywallData?: RestartPaywallData;
  completionData?: CampaignCompletionData;
  gameState?: GameState;
  card?: RenderedCard;
}

export interface UnlockResponse {
  status: "ok";
  gameState: GameState;
  card: RenderedCard;
}

export interface RenderedCard {
  eventId: string;
  mode: LlmRenderMode;
  title: string;
  body: string;
  choices: RenderedChoice[];
  npc?: {
    name: string;
    line: string;
  };
  statePreview: StateTrackId[];
  llmUsed: boolean;
  llmProvider?: "deepseek" | "anthropic";
  fallbackReason?: "budget_exhausted" | "provider_not_configured" | "llm_error" | "invalid_llm_output";
}

export interface RenderedChoice {
  id: string;
  label: string;
  intent: string;
  previewTracks: StateTrackId[];
}

export type LlmProviderName = "deepseek" | "anthropic";

export interface RenderEventOptions {
  provider?: "template" | LlmProviderName | LlmRenderProvider;
  maxLlmCallsPerRun?: number;
}

export interface LlmRenderProvider {
  name: LlmProviderName;
  renderFlavor?: (input: FlavorPromptInput) => Promise<FlavorPromptOutput>;
  renderClimax?: (input: ClimaxPromptInput) => Promise<FlavorPromptOutput>;
}

interface BasePromptInput<TTask extends "render_event_flavor" | "render_event_climax"> {
  task: TTask;
  constraints: {
    language: "en";
    maxBodyWords: number;
    preserveChoiceCount: 2;
    doNotChangeRules: true;
    noSpoilers: true;
  };
  event: {
    id: string;
    title: string;
    body: string;
    npcName?: string;
    npcLine?: string;
    choices: { id: string; label: string; intent: string }[];
  };
  state: {
    era: EraId;
    rulerName: string;
    generation: number;
    year: number;
    bars: Partial<Record<StateTrackId, number>>;
    inheritedLegacies: string[];
  };
}

export type FlavorPromptInput = BasePromptInput<"render_event_flavor">;

export interface ClimaxPromptInput
  extends Omit<BasePromptInput<"render_event_climax">, "constraints"> {
  constraints: FlavorPromptInput["constraints"] & {
    maxBodyWords: 130;
    makeItShareable: true;
  };
  historySummary: {
    lastKeyChoices: {
      round: number;
      eventId: string;
      choiceLabel: string;
      summary: string;
    }[];
    dynastyRecords: {
      generation: number;
      terminalId: string;
      rulingYears: number;
    }[];
    strongestLegacy?: string;
    weakestTrack?: StateTrackId;
    strongestTrack?: StateTrackId;
  };
}

export interface FlavorPromptOutput {
  title: string;
  body: string;
  npc?: {
    name: string;
    line: string;
  };
  choices: { id: string; label: string }[];
}

export type EngineTelemetryEventName =
  | "engine_v3_first_run_started"
  | "engine_v3_run_started"
  | "engine_v3_card_viewed"
  | "engine_v3_choice_submitted"
  | "engine_v3_terminal_reached"
  | "engine_v3_death_reached"
  | "engine_v3_victory_reached"
  | "engine_v3_restart_clicked"
  | "engine_v3_next_generation_started"
  | "engine_v3_run_completed"
  | "engine_v3_share_clicked"
  | "engine_v3_llm_rendered"
  | "engine_v3_llm_fallback";

export interface EngineTelemetryPayload {
  runId: string;
  era: EraId;
  generation: number;
  round: number;
  eventId?: string;
  choiceId?: string;
  eventTags?: EventTag[];
  terminalType?: TerminalType;
  terminalId?: string;
  deathId?: DeathId;
  decisionCount?: number;
  runDurationMs?: number;
  llmCallsThisRun?: number;
  llmProvider?: LlmProviderName;
  llmMode?: LlmRenderMode;
  shareSurface?: "ending_card" | "death_record" | "dynasty_archive";
  bars?: Partial<Record<StateTrackId, number>>;
}

export interface EngineTelemetryEvent {
  name: EngineTelemetryEventName;
  payload: EngineTelemetryPayload;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateEventPool(poolFile: EventPoolFile): ValidationResult {
  const errors: string[] = [];
  if (poolFile.schemaVersion !== 3) {
    errors.push("Event pool schemaVersion must be 3");
  }

  const ids = new Set<string>();
  for (const event of poolFile.events) {
    if (ids.has(event.id)) {
      errors.push(`Duplicate event id: ${event.id}`);
    }
    ids.add(event.id);

    if (event.choices.length !== 2) {
      errors.push(`${event.id} must have exactly 2 choices`);
    }

    for (const choice of event.choices) {
      if (!event.effects[choice.id]) {
        errors.push(`${event.id} missing effect for choice ${choice.id}`);
      }
      if (event.llmRenderMode === "none" && !choice.labelTemplate.trim()) {
        errors.push(`${event.id} none events require choice label templates`);
      }
    }

    if (event.llmRenderMode === "none" && !event.template.body.trim()) {
      errors.push(`${event.id} none events require template body`);
    }

    if (
      event.llmRenderMode === "climax" &&
      !event.tags.some((tag) => tag === "crisis" || tag === "death" || tag === "rare")
    ) {
      errors.push(`${event.id} climax events require crisis, death, or rare tag`);
    }

    const allowedTracks = getAllowedTrackSet(event.era);
    for (const [choiceId, effect] of Object.entries(event.effects)) {
      if (!event.choices.some((choice) => choice.id === choiceId)) {
        errors.push(`${event.id} has effect for unknown choice ${choiceId}`);
      }
      for (const track of Object.keys(effect.delta) as StateTrackId[]) {
        if (!allowedTracks.has(track)) {
          errors.push(`${event.id} uses unavailable track ${track}`);
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

function getAllowedTrackSet(era: EraId): Set<StateTrackId> {
  return new Set(
    era === "queen"
      ? ["nobility", "people", "army", "treasury"]
      : ["army", "treasury", "diplomacy", "publicSupport"],
  );
}
