import type { WorkspaceTemplate } from "./types.js";

export function minimalTemplate(session = "tailmux"): WorkspaceTemplate {
  return {
    name: "Minimal tailmux workspace",
    session,
    panes: [{ title: "local", command: "pwd" }]
  };
}
