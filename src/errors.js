export class TailmuxError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'TailmuxError';
    this.details = details;
  }
}

export function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TailmuxError(`${label} must be an object`);
  }
  return value;
}
