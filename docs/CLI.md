# CLI Reference

## `tailmux scan`

Build an inventory from explicit files. Add `--format json` for machine output. Add `--live` to call the local Tailscale CLI.

## `tailmux status`

Same as `scan`; intended for aliases and dashboards.

## `tailmux init-template`

Print a minimal workspace template. Use `--session <name>` to set the tmux session name.

## `tailmux template <file>`

Validate and normalize a workspace template.

## `tailmux launch <file>`

Print a tmux command plan. Add `--execute` to run the plan.
