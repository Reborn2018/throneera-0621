import { NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutForRun } from "@/lib/engine/checkout";
import { readRequestData, redirectResponse, wantsHtmlRedirect } from "@/lib/server/request";
import { getStore } from "@/lib/server/store";

const checkoutSchema = z.object({
  runId: z.string().min(1),
});

export async function POST(request: Request) {
  const data = checkoutSchema.parse(await readRequestData(request));
  const session = await createCheckoutForRun({
    store: await getStore(),
    runId: data.runId,
    requestId: crypto.randomUUID(),
    providerProductId:
      process.env.CREEM_COMPLETE_CAMPAIGN_PRODUCT_ID ?? "prod_complete_current_campaign",
    allowMockCheckout:
      process.env.THRONEERA_ALLOW_MOCK_CHECKOUT === "true" &&
      process.env.NODE_ENV !== "production",
  });

  if (wantsHtmlRedirect(request)) {
    return redirectResponse(request, session.checkoutUrl);
  }

  return NextResponse.json(session);
}
