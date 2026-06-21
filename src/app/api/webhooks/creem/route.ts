import { NextResponse } from "next/server";
import {
  parseCreemWebhookEvent,
  verifyCreemWebhookSignature,
} from "@/lib/adapters/creem";
import { createMetaCapiClient } from "@/lib/adapters/meta-capi";
import type { RunStore } from "@/lib/adapters/store";
import { applyCheckoutCompleted, applyRefundOrDispute } from "@/lib/engine/checkout";
import type { OrderRecord } from "@/lib/types";
import { getStore } from "@/lib/server/store";

export async function POST(request: Request) {
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Creem webhook is not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  if (
    !verifyCreemWebhookSignature(
      rawBody,
      request.headers.get("creem-signature"),
      webhookSecret,
    )
  ) {
    return NextResponse.json({ error: "Invalid Creem webhook signature" }, { status: 401 });
  }

  let payload: ReturnType<typeof parseCreemWebhookEvent>;
  try {
    payload = parseCreemWebhookEvent(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "Invalid Creem webhook payload" }, { status: 400 });
  }

  const store = await getStore();

  if (payload.type === "checkout.completed") {
    const order = await applyCheckoutCompleted({
      store,
      provider: "creem",
      providerEventId: payload.providerEventId,
      providerCheckoutId: payload.providerCheckoutId,
      providerOrderId: payload.providerOrderId,
      providerProductId: payload.providerProductId,
      amountMinor: payload.amountMinor,
      currency: payload.currency,
    });
    await sendMetaPurchaseIfConfigured(order, store, new URL(request.url).origin);
  } else {
    await applyRefundOrDispute({
      store,
      provider: "creem",
      providerEventId: payload.providerEventId,
      providerOrderId: payload.providerOrderId,
      status: payload.type === "checkout.refunded" ? "refunded" : "disputed",
    });
  }

  return NextResponse.json({ ok: true });
}

async function sendMetaPurchaseIfConfigured(
  order: OrderRecord,
  store: RunStore,
  requestOrigin: string,
): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!pixelId || !accessToken) {
    return;
  }

  const run = await store.getRun(order.runId);
  if (!run) {
    return;
  }

  const sourceUrl = new URL(
    `/${run.simulator}/return`,
    process.env.NEXT_PUBLIC_SITE_URL ?? requestOrigin,
  );
  sourceUrl.searchParams.set("runId", order.runId);

  await createMetaCapiClient({
    pixelId,
    accessToken,
    apiVersion: process.env.META_GRAPH_API_VERSION,
  }).sendPurchase({
    eventId: order.requestId,
    sourceUrl: sourceUrl.toString(),
    orderId: order.providerOrderId ?? order.id,
    value: order.amountMinor / 100,
    currency: order.currency,
    sku: order.sku,
    testEventCode: process.env.META_TEST_EVENT_CODE,
  });
}
