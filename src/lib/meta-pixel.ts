export type MetaPixelEventName = "ViewContent" | "Lead" | "InitiateCheckout";

export interface MetaPixelRouteEvent {
  name: MetaPixelEventName;
  params: Record<string, string>;
}

const SIMULATOR_SLUGS = new Set(["queen", "napoleon"]);

export function getMetaPixelRouteEvent(
  pathname: string,
  variantId?: string,
): MetaPixelRouteEvent | null {
  const segments = pathname.split("/").filter(Boolean);
  const simulator = segments[0];

  if (!simulator || !SIMULATOR_SLUGS.has(simulator)) {
    return null;
  }

  const normalizedVariant =
    simulator === "queen" && variantId && ["legacy", "crown", "betrayal"].includes(variantId)
      ? variantId
      : simulator === "queen"
        ? "legacy"
        : "default";
  const contentName = `throneera_${simulator}_${normalizedVariant}`;
  const baseParams = {
    variant_id: normalizedVariant,
    experiment_id: simulator === "queen" ? "queen_offer_hook_2026_06_22" : "default",
  };

  if (segments.length === 1) {
    return {
      name: "ViewContent",
      params: {
        ...baseParams,
        content_name: `${contentName}_landing`,
        content_category: "campaign_landing",
      },
    };
  }

  if (segments[1] === "start") {
    return {
      name: "ViewContent",
      params: {
        ...baseParams,
        content_name: `${contentName}_identity_builder`,
        content_category: "campaign_start",
      },
    };
  }

  if (segments[1] === "play") {
    return {
      name: "Lead",
      params: {
        ...baseParams,
        content_name: `${contentName}_first_play`,
        content_category: "campaign_started",
      },
    };
  }

  if (segments[1] === "unlock") {
    return {
      name: "InitiateCheckout",
      params: {
        ...baseParams,
        content_name: `${contentName}_paywall`,
        content_category: "campaign_unlock",
      },
    };
  }

  return null;
}
