import { describe, expect, it } from "vitest";
import { POST as restartPost } from "@/app/api/engine-v3/restart/route";
import { POST as unlockPost } from "@/app/api/engine-v3/unlock/route";
import {
  SCRIPTED_REIGNS,
  applyChoice,
  createInitialGameState,
  selectNextEvent,
} from "@/lib/engine-v3";
import type { DynastyRecord, GameState } from "@/lib/engine-v3";

const fixedNow = new Date("2026-06-27T00:00:00.000Z");

async function json(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

function terminalState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialGameState({
      era: "queen",
      rulerName: "Isolde",
      runId: "run-scripted",
      now: fixedNow,
    }),
    phase: "terminal",
    round: 6,
    year: 1566,
    generation: 2,
    dynastyRecords: [
      {
        id: "dynasty-gen-1",
        generation: 1,
        rulerName: "Isolde",
        era: "queen",
        startYear: 1560,
        endYear: 1566,
        rulingYears: 6,
        terminalType: "death",
        terminalId: "queen_bankruptcy",
        death: {
          id: "queen_bankruptcy",
          label: "Bankruptcy",
          causeTrack: "treasury",
          direction: "too_low",
          round: 6,
          year: 1566,
          epitaphTemplate: "{{rulerName}} spent the crown into silence.",
        },
        highestBars: { nobility: 50, people: 55, army: 50, treasury: 50 },
        lowestBars: { nobility: 42, people: 50, army: 50, treasury: 0 },
        keyChoices: [],
        inheritedLegacies: [],
        gainedLegacies: [],
        createdAt: fixedNow.toISOString(),
      },
      {
        id: "dynasty-gen-2",
        generation: 2,
        rulerName: "Isolde",
        era: "queen",
        startYear: 1567,
        endYear: 1572,
        rulingYears: 5,
        terminalType: "death",
        terminalId: "queen_military_regency",
        death: {
          id: "queen_military_regency",
          label: "Military Regency",
          causeTrack: "army",
          direction: "too_high",
          round: 5,
          year: 1572,
          epitaphTemplate: "{{rulerName}} vanished into a disputed chronicle.",
        },
        highestBars: { nobility: 50, people: 52, army: 100, treasury: 56 },
        lowestBars: { nobility: 45, people: 50, army: 50, treasury: 50 },
        keyChoices: [],
        inheritedLegacies: [],
        gainedLegacies: [],
        createdAt: fixedNow.toISOString(),
      },
    ],
    fatesDiscovered: ["queen_bankruptcy", "queen_military_regency"],
    ...overrides,
  };
}

function dynastyRecord(): DynastyRecord {
  const state = terminalState();
  return state.dynastyRecords[1];
}

describe("engine-v3 scripted mode", () => {
  it("starts unpaid runs in scripted mode with fate tracking fields", () => {
    const state = createInitialGameState({
      era: "queen",
      rulerName: "Isolde",
      runId: "run-scripted",
      now: fixedNow,
    });

    expect(state).toMatchObject({
      mode: "scripted",
      isPaid: false,
      fatesDiscovered: [],
    });
  });

  it("selects fixed scripted events for the first two unpaid generations", () => {
    const genOne = createInitialGameState({
      era: "queen",
      rulerName: "Isolde",
      runId: "run-scripted",
      now: fixedNow,
    });
    const genTwo = {
      ...genOne,
      generation: 2,
      round: 0,
      year: 1567,
    };

    expect(selectNextEvent(genOne, { rng: () => 0.99 }).id).toBe(
      SCRIPTED_REIGNS.queen[1].events[0].eventId,
    );
    expect(selectNextEvent({ ...genOne, round: 1 }, { rng: () => 0.99 }).id).toBe(
      SCRIPTED_REIGNS.queen[1].events[1].eventId,
    );
    expect(selectNextEvent(genTwo, { rng: () => 0.99 }).id).toBe(
      SCRIPTED_REIGNS.queen[2].events[0].eventId,
    );
  });

  it("uses freeplay random selection after paid unlock", () => {
    const state = createInitialGameState({
      era: "napoleon",
      rulerName: "Bonaparte",
      runId: "run-paid",
      now: fixedNow,
      isPaid: true,
      mode: "freeplay",
    });

    expect(selectNextEvent(state, { rng: () => 0 }).id).toBe("napoleon_supply_wagons_001");
  });

  it("tracks discovered death fates on terminal choice results", () => {
    const state = createInitialGameState({
      era: "queen",
      rulerName: "Isolde",
      runId: "run-fate",
      now: fixedNow,
    });
    const finalRound = {
      ...state,
      round: SCRIPTED_REIGNS.queen[1].events.length - 1,
      year: 1560 + SCRIPTED_REIGNS.queen[1].events.length - 1,
    };
    const event = selectNextEvent(finalRound);
    const result = applyChoice(finalRound, event, 0, fixedNow);

    expect(result.result.type).toBe("death");
    expect(result.gameState.fatesDiscovered).toContain(result.result.death?.id);
    expect(result.result.nextGenerationState?.fatesDiscovered).toContain(result.result.death?.id);
  });
});

describe("engine-v3 paywall and unlock", () => {
  it("returns a paywall restart response when unpaid users attempt generation three", async () => {
    const state = terminalState({ isPaid: false, mode: "scripted" });

    const response = await restartPost(
      new Request("https://throneera.com/api/engine-v3/restart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          runId: "run-scripted",
          terminalState: state,
          dynastyRecord: dynastyRecord(),
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(json(response)).resolves.toMatchObject({
      status: "paywall",
      paywallData: {
        nextGeneration: 3,
        fatesDiscovered: ["queen_bankruptcy", "queen_military_regency"],
        dynastyRecords: [
          expect.objectContaining({ terminalId: "queen_bankruptcy" }),
          expect.objectContaining({ terminalId: "queen_military_regency" }),
        ],
      },
    });
  });

  it("lets paid users restart into generation three freeplay", async () => {
    const state = terminalState({ isPaid: true, mode: "freeplay" });

    const response = await restartPost(
      new Request("https://throneera.com/api/engine-v3/restart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          runId: "run-scripted",
          terminalState: state,
          dynastyRecord: dynastyRecord(),
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(json(response)).resolves.toMatchObject({
      status: "ok",
      gameState: {
        generation: 3,
        isPaid: true,
        mode: "freeplay",
        fatesDiscovered: ["queen_bankruptcy", "queen_military_regency"],
      },
      card: {
        eventId: expect.not.stringMatching(/^queen_scripted_/),
      },
    });
  });

  it("unlocks a paywalled dynasty into paid freeplay", async () => {
    const state = terminalState({ isPaid: false, mode: "scripted" });

    const response = await unlockPost(
      new Request("https://throneera.com/api/engine-v3/unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          runId: "run-scripted",
          terminalState: state,
          dynastyRecord: dynastyRecord(),
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(json(response)).resolves.toMatchObject({
      status: "ok",
      gameState: {
        generation: 3,
        isPaid: true,
        mode: "freeplay",
        fatesDiscovered: ["queen_bankruptcy", "queen_military_regency"],
      },
      card: {
        choices: [{ id: expect.any(String) }, { id: expect.any(String) }],
      },
    });
  });
});
