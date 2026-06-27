import { describe, expect, it } from "vitest";
import { POST as restartPost } from "@/app/api/engine-v3/restart/route";
import { POST as unlockPost } from "@/app/api/engine-v3/unlock/route";
import { POST as unlockReplayPost } from "@/app/api/engine-v3/unlock-replay/route";
import { POST as unlockUnlimitedPost } from "@/app/api/engine-v3/unlock-unlimited/route";
import { createInitialGameState, isCampaignComplete } from "@/lib/engine-v3";
import type { DynastyRecord, GameState, TerminalType } from "@/lib/engine-v3";

const fixedNow = new Date("2026-06-27T00:00:00.000Z");

async function json(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

function paidTerminalState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialGameState({
      era: "queen",
      rulerName: "Isolde",
      runId: "run-campaign",
      now: fixedNow,
      isPaid: true,
      mode: "freeplay",
      fatesDiscovered: ["queen_bankruptcy", "queen_military_regency"],
    }),
    phase: "terminal",
    generation: 10,
    round: 4,
    year: 1572,
    campaignNumber: 2,
    campaignStartGen: 3,
    dynastyRecords: [
      record({ id: "dynasty-3", generation: 3, terminalId: "queen_bankruptcy", years: 3 }),
      record({
        id: "dynasty-4",
        generation: 4,
        terminalId: "queen_military_regency",
        years: 6,
      }),
    ],
    ...overrides,
  };
}

function record({
  id = "dynasty-10",
  generation = 10,
  terminalType = "death",
  terminalId = "queen_bankruptcy",
  years = 4,
}: {
  id?: string;
  generation?: number;
  terminalType?: TerminalType;
  terminalId?: string;
  years?: number;
} = {}): DynastyRecord {
  return {
    id,
    generation,
    rulerName: "Isolde",
    era: "queen",
    startYear: 1560 + generation,
    endYear: 1560 + generation + years,
    rulingYears: years,
    terminalType,
    terminalId,
    death:
      terminalType === "death"
        ? {
            id: "queen_bankruptcy",
            label: "Bankruptcy",
            causeTrack: "treasury",
            direction: "too_low",
            round: 4,
            year: 1560 + generation + years,
            epitaphTemplate: "{{rulerName}} spent the crown into silence.",
          }
        : undefined,
    highestBars: { nobility: 60, people: 55, army: 50, treasury: 50 },
    lowestBars: { nobility: 40, people: 48, army: 45, treasury: 0 },
    keyChoices: [],
    inheritedLegacies: [],
    gainedLegacies: [],
    createdAt: fixedNow.toISOString(),
  };
}

function postBody(state: GameState, dynastyRecord: DynastyRecord) {
  return {
    runId: state.runId,
    terminalState: state,
    dynastyRecord,
  };
}

