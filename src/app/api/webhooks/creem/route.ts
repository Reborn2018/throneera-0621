import { NextResponse } from "next/server";
import {
  parseCreemWebhookEvent,
  verifyCreemWebhookSignature,
} from "@/lib/adapters/creem";
import { applyCheckoutCompleted, applyRefundOrDispute } from "@/lib/engine/checkout";
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
    await applyCheckoutCompleted({
      store,
      provider: "creem",
      providerEventId: payload.providerEventId,
      providerCheckoutId: payload.providerCheckoutId,
      providerOrderId: payload.providerOrderId,
      providerProductId: payload.providerProductId,
      amountMinor: payload.amountMinor,
      currency: payload.currency,
    });
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
