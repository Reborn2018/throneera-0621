import { NextResponse } from "next/server";
import { z } from "zod";
import { createCreemCheckoutProvider } from "@/lib/adapters/creem";
import { createCheckoutForRun } from "@/lib/engine/checkout";
import {
  jsonError,
  readRequestData,
  redirectResponse,
  wantsHtmlRedirect,
} from "@/lib/server/request";
import { getStore } from "@/lib/server/store";

const checkoutSchema = z.object({
  runId: z.string().min(1),
  mode: z.enum(["open", "prefetch"]).optional().default("open"),
});

export async function POST(request: Request) {
  const data = checkoutSchema.parse(await readRequestData(request));
  const allowMockCheckout =
    process.env.THRONEERA_ALLOW_MOCK_CHECKOUT === "true" &&
    process.env.VERCEL_ENV !== "production";
  const providerProductId = process.env.CREEM_COMPLETE_CAMPAIGN_PRODUCT_ID;
  const creemApiKey = process.env.CREEM_API_KEY;

  if (!allowMockCheckout && (!providerProductId || !creemApiKey)) {
    return jsonError("Checkout provider is not configured", 503);
  }

  const session = await createCheckoutForRun({
    store: await getStore(),
    runId: data.runId,
    requestId: crypto.randomUUID(),
    providerProductId: providerProductId ?? "prod_complete_current_campaign",
    allowMockCheckout,
    trackCheckoutStarted: data.mode === "open",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin,
    checkoutProvider:
      allowMockCheckout || !creemApiKey
        ? undefined
        : createCreemCheckoutProvider({
            apiKey: creemApiKey,
            apiBaseUrl: process.env.CREEM_API_BASE_URL,
          }),
  });

  if (wantsHtmlRedirect(request)) {
    return redirectResponse(request, session.checkoutUrl);
  }

  return NextResponse.json(session);
}
