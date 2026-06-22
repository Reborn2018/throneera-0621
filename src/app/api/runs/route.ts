import { NextResponse } from "next/server";
import { z } from "zod";
import { createReplayRun, createRun, submitIdentity } from "@/lib/engine/runs";
import { isSimulatorSlug } from "@/lib/simulators";
import { readRequestData, redirectResponse, wantsHtmlRedirect } from "@/lib/server/request";
import { getStore } from "@/lib/server/store";
import { getConfigVariantForSimulator, variantUrlForRun } from "@/lib/variants";

const runSchema = z.object({
  simulator: z.string(),
  name: z.string().optional(),
  dispositionId: z.string().optional(),
  originId: z.string().optional(),
  sourceRunId: z.string().optional(),
  runType: z.enum(["first_campaign", "replay", "cross_sell"]).optional(),
  variantId: z.string().optional(),
});

export async function POST(request: Request) {
  const data = runSchema.parse(await readRequestData(request));
  if (!isSimulatorSlug(data.simulator)) {
    return NextResponse.json({ error: "Unknown simulator" }, { status: 400 });
  }

  const store = await getStore();
  const variantId = getConfigVariantForSimulator(data.simulator, data.variantId);
  if (data.runType === "replay" && !data.sourceRunId) {
    return NextResponse.json({ error: "Replay requires a source run" }, { status: 400 });
  }

  const run =
    data.runType === "replay" && data.sourceRunId
      ? await createReplayRun({
          store,
          sourceRunId: data.sourceRunId,
        })
      : await createRun({
          store,
          simulator: data.simulator,
          runType: data.runType ?? (data.sourceRunId ? "cross_sell" : "first_campaign"),
          sourceRunId: data.sourceRunId,
          variantId: data.simulator === "queen" ? variantId : undefined,
        });

  const withIdentity =
    data.name && data.dispositionId && data.originId
      ? await submitIdentity({
          store,
          runId: run.id,
          name: data.name,
          dispositionId: data.dispositionId,
          originId: data.originId,
        })
      : run;

  if (wantsHtmlRedirect(request)) {
    return redirectResponse(
      request,
      variantUrlForRun(`/${withIdentity.simulator}/play/${withIdentity.id}`, withIdentity),
    );
  }

  return NextResponse.json({ run: withIdentity });
}