function request(path: string, body: unknown) {
  return new Request(`https://throneera.com/api/engine-v3/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("engine-v3 campaign completion", () => {
  it("starts new games with campaign tracking fields", () => {
    const state = createInitialGameState({
      era: "napoleon",
      rulerName: "Bonaparte",
      runId: "run-initial-campaign",
      now: fixedNow,
    });

    expect(state).toMatchObject({
      campaignNumber: 1,
      campaignStartGen: 1,
      isUnlimitedPaid: false,
    });
  });

  it("detects campaign completion by victory or eight paid campaign generations", () => {
    expect(
      isCampaignComplete(paidTerminalState({ generation: 4 }), { type: "victory" }),
    ).toBe(true);
    expect(
      isCampaignComplete(paidTerminalState({ generation: 10, campaignStartGen: 3 }), {
        type: "death",
      }),
    ).toBe(true);
    expect(
      isCampaignComplete(paidTerminalState({ generation: 9, campaignStartGen: 3 }), {
        type: "death",
      }),
    ).toBe(false);
  });

  it("returns campaign_complete when a paid non-unlimited campaign ends in victory", async () => {
    const state = paidTerminalState({ generation: 4, campaignStartGen: 3 });
    const dynastyRecord = record({
      id: "dynasty-victory",
      generation: 4,
      terminalType: "victory",
      terminalId: "queen_stable_reign",
      years: 30,
    });

    const response = await restartPost(request("restart", postBody(state, dynastyRecord)));

    expect(response.status).toBe(200);
    await expect(json(response)).resolves.toMatchObject({
      status: "campaign_complete",
      completionData: {
        campaignNumber: 2,
        totalGenerations: 3,
        fatesDiscovered: ["queen_bankruptcy", "queen_military_regency"],
        longestReign: { rulerName: "Isolde", years: 30 },
        shortestReign: { rulerName: "Isolde", years: 3 },
        dynastyRecords: expect.arrayContaining([
          expect.objectContaining({ generation: 3 }),
          expect.objectContaining({ terminalType: "victory" }),
        ]),
      },
    });
  });

  it("returns campaign_complete when a paid non-unlimited campaign reaches eight generations", async () => {
    const state = paidTerminalState({ generation: 10, campaignStartGen: 3 });
    const dynastyRecord = record({ id: "dynasty-10", generation: 10, years: 5 });

    const response = await restartPost(request("restart", postBody(state, dynastyRecord)));

    expect(response.status).toBe(200);
    await expect(json(response)).resolves.toMatchObject({
      status: "campaign_complete",
      completionData: {
        campaignNumber: 2,
        totalGenerations: 3,
      },
    });
  });

  it("returns campaign_complete for Napoleon paid victories too", async () => {
    const state: GameState = {
      ...createInitialGameState({
        era: "napoleon",
        rulerName: "Napoleon Bonaparte",
        runId: "run-napoleon-campaign",
        now: fixedNow,
        isPaid: true,
        mode: "freeplay",
        fatesDiscovered: ["napoleon_marshal_coup"],
      }),
      phase: "terminal",
      generation: 3,
      round: 30,
      year: 1826,
      campaignNumber: 2,
      campaignStartGen: 3,
    };
    const dynastyRecord: DynastyRecord = {
      id: "dynasty-napoleon-victory",
      generation: 3,
      rulerName: "Napoleon Bonaparte",
      era: "napoleon",
      startYear: 1796,
      endYear: 1826,
      rulingYears: 30,
      terminalType: "victory",
      terminalId: "napoleon_stable_reign",
      highestBars: { army: 75, treasury: 60, diplomacy: 70, publicSupport: 65 },
      lowestBars: { army: 40, treasury: 35, diplomacy: 38, publicSupport: 42 },
      keyChoices: [],
      inheritedLegacies: [],
      gainedLegacies: [],
      createdAt: fixedNow.toISOString(),
    };

    const response = await restartPost(
      request("restart", {
        runId: "run-napoleon-campaign",
        terminalState: state,
        dynastyRecord,
      }),
    );

    expect(response.status).toBe(200);
    await expect(json(response)).resolves.toMatchObject({
      status: "campaign_complete",
      completionData: {
        campaignNumber: 2,
        longestReign: { rulerName: "Napoleon Bonaparte", years: 30 },
        dynastyRecords: [expect.objectContaining({ era: "napoleon", terminalType: "victory" })],
      },
    });
  });

  it("does not return campaign_complete for unlimited paid players", async () => {
    const state = paidTerminalState({
      generation: 10,
      campaignStartGen: 3,
      isUnlimitedPaid: true,
    });
    const dynastyRecord = record({ id: "dynasty-10", generation: 10, years: 5 });

    const response = await restartPost(request("restart", postBody(state, dynastyRecord)));

    expect(response.status).toBe(200);
    await expect(json(response)).resolves.toMatchObject({
      status: "ok",
      gameState: {
        generation: 11,
        campaignNumber: 2,
        campaignStartGen: 3,
        isUnlimitedPaid: true,
        fatesDiscovered: ["queen_bankruptcy", "queen_military_regency"],
      },
    });
  });

  it("first unlock starts the paid campaign at generation three", async () => {
    const state = paidTerminalState({
      isPaid: false,
      mode: "scripted",
      generation: 2,
      campaignNumber: 1,
      campaignStartGen: 1,
    });
    const dynastyRecord = record({ id: "dynasty-2", generation: 2, years: 5 });

    const response = await unlockPost(request("unlock", postBody(state, dynastyRecord)));

    expect(response.status).toBe(200);
    await expect(json(response)).resolves.toMatchObject({
      status: "ok",
      gameState: {
        generation: 3,
        campaignNumber: 2,
        campaignStartGen: 3,
        isPaid: true,
        isUnlimitedPaid: false,
        mode: "freeplay",
      },
    });
  });

  it("unlock-replay starts a new paid campaign and keeps discovered fates", async () => {
    const state = paidTerminalState();
    const dynastyRecord = record({ id: "dynasty-10", generation: 10, years: 5 });

    const response = await unlockReplayPost(
      request("unlock-replay", postBody(state, dynastyRecord)),
    );

    expect(response.status).toBe(200);
    await expect(json(response)).resolves.toMatchObject({
      status: "ok",
      gameState: {
        generation: 11,
        campaignNumber: 3,
        campaignStartGen: 11,
        isPaid: true,
        isUnlimitedPaid: false,
        mode: "freeplay",
        fatesDiscovered: ["queen_bankruptcy", "queen_military_regency"],
      },
      card: {
        choices: [{ id: expect.any(String) }, { id: expect.any(String) }],
      },
    });
  });

  it("unlock-unlimited starts a new campaign and suppresses all future campaign paywalls", async () => {
    const state = paidTerminalState();
    const dynastyRecord = record({ id: "dynasty-10", generation: 10, years: 5 });

    const response = await unlockUnlimitedPost(
      request("unlock-unlimited", postBody(state, dynastyRecord)),
    );

    expect(response.status).toBe(200);
    await expect(json(response)).resolves.toMatchObject({
      status: "ok",
      gameState: {
        generation: 11,
        campaignNumber: 3,
        campaignStartGen: 11,
        isPaid: true,
        isUnlimitedPaid: true,
        mode: "freeplay",
        fatesDiscovered: ["queen_bankruptcy", "queen_military_regency"],
      },
    });
  });
});
