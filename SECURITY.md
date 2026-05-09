# Security Policy

`tailmux` is a local-first orchestration helper. Please report security issues privately through GitHub security advisories when available.

## Scope

In scope:

- Hidden network calls or command execution without `--live` / `--execute`.
- Command rendering bugs that hide or materially change SSH/tmux execution.
- Template validation bypasses that cause unexpected local execution.

Out of scope:

- Commands that a user explicitly places in a workspace template and runs with `--execute`.
- Security of Tailscale, SSH, tmux, shells, or remote hosts themselves.

## Design commitments

- `scan` reads files unless `--live` is supplied.
- `launch` prints plans unless `--execute` is supplied.
- No credentials are stored, synced, or transmitted by `tailmux`.
- No telemetry is collected.
