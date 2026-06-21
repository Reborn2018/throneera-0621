import { createFileStore, createMemoryStore } from "@/lib/adapters/local-store";
import { createSupabaseStore } from "@/lib/adapters/supabase-store";
import type { RunStore } from "@/lib/adapters/store";

export function getStore(): Promise<RunStore> {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Promise.resolve(
      createSupabaseStore(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY),
    );
  }

  if (process.env.NODE_ENV === "test") {
    return Promise.resolve(createMemoryStore());
  }

  return createFileStore(
    process.env.THRONEERA_LOCAL_STORE_PATH ?? ".throneera/local-store.json",
  );
}
