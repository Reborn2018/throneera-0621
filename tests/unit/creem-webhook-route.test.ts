import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getStore: vi.fn(),
  applyCheckoutCompleted: vi.fn(),
  applyRefundOrDispute: vi.fn(),
}));

vi.mock("@/lib/server/store", () => ({
  getStore: mocks.getStore,
}));

vi.mock("@/lib/engine/checkout", () => ({
  applyCheckoutCompleted: mocks.applyCheckoutCompleted,
  applyRefundOrDispute: mocks.applyRefundOrDispute,
}));

import { POST } from "@/app/api/webhooks/creem/route";

describe("Creem webhook route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.CREEM_WEBHOOK_SECRET = "webhook_secret";
    mocks.getStore.mockResolvedValue({ id: "store" });
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
          amount: 799,
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
      store: { id: "store" },
      provider: "creem",
      providerEventId: "evt_123",
      providerCheckoutId: "ch_123",
      providerOrderId: "ord_123",
      providerProductId: "prod_123",
      amountMinor: 799,
      currency: "USD",
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
