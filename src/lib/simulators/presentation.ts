import type { SimulatorConfig, SimulatorSlug } from "@/lib/types";

export interface SimulatorVisuals {
  heroImage: string;
  heroAlt: string;
  kicker: string;
  promise: string;
  proof: string;
  switchLabel: string;
}

export const simulatorVisuals: Record<SimulatorSlug, SimulatorVisuals> = {
  queen: {
    heroImage: "/assets/hero-queen.png",
    heroAlt: "A queen in a candlelit throne room with a crown and royal court atmosphere.",
    kicker: "Candlelit Court",
    promise: "Every decree changes loyalty, fear, and the survival of your crown.",
    proof: "Built for a dramatic, choice-driven reign with a personalized ending.",
    switchLabel: "Try Napoleon Simulator",
  },
  napoleon: {
    heroImage: "/assets/hero-napoleon.png",
    heroAlt: "Napoleon at a campaign map table with imperial war-room lighting.",
    kicker: "Campaign Map Room",
    promise: "Every order changes authority, supply, army morale, and public will.",
    proof: "Built for a strategic, choice-driven campaign with a personalized ending.",
    switchLabel: "Try Queen Simulator",
  },
};

export function getStoryTurnCount(config: SimulatorConfig): number {
  return config.prologueScenes.length + config.paidScenes.length;
}

export function getFormattedPrice(config: SimulatorConfig): string {
  return `$${(config.offer.amountMinor / 100).toFixed(2)}`;
}
