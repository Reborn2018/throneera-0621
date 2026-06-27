import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createNextGenerationState,
  buildCampaignCompletionData,
  isCampaignComplete,
  recordTelemetry,
  renderEvent,
  selectNextEvent,
} from "@/lib/engine-v3";
import type { DynastyRecord, GameState, RestartResponse } from "@/lib/engine-v3";

const restartSchema = z.object({
  runId: z.string().trim().min(1),
  terminalState: z.custom<GameState>((value) => Boolean(value && typeof value === "object")),
  dynastyRecord: z.custom<DynastyRecord>((value) => Boolean(value && typeof value === "object")),
});

export async function POST(request: Request) {
  const parsed = restartSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid engine-v3 restart payload" }, { status: 400 });
  }

  const { runId, terminalState, dynastyRecord } = parsed.data;
  if (terminalState.runId !== runId) {
    return NextResponse.json({ error: "Run id mismatch" }, { status: 400 });
  }
  if (terminalState.phase !== "terminal") {
    return NextResponse.json({ error: "Restart requires a terminal state" }, { status: 400 });
  }

  const nextGeneration = terminalState.generation + 1;
  const dynastyRecords = appendUniqueDynastyRecord(terminalState.dynastyRecords, dynastyRecord);
  if (!terminalState.isPaid && nextGeneration >= 3) {
    const response: RestartResponse = {
      status: "paywall",
      paywallData: {
        dynastyRecords,
        fatesDiscovered: [...terminalState.fatesDiscovered],
        nextGeneration,
      },
    };

    await recordTelemetry({
      name: "engine_v3_restart_clicked",
      payload: {
        runId,
        era: terminalState.era,
        generation: terminalState.generation,
        round: terminalState.round,
        terminalType: dynastyRecord.terminalType,
        terminalId: dynastyRecord.terminalId,
        deathId: dynastyRecord.death?.id,
      },
    });

    return NextResponse.json(response);
  }

  if (
    terminalState.isPaid &&
    !terminalState.isUnlimitedPaid &&
    isCampaignComplete(terminalState, { type: dynastyRecord.terminalType })
  ) {
    const response: RestartResponse = {
      status: "campaign_complete",
      completionData: buildCampaignCompletionData(terminalState, dynastyRecords),
    };

    await recordTelemetry({
      name: "engine_v3_run_completed",
      payload: {
        runId,
        era: terminalState.era,
        generation: terminalState.generation,
        round: terminalState.round,
        terminalType: dynastyRecord.terminalType,
        terminalId: dynastyRecord.terminalId,
        deathId: dynastyRecord.death?.id,
      },
    });

    return NextResponse.json(response);
  }

  const gameState = createNextGenerationState(
    removeDynastyRecord(terminalState, dynastyRecord.id),
    dynastyRecord,
  );
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

  const response: RestartResponse = { status: "ok", gameState, card };
  return NextResponse.json(response);
}

function appendUniqueDynastyRecord(records: DynastyRecord[], record: DynastyRecord): DynastyRecord[] {
  if (records.some((candidate) => candidate.id === record.id)) {
    return [...records];
  }
  return [...records, record];
}

function removeDynastyRecord(state: GameState, recordId: string): GameState {
  return {
    ...state,
    dynastyRecords: state.dynastyRecords.filter((record) => record.id !== recordId),
  };
}
