import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseStore: vi.fn(),
  createFileStore: vi.fn(),
  createMemoryStore: vi.fn(),
}));

vi.mock("@/lib/adapters/supabase-store", () => ({
  createSupabaseStore: mocks.createSupabaseStore,
}));

vi.mock("@/lib/adapters/local-store", () => ({
  createFileStore: mocks.createFileStore,
  createMemoryStore: mocks.createMemoryStore,
}));

import { getStore } from "@/lib/server/store";

describe("server store selection", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    mocks.createSupabaseStore.mockReturnValue({ kind: "supabase" });
    mocks.createFileStore.mockResolvedValue({ kind: "file" });
    mocks.createMemoryStore.mockReturnValue({ kind: "memory" });
  });

  it("uses Supabase when service-role configuration is present", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";

    await expect(getStore()).resolves.toEqual({ kind: "supabase" });

    expect(mocks.createSupabaseStore).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "service-role",
    );
    expect(mocks.createFileStore).not.toHaveBeenCalled();
  });

  it("falls back to local file storage outside production provider configuration", async () => {
    await expect(getStore()).resolves.toEqual({ kind: "file" });

    expect(mocks.createFileStore).toHaveBeenCalledWith(".throneera/local-store.json");
    expect(mocks.createSupabaseStore).not.toHaveBeenCalled();
  });
});
