import { applyCheckoutCompleted } from "@/lib/engine/checkout";
import { redirectResponse } from "@/lib/server/request";
import { getStore } from "@/lib/server/store";

export async function GET(request: Request) {
  if (
    process.env.THRONEERA_ALLOW_MOCK_CHECKOUT !== "true" ||
    process.env.NODE_ENV === "production"
  ) {
    return new Response("Mock checkout is disabled", { status: 404 });
  }

  const url = new URL(request.url);
  const providerCheckoutId = url.searchParams.get("checkout_id");
  const runId = url.searchParams.get("run_id");

  if (!providerCheckoutId || !runId) {
    return new Response("Missing checkout reference", { status: 400 });
  }

  const store = await getStore();
  const order = await store.findOrderByProviderCheckoutId(providerCheckoutId);
  if (!order) {
    return new Response("Checkout not found", { status: 404 });
  }

  const run = await store.getRun(runId);
  if (!run) {
    return new Response("Run not found", { status: 404 });
  }

  await applyCheckoutCompleted({
    store,
    providerEventId: `mock-event-${order.id}`,
    providerCheckoutId,
    providerOrderId: `mock-order-${order.id}`,
    providerProductId: order.providerProductId,
    amountMinor: order.amountMinor,
    currency: order.currency,
  });

  return redirectResponse(request, `/${run.simulator}/return?runId=${run.id}`);
}
