import { createHash } from "node:crypto";
import { nanoid } from "nanoid";
import type { CheckoutSession } from "@/lib/adapters/checkout";
import { createMockCheckoutUrl } from "@/lib/adapters/checkout";
import type { CreemCheckoutProvider } from "@/lib/adapters/creem";
import type { RunStore } from "@/lib/adapters/store";
import { appendRunFunnelEvent } from "@/lib/analytics";
import { getSimulatorConfig } from "@/lib/simulators";
import type { OfferSku, OrderRecord, RunRecord, SimulatorOffer } from "@/lib/types";
import { getRunVariantId, runVariantPayload } from "@/lib/variants";

type Clock = () => Date;
const defaultNow: Clock = () => new Date();

interface CheckoutOptions {
  store: RunStore;
  runId: string;
  requestId: string;
  providerProductId: string;
  offer?: CheckoutOffer;
  allowMockCheckout: boolean;
  siteUrl?: string;
  checkoutProvider?: CreemCheckoutProvider;
  trackCheckoutStarted?: boolean;
  now?: Clock;
}

interface CheckoutOffer {
  sku: OfferSku;
  amountMinor: number;
  currency: SimulatorOffer["currency"];
}

interface CompletedWebhookOptions {
  store: RunStore;
  provider?: OrderRecord["provider"];
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
  provider?: OrderRecord["provider"];
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
  const run = await requireRun(options.store, options.runId);
  const trackCheckoutStarted = options.trackCheckoutStarted ?? true;
  if (run.status !== "paywalled" && run.status !== "checkout_pending") {
    throw new Error(`Run is not ready for checkout: ${run.status}`);
  }

  const offer = options.offer ?? getSimulatorConfig(run.simulator, getRunVariantId(run)).offer;
  const existing = await options.store.findOpenOrder(run.id, offer.sku);
  if (existing) {
    await appendRunFunnelEvent(options.store, run, trackCheckoutStarted ? "checkout_started" : "checkout_prefetched", {
      order_id: existing.id,
      provider: existing.provider,
      checkout_status: existing.status,
      reused_checkout: true,
    });
    return {
      order: existing,
      checkoutUrl: checkoutUrlForOrder(existing),
    };
  }

  const now = (options.now ?? defaultNow)().toISOString();
  if (options.allowMockCheckout) {
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
    await appendRunFunnelEvent(options.store, run, trackCheckoutStarted ? "checkout_started" : "checkout_prefetched", {
      order_id: order.id,
      provider: order.provider,
      checkout_status: order.status,
    });

    return {
      order,
      checkoutUrl: createMockCheckoutUrl(order),
    };
  }

  if (!options.checkoutProvider || !options.siteUrl) {
    throw new Error("Checkout provider is not configured");
  }

  const successUrl = new URL(`/${run.simulator}/return`, options.siteUrl);
  successUrl.searchParams.set("runId", run.id);
  successUrl.searchParams.set("variant", runVariantPayload(run).variant_id);
  const externalCheckout = await options.checkoutProvider.createCheckout({
    productId: options.providerProductId,
    requestId: options.requestId,
    successUrl: successUrl.toString(),
    metadata: {
      runId: run.id,
      simulator: run.simulator,
      sku: offer.sku,
    },
  });
  const order: OrderRecord = {
    id: `order-${nanoid()}`,
    runId: run.id,
    sku: offer.sku,
    amountMinor: offer.amountMinor,
    currency: offer.currency,
    status: "pending",
    provider: options.checkoutProvider.provider,
    providerCheckoutId: externalCheckout.providerCheckoutId,
    providerCheckoutUrl: externalCheckout.checkoutUrl,
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
  await appendRunFunnelEvent(options.store, run, trackCheckoutStarted ? "checkout_started" : "checkout_prefetched", {
    order_id: order.id,
    provider: order.provider,
    checkout_status: order.status,
  });

  return {
    order,
    checkoutUrl: externalCheckout.checkoutUrl,
  };
}

export async function applyCheckoutCompleted(
  options: CompletedWebhookOptions,
): Promise<OrderRecord> {
  const provider = options.provider ?? "mock";
  const existingEvent = await options.store.getWebhookEvent(provider, options.providerEventId);
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
  const config = getSimulatorConfig(run.simulator, getRunVariantId(run));
  const firstPaidScene = config.paidScenes[0];
  if (!firstPaidScene) {
    throw new Error(`Simulator has no paid scenes: ${run.simulator}`);
  }

  const now = (options.now ?? defaultNow)().toISOString();
  await options.store.saveWebhookEvent({
    provider,
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

  if (order.status !== "completed") {
    const updatedRun = await requireRun(options.store, order.runId);
    await appendRunFunnelEvent(options.store, updatedRun, "purchase_completed", {
      order_id: completedOrder.id,
      provider: completedOrder.provider,
      provider_order_id: completedOrder.providerOrderId ?? "",
      amount_minor: completedOrder.amountMinor,
      currency: completedOrder.currency,
      sku: completedOrder.sku,
    });
    if (updatedRun.runType === "replay") {
      await appendRunFunnelEvent(options.store, updatedRun, "replay_purchase", {
        source_run_id: updatedRun.sourceRunId ?? "",
        order_id: completedOrder.id,
        provider: completedOrder.provider,
        provider_order_id: completedOrder.providerOrderId ?? "",
        amount_minor: completedOrder.amountMinor,
        currency: completedOrder.currency,
        sku: completedOrder.sku,
      });
    }
    await appendRunFunnelEvent(options.store, updatedRun, "paid_content_started", {
      scene_id: firstPaidScene.id,
      order_id: completedOrder.id,
    });
  }

  return completedOrder;
}

export async function applyRefundOrDispute(options: RefundWebhookOptions): Promise<void> {
  const provider = options.provider ?? "mock";
  const existingEvent = await options.store.getWebhookEvent(provider, options.providerEventId);
  if (existingEvent) {
    return;
  }

  const order = await options.store.findOrderByProviderOrderId(options.providerOrderId);
  if (!order) {
    throw new Error(`Provider order not found: ${options.providerOrderId}`);
  }

  const now = (options.now ?? defaultNow)().toISOString();
  await options.store.saveWebhookEvent({
    provider,
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

  const updatedRun = await requireRun(options.store, order.runId);
  await appendRunFunnelEvent(options.store, updatedRun, options.status, {
    order_id: order.id,
    provider: order.provider,
    provider_order_id: order.providerOrderId ?? "",
  });
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

function checkoutUrlForOrder(order: OrderRecord): string {
  if (order.provider === "mock") {
    return createMockCheckoutUrl(order);
  }

  if (!order.providerCheckoutUrl) {
    throw new Error(`Checkout URL missing for order: ${order.id}`);
  }

  return order.providerCheckoutUrl;
}

async function requireRun(store: RunStore, runId: string): Promise<RunRecord> {
  const run = await store.getRun(runId);
  if (!run) {
    throw new Error(`Run not found: ${runId}`);
  }

  return run;
}
