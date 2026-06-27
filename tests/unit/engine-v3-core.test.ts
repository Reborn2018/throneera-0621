import { describe, expect, it } from "vitest";
import {
  FALLBACK_EVENT_BY_ERA,
  applyChoice,
  createInitialGameState,
  createNextGenerationState,
  evaluateTerminalOutcome,
  selectNextEvent,
  validateEventPool,
} from "@/lib/engine-v3";
import type { EngineEvent, GameState } from "@/lib/engine-v3";

const fixedNow = new Date("2026-06-26T00:00:00.000Z");

function queenEvent(overrides: Partial<EngineEvent> = {}): EngineEvent {
  return {
    id: "queen_test_tax",
    era: "queen",
    tags: ["governance", "treasury", "people"],
    trigger: { minRound: 1 },
    choices: [
      {
        id: "raise",
        labelTemplate: "Raise tax for {{rulerName}}",
        intent: "Fund the crown",
        previewTracks: ["treasury", "people"],
      },
      {
        id: "spare",
        labelTemplate: "Spare the market",
        intent: "Protect goodwill",
        previewTracks: ["treasury", "people"],
      },
    ],
    effects: {
      raise: {
        delta: { treasury: 12, people: -10 },
        addFlags: ["tax_raised"],
        addLegacy: {
          id: "hard_coin",
          label: "Hard Coin",
          description: "The dynasty learned to squeeze gold from fear.",
          statBias: { treasury: 4, people: -2 },
          expiresAfterGenerations: 2,
        },
        keyChoice: true,
      },
      spare: { delta: { treasury: -8, people: 8 } },
    },
    requires: {},
    excludes: {},
    cooldown: { event: 3, tags: { treasury: 2 } },
    llmRenderMode: "none",
    weight: 1,
    template: {
      title: "The Market Petition",
      body: "{{rulerName}} hears the merchants in {{year}}.",
      npcName: "Treasurer",
      npcLine: "Gold buys obedience.",
    },
    ...overrides,
  };
}

function activeQueenState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialGameState({
      era: "queen",
      rulerName: "Isolde",
      runId: "run-1",
      now: fixedNow,
    }),
    ...overrides,
  };
}

describe("engine-v3 event schema", () => {
  it("accepts a valid binary event pool", () => {
    expect(validateEventPool({ schemaVersion: 3, events: [queenEvent()] })).toEqual({
      ok: true,
      errors: [],
    });
  });

  it("rejects duplicate ids, non-binary choices, missing effects, invalid tracks, and invalid climax tags", () => {
    const invalidTrack = queenEvent({
      id: "queen_invalid_track",
      effects: {
        raise: { delta: { publicSupport: 10 } },
        spare: { delta: {} },
      },
    });
    const missingEffect = queenEvent({
      id: "queen_missing_effect",
      effects: { raise: { delta: {} } },
    });
    const threeChoices = queenEvent({
      id: "queen_three_choices",
      choices: [
        ...queenEvent().choices,
        {
          id: "third",
          labelTemplate: "Third option",
          intent: "Break P0",
          previewTracks: ["people"],
        },
      ],
      effects: {
        ...queenEvent().effects,
        third: { delta: { people: 1 } },
      },
    });
    const invalidClimax = queenEvent({
      id: "queen_invalid_climax",
      llmRenderMode: "climax",
      tags: ["court"],
    });

    const result = validateEventPool({
      schemaVersion: 3,
      events: [queenEvent(), queenEvent(), invalidTrack, missingEffect, threeChoices, invalidClimax],
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Duplicate event id: queen_test_tax"),
        expect.stringContaining("queen_invalid_track uses unavailable track publicSupport"),
        expect.stringContaining("queen_missing_effect missing effect for choice spare"),
        expect.stringContaining("queen_three_choices must have exactly 2 choices"),
        expect.stringContaining("queen_invalid_climax climax events require crisis, death, or rare tag"),
      ]),
    );
  });
});

