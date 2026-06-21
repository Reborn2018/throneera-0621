import { createHash } from "node:crypto";

export function hashRestoreToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}
