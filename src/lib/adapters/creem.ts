import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export interface CreemCheckoutInput {
  productId: string;
  requestId: string;
  successUrl: string;
  metadata: Record<string, string>;
}

export interface CreemCheckoutResult {
  providerCheckoutId: string;
  checkoutUrl: string;
}

export interface CreemCheckoutProvider {
  provider: "creem";
  createCheckout(input: CreemCheckoutInput): Promise<CreemCheckoutResult>;
}

interface CreemProviderOptions {
  apiKey: string;
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
}

export type NormalizedCreemWebhookEvent =
  | {
      type: "checkout.completed";
      providerEventId: string;
      providerCheckoutId: string;
      providerOrderId: string;
      providerProductId: string;
      amountMinor: number;
      currency: string;
    }
  | {
      type: "checkout.refunded" | "checkout.disputed";
      providerEventId: string;
      providerOrderId: string;
    };

export function createCreemCheckoutProvider(
  options: CreemProviderOptions,
): CreemCheckoutProvider {
  const apiBaseUrl = (options.apiBaseUrl ?? "https://api.creem.io/v1").replace(/\/$/, "");
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    provider: "creem",
    async createCheckout(input) {
      const response = await fetchImpl(`${apiBaseUrl}/checkouts`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": options.apiKey,
        },
        body: JSON.stringify({
          product_id: input.productId,
          request_id: input.requestId,
          success_url: input.successUrl,
          metadata: input.metadata,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Creem checkout failed with ${response.status}: ${body.slice(0, 200)}`);
      }

      const payload = asRecord(await response.json());
      return {
        providerCheckoutId: readString(payload, "id"),
        checkoutUrl: readString(payload, "checkout_url"),
      };
    },
  };
}

export function verifyCreemWebhookSignature(
  payload: string,
  signature: string | null | undefined,
  secret: string,
): boolean {
  if (!signature) {
    return false;
  }

  return timingSafeHexEqual(
    createHmac("sha256", secret).update(payload).digest("hex"),
    signature.trim(),
  );
}

export function verifyCreemRedirectSignature(rawQuery: string, apiKey: string): boolean {
  const query = rawQuery.startsWith("?") ? rawQuery.slice(1) : rawQuery;
  const parts: string[] = [];
  let receivedSignature = "";

  for (const pair of query.split("&")) {
    if (!pair) {
      continue;
    }

    const [encodedKey, encodedValue = ""] = pair.split("=");
    const key = decodeURIComponent(encodedKey);
    const value = decodeURIComponent(encodedValue.replace(/\+/g, " "));

    if (key === "signature") {
      receivedSignature = value;
      continue;
    }

    if (value === "" || value === "null") {
      continue;
    }

    parts.push(`${key}=${value}`);
  }

  if (!receivedSignature) {
    return false;
  }

  const expected = createHash("sha256")
    .update([...parts, `salt=${apiKey}`].join("|"))
    .digest("hex");

  return timingSafeHexEqual(expected, receivedSignature);
}

export function parseCreemWebhookEvent(payload: unknown): NormalizedCreemWebhookEvent {
  const event = asRecord(payload);
  const eventType = readString(event, "eventType");
  const object = readRecord(event, "object");
  const providerEventId = readString(event, "id");

  if (eventType === "checkout.completed") {
    const order = readRecord(object, "order");
    return {
      type: "checkout.completed",
      providerEventId,
      providerCheckoutId: readString(object, "id"),
      providerOrderId: readString(order, "id"),
      providerProductId: readProductId(object, order),
      amountMinor: readNumber(order, "amount"),
      currency: readString(order, "currency"),
    };
  }

  if (eventType === "refund.created") {
    return {
      type: "checkout.refunded",
      providerEventId,
      providerOrderId: readRevokedOrderId(object),
    };
  }

  if (eventType === "dispute.created") {
    return {
      type: "checkout.disputed",
      providerEventId,
      providerOrderId: readRevokedOrderId(object),
    };
  }

  throw new Error(`Unsupported Creem webhook event: ${eventType}`);
}

function readProductId(checkoutObject: Record<string, unknown>, order: Record<string, unknown>): string {
  const orderProduct = order.product;
  if (typeof orderProduct === "string") {
    return orderProduct;
  }

  const product = checkoutObject.product;
  if (typeof product === "string") {
    return product;
  }

  if (isRecord(product) && typeof product.id === "string") {
    return product.id;
  }

  throw new Error("Creem webhook missing product id");
}

function readRevokedOrderId(object: Record<string, unknown>): string {
  const order = object.order;
  if (isRecord(order) && typeof order.id === "string") {
    return order.id;
  }

  const transaction = object.transaction;
  if (isRecord(transaction) && typeof transaction.order === "string") {
    return transaction.order;
  }

  throw new Error("Creem revocation webhook missing order id");
}

function timingSafeHexEqual(expectedHex: string, receivedHex: string): boolean {
  const expected = Buffer.from(expectedHex, "hex");
  const received = Buffer.from(receivedHex, "hex");
  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Expected string field: ${key}`);
  }

  return value;
}

function readNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Expected number field: ${key}`);
  }

  return value;
}

function readRecord(record: Record<string, unknown>, key: string): Record<string, unknown> {
  return asRecord(record[key]);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error("Expected object payload");
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
