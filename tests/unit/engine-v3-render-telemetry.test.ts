import { describe, expect, it, vi } from "vitest";
import {
  createInitialGameState,
  createMemoryTelemetrySink,
  recordTelemetry,
  renderEvent,
  renderTemplateEvent,
} from "@/lib/engine-v3";
import type { ClimaxPromptInput, EngineEvent, FlavorPromptInput, GameState, LlmRenderProvider } from "@/lib/engine-v3";

const fixedNow = new Date("2026-06-26T00:00:00.000Z");

function flavorEvent(overrides: Partial<EngineEvent> = {}): EngineEvent {
  return {
    id: "napoleon_flavor_test",
    era: "napoleon",
    tags: ["military", "npc"],
    trigger: { minRound: 1 },
    choices: [
      {
        id: "march",
        labelTemplate: "March with {{bar:army}} battalions",
        intent: "Force tempo",
        previewTracks: ["army", "treasury"],
      },
      {
        id: "wait",
        labelTemplate: "Wait for Paris",
        intent: "Protect legitimacy",
        previewTracks: ["publicSupport", "diplomacy"],
      },
    ],
    effects: {
      march: { delta: { army: 8, treasury: -5 }, keyChoice: true },
      wait: { delta: { publicSupport: 6, diplomacy: -4 } },
    },
    requires: {},
    excludes: {},
    cooldown: { event: 4, tags: { military: 2 } },
    llmRenderMode: "flavor",
    weight: 1,
    template: {
      title: "{{rulerName}} at {{year}}",
      body: "{{rulerName}} studies the map with {{legacy:first_march}} nearby.",
      npcName: "Berthier",
      npcLine: "The army stands at {{bar:army}}.",
    },
    ...overrides,
  };
}

