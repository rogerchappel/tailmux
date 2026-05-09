# Orchestration Model

`tailmux` is intentionally a planner before it is a launcher.

1. Discovery reads explicit files by default.
2. `--live` is required before invoking `tailscale status --json`.
3. Workspace templates are JSON files that name tmux sessions and panes.
4. `tailmux launch <template>` prints a command plan only.
5. `tailmux launch <template> --execute` runs the plan locally, which may open SSH sessions from tmux panes.

## Risk labels

- `read`: read-only local inspection.
- `local-write`: local tmux session creation or attachment.
- `remote-interactive`: a tmux pane that starts an SSH command.

`tailmux` never edits remote files, syncs secrets, or runs remote destructive commands on its own. Any remote command is visible in the template and in the dry-run command plan.
