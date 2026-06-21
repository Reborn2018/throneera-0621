import { describe, expect, it, vi } from "vitest";
import { createMemoryStore } from "@/lib/adapters/local-store";
import { createCheckoutForRun } from "@/lib/engine/checkout";
import { createRun } from "@/lib/engine/runs";
import { syncCreemReturnEntitlement } from "@/lib/server/creem-return";

const fixedNow = () => new Date("2026-06-21T00:00:00.000Z");
const productId = "prod_complete_current_campaign";

async function createPendingCreemCheckout() {
  const store = createMemoryStore();
  await createRun({ store, simulator: "queen", runId: "run-1", now: fixedNow });
  await store.updateRun("run-1", (run) => ({
    ...run,
    status: "paywalled",
    currentSceneId: "crown-in-peril",
  }));
  await createCheckoutForRun({
    store,
    runId: "run-1",
    requestId: "request-1",
    providerProductId: productId,
    allowMockCheckout: false,
    siteUrl: "https://throneera.com",
    checkoutProvider: {
      provider: "creem",
      createCheckout: vi.fn(async () => ({
        providerCheckoutId: "ch_123",
        checkoutUrl: "https://checkout.creem.io/ch_123",
      })),
    },
    now: fixedNow,
  });

  const run = await store.getRun("run-1");
  if (!run) {
    throw new Error("expected run");
  }

  return { store, run };
}

describe("Creem return sync", () => {
  it("grants entitlement when Creem reports the checkout as completed", async () => {
    const { store, run } = await createPendingCreemCheckout();
    const fetchImpl = vi.fn(async () =>
      Response.json({
        id: "ch_123",
        status: "completed",
        product: productId,
        request_id: "request-1",
        order: {
          id: "ord_123",
          product: productId,
          amount: 999,
          currency: "USD",
        },
      }),
    );

    const updated = await syncCreemReturnEntitlement({
      store,
      run,
      apiKey: "creem_live_key",
      apiBaseUrl: "https://api.creem.io/v1",
      fetchImpl,
    });

    expect(updated).toMatchObject({
      status: "paid",
      currentSceneId: "war-council",
    });
    expect(await store.getActiveEntitlementForRun("run-1")).toMatchObject({
      status: "active",
    });
  });

  it("does not grant entitlement while Creem still reports pending", async () => {
    const { store, run } = await createPendingCreemCheckout();
    const fetchImpl = vi.fn(async () =>
      Response.json({
        id: "ch_123",
        status: "pending",
        product: productId,
        request_id: "request-1",
        order: {
          id: "ord_123",
          product: productId,
          amount: 999,
          currency: "USD",
        },
      }),
    );

    const updated = await syncCreemReturnEntitlement({
      store,
      run,
      apiKey: "creem_live_key",
      apiBaseUrl: "https://api.creem.io/v1",
      fetchImpl,
    });

    expect(updated).toMatchObject({ status: "checkout_pending" });
    expect(await store.getActiveEntitlementForRun("run-1")).toBeNull();
  });
});
