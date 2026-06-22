import { describe, expect, it } from "vitest";
import { normalizeCreemCheckoutUrl } from "@/lib/checkout-url";

describe("normalizeCreemCheckoutUrl", () => {
  it("uses Creem's canonical www host to avoid an iframe redirect", () => {
    expect(normalizeCreemCheckoutUrl("https://creem.io/checkout/prod_123/ch_123?theme=dark")).toBe(
      "https://www.creem.io/checkout/prod_123/ch_123?theme=dark",
    );
  });

  it("preserves already-canonical and malformed URLs", () => {
    expect(normalizeCreemCheckoutUrl("https://www.creem.io/checkout/prod_123/ch_123")).toBe(
      "https://www.creem.io/checkout/prod_123/ch_123",
    );
    expect(normalizeCreemCheckoutUrl("/api/mock-checkout?checkout_id=ch_123")).toBe(
      "/api/mock-checkout?checkout_id=ch_123",
    );
  });
});
