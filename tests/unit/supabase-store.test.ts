import { describe, expect, it } from "vitest";
import {
  orderFromSupabaseRow,
  orderToSupabaseRow,
  runFromSupabaseRow,
  runToSupabaseRow,
} from "@/lib/adapters/supabase-store";
import type { OrderRecord, RunRecord } from "@/lib/types";

const run: RunRecord = {
  id: "run-1",
  simulator: "queen",
  status: "identity",
  currentSceneId: "identity",
  runType: "first_campaign",
  identity: {
    name: "Aurelia",
    dispositionId: "merciful",
    originId: "heir",
  },
  realm: {
    legitimacy: 50,
    treasury: 50,
    military: 50,
    publicSupport: 50,
  },
  decisions: [
    {
      sceneId: "oath",
      choiceId: "protect",
      intent: "protect",
      label: "Protect the heir.",
      createdAt: "2026-06-21T00:00:00.000Z",
    },
  ],
  echoedQuote: "The crown remembers.",
  createdAt: "2026-06-21T00:00:00.000Z",
  updatedAt: "2026-06-21T00:01:00.000Z",
};

const order: OrderRecord = {
  id: "order-1",
  runId: "run-1",
  sku: "complete_current_campaign",
  amountMinor: 999,
  currency: "USD",
  status: "pending",
  provider: "creem",
  providerCheckoutId: "ch_123",
  providerCheckoutUrl: "https://checkout.creem.io/ch_123",
  providerProductId: "prod_123",
  requestId: "request-1",
  createdAt: "2026-06-21T00:00:00.000Z",
  updatedAt: "2026-06-21T00:01:00.000Z",
};

describe("Supabase store mappings", () => {
  it("maps app runs to snake_case Supabase rows and back", () => {
    const row = runToSupabaseRow(run);

    expect(row).toEqual({
      id: "run-1",
      simulator: "queen",
      status: "identity",
      current_scene_id: "identity",
      run_type: "first_campaign",
      source_run_id: null,
      identity: run.identity,
      realm_state: run.realm,
      decisions: run.decisions,
      echoed_quote: "The crown remembers.",
      paid_at: null,
      completed_at: null,
      created_at: "2026-06-21T00:00:00.000Z",
      updated_at: "2026-06-21T00:01:00.000Z",
    });
    expect(runFromSupabaseRow(row)).toEqual(run);
  });

  it("maps app orders to Supabase rows and back", () => {
    const row = orderToSupabaseRow(order);

    expect(row).toEqual({
      id: "order-1",
      run_id: "run-1",
      sku: "complete_current_campaign",
      amount_minor: 999,
      currency: "USD",
      status: "pending",
      provider: "creem",
      provider_checkout_id: "ch_123",
      provider_checkout_url: "https://checkout.creem.io/ch_123",
      provider_order_id: null,
      provider_product_id: "prod_123",
      request_id: "request-1",
      created_at: "2026-06-21T00:00:00.000Z",
      updated_at: "2026-06-21T00:01:00.000Z",
    });
    expect(orderFromSupabaseRow(row)).toEqual(order);
  });
});
