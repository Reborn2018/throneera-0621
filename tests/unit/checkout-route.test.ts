import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getStore: vi.fn(),
  createCheckoutForRun: vi.fn(),
}));

vi.mock("@/lib/server/store", () => ({
  getStore: mocks.getStore,
}));

vi.mock("@/lib/engine/checkout", () => ({
  createCheckoutForRun: mocks.createCheckoutForRun,
}));

import { POST } from "@/app/api/checkout/route";

describe("checkout route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.VERCEL_ENV = "production";
    process.env.NEXT_PUBLIC_SITE_URL = "https://throneera.com";
    process.env.CREEM_API_KEY = "creem_live_key";
    process.env.CREEM_COMPLETE_CAMPAIGN_PRODUCT_ID = "prod_123";
    delete process.env.THRONEERA_ALLOW_MOCK_CHECKOUT;
    mocks.getStore.mockResolvedValue({ id: "store" });
    mocks.createCheckoutForRun.mockResolvedValue({
      order: { id: "order-1" },
      checkoutUrl: "https://checkout.creem.io/ch_123",
    });
  });

  it("injects a Creem provider for production checkout", async () => {
    const response = await POST(
      new Request("https://throneera.com/api/checkout", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ runId: "run-1" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.createCheckoutForRun).toHaveBeenCalledWith(
      expect.objectContaining({
        store: { id: "store" },
        runId: "run-1",
        providerProductId: "prod_123",
        allowMockCheckout: false,
        siteUrl: "https://throneera.com",
        checkoutProvider: expect.objectContaining({ provider: "creem" }),
      }),
    );
  });

  it("fails closed in production when Creem is not configured", async () => {
    delete process.env.CREEM_API_KEY;

    const response = await POST(
      new Request("https://throneera.com/api/checkout", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ runId: "run-1" }),
      }),
    );

    expect(response.status).toBe(503);
    expect(mocks.createCheckoutForRun).not.toHaveBeenCalled();
  });
});
