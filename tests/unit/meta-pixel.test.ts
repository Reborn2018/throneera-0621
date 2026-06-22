import { describe, expect, it } from "vitest";
import { getMetaPixelRouteEvent } from "@/lib/meta-pixel";

describe("Meta Pixel route events", () => {
  it("tracks simulator landing pages as ViewContent", () => {
    expect(getMetaPixelRouteEvent("/queen")).toEqual({
      name: "ViewContent",
      params: {
        variant_id: "legacy",
        experiment_id: "queen_offer_hook_2026_06_22",
        content_name: "throneera_queen_legacy_landing",
        content_category: "campaign_landing",
      },
    });
  });

  it("tracks Queen variants separately", () => {
    expect(getMetaPixelRouteEvent("/queen", "crown")).toEqual({
      name: "ViewContent",
      params: {
        variant_id: "crown",
        experiment_id: "queen_offer_hook_2026_06_22",
        content_name: "throneera_queen_crown_landing",
        content_category: "campaign_landing",
      },
    });
  });

  it("tracks the first playable scene as a Lead", () => {
    expect(getMetaPixelRouteEvent("/napoleon/play/run_123")).toEqual({
      name: "Lead",
      params: {
        variant_id: "default",
        experiment_id: "default",
        content_name: "throneera_napoleon_default_first_play",
        content_category: "campaign_started",
      },
    });
  });

  it("tracks paywall views as InitiateCheckout", () => {
    expect(getMetaPixelRouteEvent("/queen/unlock/run_123", "betrayal")).toEqual({
      name: "InitiateCheckout",
      params: {
        variant_id: "betrayal",
        experiment_id: "queen_offer_hook_2026_06_22",
        content_name: "throneera_queen_betrayal_paywall",
        content_category: "campaign_unlock",
      },
    });
  });

  it("ignores non-funnel routes", () => {
    expect(getMetaPixelRouteEvent("/terms")).toBeNull();
  });
});
