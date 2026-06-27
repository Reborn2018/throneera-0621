import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getStore: vi.fn(),
  createRun: vi.fn(),
  createCheckoutForRun: vi.fn(),
  syncCreemReturnEntitlement: vi.fn(),
}));

vi.mock("@/lib/server/store", () => ({
  getStore: mocks.getStore,
}));

vi.mock("@/lib/engine/runs", () => ({
  createRun: mocks.createRun,
}));

vi.mock("@/lib/engine/checkout", () => ({
  createCheckoutForRun: mocks.createCheckoutForRun,
}));

vi.mock("@/lib/server/creem-return", () => ({
  syncCreemReturnEntitlement: mocks.syncCreemReturnEntitlement,
}));

import { POST as checkoutPost } from "@/app/api/engine-v3/checkout/route";
import { POST as completePost } from "@/app/api/engine-v3/checkout/complete/route";

const baseRun = {
  id: "engine-v3-run-1",
  simulator: "queen",
  status: "identity",
  currentSceneId: "identity",
  runType: "first_campaign",
  identity: {
    name: "Isolde",
    dispositionId: "merciful",
    originId: "exile",
    variantId: "legacy",
  },
  realm: { legitimacy: 50, treasury: 50, military: 50, publicSupport: 50 },
  decisions: [],
  createdAt: "2026-06-27T00:00:00.000Z",
  updatedAt: "2026-06-27T00:00:00.000Z",
};

function storeWithRun(run: typeof baseRun | null = baseRun) {
  return {
    getRun: vi.fn(async () => run),
    updateRun: vi.fn(async (_runId, updater) => updater(run ?? baseRun)),
    getActiveEntitlementForRun: vi.fn(async () => null),
  };
}

async function json(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

describe("engine-v3 checkout bridge", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.VERCEL_ENV = "production";
    process.env.NEXT_PUBLIC_SITE_URL = "https://throneera.com";
    process.env.CREEM_API_KEY = "creem_live_key";
    process.env.CREEM_COMPLETE_CAMPAIGN_PRODUCT_ID = "prod_499";
    process.env.CREEM_UNLIMITED_PRODUCT_ID = "prod_1499";
    delete process.env.THRONEERA_ALLOW_MOCK_CHECKOUT;
    mocks.getStore.mockResolvedValue(storeWithRun());
    mocks.createRun.mockResolvedValue(baseRun);
    mocks.createCheckoutForRun.mockResolvedValue({
      order: { id: "order-1" },
      checkoutUrl: "https://checkout.creem.io/ch_123",
    });
    mocks.syncCreemReturnEntitlement.mockImplementation(async ({ run }) => ({
      ...run,
      status: "paid",
    }));
  });

  it("creates a Creem checkout for an engine-v3 paywall run", async () => {
    const response = await checkoutPost(
      new Request("https://throneera.com/api/engine-v3/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          era: "queen",
          runId: "engine-v3-run-1",
          rulerName: "Isolde",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(json(response)).resolves.toMatchObject({
      checkoutRunId: "engine-v3-run-1",
      checkoutUrl: "https://checkout.creem.io/ch_123",
    });
    expect(mocks.createCheckoutForRun).toHaveBeenCalledWith(
      expect.objectContaining({
        runId: "engine-v3-run-1",
        providerProductId: "prod_499",
        allowMockCheckout: false,
        siteUrl: "https://throneera.com",
        checkoutProvider: expect.objectContaining({ provider: "creem" }),
      }),
    );
  });

  it("fails closed in production when checkout provider is not configured", async () => {
    delete process.env.CREEM_API_KEY;

    const response = await checkoutPost(
      new Request("https://throneera.com/api/engine-v3/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ era: "queen", runId: "engine-v3-run-1" }),
      }),
    );

    expect(response.status).toBe(503);
    expect(mocks.createCheckoutForRun).not.toHaveBeenCalled();
  });

  it("uses a separate product and amount for unlimited engine-v3 checkout", async () => {
    const response = await checkoutPost(
      new Request("https://throneera.com/api/engine-v3/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          era: "queen",
          runId: "engine-v3-run-1",
          rulerName: "Isolde",
          purchaseKind: "unlimited",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.createCheckoutForRun).toHaveBeenCalledWith(
      expect.objectContaining({
        runId: "engine-v3-run-1",
        providerProductId: "prod_1499",
        offer: {
          sku: "engine_v3_unlimited",
          amountMinor: 1499,
          currency: "USD",
        },
      }),
    );
  });

  it("fails closed for unlimited checkout when the unlimited product is missing", async () => {
    delete process.env.CREEM_UNLIMITED_PRODUCT_ID;

    const response = await checkoutPost(
      new Request("https://throneera.com/api/engine-v3/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          era: "queen",
          runId: "engine-v3-run-1",
          purchaseKind: "unlimited",
        }),
      }),
    );

    expect(response.status).toBe(503);
    expect(mocks.createCheckoutForRun).not.toHaveBeenCalled();
  });

  it("verifies checkout completion before the UI calls engine-v3 unlock", async () => {
    const response = await completePost(
      new Request("https://throneera.com/api/engine-v3/checkout/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ checkoutRunId: "engine-v3-run-1" }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(json(response)).resolves.toMatchObject({ verified: true });
    expect(mocks.syncCreemReturnEntitlement).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: "creem_live_key",
        apiBaseUrl: undefined,
        requestOrigin: "https://throneera.com",
      }),
    );
  });

  it("passes the unlimited SKU into Creem return sync for unlimited completion checks", async () => {
    const pendingRun = { ...baseRun, status: "checkout_pending" };
    mocks.getStore.mockResolvedValue(storeWithRun(pendingRun));

    const response = await completePost(
      new Request("https://throneera.com/api/engine-v3/checkout/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          checkoutRunId: "engine-v3-run-1",
          purchaseKind: "unlimited",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.syncCreemReturnEntitlement).toHaveBeenCalledWith(
      expect.objectContaining({
        offerSku: "engine_v3_unlimited",
      }),
    );
  });
});