describe("engine-v3 state and event selection", () => {
  it("creates an initial Queen state with era defaults", () => {
    const state = createInitialGameState({
      era: "queen",
      rulerName: "Isolde",
      runId: "run-1",
      now: fixedNow,
    });

    expect(state).toMatchObject({
      runId: "run-1",
      era: "queen",
      rulerName: "Isolde",
      generation: 1,
      phase: "active",
      round: 0,
      year: 1560,
      bars: {
        nobility: 50,
        people: 50,
        army: 50,
        treasury: 50,
      },
      highestBars: {
        nobility: 50,
        people: 50,
        army: 50,
        treasury: 50,
      },
      lowestBars: {
        nobility: 50,
        people: 50,
        army: 50,
        treasury: 50,
      },
      llmCallsThisRun: 0,
    });
  });

  it("selects only legal weighted events and falls back when none are legal", () => {
    const state = activeQueenState({
      round: 3,
      flags: ["allowed"],
      cooldowns: { events: { queen_cooling: 2 }, tags: { treasury: 1 } },
      occurredEventIds: ["queen_seen"],
    });
    const legal = queenEvent({ id: "queen_legal", tags: ["court"], trigger: { minRound: 1 }, weight: 1 });
    const heavier = queenEvent({ id: "queen_heavier", tags: ["court"], trigger: { minRound: 1 }, weight: 3 });
    const wrongEra = queenEvent({ id: "napoleon_wrong", era: "napoleon" });
    const blockedByRound = queenEvent({ id: "queen_future", trigger: { minRound: 9 } });
    const blockedByRequire = queenEvent({ id: "queen_requires_missing", requires: { flags: ["missing"] } });
    const blockedByExclude = queenEvent({ id: "queen_excluded_seen", excludes: { events: ["queen_seen"] } });
    const blockedByCooldown = queenEvent({
      id: "queen_cooling",
      cooldown: { event: 2 },
    });
    const blockedByTagCooldown = queenEvent({ id: "queen_tag_cooling", tags: ["treasury"] });

    expect(
      selectNextEvent(state, {
        pool: [
          wrongEra,
          blockedByRound,
          blockedByRequire,
          blockedByExclude,
          blockedByCooldown,
          blockedByTagCooldown,
          legal,
          heavier,
        ],
        rng: () => 0.99,
      }).id,
    ).toBe("queen_heavier");

    expect(
      selectNextEvent(state, {
        pool: [wrongEra, blockedByRound, blockedByRequire, blockedByExclude, blockedByCooldown],
      }),
    ).toEqual(FALLBACK_EVENT_BY_ERA.queen);
  });
});

