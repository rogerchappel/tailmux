# tailmux Task Plan

## MVP Tasks

1. Scaffold an OSS TypeScript/Node CLI repository with StackForge.
2. Copy the tailmux PRD into `docs/PRD.md`.
3. Parse `tailscale status --json` fixture data without running network commands.
4. Parse local SSH config fixture data and ignore wildcard hosts.
5. Merge Tailscale peers, SSH aliases, and service port fixtures into an inventory.
6. Render a concise health/status board.
7. Generate a shareable tmux session template for online nodes.
8. Print dry-run tmux/ssh command plans without executing them.
9. Add fixtures for deterministic tests and demos.
10. Add unit tests, CLI tests, validation scripts, and README quickstart docs.

## Safety Requirements

- Do not open network sockets during normal commands or tests.
- Do not execute SSH, Tailscale, or tmux commands in the MVP.
- Require explicit fixture paths for discovery inputs.
- Treat generated launch commands as reviewable output only.
