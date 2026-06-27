import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getStore: vi.fn(),
  applyCheckoutCompleted: vi.fn(),
  applyRefundOrDispute: vi.fn(),
  sendPurchase: vi.fn(),
  createMetaCapiClient: vi.fn(),
}));

vi.mock("@/lib/server/store", () => ({
  getStore: mocks.getStore,
}));

vi.mock("@/lib/engine/checkout", () => ({
  applyCheckoutCompleted: mocks.applyCheckoutCompleted,
  applyRefundOrDispute: mocks.applyRefundOrDispute,
}));

vi.mock("@/lib/adapters/meta-capi", () => ({
  createMetaCapiClient: mocks.createMetaCapiClient,
}));

import { POST } from "@/app/api/webhooks/creem/route";

describe("Creem webhook route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.CREEM_WEBHOOK_SECRET = "webhook_secret";
    process.env.NEXT_PUBLIC_SITE_URL = "https://throneera.com";
    process.env.META_PIXEL_ID = "962233209997686";
    process.env.META_ACCESS_TOKEN = "meta_access_token";
    mocks.sendPurchase.mockResolvedValue({ eventsReceived: 1, messages: [] });
    mocks.createMetaCapiClient.mockReturnValue({ sendPurchase: mocks.sendPurchase });
    mocks.getStore.mockResolvedValue({
      id: "store",
      getRun: vi.fn(async () => ({ simulator: "queen" })),
    });
    mocks.applyCheckoutCompleted.mockResolvedValue({
      runId: "run-1",
      requestId: "order-request-1",
      providerOrderId: "ord_123",
      amountMinor: 499,
      currency: "USD",
      sku: "complete_current_campaign",
    });
  });

  it("verifies the raw body signature before applying checkout completion", async () => {
    const body = JSON.stringify({
      id: "evt_123",
      eventType: "checkout.completed",
      object: {
        id: "ch_123",
        order: {
          id: "ord_123",
          product: "prod_123",
          amount: 499,
          currency: "USD",
          status: "paid",
        },
      },
    });
    const signature = createHmac("sha256", "webhook_secret").update(body).digest("hex");

    const response = await POST(
      new Request("https://throneera.com/api/webhooks/creem", {
        method: "POST",
        headers: {
          "creem-signature": signature,
        },
        body,
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.applyCheckoutCompleted).toHaveBeenCalledWith({
      store: expect.objectContaining({ id: "store" }),
      provider: "creem",
      providerEventId: "evt_123",
      providerCheckoutId: "ch_123",
      providerOrderId: "ord_123",
      providerProductId: "prod_123",
      amountMinor: 499,
      currency: "USD",
    });
    expect(mocks.createMetaCapiClient).toHaveBeenCalledWith({
      pixelId: "962233209997686",
      accessToken: "meta_access_token",
      apiVersion: undefined,
    });
    expect(mocks.sendPurchase).toHaveBeenCalledWith({
      eventId: "order-request-1",
      sourceUrl: "https://throneera.com/queen/return?runId=run-1&variant=legacy",
      orderId: "ord_123",
      value: 4.99,
      currency: "USD",
      sku: "complete_current_campaign",
      variantId: "legacy",
      experimentId: "queen_offer_hook_2026_06_22",
      testEventCode: undefined,
    });
  });

  it("rejects unsigned webhook bodies without applying entitlement changes", async () => {
    const response = await POST(
      new Request("https://throneera.com/api/webhooks/creem", {
        method: "POST",
        headers: {
          "creem-signature": "bad",
        },
        body: JSON.stringify({
          id: "evt_123",
          eventType: "checkout.completed",
          object: {},
        }),
      }),
    );

    expect(response.status).toBe(401);
    expect(mocks.applyCheckoutCompleted).not.toHaveBeenCalled();
    expect(mocks.applyRefundOrDispute).not.toHaveBeenCalled();
  });
});
