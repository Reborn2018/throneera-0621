import { describe, expect, it, vi } from "vitest";
import { createMetaCapiClient } from "@/lib/adapters/meta-capi";

describe("Meta CAPI adapter", () => {
  it("sends Purchase events to the pixel events endpoint", async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const url = String(_url);
      expect(url).toBe("https://graph.facebook.com/v21.0/962233209997686/events");
      expect(init?.method).toBe("POST");
      expect(init?.headers).toMatchObject({
        "content-type": "application/json",
      });
      expect(JSON.parse(String(init?.body))).toEqual({
        access_token: "meta_access_token",
        data: [
          {
            event_name: "Purchase",
            event_time: 1782000000,
            event_id: "order-request-1",
            action_source: "website",
            event_source_url: "https://throneera.com/queen/return?runId=run-1",
            user_data: {
              client_ip_address: "203.0.113.10",
              client_user_agent: "Playwright",
            },
            custom_data: {
              currency: "USD",
              value: 7.99,
              order_id: "provider-order-1",
              content_ids: ["complete_current_campaign"],
              content_type: "product",
              variant_id: "crown",
              experiment_id: "queen_offer_hook_2026_06_22",
            },
          },
        ],
        test_event_code: "TEST123",
      });

      return new Response(JSON.stringify({ events_received: 1, messages: [] }), {
        status: 200,
      });
    });

    const client = createMetaCapiClient({
      pixelId: "962233209997686",
      accessToken: "meta_access_token",
      apiVersion: "v21.0",
      fetchImpl,
    });

    await expect(
      client.sendPurchase({
        eventId: "order-request-1",
        sourceUrl: "https://throneera.com/queen/return?runId=run-1",
        orderId: "provider-order-1",
        value: 7.99,
        currency: "USD",
        sku: "complete_current_campaign",
        variantId: "crown",
        experimentId: "queen_offer_hook_2026_06_22",
        userData: {
          clientIpAddress: "203.0.113.10",
          clientUserAgent: "Playwright",
        },
        testEventCode: "TEST123",
        now: () => new Date("2026-06-21T00:00:00.000Z"),
      }),
    ).resolves.toEqual({ eventsReceived: 1, messages: [] });
  });

  it("throws without leaking the access token when Meta returns an error", async () => {
    const client = createMetaCapiClient({
      pixelId: "962233209997686",
      accessToken: "meta_access_token",
      fetchImpl: async () =>
        new Response(JSON.stringify({ error: { message: "Bad event" } }), { status: 400 }),
    });

    await expect(
      client.sendPurchase({
        eventId: "order-request-1",
        sourceUrl: "https://throneera.com/queen/return?runId=run-1",
        orderId: "provider-order-1",
        value: 7.99,
        currency: "USD",
        sku: "complete_current_campaign",
      }),
    ).rejects.toThrow("Meta CAPI failed with 400");
  });
});
