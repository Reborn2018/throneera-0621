import { NextResponse } from "next/server";
import { z } from "zod";
import { applyCheckoutCompleted, applyRefundOrDispute } from "@/lib/engine/checkout";
import { getStore } from "@/lib/server/store";

const webhookSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("checkout.completed"),
    providerEventId: z.string(),
    providerCheckoutId: z.string(),
    providerOrderId: z.string(),
    providerProductId: z.string(),
    amountMinor: z.number(),
    currency: z.literal("USD"),
  }),
  z.object({
    type: z.literal("checkout.refunded"),
    providerEventId: z.string(),
    providerOrderId: z.string(),
  }),
  z.object({
    type: z.literal("checkout.disputed"),
    providerEventId: z.string(),
    providerOrderId: z.string(),
  }),
]);

export async function POST(request: Request) {
  const payload = webhookSchema.parse(await request.json());
  const store = await getStore();

  if (payload.type === "checkout.completed") {
    await applyCheckoutCompleted({
      store,
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
      providerEventId: payload.providerEventId,
      providerOrderId: payload.providerOrderId,
      status: payload.type === "checkout.refunded" ? "refunded" : "disputed",
    });
  }

  return NextResponse.json({ ok: true });
}
