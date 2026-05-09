import type { CommandPlan, WorkspacePane, WorkspaceTemplate } from "./types.js";

function shellQuote(value: string): string {
  if (/^[A-Za-z0-9_@%+=:,./-]+$/.test(value)) return value;
  return `'${value.replaceAll("'", "'\\''")}'`;
}

export function paneCommand(pane: WorkspacePane): string {
  const pieces: string[] = [];
  if (pane.cwd) pieces.push(`cd ${shellQuote(pane.cwd)}`);
  if (pane.command) pieces.push(pane.command);
  const localCommand = pieces.join(" && ") || "$SHELL";
  if (!pane.host) return localCommand;
  return `ssh ${shellQuote(pane.host)} ${shellQuote(localCommand)}`;
}

export function planTmux(template: WorkspaceTemplate): CommandPlan[] {
  const plans: CommandPlan[] = [];
  const [first, ...rest] = template.panes;
  if (!first) return plans;
  plans.push({
    label: `create session ${template.session}`,
    command: ["tmux", "new-session", "-d", "-s", template.session, "-n", first.title, paneCommand(first)],
    risk: first.host ? "remote-interactive" : "local-write"
  });
  rest.forEach((pane, index) => {
    plans.push({
      label: `add pane ${pane.title}`,
      command: ["tmux", "split-window", "-t", `${template.session}:0.${index}`, paneCommand(pane)],
      risk: pane.host ? "remote-interactive" : "local-write"
    });
  });
  plans.push({ label: `tile ${template.session}`, command: ["tmux", "select-layout", "-t", template.session, "tiled"], risk: "local-write" });
  plans.push({ label: `attach ${template.session}`, command: ["tmux", "attach", "-t", template.session], risk: "local-write" });
  return plans;
}

export function formatCommand(command: string[]): string {
  return command.map(shellQuote).join(" ");
}
