import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendPurchase: vi.fn(),
  createMetaCapiClient: vi.fn(),
}));

vi.mock("@/lib/adapters/meta-capi", () => ({
  createMetaCapiClient: mocks.createMetaCapiClient,
}));

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
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.META_PIXEL_ID;
    delete process.env.META_ACCESS_TOKEN;
    delete process.env.META_GRAPH_API_VERSION;
    delete process.env.META_TEST_EVENT_CODE;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    mocks.sendPurchase.mockResolvedValue({ eventsReceived: 1, messages: [] });
    mocks.createMetaCapiClient.mockReturnValue({ sendPurchase: mocks.sendPurchase });
  });

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
          amount: 599,
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

  it("sends a Meta Purchase event after verified return completion", async () => {
    process.env.META_PIXEL_ID = "962233209997686";
    process.env.META_ACCESS_TOKEN = "meta_access_token";
    process.env.NEXT_PUBLIC_SITE_URL = "https://throneera.com";
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
          amount: 599,
          currency: "USD",
        },
      }),
    );

    await syncCreemReturnEntitlement({
      store,
      run,
      apiKey: "creem_live_key",
      apiBaseUrl: "https://api.creem.io/v1",
      fetchImpl,
      requestOrigin: "https://throneera.com",
    });

    expect(mocks.createMetaCapiClient).toHaveBeenCalledWith({
      pixelId: "962233209997686",
      accessToken: "meta_access_token",
      apiVersion: undefined,
    });
    expect(mocks.sendPurchase).toHaveBeenCalledWith({
      eventId: "request-1",
      sourceUrl: "https://throneera.com/queen/return?runId=run-1&variant=legacy",
      orderId: "ord_123",
      value: 5.99,
      currency: "USD",
      sku: "complete_current_campaign",
      variantId: "legacy",
      experimentId: "queen_offer_hook_2026_06_22",
      testEventCode: undefined,
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
          amount: 599,
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
