import { retrieveCreemCheckoutSession } from "@/lib/adapters/creem";
import type { RunStore } from "@/lib/adapters/store";
import { applyCheckoutCompleted } from "@/lib/engine/checkout";
import { getSimulatorConfig } from "@/lib/simulators";
import type { RunRecord } from "@/lib/types";

interface CreemReturnOptions {
  store: RunStore;
  run: RunRecord;
  apiKey?: string;
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
}

export async function syncCreemReturnEntitlement(
  options: CreemReturnOptions,
): Promise<RunRecord> {
  if (!options.apiKey || options.run.status !== "checkout_pending") {
    return options.run;
  }

  const offer = getSimulatorConfig(options.run.simulator).offer;
  const order = await options.store.findOpenOrder(options.run.id, offer.sku);
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

  await applyCheckoutCompleted({
    store: options.store,
    provider: "creem",
    providerEventId: `creem-return-${checkout.providerCheckoutId}-${checkout.providerOrderId}`,
    providerCheckoutId: checkout.providerCheckoutId,
    providerOrderId: checkout.providerOrderId,
    providerProductId: checkout.providerProductId,
    amountMinor: checkout.amountMinor,
    currency: checkout.currency,
  });

  return (await options.store.getRun(options.run.id)) ?? options.run;
}
