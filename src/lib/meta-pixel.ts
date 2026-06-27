export type MetaPixelEventName = "ViewContent" | "Lead" | "InitiateCheckout";

export interface MetaPixelRouteEvent {
  name: MetaPixelEventName;
  params: Record<string, string>;
}

const SIMULATOR_SLUGS = new Set(["queen", "napoleon"]);
const QUEEN_VARIANTS = ["legacy", "crown", "betrayal"];

export function getMetaPixelRouteEvent(
  pathname: string,
  variantId?: string,
): MetaPixelRouteEvent | null {
  const segments = pathname.split("/").filter(Boolean);
  const simulator = segments[0];

  if (!simulator || !SIMULATOR_SLUGS.has(simulator)) {
    return null;
  }

  const { contentName, baseParams } = getMetaPixelContext(simulator, variantId);

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

  if (segments[1] === "play" && segments.length === 2) {
    return {
      name: "ViewContent",
      params: {
        ...baseParams,
        content_name: `${contentName}_landing`,
        content_category: "campaign_landing",
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
      name: "ViewContent",
      params: {
        ...baseParams,
        content_name: `${contentName}_paywall`,
        content_category: "campaign_unlock",
      },
    };
  }

  return null;
}

export function getMetaPixelCheckoutStartedEvent(
  simulator: string,
  variantId?: string,
): MetaPixelRouteEvent | null {
  if (!SIMULATOR_SLUGS.has(simulator)) {
    return null;
  }

  const { contentName, baseParams } = getMetaPixelContext(simulator, variantId);
  return {
    name: "InitiateCheckout",
    params: {
      ...baseParams,
      content_name: `${contentName}_checkout_click`,
      content_category: "campaign_checkout",
    },
  };
}

function getMetaPixelContext(simulator: string, variantId?: string) {
  const normalizedVariant =
    simulator === "queen" && variantId && QUEEN_VARIANTS.includes(variantId)
      ? variantId
      : simulator === "queen"
        ? "legacy"
        : "default";

  return {
    contentName: `throneera_${simulator}_${normalizedVariant}`,
    baseParams: {
      variant_id: normalizedVariant,
      experiment_id: simulator === "queen" ? "queen_offer_hook_2026_06_22" : "default",
    },
  };
}
