import type { SimulatorConfig, SimulatorSlug } from "@/lib/types";
import { napoleonConfig } from "@/lib/simulators/napoleon";
import { queenConfig } from "@/lib/simulators/queen";

export const simulatorConfigs = {
  queen: queenConfig,
  napoleon: napoleonConfig,
} satisfies Record<SimulatorSlug, SimulatorConfig>;

export function getSimulatorConfig(slug: SimulatorSlug): SimulatorConfig {
  return simulatorConfigs[slug];
}

export function isSimulatorSlug(value: string): value is SimulatorSlug {
  return value === "queen" || value === "napoleon";
}
