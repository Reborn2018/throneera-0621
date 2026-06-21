import { describe, expect, it } from "vitest";
import { getMetaPixelRouteEvent } from "@/lib/meta-pixel";

describe("Meta Pixel route events", () => {
  it("tracks simulator landing pages as ViewContent", () => {
    expect(getMetaPixelRouteEvent("/queen")).toEqual({
      name: "ViewContent",
      params: {
        content_name: "throneera_queen_landing",
        content_category: "campaign_landing",
      },
    });
  });

  it("tracks the first playable scene as a Lead", () => {
    expect(getMetaPixelRouteEvent("/napoleon/play/run_123")).toEqual({
      name: "Lead",
      params: {
        content_name: "throneera_napoleon_first_play",
        content_category: "campaign_started",
      },
    });
  });

  it("tracks paywall views as InitiateCheckout", () => {
    expect(getMetaPixelRouteEvent("/queen/unlock/run_123")).toEqual({
      name: "InitiateCheckout",
      params: {
        content_name: "throneera_queen_paywall",
        content_category: "campaign_unlock",
      },
    });
  });

  it("ignores non-funnel routes", () => {
    expect(getMetaPixelRouteEvent("/terms")).toBeNull();
  });
});
