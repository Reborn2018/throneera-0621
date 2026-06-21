import { createFileStore, createMemoryStore } from "@/lib/adapters/local-store";
import type { RunStore } from "@/lib/adapters/store";

let storePromise: Promise<RunStore> | null = null;

export function getStore(): Promise<RunStore> {
  if (process.env.NODE_ENV === "test") {
    return Promise.resolve(createMemoryStore());
  }

  storePromise ??= createFileStore(
    process.env.THRONEERA_LOCAL_STORE_PATH ?? ".throneera/local-store.json",
  );
  return storePromise;
}
