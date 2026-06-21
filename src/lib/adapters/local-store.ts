import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { RunStore, StoreSnapshot } from "@/lib/adapters/store";
import type {
  EntitlementRecord,
  OrderRecord,
  RestoreTokenRecord,
  RunEventRecord,
  RunRecord,
  SimulatorOffer,
} from "@/lib/types";

const emptySnapshot = (): StoreSnapshot => ({
  runs: [],
  events: [],
  orders: [],
  entitlements: [],
  restoreTokens: [],
});

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function replaceById<T extends { id: string }>(items: T[], item: T): T[] {
  const existingIndex = items.findIndex((candidate) => candidate.id === item.id);
  if (existingIndex === -1) {
    return [...items, item];
  }

  const next = [...items];
  next[existingIndex] = item;
  return next;
}

class LocalStore implements RunStore {
  constructor(
    private snapshot: StoreSnapshot,
    private readonly persist?: (snapshot: StoreSnapshot) => Promise<void>,
  ) {}

  async saveRun(run: RunRecord): Promise<void> {
    this.snapshot.runs = replaceById(this.snapshot.runs, clone(run));
    await this.flush();
  }

  async getRun(id: string): Promise<RunRecord | null> {
    const run = this.snapshot.runs.find((candidate) => candidate.id === id);
    return run ? clone(run) : null;
  }

  async listRuns(): Promise<RunRecord[]> {
    return clone(this.snapshot.runs);
  }

  async updateRun(id: string, update: (run: RunRecord) => RunRecord): Promise<RunRecord> {
    const run = await this.getRun(id);
    if (!run) {
      throw new Error(`Run not found: ${id}`);
    }

    const updated = clone(update(run));
    this.snapshot.runs = replaceById(this.snapshot.runs, updated);
    await this.flush();
    return clone(updated);
  }

  async appendRunEvent(event: RunEventRecord): Promise<void> {
    this.snapshot.events = [...this.snapshot.events, clone(event)];
    await this.flush();
  }

  async listRunEvents(runId: string): Promise<RunEventRecord[]> {
    return clone(this.snapshot.events.filter((event) => event.runId === runId));
  }

  async saveOrder(order: OrderRecord): Promise<void> {
    this.snapshot.orders = replaceById(this.snapshot.orders, clone(order));
    await this.flush();
  }

  async getOrder(id: string): Promise<OrderRecord | null> {
    const order = this.snapshot.orders.find((candidate) => candidate.id === id);
    return order ? clone(order) : null;
  }

  async updateOrder(
    id: string,
    update: (order: OrderRecord) => OrderRecord,
  ): Promise<OrderRecord> {
    const order = await this.getOrder(id);
    if (!order) {
      throw new Error(`Order not found: ${id}`);
    }

    const updated = clone(update(order));
    this.snapshot.orders = replaceById(this.snapshot.orders, updated);
    await this.flush();
    return clone(updated);
  }

  async findOpenOrder(
    runId: string,
    sku: SimulatorOffer["sku"],
  ): Promise<OrderRecord | null> {
    const order = this.snapshot.orders.find(
      (candidate) =>
        candidate.runId === runId &&
        candidate.sku === sku &&
        (candidate.status === "pending" || candidate.status === "completed"),
    );

    return order ? clone(order) : null;
  }

  async saveEntitlement(entitlement: EntitlementRecord): Promise<void> {
    this.snapshot.entitlements = replaceById(this.snapshot.entitlements, clone(entitlement));
    await this.flush();
  }

  async getActiveEntitlementForRun(runId: string): Promise<EntitlementRecord | null> {
    const entitlement = this.snapshot.entitlements.find(
      (candidate) => candidate.runId === runId && candidate.status === "active",
    );

    return entitlement ? clone(entitlement) : null;
  }

  async listEntitlementsForRun(runId: string): Promise<EntitlementRecord[]> {
    return clone(
      this.snapshot.entitlements.filter((entitlement) => entitlement.runId === runId),
    );
  }

  async saveRestoreToken(token: RestoreTokenRecord): Promise<void> {
    this.snapshot.restoreTokens = replaceById(this.snapshot.restoreTokens, clone(token));
    await this.flush();
  }

  async getRestoreTokenByHash(tokenHash: string): Promise<RestoreTokenRecord | null> {
    const token = this.snapshot.restoreTokens.find(
      (candidate) => candidate.tokenHash === tokenHash,
    );

    return token ? clone(token) : null;
  }

  async updateRestoreToken(
    id: string,
    update: (token: RestoreTokenRecord) => RestoreTokenRecord,
  ): Promise<RestoreTokenRecord> {
    const token = this.snapshot.restoreTokens.find((candidate) => candidate.id === id);
    if (!token) {
      throw new Error(`Restore token not found: ${id}`);
    }

    const updated = clone(update(clone(token)));
    this.snapshot.restoreTokens = replaceById(this.snapshot.restoreTokens, updated);
    await this.flush();
    return clone(updated);
  }

  async reset(): Promise<void> {
    this.snapshot = emptySnapshot();
    await this.flush();
  }

  private async flush(): Promise<void> {
    if (this.persist) {
      await this.persist(clone(this.snapshot));
    }
  }
}

export function createMemoryStore(snapshot: StoreSnapshot = emptySnapshot()): RunStore {
  return new LocalStore(clone(snapshot));
}

export async function createFileStore(filePath: string): Promise<RunStore> {
  const snapshot = await readSnapshot(filePath);

  return new LocalStore(snapshot, async (nextSnapshot) => {
    await mkdir(dirname(filePath), { recursive: true });
    const tempPath = `${filePath}.tmp`;
    await writeFile(tempPath, `${JSON.stringify(nextSnapshot, null, 2)}\n`, "utf8");
    await rename(tempPath, filePath);
  });
}

async function readSnapshot(filePath: string): Promise<StoreSnapshot> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreSnapshot>;

    return {
      runs: parsed.runs ?? [],
      events: parsed.events ?? [],
      orders: parsed.orders ?? [],
      entitlements: parsed.entitlements ?? [],
      restoreTokens: parsed.restoreTokens ?? [],
    };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return emptySnapshot();
    }

    throw error;
  }
}
