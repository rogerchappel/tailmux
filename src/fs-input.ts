import { readFile } from "node:fs/promises";
import { TailmuxError } from "./errors.js";

export interface NamedFileOptions {
  /** Human name of the input, used as the diagnostic subject. */
  label: string;
  /** Concrete next step the operator can act on. */
  nextStep: string;
}

/**
 * Read a CLI-supplied input file, converting a missing path into a concise,
 * actionable TailmuxError that names the offending input and the next step
 * instead of leaking the raw fs error.
 */
export async function readNamedFile(path: string, options: NamedFileOptions): Promise<string> {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new TailmuxError(`${options.label} not found: ${path} — ${options.nextStep}`, "TAILMUX_INPUT");
    }
    throw error;
  }
}