import type { OrderRecord } from "@/lib/types";

export interface CheckoutSession {
  order: OrderRecord;
  checkoutUrl: string;
}

export function createMockCheckoutUrl(order: OrderRecord): string {
  const params = new URLSearchParams({
    checkout_id: order.providerCheckoutId,
    run_id: order.runId,
  });

  return `/api/mock-checkout?${params.toString()}`;
}
