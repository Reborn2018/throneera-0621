import type { QueenVariantId, SimulatorConfig, SimulatorSlug } from "@/lib/types";
import { normalizeQueenVariant } from "@/lib/variants";

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

export const queenVariantVisuals: Record<QueenVariantId, SimulatorVisuals> = {
  legacy: simulatorVisuals.queen,
  crown: {
    heroImage: "/assets/hero-queen-crown-v2.png",
    heroAlt: "A younger sister sits on the throne wearing the stolen crown while the rightful queen enters court.",
    kicker: "Stolen Crown",
    promise: "Your sister has the throne. You have one public moment to make the court choose.",
    proof: "Built to test legality, humiliation, sister rivalry, revenge, and public power.",
    switchLabel: "Try Napoleon Simulator",
  },
  betrayal: {
    heroImage: "/assets/hero-queen-betrayal-v2.png",
    heroAlt: "A betrayed queen faces her husband, another pregnant woman, and an abdication paper at a royal dinner.",
    kicker: "Marriage Betrayal",
    promise: "Your husband brought another woman and an abdication paper to dinner.",
    proof: "Built to test intimate betrayal, heir panic, identity threat, and revenge.",
    switchLabel: "Try Napoleon Simulator",
  },
};

export function getSimulatorVisuals(config: SimulatorConfig): SimulatorVisuals {
  if (config.slug === "queen") {
    return queenVariantVisuals[normalizeQueenVariant(config.variantId)];
  }

  return simulatorVisuals[config.slug];
}

export function getStoryTurnCount(config: SimulatorConfig): number {
  return config.prologueScenes.length + config.paidScenes.length;
}

export function getFormattedPrice(config: SimulatorConfig): string {
  return `$${(config.offer.amountMinor / 100).toFixed(2)}`;
}
