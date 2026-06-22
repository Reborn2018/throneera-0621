import type { SimulatorConfig, SimulatorSlug } from "@/lib/types";
import { napoleonConfig } from "@/lib/simulators/napoleon";
import { queenConfig } from "@/lib/simulators/queen";
import { queenVariantConfigs } from "@/lib/simulators/queen-variants";
import { normalizeQueenVariant } from "@/lib/variants";

export const simulatorConfigs = {
  queen: queenConfig,
  napoleon: napoleonConfig,
} satisfies Record<SimulatorSlug, SimulatorConfig>;

export function getSimulatorConfig(slug: SimulatorSlug, variantId?: unknown): SimulatorConfig {
  if (slug === "queen") {
    return queenVariantConfigs[normalizeQueenVariant(variantId)];
  }

  return simulatorConfigs[slug];
}

export function isSimulatorSlug(value: string): value is SimulatorSlug {
  return value === "queen" || value === "napoleon";
}
