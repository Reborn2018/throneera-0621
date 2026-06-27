import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createNextGenerationState,
  recordTelemetry,
  renderEvent,
  selectNextEvent,
} from "@/lib/engine-v3";
import type { DynastyRecord, GameState, UnlockResponse } from "@/lib/engine-v3";

const unlockReplaySchema = z.object({
  runId: z.string().trim().min(1),
  terminalState: z.custom<GameState>((value) => Boolean(value && typeof value === "object")),
  dynastyRecord: z.custom<DynastyRecord>((value) => Boolean(value && typeof value === "object")),
});

export async function POST(request: Request) {
  const parsed = unlockReplaySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid engine-v3 replay unlock payload" }, { status: 400 });
  }

  const { runId, terminalState, dynastyRecord } = parsed.data;
  if (terminalState.runId !== runId) {
    return NextResponse.json({ error: "Run id mismatch" }, { status: 400 });
  }
  if (terminalState.phase !== "terminal") {
    return NextResponse.json({ error: "Replay unlock requires a terminal state" }, { status: 400 });
  }

  const replayTerminalState: GameState = {
    ...removeDynastyRecord(terminalState, dynastyRecord.id),
    isPaid: true,
    mode: "freeplay",
    campaignNumber: (terminalState.campaignNumber ?? 1) + 1,
    campaignStartGen: terminalState.generation + 1,
    isUnlimitedPaid: terminalState.isUnlimitedPaid ?? false,
  };
  const gameState = createNextGenerationState(replayTerminalState, dynastyRecord);
  const event = selectNextEvent(gameState);
  const card = await renderEvent(event, gameState);

  await recordTelemetry({
    name: "engine_v3_next_generation_started",
    payload: {
      runId,
      era: gameState.era,
      generation: gameState.generation,
      round: gameState.round,
      terminalType: dynastyRecord.terminalType,
      terminalId: dynastyRecord.terminalId,
      deathId: dynastyRecord.death?.id,
    },
  });

  const response: UnlockResponse = { status: "ok", gameState, card };
  return NextResponse.json(response);
}

function removeDynastyRecord(state: GameState, recordId: string): GameState {
  return {
    ...state,
    dynastyRecords: state.dynastyRecords.filter((record) => record.id !== recordId),
  };
}
