import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createInitialGameState,
  recordTelemetry,
  renderEvent,
  selectNextEvent,
} from "@/lib/engine-v3";

const startSchema = z.object({
  era: z.enum(["queen", "napoleon"]),
  rulerName: z.string().trim().min(1),
  runId: z.string().trim().min(1).optional(),
});

export async function POST(request: Request) {
  const parsed = startSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid engine-v3 start payload" }, { status: 400 });
  }

  const gameState = createInitialGameState(parsed.data);
  const event = selectNextEvent(gameState);
  const card = await renderEvent(event, gameState);

  await recordTelemetry({
    name: "engine_v3_run_started",
    payload: {
      runId: gameState.runId,
      era: gameState.era,
      generation: gameState.generation,
      round: gameState.round,
    },
  });
  await recordTelemetry({
    name: "engine_v3_card_viewed",
    payload: {
      runId: gameState.runId,
      era: gameState.era,
      generation: gameState.generation,
      round: gameState.round,
      eventId: event.id,
      eventTags: event.tags,
    },
  });

  return NextResponse.json({ gameState, card });
}
