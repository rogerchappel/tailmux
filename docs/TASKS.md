# tailmux MVP Tasks

## Foundation
- [x] Scaffold TypeScript CLI package with StackForge.
- [x] Keep all default behavior local-first and deterministic.
- [x] Add public library exports for parsers, inventory, rendering, and planning.

## Discovery
- [x] Parse `tailscale status --json` fixture or explicit file input.
- [x] Parse OpenSSH `Host` aliases from explicit config files.
- [x] Parse deterministic port fixture rows and common listener output.
- [x] Merge peers by host/address while preserving source attribution.

## Orchestration
- [x] Validate shareable JSON workspace templates.
- [x] Generate tmux command plans without executing by default.
- [x] Require `--execute` before invoking tmux/ssh.

## CLI UX
- [x] Implement `scan`, `status`, `template`, and `launch` commands.
- [x] Support table and JSON output.
- [x] Include fixture-backed smoke commands.

## Verification
- [x] Unit tests for parsers, inventory, template validation, planning, rendering, and discovery.
- [x] Build/check/test/smoke/validate scripts.
- [x] README, safety notes, contributing, security, and examples.
