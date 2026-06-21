import { describe, expect, it } from "vitest";
import { createMemoryStore } from "@/lib/adapters/local-store";
import type { OrderRecord, RunRecord } from "@/lib/types";

function makeRun(id: string): RunRecord {
  const now = "2026-06-21T00:00:00.000Z";

  return {
    id,
    simulator: "queen",
    status: "identity",
    currentSceneId: "identity",
    identity: {
      name: "Isolde",
      dispositionId: "merciful",
      originId: "heir",
    },
    realm: {
      legitimacy: 50,
      treasury: 50,
      military: 50,
      publicSupport: 50,
    },
    decisions: [],
    createdAt: now,
    updatedAt: now,
  };
}

function makeOrder(id: string, runId: string): OrderRecord {
  const now = "2026-06-21T00:00:00.000Z";

  return {
    id,
    runId,
    sku: "complete_current_campaign",
    amountMinor: 799,
    currency: "USD",
    status: "pending",
    provider: "mock",
    providerCheckoutId: `checkout-${id}`,
    requestId: `request-${id}`,
    createdAt: now,
    updatedAt: now,
  };
}

describe("memory store", () => {
  it("creates, loads, and updates runs without mutating stored snapshots", async () => {
    const store = createMemoryStore();
    const run = makeRun("run-1");

    await store.saveRun(run);
    run.status = "paid";

    expect((await store.getRun("run-1"))?.status).toBe("identity");

    await store.updateRun("run-1", (stored) => ({
      ...stored,
      status: "prologue",
      currentSceneId: "oath",
    }));

    expect(await store.getRun("run-1")).toMatchObject({
      id: "run-1",
      status: "prologue",
      currentSceneId: "oath",
    });
  });

  it("appends events in insertion order", async () => {
    const store = createMemoryStore();
    await store.saveRun(makeRun("run-1"));

    await store.appendRunEvent({
      id: "event-1",
      runId: "run-1",
      eventType: "landing_view",
      payload: {},
      createdAt: "2026-06-21T00:00:00.000Z",
    });
    await store.appendRunEvent({
      id: "event-2",
      runId: "run-1",
      eventType: "start_clicked",
      payload: {},
      createdAt: "2026-06-21T00:00:01.000Z",
    });

    expect((await store.listRunEvents("run-1")).map((event) => event.eventType)).toEqual([
      "landing_view",
      "start_clicked",
    ]);
  });

  it("stores orders and finds pending checkout by run and sku", async () => {
    const store = createMemoryStore();
    const order = makeOrder("order-1", "run-1");

    await store.saveOrder(order);

    expect(await store.getOrder("order-1")).toMatchObject({ id: "order-1" });
    expect(await store.findOpenOrder("run-1", "complete_current_campaign")).toMatchObject({
      id: "order-1",
      status: "pending",
    });
  });

  it("stores active entitlements by run", async () => {
    const store = createMemoryStore();

    await store.saveEntitlement({
      id: "entitlement-1",
      runId: "run-1",
      orderId: "order-1",
      status: "active",
      grantedAt: "2026-06-21T00:00:00.000Z",
    });

    expect(await store.getActiveEntitlementForRun("run-1")).toMatchObject({
      id: "entitlement-1",
      status: "active",
    });
  });

  it("resets all records for isolated tests", async () => {
    const store = createMemoryStore();

    await store.saveRun(makeRun("run-1"));
    await store.saveOrder(makeOrder("order-1", "run-1"));
    await store.reset();

    expect(await store.getRun("run-1")).toBeNull();
    expect(await store.getOrder("order-1")).toBeNull();
    expect(await store.listRunEvents("run-1")).toEqual([]);
  });
});
