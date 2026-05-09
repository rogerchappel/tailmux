export class TailmuxError extends Error {
  constructor(message: string, readonly code = "TAILMUX_ERROR") {
    super(message);
    this.name = "TailmuxError";
  }
}

export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new TailmuxError(message, "TAILMUX_INVARIANT");
}
