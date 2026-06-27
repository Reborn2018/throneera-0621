import { NextResponse } from "next/server";
import { z } from "zod";
import {
  applyChoice,
  findEventForState,
  recordTelemetry,
  renderEvent,
  selectNextEvent,
} from "@/lib/engine-v3";
import type { GameState } from "@/lib/engine-v3";

const choiceSchema = z.object({
  runId: z.string().trim().min(1),
  gameState: z.custom<GameState>((value) => Boolean(value && typeof value === "object")),
  eventId: z.string().trim().min(1),
  choiceIndex: z.number().int().min(0).max(1),
});

export async function POST(request: Request) {
  const parsed = choiceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid engine-v3 choice payload" }, { status: 400 });
  }

  const { runId, gameState, eventId, choiceIndex } = parsed.data;
  if (gameState.runId !== runId) {
    return NextResponse.json({ error: "Run id mismatch" }, { status: 400 });
  }

  const event = findEventForState(gameState, eventId);
  if (!event) {
    return NextResponse.json({ error: "Unknown engine-v3 event" }, { status: 400 });
  }

  const applied = applyChoice(gameState, event, choiceIndex);
  const choice = event.choices[choiceIndex];

  await recordTelemetry({
    name: "engine_v3_choice_submitted",
    payload: {
      runId,
      era: applied.gameState.era,
      generation: applied.gameState.generation,
      round: applied.gameState.round,
      eventId: event.id,
      choiceId: choice.id,
      eventTags: event.tags,
      bars: applied.gameState.bars,
    },
  });

  if (applied.result.type !== "continue") {
    await recordTelemetry({
      name: "engine_v3_terminal_reached",
      payload: {
        runId,
        era: applied.gameState.era,
        generation: applied.gameState.generation,
        round: applied.gameState.round,
        terminalType: applied.result.type,
        terminalId: applied.result.terminalId,
        deathId: applied.result.death?.id,
        decisionCount: applied.gameState.occurredEventIds.length,
        llmCallsThisRun: applied.gameState.llmCallsThisRun,
        bars: applied.gameState.bars,
      },
    });

    return NextResponse.json(applied);
  }

  const nextEvent = selectNextEvent(applied.gameState);
  const nextCard = await renderEvent(nextEvent, applied.gameState);

  await recordTelemetry({
    name: "engine_v3_card_viewed",
    payload: {
      runId,
      era: applied.gameState.era,
      generation: applied.gameState.generation,
      round: applied.gameState.round,
      eventId: nextEvent.id,
      eventTags: nextEvent.tags,
    },
  });

  return NextResponse.json({ ...applied, nextCard });
}
