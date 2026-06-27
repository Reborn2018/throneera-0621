import { NextResponse } from "next/server";
import { z } from "zod";
import { createCreemCheckoutProvider } from "@/lib/adapters/creem";
import { createCheckoutForRun } from "@/lib/engine/checkout";
import { createRun } from "@/lib/engine/runs";
import { getSimulatorConfig } from "@/lib/simulators";
import { getStore } from "@/lib/server/store";
import type { RunRecord, SimulatorSlug } from "@/lib/types";

const checkoutSchema = z.object({
  era: z.enum(["queen", "napoleon"]),
  runId: z.string().trim().min(1),
  rulerName: z.string().trim().optional(),
  mode: z.enum(["open", "prefetch"]).optional().default("open"),
  purchaseKind: z.enum(["campaign", "replay", "unlimited"]).optional().default("campaign"),
  campaignNumber: z.number().int().positive().optional(),
});

type EngineV3PurchaseKind = z.infer<typeof checkoutSchema>["purchaseKind"];

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid engine-v3 checkout payload" }, { status: 400 });
  }

  const allowMockCheckout =
    process.env.THRONEERA_ALLOW_MOCK_CHECKOUT === "true" &&
    process.env.VERCEL_ENV !== "production";
  const data = parsed.data;
  const providerProductId = productIdForPurchaseKind(data.purchaseKind);
  const creemApiKey = process.env.CREEM_API_KEY;

  if (!allowMockCheckout && (!providerProductId || !creemApiKey)) {
    return NextResponse.json({ error: "Checkout provider is not configured" }, { status: 503 });
  }

  const store = await getStore();
  const run = await ensureCheckoutRun({
    store,
    era: data.era,
    runId: data.runId,
    rulerName: data.rulerName,
    forceNewCheckout: data.purchaseKind !== "campaign",
  });

  if (run.status === "paid" && data.purchaseKind === "campaign") {
    return NextResponse.json({ checkoutRunId: run.id, verified: true });
  }

  const offer = offerForPurchaseKind(data.era, data.purchaseKind);

  const session = await createCheckoutForRun({
    store,
    runId: run.id,
    requestId: crypto.randomUUID(),
    providerProductId: providerProductId ?? mockProductIdForPurchaseKind(data.purchaseKind),
    offer,
    allowMockCheckout,
    trackCheckoutStarted: data.mode === "open",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin,
    checkoutProvider:
      allowMockCheckout || !creemApiKey
        ? undefined
        : createCreemCheckoutProvider({
            apiKey: creemApiKey,
            apiBaseUrl: process.env.CREEM_API_BASE_URL,
          }),
  });

  return NextResponse.json({
    checkoutRunId: run.id,
    purchaseKind: data.purchaseKind,
    checkoutUrl: session.checkoutUrl,
  });
}

async function ensureCheckoutRun({
  store,
  era,
  runId,
  rulerName,
  forceNewCheckout,
}: {
  store: Awaited<ReturnType<typeof getStore>>;
  era: SimulatorSlug;
  runId: string;
  rulerName?: string;
  forceNewCheckout: boolean;
}): Promise<RunRecord> {
  const existing = await store.getRun(runId);
  const run =
    existing ??
    (await createRun({
      store,
      simulator: era,
      runId,
      variantId: era === "queen" ? "legacy" : undefined,
    }));

  if (run.simulator !== era) {
    throw new Error(`Checkout run era mismatch: ${run.simulator} !== ${era}`);
  }

  if (run.status === "paid" && !forceNewCheckout) {
    return run;
  }

  if (run.status === "paywalled" || run.status === "checkout_pending") {
    return run;
  }

  const config = getSimulatorConfig(era, era === "queen" ? "legacy" : undefined);
  const paywallSceneId = config.prologueScenes.at(-1)?.id ?? run.currentSceneId;
  const name = rulerName?.trim() || run.identity.name;
  const now = new Date().toISOString();

  return store.updateRun(run.id, (current) => ({
    ...current,
    status: "paywalled",
    currentSceneId: paywallSceneId,
    identity: {
      ...current.identity,
      name,
      variantId: era === "queen" ? "legacy" : current.identity.variantId,
    },
    updatedAt: now,
  }));
}

function offerForPurchaseKind(era: SimulatorSlug, purchaseKind: EngineV3PurchaseKind) {
  if (purchaseKind === "unlimited") {
    return {
      sku: "engine_v3_unlimited" as const,
      amountMinor: 1499,
      currency: "USD" as const,
    };
  }

  return getSimulatorConfig(era, era === "queen" ? "legacy" : undefined).offer;
}

function productIdForPurchaseKind(purchaseKind: EngineV3PurchaseKind): string | undefined {
  if (purchaseKind === "unlimited") {
    return process.env.CREEM_UNLIMITED_PRODUCT_ID;
  }

  return process.env.CREEM_COMPLETE_CAMPAIGN_PRODUCT_ID;
}

function mockProductIdForPurchaseKind(purchaseKind: EngineV3PurchaseKind): string {
  return purchaseKind === "unlimited"
    ? "prod_engine_v3_unlimited"
    : "prod_complete_current_campaign";
}
