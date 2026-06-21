import type {
  EntitlementRecord,
  OrderRecord,
  RestoreTokenRecord,
  RunEventRecord,
  RunRecord,
  SimulatorOffer,
} from "@/lib/types";

export interface RunStore {
  saveRun(run: RunRecord): Promise<void>;
  getRun(id: string): Promise<RunRecord | null>;
  listRuns(): Promise<RunRecord[]>;
  updateRun(id: string, update: (run: RunRecord) => RunRecord): Promise<RunRecord>;
  appendRunEvent(event: RunEventRecord): Promise<void>;
  listRunEvents(runId: string): Promise<RunEventRecord[]>;
  saveOrder(order: OrderRecord): Promise<void>;
  getOrder(id: string): Promise<OrderRecord | null>;
  updateOrder(id: string, update: (order: OrderRecord) => OrderRecord): Promise<OrderRecord>;
  findOpenOrder(runId: string, sku: SimulatorOffer["sku"]): Promise<OrderRecord | null>;
  saveEntitlement(entitlement: EntitlementRecord): Promise<void>;
  getActiveEntitlementForRun(runId: string): Promise<EntitlementRecord | null>;
  listEntitlementsForRun(runId: string): Promise<EntitlementRecord[]>;
  saveRestoreToken(token: RestoreTokenRecord): Promise<void>;
  getRestoreTokenByHash(tokenHash: string): Promise<RestoreTokenRecord | null>;
  updateRestoreToken(
    id: string,
    update: (token: RestoreTokenRecord) => RestoreTokenRecord,
  ): Promise<RestoreTokenRecord>;
  reset(): Promise<void>;
}

export interface StoreSnapshot {
  runs: RunRecord[];
  events: RunEventRecord[];
  orders: OrderRecord[];
  entitlements: EntitlementRecord[];
  restoreTokens: RestoreTokenRecord[];
}
