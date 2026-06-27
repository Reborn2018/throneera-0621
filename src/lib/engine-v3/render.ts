import type {
  ClimaxPromptInput,
  EngineEvent,
  FlavorPromptInput,
  FlavorPromptOutput,
  GameState,
  LlmRenderMode,
  LlmRenderProvider,
  RenderedCard,
  RenderEventOptions,
  StateTrackId,
} from "@/lib/engine-v3/event.schema";

export async function renderEvent(
  event: EngineEvent,
  gameState: GameState,
  mode: LlmRenderMode = event.llmRenderMode,
  options: RenderEventOptions = {},
): Promise<RenderedCard> {
  if (mode === "none") {
    return renderTemplateEvent(event, gameState);
  }

  if (!shouldUseLlm(event, gameState, options)) {
    return {
      ...renderTemplateEvent(event, gameState),
      fallbackReason: "budget_exhausted",
    };
  }

  const provider = typeof options.provider === "object" ? options.provider : null;
  if (!provider || options.provider === "template") {
    return {
      ...renderTemplateEvent(event, gameState),
      fallbackReason: "provider_not_configured",
    };
  }

  try {
    const output =
      mode === "flavor"
        ? await provider.renderFlavor?.(buildFlavorPromptInput(event, gameState))
        : await provider.renderClimax?.(buildClimaxPromptInput(event, gameState));
    if (!output || !isValidLlmOutput(event, output)) {
      return {
        ...renderTemplateEvent(event, gameState),
        fallbackReason: "invalid_llm_output",
      };
    }

    return renderLlmOutput(event, gameState, mode, provider, output);
  } catch {
    return {
      ...renderTemplateEvent(event, gameState),
      fallbackReason: "llm_error",
    };
  }
}

export function renderTemplateEvent(event: EngineEvent, gameState: GameState): RenderedCard {
  return {
    eventId: event.id,
    mode: "none",
    title: fillTemplate(event.template.title, gameState),
    body: fillTemplate(event.template.body, gameState),
    choices: event.choices.map((choice) => ({
      id: choice.id,
      label: fillTemplate(choice.labelTemplate, gameState),
      intent: choice.intent,
      previewTracks: choice.previewTracks,
    })),
    npc:
      event.template.npcName || event.template.npcLine
        ? {
            name: fillTemplate(event.template.npcName ?? "Advisor", gameState),
            line: fillTemplate(event.template.npcLine ?? "", gameState),
          }
        : undefined,
    statePreview: unique(event.choices.flatMap((choice) => choice.previewTracks)),
    llmUsed: false,
  };
}

export function buildFlavorPromptInput(event: EngineEvent, gameState: GameState): FlavorPromptInput {
  return {
    task: "render_event_flavor",
    constraints: {
      language: "en",
      maxBodyWords: 90,
      preserveChoiceCount: 2,
      doNotChangeRules: true,
      noSpoilers: true,
    },
    event: promptEvent(event, gameState),
    state: promptState(gameState),
  };
}

export function buildClimaxPromptInput(event: EngineEvent, gameState: GameState): ClimaxPromptInput {
  return {
    task: "render_event_climax",
    constraints: {
      language: "en",
      maxBodyWords: 130,
      preserveChoiceCount: 2,
      doNotChangeRules: true,
      noSpoilers: true,
      makeItShareable: true,
    },
    event: promptEvent(event, gameState),
    state: promptState(gameState),
    historySummary: {
      lastKeyChoices: gameState.keyChoices.slice(-5).map((choice) => ({
        round: choice.round,
        eventId: choice.eventId,
        choiceLabel: choice.choiceLabel,
        summary: choice.summary,
      })),
      dynastyRecords: gameState.dynastyRecords.slice(-5).map((record) => ({
        generation: record.generation,
        terminalId: record.terminalId,
        rulingYears: record.rulingYears,
      })),
      strongestLegacy: gameState.inheritedLegacies[0]?.label,
      weakestTrack: getExtremeTrack(gameState.bars, "min"),
      strongestTrack: getExtremeTrack(gameState.bars, "max"),
    },
  };
}

function shouldUseLlm(
  event: EngineEvent,
  gameState: GameState,
  options: RenderEventOptions,
): boolean {
  const max = options.maxLlmCallsPerRun ?? 5;
  if (gameState.llmCallsThisRun >= max) return false;
  return event.llmRenderMode !== "none";
}

function renderLlmOutput(
  event: EngineEvent,
  gameState: GameState,
  mode: LlmRenderMode,
  provider: LlmRenderProvider,
  output: FlavorPromptOutput,
): RenderedCard {
  return {
    eventId: event.id,
    mode,
    title: output.title,
    body: output.body,
    choices: event.choices.map((choice) => ({
      id: choice.id,
      label: output.choices.find((candidate) => candidate.id === choice.id)?.label ?? fillTemplate(choice.labelTemplate, gameState),
      intent: choice.intent,
      previewTracks: choice.previewTracks,
    })),
    npc: output.npc,
    statePreview: unique(event.choices.flatMap((choice) => choice.previewTracks)),
    llmUsed: true,
    llmProvider: provider.name,
  };
}

function promptEvent(event: EngineEvent, gameState: GameState): FlavorPromptInput["event"] {
  return {
    id: event.id,
    title: fillTemplate(event.template.title, gameState),
    body: fillTemplate(event.template.body, gameState),
    npcName: event.template.npcName ? fillTemplate(event.template.npcName, gameState) : undefined,
    npcLine: event.template.npcLine ? fillTemplate(event.template.npcLine, gameState) : undefined,
    choices: event.choices.map((choice) => ({
      id: choice.id,
      label: fillTemplate(choice.labelTemplate, gameState),
      intent: choice.intent,
    })),
  };
}

function promptState(gameState: GameState): FlavorPromptInput["state"] {
  return {
    era: gameState.era,
    rulerName: gameState.rulerName,
    generation: gameState.generation,
    year: gameState.year,
    bars: gameState.bars,
    inheritedLegacies: gameState.inheritedLegacies.map((legacy) => legacy.label),
  };
}

function isValidLlmOutput(event: EngineEvent, output: FlavorPromptOutput): boolean {
  if (!output.title?.trim() || !output.body?.trim()) return false;
  if (output.choices.length !== event.choices.length) return false;
  const outputIds = new Set(output.choices.map((choice) => choice.id));
  return event.choices.every((choice) => outputIds.has(choice.id));
}

function fillTemplate(template: string, gameState: GameState): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, rawKey: string) => {
    const key = rawKey.trim();
    if (key === "rulerName") return gameState.rulerName;
    if (key === "era") return gameState.era;
    if (key === "year") return String(gameState.year);
    if (key === "generation") return String(gameState.generation);

    if (key.startsWith("bar:")) {
      const track = key.slice("bar:".length) as StateTrackId;
      return String(gameState.bars[track] ?? 0);
    }

    if (key.startsWith("legacy:")) {
      const legacyId = key.slice("legacy:".length);
      return gameState.inheritedLegacies.find((legacy) => legacy.id === legacyId)?.label ?? "";
    }

    return "";
  });
}

function getExtremeTrack(
  bars: Partial<Record<StateTrackId, number>>,
  direction: "min" | "max",
): StateTrackId | undefined {
  const entries = Object.entries(bars) as [StateTrackId, number][];
  if (!entries.length) return undefined;

  return entries.reduce((best, current) => {
    if (direction === "min") return current[1] < best[1] ? current : best;
    return current[1] > best[1] ? current : best;
  })[0];
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}
