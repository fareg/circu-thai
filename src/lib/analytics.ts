type EventName =
  | "program.create"
  | "program.start"
  | "program.complete"
  | "program.delete";

export function track(event: EventName, payload?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[analytics] ${event}`, payload ?? {});
  }
}
