# tailmux Orchestration

Tailmux V1 is intentionally a planner, not a remote executor.

## Flow

1. Load `tailscale status --json` fixture data.
2. Load SSH config fixture data.
3. Optionally load service/port fixture data.
4. Build an inventory of local-first node metadata.
5. Render either status, a session template, or a dry-run tmux command plan.

## Commands

- `tailmux status` shows health and service state.
- `tailmux template` emits a portable tmux session template.
- `tailmux plan` emits shell commands that a human can review and run manually.

## Guardrails

- No hidden `tailscale`, `ssh`, `tmux`, or network subprocesses.
- No destructive file operations.
- No credential or secret synchronization.
- Fixtures make CI deterministic and safe.
