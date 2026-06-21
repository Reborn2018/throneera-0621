import { NextResponse } from "next/server";
import { z } from "zod";
import { createRun, submitIdentity } from "@/lib/engine/runs";
import { isSimulatorSlug } from "@/lib/simulators";
import { readRequestData, redirectResponse, wantsHtmlRedirect } from "@/lib/server/request";
import { getStore } from "@/lib/server/store";

const runSchema = z.object({
  simulator: z.string(),
  name: z.string().optional(),
  dispositionId: z.string().optional(),
  originId: z.string().optional(),
  sourceRunId: z.string().optional(),
});

export async function POST(request: Request) {
  const data = runSchema.parse(await readRequestData(request));
  if (!isSimulatorSlug(data.simulator)) {
    return NextResponse.json({ error: "Unknown simulator" }, { status: 400 });
  }

  const store = await getStore();
  const run = await createRun({
    store,
    simulator: data.simulator,
    runType: data.sourceRunId ? "cross_sell" : "first_campaign",
    sourceRunId: data.sourceRunId,
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
    return redirectResponse(request, `/${withIdentity.simulator}/play/${withIdentity.id}`);
  }

  return NextResponse.json({ run: withIdentity });
}
