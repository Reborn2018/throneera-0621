import { describe, expect, it, vi } from "vitest";
import { createMemoryStore } from "@/lib/adapters/local-store";
import {
  applyCheckoutCompleted,
  applyRefundOrDispute,
  createCheckoutForRun,
  hasActiveRunEntitlement,
} from "@/lib/engine/checkout";
import { createReplayRun, createRun } from "@/lib/engine/runs";

const fixedNow = () => new Date("2026-06-21T00:00:00.000Z");
const productId = "prod_complete_current_campaign";

async function createPaywalledRun(runId = "run-1") {
  const store = createMemoryStore();
  await createRun({ store, simulator: "queen", runId, now: fixedNow });
  await store.updateRun(runId, (run) => ({
    ...run,
    status: "paywalled",
    currentSceneId: "crown-in-peril",
  }));
  return store;
}

describe("checkout engine", () => {
  it("creates and reuses a pending checkout for the same run and sku", async () => {
    const store = await createPaywalledRun();

    const first = await createCheckoutForRun({
      store,
      runId: "run-1",
      requestId: "request-1",
      providerProductId: productId,
      allowMockCheckout: true,
      now: fixedNow,
    });
    const second = await createCheckoutForRun({
      store,
      runId: "run-1",
      requestId: "request-2",
      providerProductId: productId,
      allowMockCheckout: true,
      now: fixedNow,
    });

    expect(second.order.id).toBe(first.order.id);
    expect(second.checkoutUrl).toBe(first.checkoutUrl);
    expect(await store.getRun("run-1")).toMatchObject({ status: "checkout_pending" });
  });

  it("can prefetch checkout without counting it as checkout_started", async () => {
    const store = await createPaywalledRun();

    const prefetched = await createCheckoutForRun({
      store,
      runId: "run-1",
      requestId: "request-1",
      providerProductId: productId,
      allowMockCheckout: true,
      trackCheckoutStarted: false,
      now: fixedNow,
    });
    const opened = await createCheckoutForRun({
      store,
      runId: "run-1",
      requestId: "request-2",
      providerProductId: productId,
      allowMockCheckout: true,
      now: fixedNow,
    });

    expect(opened.order.id).toBe(prefetched.order.id);
    expect(
      (await store.listRunEvents("run-1"))
        .map((event) => event.eventType)
        .filter((eventType) => eventType.startsWith("checkout_")),
    ).toEqual([
      "checkout_prefetched",
      "checkout_started",
    ]);
  });

  it("grants a run entitlement from a verified completed checkout", async () => {
    const store = await createPaywalledRun();
    const checkout = await createCheckoutForRun({
      store,
      runId: "run-1",
      requestId: "request-1",
      providerProductId: productId,
      allowMockCheckout: true,
      now: fixedNow,
    });

    await applyCheckoutCompleted({
      store,
      providerEventId: "event-1",
      providerCheckoutId: checkout.order.providerCheckoutId,
      providerOrderId: "provider-order-1",
      providerProductId: productId,
      amountMinor: 599,
      currency: "USD",
      now: fixedNow,
    });

    expect(await hasActiveRunEntitlement({ store, runId: "run-1" })).toBe(true);
    expect(await store.getRun("run-1")).toMatchObject({
      status: "paid",
      currentSceneId: "war-council",
      paidAt: fixedNow().toISOString(),
    });
  });

  it("processes duplicate completed webhooks idempotently", async () => {
    const store = await createPaywalledRun();
    const checkout = await createCheckoutForRun({
      store,
      runId: "run-1",
      requestId: "request-1",
      providerProductId: productId,
      allowMockCheckout: true,
      now: fixedNow,
    });

    for (let attempt = 0; attempt < 2; attempt += 1) {
      await applyCheckoutCompleted({
        store,
        providerEventId: "event-1",
        providerCheckoutId: checkout.order.providerCheckoutId,
        providerOrderId: "provider-order-1",
        providerProductId: productId,
        amountMinor: 599,
        currency: "USD",
        now: fixedNow,
      });
    }

    expect(await store.listEntitlementsForRun("run-1")).toHaveLength(1);
  });

  it.each([
    { providerProductId: "wrong-product", amountMinor: 599, currency: "USD" as const },
    { providerProductId: productId, amountMinor: 600, currency: "USD" as const },
    { providerProductId: productId, amountMinor: 599, currency: "EUR" as const },
  ])("rejects checkout mismatch %#", async (payload) => {
    const store = await createPaywalledRun();
    const checkout = await createCheckoutForRun({
      store,
      runId: "run-1",
      requestId: "request-1",
      providerProductId: productId,
      allowMockCheckout: true,
      now: fixedNow,
    });

    await expect(
      applyCheckoutCompleted({
        store,
        providerEventId: "event-1",
        providerCheckoutId: checkout.order.providerCheckoutId,
        providerOrderId: "provider-order-1",
        now: fixedNow,
        ...payload,
      }),
    ).rejects.toThrow("Checkout payload mismatch");
  });

  it("does not carry entitlement from a completed run into a replay", async () => {
    const store = await createPaywalledRun();
    const checkout = await createCheckoutForRun({
      store,
      runId: "run-1",
      requestId: "request-1",
      providerProductId: productId,
      allowMockCheckout: true,
      now: fixedNow,
    });
    await applyCheckoutCompleted({
      store,
      providerEventId: "event-1",
      providerCheckoutId: checkout.order.providerCheckoutId,
      providerOrderId: "provider-order-1",
      providerProductId: productId,
      amountMinor: 599,
      currency: "USD",
      now: fixedNow,
    });
    await store.updateRun("run-1", (run) => ({ ...run, status: "completed" }));

    await createReplayRun({ store, sourceRunId: "run-1", runId: "run-2", now: fixedNow });

    expect(await hasActiveRunEntitlement({ store, runId: "run-1" })).toBe(true);
    expect(await hasActiveRunEntitlement({ store, runId: "run-2" })).toBe(false);
  });

  it("records replay purchases as a separate LTV event", async () => {
    const store = createMemoryStore();
    await createRun({ store, simulator: "queen", runId: "run-1", now: fixedNow });
    await store.updateRun("run-1", (run) => ({
      ...run,
      status: "completed",
      completedAt: fixedNow().toISOString(),
    }));
    await createReplayRun({ store, sourceRunId: "run-1", runId: "run-2", now: fixedNow });
    await store.updateRun("run-2", (run) => ({
      ...run,
      status: "paywalled",
      currentSceneId: "crown-in-peril",
    }));
    const checkout = await createCheckoutForRun({
      store,
      runId: "run-2",
      requestId: "request-2",
      providerProductId: productId,
      allowMockCheckout: true,
      now: fixedNow,
    });

    await applyCheckoutCompleted({
      store,
      providerEventId: "event-2",
      providerCheckoutId: checkout.order.providerCheckoutId,
      providerOrderId: "provider-order-2",
      providerProductId: productId,
      amountMinor: 599,
      currency: "USD",
      now: fixedNow,
    });

    await expect(store.listRunEvents("run-2")).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventType: "replay_purchase",
          payload: expect.objectContaining({
            run_type: "replay",
            source_run_id: "run-1",
            order_id: checkout.order.id,
            amount_minor: 599,
          }),
        }),
      ]),
    );
  });

  it("revokes only the originating run entitlement for refunds", async () => {
    const store = await createPaywalledRun();
    const checkout = await createCheckoutForRun({
      store,
      runId: "run-1",
      requestId: "request-1",
      providerProductId: productId,
      allowMockCheckout: true,
      now: fixedNow,
    });
    await applyCheckoutCompleted({
      store,
      providerEventId: "event-1",
      providerCheckoutId: checkout.order.providerCheckoutId,
      providerOrderId: "provider-order-1",
      providerProductId: productId,
      amountMinor: 599,
      currency: "USD",
      now: fixedNow,
    });

    await applyRefundOrDispute({
      store,
      providerEventId: "event-2",
      providerOrderId: "provider-order-1",
      status: "refunded",
      now: fixedNow,
    });

    expect(await hasActiveRunEntitlement({ store, runId: "run-1" })).toBe(false);
    expect(await store.getRun("run-1")).toMatchObject({ status: "refunded" });
  });

  it("fails closed when mock checkout is not explicitly enabled", async () => {
    const store = await createPaywalledRun();

    await expect(
      createCheckoutForRun({
        store,
        runId: "run-1",
        requestId: "request-1",
        providerProductId: productId,
        allowMockCheckout: false,
        now: fixedNow,
      }),
    ).rejects.toThrow("Checkout provider is not configured");
  });

  it("creates and reuses a Creem checkout when mock checkout is disabled", async () => {
    const store = await createPaywalledRun();
    const createCheckout = vi.fn(async () => ({
      providerCheckoutId: "ch_creem_1",
      checkoutUrl: "https://checkout.creem.io/ch_creem_1",
    }));

    const first = await createCheckoutForRun({
      store,
      runId: "run-1",
      requestId: "request-1",
      providerProductId: productId,
      allowMockCheckout: false,
      siteUrl: "https://throneera.com",
      checkoutProvider: {
        provider: "creem",
        createCheckout,
      },
      now: fixedNow,
    });
    const second = await createCheckoutForRun({
      store,
      runId: "run-1",
      requestId: "request-2",
      providerProductId: productId,
      allowMockCheckout: false,
      siteUrl: "https://throneera.com",
      checkoutProvider: {
        provider: "creem",
        createCheckout,
      },
      now: fixedNow,
    });

    expect(createCheckout).toHaveBeenCalledTimes(1);
    expect(createCheckout).toHaveBeenCalledWith({
      productId,
      requestId: "request-1",
      successUrl: "https://throneera.com/queen/return?runId=run-1&variant=legacy",
      metadata: {
        runId: "run-1",
        simulator: "queen",
        sku: "complete_current_campaign",
      },
    });
    expect(first.order).toMatchObject({
      provider: "creem",
      providerCheckoutId: "ch_creem_1",
      providerCheckoutUrl: "https://checkout.creem.io/ch_creem_1",
    });
    expect(second.order.id).toBe(first.order.id);
    expect(second.checkoutUrl).toBe("https://checkout.creem.io/ch_creem_1");
  });
});
