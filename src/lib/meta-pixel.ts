export type MetaPixelEventName = "ViewContent" | "Lead" | "InitiateCheckout";

export interface MetaPixelRouteEvent {
  name: MetaPixelEventName;
  params: Record<string, string>;
}

const SIMULATOR_SLUGS = new Set(["queen", "napoleon"]);

export function getMetaPixelRouteEvent(pathname: string): MetaPixelRouteEvent | null {
  const segments = pathname.split("/").filter(Boolean);
  const simulator = segments[0];

  if (!simulator || !SIMULATOR_SLUGS.has(simulator)) {
    return null;
  }

  const contentName = `throneera_${simulator}`;

  if (segments.length === 1) {
    return {
      name: "ViewContent",
      params: {
        content_name: `${contentName}_landing`,
        content_category: "campaign_landing",
      },
    };
  }

  if (segments[1] === "start") {
    return {
      name: "ViewContent",
      params: {
        content_name: `${contentName}_identity_builder`,
        content_category: "campaign_start",
      },
    };
  }

  if (segments[1] === "play") {
    return {
      name: "Lead",
      params: {
        content_name: `${contentName}_first_play`,
        content_category: "campaign_started",
      },
    };
  }

  if (segments[1] === "unlock") {
    return {
      name: "InitiateCheckout",
      params: {
        content_name: `${contentName}_paywall`,
        content_category: "campaign_unlock",
      },
    };
  }

  return null;
}
