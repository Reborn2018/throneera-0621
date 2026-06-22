import { nanoid } from "nanoid";
import type { RunStore } from "@/lib/adapters/store";
import type { RunRecord } from "@/lib/types";
import { runVariantPayload } from "@/lib/variants";

export async function appendRunFunnelEvent(
  store: RunStore,
  run: RunRecord,
  eventType: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  await store.appendRunEvent({
    id: `event-${nanoid()}`,
    runId: run.id,
    eventType,
    sceneId: typeof payload.scene_id === "string" ? payload.scene_id : undefined,
    choiceId: typeof payload.choice_id === "string" ? payload.choice_id : undefined,
    payload: {
      ...runVariantPayload(run),
      run_status: run.status,
      run_type: run.runType,
      ...payload,
    },
    createdAt: new Date().toISOString(),
  });
}
