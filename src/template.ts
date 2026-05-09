import { invariant, TailmuxError } from "./errors.js";
import type { WorkspaceTemplate } from "./types.js";

function assertString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new TailmuxError(`${label} must be a non-empty string`, "TAILMUX_TEMPLATE");
  return value;
}

export function parseWorkspaceTemplate(input: string): WorkspaceTemplate {
  const raw = JSON.parse(input) as Record<string, unknown>;
  const panes = raw.panes;
  invariant(Array.isArray(panes) && panes.length > 0, "template panes must be a non-empty array");
  return {
    name: assertString(raw.name, "template.name"),
    description: typeof raw.description === "string" ? raw.description : undefined,
    session: assertString(raw.session, "template.session"),
    panes: panes.map((pane, index) => {
      if (!pane || typeof pane !== "object") throw new TailmuxError(`pane ${index} must be an object`, "TAILMUX_TEMPLATE");
      const row = pane as Record<string, unknown>;
      return {
        title: assertString(row.title, `pane ${index}.title`),
        host: typeof row.host === "string" ? row.host : undefined,
        command: typeof row.command === "string" ? row.command : undefined,
        cwd: typeof row.cwd === "string" ? row.cwd : undefined
      };
    })
  };
}

export function stringifyWorkspaceTemplate(template: WorkspaceTemplate): string {
  return `${JSON.stringify(template, null, 2)}\n`;
}
