import { retrieveCreemCheckoutSession } from "@/lib/adapters/creem";
import type { RunStore } from "@/lib/adapters/store";
import { applyCheckoutCompleted } from "@/lib/engine/checkout";
import { sendMetaPurchaseIfConfigured } from "@/lib/server/meta-purchase";
import { getSimulatorConfig } from "@/lib/simulators";
import type { OfferSku, RunRecord } from "@/lib/types";
import { getRunVariantId } from "@/lib/variants";

interface CreemReturnOptions {
  store: RunStore;
  run: RunRecord;
  apiKey?: string;
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
  requestOrigin?: string;
  offerSku?: OfferSku;
}

export async function syncCreemReturnEntitlement(
  options: CreemReturnOptions,
): Promise<RunRecord> {
  if (!options.apiKey || options.run.status !== "checkout_pending") {
    return options.run;
  }

  const offerSku =
    options.offerSku ?? getSimulatorConfig(options.run.simulator, getRunVariantId(options.run)).offer.sku;
  const order = await options.store.findOpenOrder(options.run.id, offerSku);
  if (!order || order.provider !== "creem") {
    return options.run;
  }

  const checkout = await retrieveCreemCheckoutSession(
    {
      apiKey: options.apiKey,
      apiBaseUrl: options.apiBaseUrl,
      fetchImpl: options.fetchImpl,
    },
    order.providerCheckoutId,
  );

  if (
    checkout.status !== "completed" ||
    checkout.providerCheckoutId !== order.providerCheckoutId ||
    checkout.requestId !== order.requestId
  ) {
    return options.run;
  }

  const completedOrder = await applyCheckoutCompleted({
    store: options.store,
    provider: "creem",
    providerEventId: `creem-return-${checkout.providerCheckoutId}-${checkout.providerOrderId}`,
    providerCheckoutId: checkout.providerCheckoutId,
    providerOrderId: checkout.providerOrderId,
    providerProductId: checkout.providerProductId,
    amountMinor: checkout.amountMinor,
    currency: checkout.currency,
  });

  try {
    await sendMetaPurchaseIfConfigured({
      order: completedOrder,
      store: options.store,
      requestOrigin: options.requestOrigin,
    });
  } catch (error) {
    console.error("Unable to send Meta Purchase for Creem return", error);
  }

  return (await options.store.getRun(options.run.id)) ?? options.run;
}
