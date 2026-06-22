import { createMetaCapiClient } from "@/lib/adapters/meta-capi";
import type { RunStore } from "@/lib/adapters/store";
import type { OrderRecord } from "@/lib/types";
import { runVariantPayload } from "@/lib/variants";

interface MetaPurchaseOptions {
  order: OrderRecord;
  store: RunStore;
  requestOrigin?: string;
}

export async function sendMetaPurchaseIfConfigured({
  order,
  store,
  requestOrigin,
}: MetaPurchaseOptions): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? requestOrigin;
  if (!pixelId || !accessToken || !siteUrl) {
    return;
  }

  const run = await store.getRun(order.runId);
  if (!run) {
    return;
  }
  const variantPayload = runVariantPayload(run);

  const sourceUrl = new URL(`/${run.simulator}/return`, siteUrl);
  sourceUrl.searchParams.set("runId", order.runId);
  sourceUrl.searchParams.set("variant", variantPayload.variant_id);

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
    variantId: variantPayload.variant_id,
    experimentId: variantPayload.experiment_id,
    testEventCode: process.env.META_TEST_EVENT_CODE,
  });
}
