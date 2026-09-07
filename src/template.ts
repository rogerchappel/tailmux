import { TailmuxError } from "./errors.js";
import type { WorkspaceTemplate } from "./types.js";

function assertString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new TailmuxError(`${label} must be a non-empty string`, "TAILMUX_TEMPLATE");
  return value;
}

function optionalString(value: unknown, label: string): string | undefined {
  return value === undefined ? undefined : assertString(value, label);
}

export function parseWorkspaceTemplate(input: string): WorkspaceTemplate {
  let value: unknown;
  try {
    value = JSON.parse(input) as unknown;
  } catch {
    throw new TailmuxError("template must be valid JSON", "TAILMUX_TEMPLATE");
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TailmuxError("template must be an object", "TAILMUX_TEMPLATE");
  }
  const raw = value as Record<string, unknown>;
  const panes = raw.panes;
  if (!Array.isArray(panes) || panes.length === 0) {
    throw new TailmuxError("template.panes must be a non-empty array", "TAILMUX_TEMPLATE");
  }
  if (raw.description !== undefined && typeof raw.description !== "string") {
    throw new TailmuxError("template.description must be a string", "TAILMUX_TEMPLATE");
  }
  return {
    name: assertString(raw.name, "template.name"),
    description: raw.description,
    session: assertString(raw.session, "template.session"),
    panes: panes.map((pane, index) => {
      if (!pane || typeof pane !== "object") throw new TailmuxError(`pane ${index} must be an object`, "TAILMUX_TEMPLATE");
      const row = pane as Record<string, unknown>;
      return {
        title: assertString(row.title, `pane ${index}.title`),
        host: optionalString(row.host, `pane ${index}.host`),
        command: optionalString(row.command, `pane ${index}.command`),
        cwd: optionalString(row.cwd, `pane ${index}.cwd`)
      };
    })
  };
}

export function stringifyWorkspaceTemplate(template: WorkspaceTemplate): string {
  return `${JSON.stringify(template, null, 2)}\n`;
}
