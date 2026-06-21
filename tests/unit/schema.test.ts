import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync("db/001_initial.sql", "utf8");

describe("production schema", () => {
  it("supports anonymous text-id runs and the app identity status", () => {
    expect(schema).toContain("'identity'");
    expect(schema).toContain("id text primary key");
    expect(schema).not.toContain("user_id uuid not null references auth.users");
  });

  it("stores provider checkout URLs for Creem redirect reuse", () => {
    expect(schema).toContain("provider_checkout_url text");
  });
});
