import type { EngineTelemetryEvent } from "@/lib/engine-v3/event.schema";

export interface EngineTelemetrySink {
  record: (event: EngineTelemetryEvent) => Promise<void> | void;
}

export interface RecordTelemetryOptions {
  sink?: EngineTelemetrySink;
}

export interface MemoryTelemetrySink extends EngineTelemetrySink {
  events: EngineTelemetryEvent[];
}

export async function recordTelemetry(
  event: EngineTelemetryEvent,
  options: RecordTelemetryOptions = {},
): Promise<void> {
  await options.sink?.record(event);
}

export function createMemoryTelemetrySink(): MemoryTelemetrySink {
  const events: EngineTelemetryEvent[] = [];
  return {
    events,
    record(event) {
      events.push(event);
    },
  };
}
