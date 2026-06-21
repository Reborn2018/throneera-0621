import { createHash } from "node:crypto";
import { nanoid } from "nanoid";
import type { CheckoutSession } from "@/lib/adapters/checkout";
import { createMockCheckoutUrl } from "@/lib/adapters/checkout";
import type { RunStore } from "@/lib/adapters/store";
import { getSimulatorConfig } from "@/lib/simulators";
import type { OrderRecord, RunRecord } from "@/lib/types";

type Clock = () => Date;
const defaultNow: Clock = () => new Date();

interface CheckoutOptions {
  store: RunStore;
  runId: string;
  requestId: string;
  providerProductId: string;
  allowMockCheckout: boolean;
  now?: Clock;
}

interface CompletedWebhookOptions {
  store: RunStore;
  providerEventId: string;
  providerCheckoutId: string;
  providerOrderId: string;
  providerProductId: string;
  amountMinor: number;
  currency: string;
  now?: Clock;
}

interface RefundWebhookOptions {
  store: RunStore;
  providerEventId: string;
  providerOrderId: string;
  status: "refunded" | "disputed";
  now?: Clock;
}

interface EntitlementOptions {
  store: RunStore;
  runId: string;
}

export async function createCheckoutForRun(options: CheckoutOptions): Promise<CheckoutSession> {
  if (!options.allowMockCheckout) {
    throw new Error("Checkout provider is not configured");
  }

  const run = await requireRun(options.store, options.runId);
  if (run.status !== "paywalled" && run.status !== "checkout_pending") {
    throw new Error(`Run is not ready for checkout: ${run.status}`);
  }

  const offer = getSimulatorConfig(run.simulator).offer;
  const existing = await options.store.findOpenOrder(run.id, offer.sku);
  if (existing) {
    return {
      order: existing,
      checkoutUrl: createMockCheckoutUrl(existing),
    };
  }

  const now = (options.now ?? defaultNow)().toISOString();
  const order: OrderRecord = {
    id: `order-${nanoid()}`,
    runId: run.id,
    sku: offer.sku,
    amountMinor: offer.amountMinor,
    currency: offer.currency,
    status: "pending",
    provider: "mock",
    providerCheckoutId: `mock-checkout-${nanoid()}`,
    providerProductId: options.providerProductId,
    requestId: options.requestId,
    createdAt: now,
    updatedAt: now,
  };

  await options.store.saveOrder(order);
  await options.store.updateRun(run.id, (current) => ({
    ...current,
    status: "checkout_pending",
    updatedAt: now,
  }));

  return {
    order,
    checkoutUrl: createMockCheckoutUrl(order),
  };
}

export async function applyCheckoutCompleted(
  options: CompletedWebhookOptions,
): Promise<OrderRecord> {
  const existingEvent = await options.store.getWebhookEvent("mock", options.providerEventId);
  if (existingEvent) {
    const order = await options.store.findOrderByProviderOrderId(options.providerOrderId);
    if (order) {
      return order;
    }
  }

  const order = await options.store.findOrderByProviderCheckoutId(options.providerCheckoutId);
  if (!order) {
    throw new Error(`Checkout not found: ${options.providerCheckoutId}`);
  }

  assertCheckoutPayload(order, {
    providerProductId: options.providerProductId,
    amountMinor: options.amountMinor,
    currency: options.currency,
  });

  const run = await requireRun(options.store, order.runId);
  const config = getSimulatorConfig(run.simulator);
  const firstPaidScene = config.paidScenes[0];
  if (!firstPaidScene) {
    throw new Error(`Simulator has no paid scenes: ${run.simulator}`);
  }

  const now = (options.now ?? defaultNow)().toISOString();
  await options.store.saveWebhookEvent({
    provider: "mock",
    providerEventId: options.providerEventId,
    eventType: "checkout.completed",
    payloadHash: hashPayload(options),
    processedAt: now,
    receivedAt: now,
  });

  const completedOrder = await options.store.updateOrder(order.id, (current) => ({
    ...current,
    status: "completed",
    providerOrderId: options.providerOrderId,
    updatedAt: now,
  }));

  const activeEntitlement = await options.store.getActiveEntitlementForRun(order.runId);
  if (!activeEntitlement) {
    await options.store.saveEntitlement({
      id: `entitlement-${nanoid()}`,
      runId: order.runId,
      orderId: order.id,
      status: "active",
      grantedAt: now,
    });
  }

  await options.store.updateRun(order.runId, (current) => ({
    ...current,
    status: "paid",
    currentSceneId: firstPaidScene.id,
    paidAt: current.paidAt ?? now,
    updatedAt: now,
  }));

  return completedOrder;
}

export async function applyRefundOrDispute(options: RefundWebhookOptions): Promise<void> {
  const existingEvent = await options.store.getWebhookEvent("mock", options.providerEventId);
  if (existingEvent) {
    return;
  }

  const order = await options.store.findOrderByProviderOrderId(options.providerOrderId);
  if (!order) {
    throw new Error(`Provider order not found: ${options.providerOrderId}`);
  }

  const now = (options.now ?? defaultNow)().toISOString();
  await options.store.saveWebhookEvent({
    provider: "mock",
    providerEventId: options.providerEventId,
    eventType: `checkout.${options.status}`,
    payloadHash: hashPayload(options),
    processedAt: now,
    receivedAt: now,
  });

  await options.store.updateOrder(order.id, (current) => ({
    ...current,
    status: options.status,
    updatedAt: now,
  }));

  const entitlements = await options.store.listEntitlementsForRun(order.runId);
  for (const entitlement of entitlements) {
    if (entitlement.orderId === order.id && entitlement.status === "active") {
      await options.store.updateEntitlement(entitlement.id, (current) => ({
        ...current,
        status: "revoked",
        revokedAt: now,
      }));
    }
  }

  await options.store.updateRun(order.runId, (current) => ({
    ...current,
    status: options.status,
    updatedAt: now,
  }));
}

export async function hasActiveRunEntitlement(options: EntitlementOptions): Promise<boolean> {
  return Boolean(await options.store.getActiveEntitlementForRun(options.runId));
}

function assertCheckoutPayload(
  order: OrderRecord,
  payload: { providerProductId: string; amountMinor: number; currency: string },
): void {
  if (
    order.providerProductId !== payload.providerProductId ||
    order.amountMinor !== payload.amountMinor ||
    order.currency !== payload.currency
  ) {
    throw new Error("Checkout payload mismatch");
  }
}

function hashPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

async function requireRun(store: RunStore, runId: string): Promise<RunRecord> {
  const run = await store.getRun(runId);
  if (!run) {
    throw new Error(`Run not found: ${runId}`);
  }

  return run;
}
