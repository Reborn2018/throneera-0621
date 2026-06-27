import { NextResponse } from "next/server";
import { z } from "zod";
import { syncCreemReturnEntitlement } from "@/lib/server/creem-return";
import { getStore } from "@/lib/server/store";
import type { OfferSku } from "@/lib/types";

const completeSchema = z.object({
  checkoutRunId: z.string().trim().min(1),
  purchaseKind: z.enum(["campaign", "replay", "unlimited"]).optional().default("campaign"),
});

export async function POST(request: Request) {
  const parsed = completeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid engine-v3 checkout completion payload" }, { status: 400 });
  }

  const store = await getStore();
  const run = await store.getRun(parsed.data.checkoutRunId);
  if (!run) {
    return NextResponse.json({ error: "Checkout run not found" }, { status: 404 });
  }

  if (
    run.status === "paid" ||
    (parsed.data.purchaseKind === "campaign" && (await store.getActiveEntitlementForRun(run.id)))
  ) {
    return NextResponse.json({ checkoutRunId: run.id, verified: true });
  }

  if (!process.env.CREEM_API_KEY) {
    return NextResponse.json({ checkoutRunId: run.id, verified: false }, { status: 503 });
  }

  const updated = await syncCreemReturnEntitlement({
    store,
    run,
    apiKey: process.env.CREEM_API_KEY,
    apiBaseUrl: process.env.CREEM_API_BASE_URL,
    requestOrigin: process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin,
    offerSku: offerSkuForPurchaseKind(parsed.data.purchaseKind),
  });

  return NextResponse.json({
    checkoutRunId: run.id,
    verified: updated.status === "paid",
  });
}

function offerSkuForPurchaseKind(purchaseKind: "campaign" | "replay" | "unlimited"): OfferSku {
  return purchaseKind === "unlimited" ? "engine_v3_unlimited" : "complete_current_campaign";
}
