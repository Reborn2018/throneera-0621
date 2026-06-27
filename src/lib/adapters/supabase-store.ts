import { createClient } from "@supabase/supabase-js";
import type { RunStore } from "@/lib/adapters/store";
import type {
  EntitlementRecord,
  OfferSku,
  OrderRecord,
  RestoreTokenRecord,
  RunEventRecord,
  RunRecord,
  WebhookEventRecord,
} from "@/lib/types";

type DbRow = Record<string, unknown>;
type DbError = { message: string };
type DbResult<T> = { data: T; error: DbError | null };
type DbQuery<T> = PromiseLike<DbResult<T>>;

interface SupabaseTable {
  select(columns?: string): SupabaseTable;
  upsert(row: DbRow | DbRow[], options?: { onConflict?: string }): DbQuery<unknown>;
  insert(row: DbRow | DbRow[]): DbQuery<unknown>;
  update(row: DbRow): SupabaseTable;
  delete(): SupabaseTable;
  eq(column: string, value: unknown): SupabaseTable;
  in(column: string, values: unknown[]): SupabaseTable;
  neq(column: string, value: unknown): SupabaseTable;
  order(column: string, options?: { ascending?: boolean }): SupabaseTable;
  maybeSingle(): DbQuery<DbRow | null>;
  then<TResult1 = DbResult<DbRow[]>, TResult2 = never>(
    onfulfilled?: ((value: DbResult<DbRow[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2>;
}

interface SupabaseLike {
  from(table: string): SupabaseTable;
}

export function createSupabaseStore(url: string, serviceRoleKey: string): RunStore {
  const client = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }) as unknown as SupabaseLike;

  return createSupabaseStoreFromClient(client);
}

export function createSupabaseStoreFromClient(client: SupabaseLike): RunStore {
  return new SupabaseStore(client);
}

class SupabaseStore implements RunStore {
  constructor(private readonly client: SupabaseLike) {}

  async saveRun(run: RunRecord): Promise<void> {
    await this.write(this.client.from("runs").upsert(runToSupabaseRow(run)));
  }

  async getRun(id: string): Promise<RunRecord | null> {
    const row = await this.maybeOne(this.client.from("runs").select("*").eq("id", id).maybeSingle());
    return row ? runFromSupabaseRow(row) : null;
  }

  async listRuns(): Promise<RunRecord[]> {
    const rows = await this.many(this.client.from("runs").select("*").order("created_at"));
    return rows.map(runFromSupabaseRow);
  }

  async updateRun(id: string, update: (run: RunRecord) => RunRecord): Promise<RunRecord> {
    const run = await this.getRun(id);
    if (!run) {
      throw new Error(`Run not found: ${id}`);
    }

    const updated = update(run);
    await this.saveRun(updated);
    return updated;
  }

  async appendRunEvent(event: RunEventRecord): Promise<void> {
    await this.write(this.client.from("run_events").upsert(runEventToSupabaseRow(event)));
  }

  async listRunEvents(runId: string): Promise<RunEventRecord[]> {
    const rows = await this.many(
      this.client.from("run_events").select("*").eq("run_id", runId).order("created_at"),
    );
    return rows.map(runEventFromSupabaseRow);
  }

  async saveOrder(order: OrderRecord): Promise<void> {
    await this.write(this.client.from("orders").upsert(orderToSupabaseRow(order)));
  }

  async getOrder(id: string): Promise<OrderRecord | null> {
    const row = await this.maybeOne(this.client.from("orders").select("*").eq("id", id).maybeSingle());
    return row ? orderFromSupabaseRow(row) : null;
  }

  async findOrderByProviderCheckoutId(providerCheckoutId: string): Promise<OrderRecord | null> {
    const row = await this.maybeOne(
      this.client
        .from("orders")
        .select("*")
        .eq("provider_checkout_id", providerCheckoutId)
        .maybeSingle(),
    );
    return row ? orderFromSupabaseRow(row) : null;
  }

  async findOrderByProviderOrderId(providerOrderId: string): Promise<OrderRecord | null> {
    const row = await this.maybeOne(
      this.client
        .from("orders")
        .select("*")
        .eq("provider_order_id", providerOrderId)
        .maybeSingle(),
    );
    return row ? orderFromSupabaseRow(row) : null;
  }

  async updateOrder(id: string, update: (order: OrderRecord) => OrderRecord): Promise<OrderRecord> {
    const order = await this.getOrder(id);
    if (!order) {
      throw new Error(`Order not found: ${id}`);
    }

    const updated = update(order);
    await this.saveOrder(updated);
    return updated;
  }

  async findOpenOrder(
    runId: string,
    sku: OfferSku,
  ): Promise<OrderRecord | null> {
    const row = await this.maybeOne(
      this.client
        .from("orders")
        .select("*")
        .eq("run_id", runId)
        .eq("sku", sku)
        .eq("status", "pending")
        .maybeSingle(),
    );
    return row ? orderFromSupabaseRow(row) : null;
  }

  async saveEntitlement(entitlement: EntitlementRecord): Promise<void> {
    await this.write(this.client.from("entitlements").upsert(entitlementToSupabaseRow(entitlement)));
  }

  async updateEntitlement(
    id: string,
    update: (entitlement: EntitlementRecord) => EntitlementRecord,
  ): Promise<EntitlementRecord> {
    const rows = await this.many(this.client.from("entitlements").select("*").eq("id", id));
    const entitlement = rows[0] ? entitlementFromSupabaseRow(rows[0]) : null;
    if (!entitlement) {
      throw new Error(`Entitlement not found: ${id}`);
    }

    const updated = update(entitlement);
    await this.saveEntitlement(updated);
    return updated;
  }

  async getActiveEntitlementForRun(runId: string): Promise<EntitlementRecord | null> {
    const row = await this.maybeOne(
      this.client
        .from("entitlements")
        .select("*")
        .eq("run_id", runId)
        .eq("status", "active")
        .maybeSingle(),
    );
    return row ? entitlementFromSupabaseRow(row) : null;
  }

  async listEntitlementsForRun(runId: string): Promise<EntitlementRecord[]> {
    const rows = await this.many(
      this.client.from("entitlements").select("*").eq("run_id", runId),
    );
    return rows.map(entitlementFromSupabaseRow);
  }

  async saveWebhookEvent(event: WebhookEventRecord): Promise<void> {
    await this.write(
      this.client
        .from("webhook_events")
        .upsert(webhookEventToSupabaseRow(event), {
          onConflict: "provider,provider_event_id",
        }),
    );
  }

  async getWebhookEvent(
    provider: WebhookEventRecord["provider"],
    providerEventId: string,
  ): Promise<WebhookEventRecord | null> {
    const row = await this.maybeOne(
      this.client
        .from("webhook_events")
        .select("*")
        .eq("provider", provider)
        .eq("provider_event_id", providerEventId)
        .maybeSingle(),
    );
    return row ? webhookEventFromSupabaseRow(row) : null;
  }

  async saveRestoreToken(token: RestoreTokenRecord): Promise<void> {
    await this.write(this.client.from("restore_tokens").upsert(restoreTokenToSupabaseRow(token)));
  }

  async getRestoreTokenByHash(tokenHash: string): Promise<RestoreTokenRecord | null> {
    const row = await this.maybeOne(
      this.client
        .from("restore_tokens")
        .select("*")
        .eq("token_hash", tokenHash)
        .maybeSingle(),
    );
    return row ? restoreTokenFromSupabaseRow(row) : null;
  }

  async updateRestoreToken(
    id: string,
    update: (token: RestoreTokenRecord) => RestoreTokenRecord,
  ): Promise<RestoreTokenRecord> {
    const tokenRow = await this.maybeOne(
      this.client.from("restore_tokens").select("*").eq("id", id).maybeSingle(),
    );
    const token = tokenRow ? restoreTokenFromSupabaseRow(tokenRow) : null;
    if (!token) {
      throw new Error(`Restore token not found: ${id}`);
    }

    const updated = update(token);
    await this.saveRestoreToken(updated);
    return updated;
  }

  async reset(): Promise<void> {
    for (const table of [
      "restore_tokens",
      "webhook_events",
      "entitlements",
      "orders",
      "run_events",
      "runs",
    ]) {
      await this.write(this.client.from(table).delete().neq("id", "__never__"));
    }
  }

  private async write(query: DbQuery<unknown> | SupabaseTable): Promise<void> {
    const result = await query;
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  private async maybeOne(query: DbQuery<DbRow | null>): Promise<DbRow | null> {
    const result = await query;
    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data;
  }

  private async many(query: SupabaseTable): Promise<DbRow[]> {
    const result = await query;
    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data;
  }
}

export function runToSupabaseRow(run: RunRecord): DbRow {
  return {
    id: run.id,
    simulator: run.simulator,
    status: run.status,
    current_scene_id: run.currentSceneId,
    run_type: run.runType,
    source_run_id: run.sourceRunId ?? null,
    identity: run.identity,
    realm_state: run.realm,
    decisions: run.decisions,
    echoed_quote: run.echoedQuote ?? null,
    paid_at: run.paidAt ?? null,
    completed_at: run.completedAt ?? null,
    created_at: run.createdAt,
    updated_at: run.updatedAt,
  };
}

export function runFromSupabaseRow(row: DbRow): RunRecord {
  return {
    id: readString(row, "id"),
    simulator: readString(row, "simulator") as RunRecord["simulator"],
    status: readString(row, "status") as RunRecord["status"],
    currentSceneId: readString(row, "current_scene_id"),
    runType: readString(row, "run_type") as RunRecord["runType"],
    sourceRunId: readOptionalString(row, "source_run_id"),
    identity: readObject(row, "identity") as RunRecord["identity"],
    realm: readObject(row, "realm_state") as RunRecord["realm"],
    decisions: readArray(row, "decisions") as RunRecord["decisions"],
    echoedQuote: readOptionalString(row, "echoed_quote"),
    createdAt: readString(row, "created_at"),
    updatedAt: readString(row, "updated_at"),
    paidAt: readOptionalString(row, "paid_at"),
    completedAt: readOptionalString(row, "completed_at"),
  };
}

export function orderToSupabaseRow(order: OrderRecord): DbRow {
  return {
    id: order.id,
    run_id: order.runId,
    sku: order.sku,
    amount_minor: order.amountMinor,
    currency: order.currency,
    status: order.status,
    provider: order.provider,
    provider_checkout_id: order.providerCheckoutId,
    provider_checkout_url: order.providerCheckoutUrl ?? null,
    provider_order_id: order.providerOrderId ?? null,
    provider_product_id: order.providerProductId,
    request_id: order.requestId,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  };
}

export function orderFromSupabaseRow(row: DbRow): OrderRecord {
  return {
    id: readString(row, "id"),
    runId: readString(row, "run_id"),
    sku: readString(row, "sku") as OrderRecord["sku"],
    amountMinor: readNumber(row, "amount_minor"),
    currency: readString(row, "currency") as OrderRecord["currency"],
    status: readString(row, "status") as OrderRecord["status"],
    provider: readString(row, "provider") as OrderRecord["provider"],
    providerCheckoutId: readString(row, "provider_checkout_id"),
    providerCheckoutUrl: readOptionalString(row, "provider_checkout_url"),
    providerOrderId: readOptionalString(row, "provider_order_id"),
    providerProductId: readString(row, "provider_product_id"),
    requestId: readString(row, "request_id"),
    createdAt: readString(row, "created_at"),
    updatedAt: readString(row, "updated_at"),
  };
}

function runEventToSupabaseRow(event: RunEventRecord): DbRow {
  return {
    id: event.id,
    run_id: event.runId,
    event_type: event.eventType,
    scene_id: event.sceneId ?? null,
    choice_id: event.choiceId ?? null,
    payload: event.payload,
    created_at: event.createdAt,
  };
}

function runEventFromSupabaseRow(row: DbRow): RunEventRecord {
  return {
    id: readString(row, "id"),
    runId: readString(row, "run_id"),
    eventType: readString(row, "event_type"),
    sceneId: readOptionalString(row, "scene_id"),
    choiceId: readOptionalString(row, "choice_id"),
    payload: readObject(row, "payload"),
    createdAt: readString(row, "created_at"),
  };
}

function entitlementToSupabaseRow(entitlement: EntitlementRecord): DbRow {
  return {
    id: entitlement.id,
    run_id: entitlement.runId,
    order_id: entitlement.orderId,
    status: entitlement.status,
    granted_at: entitlement.grantedAt,
    revoked_at: entitlement.revokedAt ?? null,
  };
}

function entitlementFromSupabaseRow(row: DbRow): EntitlementRecord {
  return {
    id: readString(row, "id"),
    runId: readString(row, "run_id"),
    orderId: readString(row, "order_id"),
    status: readString(row, "status") as EntitlementRecord["status"],
    grantedAt: readString(row, "granted_at"),
    revokedAt: readOptionalString(row, "revoked_at"),
  };
}

function webhookEventToSupabaseRow(event: WebhookEventRecord): DbRow {
  return {
    provider: event.provider,
    provider_event_id: event.providerEventId,
    event_type: event.eventType,
    payload_hash: event.payloadHash,
    processed_at: event.processedAt ?? null,
    received_at: event.receivedAt,
  };
}

function webhookEventFromSupabaseRow(row: DbRow): WebhookEventRecord {
  return {
    provider: readString(row, "provider") as WebhookEventRecord["provider"],
    providerEventId: readString(row, "provider_event_id"),
    eventType: readString(row, "event_type"),
    payloadHash: readString(row, "payload_hash"),
    processedAt: readOptionalString(row, "processed_at"),
    receivedAt: readString(row, "received_at"),
  };
}

function restoreTokenToSupabaseRow(token: RestoreTokenRecord): DbRow {
  return {
    id: token.id,
    run_id: token.runId,
    token_hash: token.tokenHash,
    expires_at: token.expiresAt,
    used_at: token.usedAt ?? null,
    created_at: token.createdAt,
  };
}

function restoreTokenFromSupabaseRow(row: DbRow): RestoreTokenRecord {
  return {
    id: readString(row, "id"),
    runId: readString(row, "run_id"),
    tokenHash: readString(row, "token_hash"),
    expiresAt: readString(row, "expires_at"),
    usedAt: readOptionalString(row, "used_at"),
    createdAt: readString(row, "created_at"),
  };
}

function readString(row: DbRow, key: string): string {
  const value = row[key];
  if (typeof value !== "string") {
    throw new Error(`Expected string column: ${key}`);
  }

  return value;
}

function readOptionalString(row: DbRow, key: string): string | undefined {
  const value = row[key];
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`Expected optional string column: ${key}`);
  }

  return value;
}

function readNumber(row: DbRow, key: string): number {
  const value = row[key];
  if (typeof value !== "number") {
    throw new Error(`Expected number column: ${key}`);
  }

  return value;
}

function readObject(row: DbRow, key: string): Record<string, unknown> {
  const value = row[key];
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Expected object column: ${key}`);
  }

  return value as Record<string, unknown>;
}

function readArray(row: DbRow, key: string): unknown[] {
  const value = row[key];
  if (!Array.isArray(value)) {
    throw new Error(`Expected array column: ${key}`);
  }

  return value;
}
