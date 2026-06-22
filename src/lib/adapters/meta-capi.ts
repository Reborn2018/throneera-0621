type Clock = () => Date;

export interface MetaCapiClientOptions {
  pixelId: string;
  accessToken: string;
  apiVersion?: string;
  fetchImpl?: typeof fetch;
}

export interface MetaPurchaseInput {
  eventId: string;
  sourceUrl: string;
  orderId: string;
  value: number;
  currency: "USD";
  sku: string;
  variantId?: string;
  experimentId?: string;
  userData?: {
    clientIpAddress?: string;
    clientUserAgent?: string;
    fbp?: string;
    fbc?: string;
  };
  testEventCode?: string;
  now?: Clock;
}

export interface MetaCapiResult {
  eventsReceived: number;
  messages: unknown[];
}

export interface MetaCapiClient {
  sendPurchase(input: MetaPurchaseInput): Promise<MetaCapiResult>;
}

export function createMetaCapiClient(options: MetaCapiClientOptions): MetaCapiClient {
  const apiVersion = options.apiVersion ?? "v21.0";
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    async sendPurchase(input) {
      const body = {
        access_token: options.accessToken,
        data: [
          {
            event_name: "Purchase",
            event_time: Math.floor((input.now ?? (() => new Date()))().getTime() / 1000),
            event_id: input.eventId,
            action_source: "website",
            event_source_url: input.sourceUrl,
            user_data: buildUserData(input.userData),
            custom_data: {
              currency: input.currency,
              value: input.value,
              order_id: input.orderId,
              content_ids: [input.sku],
              content_type: "product",
              ...(input.variantId ? { variant_id: input.variantId } : {}),
              ...(input.experimentId ? { experiment_id: input.experimentId } : {}),
            },
          },
        ],
        ...(input.testEventCode ? { test_event_code: input.testEventCode } : {}),
      };

      const response = await fetchImpl(
        `https://graph.facebook.com/${apiVersion}/${options.pixelId}/events`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        throw new Error(`Meta CAPI failed with ${response.status}`);
      }

      const payload = (await response.json()) as {
        events_received?: number;
        messages?: unknown[];
      };

      return {
        eventsReceived: payload.events_received ?? 0,
        messages: payload.messages ?? [],
      };
    },
  };
}

function buildUserData(input: MetaPurchaseInput["userData"]): Record<string, string> {
  return {
    ...(input?.clientIpAddress ? { client_ip_address: input.clientIpAddress } : {}),
    ...(input?.clientUserAgent ? { client_user_agent: input.clientUserAgent } : {}),
    ...(input?.fbp ? { fbp: input.fbp } : {}),
    ...(input?.fbc ? { fbc: input.fbc } : {}),
  };
}
