import { NextResponse } from "next/server";
import { z } from "zod";
import { submitChoice } from "@/lib/engine/runs";
import { readRequestData, redirectResponse, wantsHtmlRedirect } from "@/lib/server/request";
import { getStore } from "@/lib/server/store";

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
      return redirectResponse(request, `/${run.simulator}/unlock/${run.id}`);
    }

    if (run.status === "completed") {
      return redirectResponse(request, `/${run.simulator}/ending/${run.id}`);
    }

    return redirectResponse(request, `/${run.simulator}/play/${run.id}`);
  }

  return NextResponse.json({ run });
}
