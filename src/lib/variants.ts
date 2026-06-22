import type { QueenVariantId, RunRecord, SimulatorSlug, SimulatorVariantId } from "@/lib/types";

export const QUEEN_VARIANT_IDS = ["legacy", "crown", "betrayal"] as const;
export const QUEEN_EXPERIMENT_ID = "queen_offer_hook_2026_06_22";

export function isQueenVariantId(value: unknown): value is QueenVariantId {
  return typeof value === "string" && QUEEN_VARIANT_IDS.includes(value as QueenVariantId);
}

export function normalizeQueenVariant(value: unknown): QueenVariantId {
  return isQueenVariantId(value) ? value : "legacy";
}

export function getConfigVariantForSimulator(
  simulator: SimulatorSlug,
  value: unknown,
): SimulatorVariantId {
  return simulator === "queen" ? normalizeQueenVariant(value) : "default";
}

export function getRunVariantId(run: RunRecord): SimulatorVariantId {
  return getConfigVariantForSimulator(run.simulator, run.identity?.variantId);
}

export function variantSearchForConfig(config: {
  slug: SimulatorSlug;
  variantId?: SimulatorVariantId;
}): string {
  if (config.slug !== "queen") {
    return "";
  }

  return `?variant=${normalizeQueenVariant(config.variantId)}`;
}

export function variantUrlForRun(pathname: string, run: RunRecord): string {
  if (run.simulator !== "queen") {
    return pathname;
  }

  const url = new URL(pathname, "https://throneera.local");
  url.searchParams.set("variant", normalizeQueenVariant(run.identity.variantId));
  return `${url.pathname}${url.search}`;
}

export function runVariantPayload(run: RunRecord): Record<string, string> {
  const variantId = getRunVariantId(run);

  return {
    simulator: run.simulator,
    variant_id: variantId,
    experiment_id: run.simulator === "queen" ? QUEEN_EXPERIMENT_ID : "default",
  };
}