describe("engine-v3 rendering", () => {
  it("renders template cards without LLM and fills state variables", async () => {
    const state = createInitialGameState({
      era: "napoleon",
      rulerName: "Bonaparte",
      runId: "run-1",
      now: fixedNow,
      inheritedLegacies: [
        {
          id: "first_march",
          label: "First March",
          description: "A remembered forced march.",
          gainedAtGeneration: 1,
        },
      ],
    });

    const card = renderTemplateEvent(flavorEvent({ llmRenderMode: "none" }), state);

    expect(card).toEqual({
      eventId: "napoleon_flavor_test",
      mode: "none",
      title: "Bonaparte at 1796",
      body: "Bonaparte studies the map with First March nearby.",
      choices: [
        {
          id: "march",
          label: "March with 55 battalions",
          intent: "Force tempo",
          previewTracks: ["army", "treasury"],
        },
        {
          id: "wait",
          label: "Wait for Paris",
          intent: "Protect legitimacy",
          previewTracks: ["publicSupport", "diplomacy"],
        },
      ],
      npc: {
        name: "Berthier",
        line: "The army stands at 55.",
      },
      statePreview: ["army", "treasury", "publicSupport", "diplomacy"],
      llmUsed: false,
    });
  });

  it("uses a flavor LLM provider when budget remains and preserves choice contracts", async () => {
    let capturedInput: FlavorPromptInput | undefined;
    const provider: LlmRenderProvider = {
      name: "deepseek",
      renderFlavor: vi.fn(async (input) => {
        capturedInput = input;
        return {
          title: "The Road Opens",
          body: "A sharper, rendered dispatch.",
          npc: { name: "Marshal Berthier", line: "We move before the ink dries." },
          choices: [
            { id: "march", label: "Drive the army forward" },
            { id: "wait", label: "Let Paris answer first" },
          ],
        };
      }),
    };
    const state = createInitialGameState({
      era: "napoleon",
      rulerName: "Bonaparte",
      runId: "run-1",
      now: fixedNow,
    });

    const card = await renderEvent(flavorEvent(), state, "flavor", {
      provider,
      maxLlmCallsPerRun: 5,
    });

    expect(provider.renderFlavor).toHaveBeenCalledTimes(1);
    expect(capturedInput).toMatchObject({
      task: "render_event_flavor",
      constraints: {
        preserveChoiceCount: 2,
        doNotChangeRules: true,
        noSpoilers: true,
      },
      state: {
        era: "napoleon",
        rulerName: "Bonaparte",
        year: 1796,
      },
    });
    expect(card).toMatchObject({
      eventId: "napoleon_flavor_test",
      mode: "flavor",
      title: "The Road Opens",
      body: "A sharper, rendered dispatch.",
      llmUsed: true,
      llmProvider: "deepseek",
      choices: [
        { id: "march", label: "Drive the army forward", intent: "Force tempo" },
        { id: "wait", label: "Let Paris answer first", intent: "Protect legitimacy" },
      ],
    });
  });

  it("falls back to template rendering when budget is exhausted or provider output is invalid", async () => {
    const provider: LlmRenderProvider = {
      name: "deepseek",
      renderFlavor: vi.fn(async () => ({
        title: "Invalid",
        body: "Missing one choice.",
        choices: [{ id: "march", label: "Only one" }],
      })),
    };
    const state = createInitialGameState({
      era: "napoleon",
      rulerName: "Bonaparte",
      runId: "run-1",
      now: fixedNow,
      llmCallsThisRun: 5,
    });

    const budgetFallback = await renderEvent(flavorEvent(), state, "flavor", {
      provider,
      maxLlmCallsPerRun: 5,
    });
    expect(provider.renderFlavor).not.toHaveBeenCalled();
    expect(budgetFallback).toMatchObject({ mode: "none", llmUsed: false });

    const invalidFallback = await renderEvent(flavorEvent(), { ...state, llmCallsThisRun: 0 }, "flavor", {
      provider,
    });
    expect(invalidFallback).toMatchObject({
      mode: "none",
      title: "Bonaparte at 1796",
      llmUsed: false,
      fallbackReason: "invalid_llm_output",
    });
  });

  it("passes dynasty history into climax prompts", async () => {
    const provider: LlmRenderProvider = {
      name: "anthropic",
      renderClimax: vi.fn(async (input: ClimaxPromptInput) => ({
        title: `${input.historySummary.strongestTrack} Breaks Europe`,
        body: "A crisis rendered with history.",
        choices: input.event.choices.map((choice) => ({ id: choice.id, label: choice.label })),
      })),
    };
    const state: GameState = {
      ...createInitialGameState({
        era: "napoleon",
        rulerName: "Bonaparte",
        runId: "run-1",
        now: fixedNow,
      }),
      keyChoices: [
        {
          round: 3,
          eventId: "napoleon_old",
          choiceId: "march",
          choiceLabel: "Forced march",
          summary: "The army learned speed.",
          barsAfter: { army: 70 },
        },
      ],
      dynastyRecords: [
        {
          id: "dynasty-1",
          generation: 1,
          rulerName: "Bonaparte",
          era: "napoleon" as const,
          startYear: 1796,
          endYear: 1800,
          rulingYears: 4,
          terminalType: "death" as const,
          terminalId: "napoleon_army_mutiny",
          highestBars: { army: 91 },
          lowestBars: { treasury: 12 },
          keyChoices: [],
          inheritedLegacies: [],
          gainedLegacies: [],
          createdAt: fixedNow.toISOString(),
        },
      ],
    };

    const card = await renderEvent(
      flavorEvent({
        id: "napoleon_climax",
        tags: ["military", "crisis"],
        llmRenderMode: "climax",
      }),
      state,
      "climax",
      { provider },
    );

    expect(provider.renderClimax).toHaveBeenCalledWith(
      expect.objectContaining({
        task: "render_event_climax",
        historySummary: expect.objectContaining({
          strongestTrack: "army",
          weakestTrack: "treasury",
          lastKeyChoices: [
            expect.objectContaining({
              round: 3,
              choiceLabel: "Forced march",
            }),
          ],
          dynastyRecords: [
            {
              generation: 1,
              terminalId: "napoleon_army_mutiny",
              rulingYears: 4,
            },
          ],
        }),
      }),
    );
    expect(card).toMatchObject({ mode: "climax", llmUsed: true, llmProvider: "anthropic" });
  });
});

describe("engine-v3 telemetry", () => {
  it("records telemetry payloads through an injectable sink", async () => {
    const sink = createMemoryTelemetrySink();

    await recordTelemetry(
      {
        name: "engine_v3_choice_submitted",
        payload: {
          runId: "run-1",
          era: "queen",
          generation: 1,
          round: 4,
          eventId: "queen_test_tax",
          choiceId: "raise",
          eventTags: ["treasury"],
          bars: { treasury: 62 },
        },
      },
      { sink },
    );

    expect(sink.events).toEqual([
      {
        name: "engine_v3_choice_submitted",
        payload: {
          runId: "run-1",
          era: "queen",
          generation: 1,
          round: 4,
          eventId: "queen_test_tax",
          choiceId: "raise",
          eventTags: ["treasury"],
          bars: { treasury: 62 },
        },
      },
    ]);
  });
});
