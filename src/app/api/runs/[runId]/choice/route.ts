import { NextResponse } from "next/server";
import { z } from "zod";
import { submitChoice } from "@/lib/engine/runs";
import { readRequestData, redirectResponse, wantsHtmlRedirect } from "@/lib/server/request";
import { getStore } from "@/lib/server/store";
import { variantUrlForRun } from "@/lib/variants";

const choiceSchema = z.object({
  choiceId: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params;
  const data = choiceSchema.parse(await readRequestData(request));
  const run = await submitChoice({
    store: await getStore(),
    runId,
    choiceId: data.choiceId,
  });

  if (wantsHtmlRedirect(request)) {
    if (run.status === "paywalled" || run.status === "checkout_pending") {
      return redirectResponse(request, variantUrlForRun(`/${run.simulator}/unlock/${run.id}`, run));
    }

    if (run.status === "completed") {
      return redirectResponse(request, variantUrlForRun(`/${run.simulator}/ending/${run.id}`, run));
    }

    return redirectResponse(request, variantUrlForRun(`/${run.simulator}/play/${run.id}`, run));
  }

  return NextResponse.json({ run });
}
