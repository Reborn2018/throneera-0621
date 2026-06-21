import { createHash, createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  createCreemCheckoutProvider,
  parseCreemWebhookEvent,
  retrieveCreemCheckoutSession,
  verifyCreemRedirectSignature,
  verifyCreemWebhookSignature,
} from "@/lib/adapters/creem";

describe("Creem adapter", () => {
  it("creates checkout sessions with Creem's REST payload shape", async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      expect(init?.method).toBe("POST");
      expect(init?.headers).toMatchObject({
        "content-type": "application/json",
        "x-api-key": "creem_live_key",
      });
      expect(JSON.parse(String(init?.body))).toEqual({
        product_id: "prod_123",
        request_id: "order-request-1",
        success_url: "https://throneera.com/queen/return?runId=run-1",
        metadata: {
          runId: "run-1",
          simulator: "queen",
          sku: "complete_current_campaign",
        },
      });

      return new Response(
        JSON.stringify({
          id: "ch_123",
          checkout_url: "https://checkout.creem.io/ch_123",
          product_id: "prod_123",
          status: "pending",
        }),
        { status: 200 },
      );
    });

    const provider = createCreemCheckoutProvider({
      apiKey: "creem_live_key",
      apiBaseUrl: "https://api.creem.io/v1",
      fetchImpl,
    });

    await expect(
      provider.createCheckout({
        productId: "prod_123",
        requestId: "order-request-1",
        successUrl: "https://throneera.com/queen/return?runId=run-1",
        metadata: {
          runId: "run-1",
          simulator: "queen",
          sku: "complete_current_campaign",
        },
      }),
    ).resolves.toEqual({
      providerCheckoutId: "ch_123",
      checkoutUrl: "https://checkout.creem.io/ch_123",
    });
  });

  it("verifies webhook signatures against the raw body", () => {
    const payload = JSON.stringify({ id: "evt_123", eventType: "checkout.completed" });
    const signature = createHmac("sha256", "webhook_secret").update(payload).digest("hex");

    expect(verifyCreemWebhookSignature(payload, signature, "webhook_secret")).toBe(true);
    expect(verifyCreemWebhookSignature(payload, "bad-signature", "webhook_secret")).toBe(false);
  });

  it("verifies redirect signatures in received query-parameter order", () => {
    const rawWithoutSignature =
      "request_id=order-request-1&checkout_id=ch_123&order_id=ord_123&product_id=prod_123";
    const signature = createHashForRedirect(rawWithoutSignature, "creem_live_key");

    expect(
      verifyCreemRedirectSignature(`${rawWithoutSignature}&signature=${signature}`, "creem_live_key"),
    ).toBe(true);
    expect(
      verifyCreemRedirectSignature(`${rawWithoutSignature}&signature=bad`, "creem_live_key"),
    ).toBe(false);
  });

  it("retrieves checkout sessions with Creem's query parameter shape", async () => {
    const fetchImpl = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      expect(String(url)).toBe("https://api.creem.io/v1/checkouts?checkout_id=ch_123");
      expect(init?.headers).toMatchObject({
        "x-api-key": "creem_live_key",
      });

      return new Response(
        JSON.stringify({
          id: "ch_123",
          status: "completed",
          product: "prod_123",
          request_id: "order-request-1",
          order: {
            id: "ord_123",
            product: "prod_123",
            amount: 999,
            currency: "USD",
          },
        }),
        { status: 200 },
      );
    });

    await expect(
      retrieveCreemCheckoutSession(
        {
          apiKey: "creem_live_key",
          apiBaseUrl: "https://api.creem.io/v1",
          fetchImpl,
        },
        "ch_123",
      ),
    ).resolves.toEqual({
      status: "completed",
      providerCheckoutId: "ch_123",
      providerOrderId: "ord_123",
      providerProductId: "prod_123",
      requestId: "order-request-1",
      amountMinor: 999,
      currency: "USD",
    });
  });

  it("maps checkout.completed payloads to internal entitlement data", () => {
    expect(
      parseCreemWebhookEvent({
        id: "evt_123",
        eventType: "checkout.completed",
        object: {
          id: "ch_123",
          request_id: "order-request-1",
          order: {
            id: "ord_123",
            product: "prod_123",
            amount: 999,
            currency: "USD",
            status: "paid",
          },
          product: {
            id: "prod_123",
            price: 999,
            currency: "USD",
          },
        },
      }),
    ).toEqual({
      type: "checkout.completed",
      providerEventId: "evt_123",
      providerCheckoutId: "ch_123",
      providerOrderId: "ord_123",
      providerProductId: "prod_123",
      amountMinor: 999,
      currency: "USD",
    });
  });

  it.each([
    ["refund.created", "checkout.refunded"],
    ["dispute.created", "checkout.disputed"],
  ])("maps %s payloads to revocation events", (eventType, expectedType) => {
    expect(
      parseCreemWebhookEvent({
        id: "evt_456",
        eventType,
        object: {
          order: {
            id: "ord_123",
          },
          transaction: {
            order: "ord_123",
          },
        },
      }),
    ).toEqual({
      type: expectedType,
      providerEventId: "evt_456",
      providerOrderId: "ord_123",
    });
  });
});

function createHashForRedirect(rawWithoutSignature: string, apiKey: string): string {
  const data = rawWithoutSignature
    .split("&")
    .map((part) => decodeURIComponent(part))
    .concat(`salt=${apiKey}`)
    .join("|");

  return createHash("sha256").update(data).digest("hex");
}
