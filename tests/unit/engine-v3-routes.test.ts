import { describe, expect, it } from "vitest";
import { POST as startPost } from "@/app/api/engine-v3/start/route";
import { POST as choicePost } from "@/app/api/engine-v3/choice/route";
import { POST as restartPost } from "@/app/api/engine-v3/restart/route";
import { createInitialGameState, selectNextEvent } from "@/lib/engine-v3";

async function json(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

describe("engine-v3 API routes", () => {
  it("starts a stateless game and returns the first rendered card", async () => {
    const response = await startPost(
      new Request("https://throneera.com/api/engine-v3/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ era: "queen", rulerName: "Isolde", runId: "run-test" }),
      }),
    );

    expect(response.status).toBe(200);
    const body = await json(response);

    expect(body.gameState).toMatchObject({
      runId: "run-test",
      era: "queen",
      rulerName: "Isolde",
      generation: 1,
      phase: "active",
      round: 0,
      mode: "scripted",
      isPaid: false,
      fatesDiscovered: [],
    });
    expect(body.card).toMatchObject({
      eventId: expect.any(String),
      title: expect.any(String),
      body: expect.any(String),
      choices: [{ id: expect.any(String) }, { id: expect.any(String) }],
      llmUsed: false,
    });
  });

  it("submits a choice and returns either a terminal result or the next card", async () => {
    const gameState = createInitialGameState({
      era: "napoleon",
      rulerName: "Bonaparte",
      runId: "run-napoleon",
      now: new Date("2026-06-26T00:00:00.000Z"),
    });
    const event = selectNextEvent(gameState, { rng: () => 0 });

    const response = await choicePost(
      new Request("https://throneera.com/api/engine-v3/choice", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          runId: "run-napoleon",
          gameState,
          eventId: event.id,
          choiceIndex: 0,
        }),
      }),
    );

    expect(response.status).toBe(200);
    const body = await json(response);

    expect(body.gameState).toMatchObject({
      runId: "run-napoleon",
      era: "napoleon",
      round: 1,
      occurredEventIds: [event.id],
    });
    expect(body.result).toMatchObject({ type: "continue" });
    expect(body.nextCard).toMatchObject({
      eventId: expect.any(String),
      choices: [{ id: expect.any(String) }, { id: expect.any(String) }],
    });
  });

  it("omits nextCard when a submitted choice reaches terminal state", async () => {
    const gameState = {
      ...createInitialGameState({
        era: "queen",
        rulerName: "Isolde",
        runId: "run-terminal",
        now: new Date("2026-06-26T00:00:00.000Z"),
        isPaid: true,
        mode: "freeplay",
      }),
      bars: { nobility: 50, people: 50, army: 50, treasury: 1 },
      lowestBars: { nobility: 50, people: 50, army: 50, treasury: 1 },
    };

    const response = await choicePost(
      new Request("https://throneera.com/api/engine-v3/choice", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          runId: "run-terminal",
          gameState,
          eventId: "queen_tax_petition_001",
          choiceIndex: 1,
        }),
      }),
    );

    expect(response.status).toBe(200);
    const body = await json(response);

    expect(body.result).toMatchObject({
      type: "death",
      terminalId: "queen_bankruptcy",
    });
    expect(body).not.toHaveProperty("nextCard");
  });

  it("rejects out-of-order random events during unpaid scripted mode", async () => {
    const gameState = createInitialGameState({
      era: "queen",
      rulerName: "Isolde",
      runId: "run-scripted-order",
      now: new Date("2026-06-26T00:00:00.000Z"),
    });

    const response = await choicePost(
      new Request("https://throneera.com/api/engine-v3/choice", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          runId: "run-scripted-order",
          gameState,
          eventId: "queen_tax_petition_001",
          choiceIndex: 0,
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(json(response)).resolves.toMatchObject({ error: "Unknown engine-v3 event" });
  });

  it("restarts from a dynasty record and returns a next-generation card", async () => {
    const terminalState = {
      ...createInitialGameState({
        era: "queen",
        rulerName: "Isolde",
        runId: "run-restart",
        now: new Date("2026-06-26T00:00:00.000Z"),
      }),
      phase: "terminal" as const,
      round: 5,
      year: 1565,
    };
    const dynastyRecord = {
      id: "dynasty-1",
      generation: 1,
      rulerName: "Isolde",
      era: "queen" as const,
      startYear: 1560,
      endYear: 1565,
      rulingYears: 5,
      terminalType: "death" as const,
      terminalId: "queen_bankruptcy",
      death: {
        id: "queen_bankruptcy" as const,
        label: "Bankruptcy",
        causeTrack: "treasury" as const,
        direction: "too_low" as const,
        round: 5,
        year: 1565,
        epitaphTemplate: "{{rulerName}} spent the crown into silence.",
      },
      highestBars: terminalState.highestBars,
      lowestBars: terminalState.lowestBars,
      keyChoices: [],
      inheritedLegacies: [],
      gainedLegacies: [],
      createdAt: "2026-06-26T00:00:00.000Z",
    };

    const response = await restartPost(
      new Request("https://throneera.com/api/engine-v3/restart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ runId: "run-restart", terminalState, dynastyRecord }),
      }),
    );

    expect(response.status).toBe(200);
    const body = await json(response);

    expect(body.status).toBe("ok");
    expect(body.gameState).toMatchObject({
      runId: "run-restart",
      generation: 2,
      phase: "active",
      round: 0,
      mode: "scripted",
      isPaid: false,
      inheritedLegacies: [expect.objectContaining({ id: "legacy_queen_bankruptcy" })],
    });
    expect(body.card).toMatchObject({
      eventId: expect.any(String),
      choices: [{ id: expect.any(String) }, { id: expect.any(String) }],
    });
  });

  it("rejects invalid route payloads", async () => {
    const response = await startPost(
      new Request("https://throneera.com/api/engine-v3/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ era: "rome", rulerName: "" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(json(response)).resolves.toMatchObject({ error: expect.any(String) });
  });
});