describe("engine-v3 choice resolution and inheritance", () => {
  it("applies choice effects, cooldowns, flags, legacies, and key choice records", () => {
    const state = activeQueenState({
      round: 2,
      year: 1562,
      cooldowns: { events: { old_event: 2 }, tags: { court: 1 } },
    });

    const result = applyChoice(state, queenEvent(), 0, fixedNow);

    expect(result.result).toEqual({ type: "continue" });
    expect(result.gameState).toMatchObject({
      phase: "active",
      round: 3,
      year: 1563,
      bars: {
        nobility: 50,
        people: 40,
        army: 50,
        treasury: 62,
      },
      highestBars: expect.objectContaining({ treasury: 62 }),
      lowestBars: expect.objectContaining({ people: 40 }),
      occurredEventIds: ["queen_test_tax"],
      lastEventId: "queen_test_tax",
      lastEventTags: ["governance", "treasury", "people"],
      cooldowns: { events: { old_event: 1, queen_test_tax: 3 }, tags: { treasury: 2 } },
      flags: ["tax_raised"],
    });
    expect(result.gameState.pendingLegacies).toEqual([
      expect.objectContaining({ id: "hard_coin", gainedAtGeneration: 1, remainingGenerations: 2 }),
    ]);
    expect(result.gameState.keyChoices).toEqual([
      expect.objectContaining({
        round: 3,
        eventId: "queen_test_tax",
        choiceId: "raise",
        choiceLabel: "Raise tax for {{rulerName}}",
        barsAfter: expect.objectContaining({ treasury: 62 }),
      }),
    ]);
  });

  it("turns an overbalanced bar into a death record and next-generation state", () => {
    const state = activeQueenState({
      round: 5,
      year: 1565,
      bars: { nobility: 50, people: 50, army: 50, treasury: 4 },
      lowestBars: { nobility: 50, people: 50, army: 50, treasury: 4 },
    });
    const event = queenEvent({
      effects: {
        raise: { delta: { treasury: -10 } },
        spare: { delta: { people: 1 } },
      },
    });

    const result = applyChoice(state, event, 0, fixedNow);

    expect(result.gameState.phase).toBe("terminal");
    expect(result.result.type).toBe("death");
    expect(result.result.terminalId).toBe("queen_bankruptcy");
    expect(result.result.death).toMatchObject({
      id: "queen_bankruptcy",
      causeTrack: "treasury",
      direction: "too_low",
      round: 6,
      year: 1566,
    });
    expect(result.result.dynastyRecord).toMatchObject({
      era: "queen",
      generation: 1,
      terminalType: "death",
      terminalId: "queen_bankruptcy",
      rulingYears: 6,
    });
    expect(result.result.nextGenerationState).toMatchObject({
      generation: 2,
      phase: "active",
      round: 0,
      dynastyRecords: [expect.objectContaining({ terminalId: "queen_bankruptcy" })],
      inheritedLegacies: [expect.objectContaining({ id: "legacy_queen_bankruptcy" })],
    });
    expect(result.result.nextGenerationState?.bars.treasury).toBeGreaterThan(50);
  });

  it("supports forced terminal outcomes and victory thresholds", () => {
    const forced = applyChoice(
      activeQueenState({ round: 7 }),
      queenEvent({
        effects: {
          raise: {
            delta: {},
            forceOutcome: { type: "death", id: "scripted_death" },
          },
          spare: { delta: {} },
        },
      }),
      0,
      fixedNow,
    );

    expect(forced.result).toMatchObject({
      type: "death",
      terminalId: "scripted_death",
      death: expect.objectContaining({ direction: "forced" }),
    });

    const victory = evaluateTerminalOutcome(activeQueenState({ round: 30 }), fixedNow);
    expect(victory).toEqual({ type: "victory", terminalId: "queen_stable_reign" });
  });

  it("creates the next generation from pending, inherited, and terminal legacies", () => {
    const terminal = activeQueenState({
      phase: "terminal",
      generation: 2,
      year: 1572,
      inheritedLegacies: [
        {
          id: "old_shadow",
          label: "Old Shadow",
          description: "Nearly gone.",
          gainedAtGeneration: 1,
          remainingGenerations: 1,
          statBias: { people: -9 },
        },
      ],
      pendingLegacies: [
        {
          id: "hard_coin",
          label: "Hard Coin",
          description: "Treasury discipline.",
          gainedAtGeneration: 2,
          remainingGenerations: 2,
          statBias: { treasury: 5 },
        },
      ],
    });
    const record = {
      id: "dynasty-1",
      generation: 2,
      rulerName: "Isolde",
      era: "queen" as const,
      startYear: 1560,
      endYear: 1572,
      rulingYears: 12,
      terminalType: "death" as const,
      terminalId: "queen_bankruptcy",
      death: {
        id: "queen_bankruptcy" as const,
        label: "Bankruptcy",
        causeTrack: "treasury" as const,
        direction: "too_low" as const,
        round: 12,
        year: 1572,
        epitaphTemplate: "{{rulerName}} spent the crown into silence.",
      },
      highestBars: terminal.highestBars,
      lowestBars: terminal.lowestBars,
      keyChoices: [],
      inheritedLegacies: terminal.inheritedLegacies,
      gainedLegacies: terminal.pendingLegacies,
      createdAt: fixedNow.toISOString(),
    };

    const next = createNextGenerationState(terminal, record, fixedNow);

    expect(next.generation).toBe(3);
    expect(next.inheritedLegacies.map((legacy) => legacy.id)).toEqual([
      "hard_coin",
      "legacy_queen_bankruptcy",
    ]);
    expect(next.bars.treasury).toBe(61);
    expect(next.bars.people).toBe(50);
  });
});
