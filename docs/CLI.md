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

Options may appear before or after positional arguments, so both
`tailmux launch --execute workspace.json` and
`tailmux launch workspace.json --execute` are equivalent.

## Option validation

`--format` accepts only `table` or `json`. Unknown options, unsupported format
values, and value-taking options without a value exit nonzero with a diagnostic.

`scan`, `status`, and `init-template` do not accept positional arguments.
`template` and `launch` require exactly one template file. Missing or extra
positional arguments exit nonzero with a concise diagnostic.

Workspace panes require a non-empty string `title`. Optional `host`, `command`,
and `cwd` fields may be omitted; when present, each must be a non-empty string.
Empty or non-string values fail with a field-specific `TAILMUX_TEMPLATE` error
and cannot be silently dropped while creating a launch plan.

The template file must be valid JSON with an object at the top level. It
requires non-empty string `name` and `session` fields and a non-empty `panes`
array; optional `description` must be a string. Invalid JSON or container types
fail with concise template diagnostics without leaking raw `SyntaxError` or
`TypeError` messages.

Port-file entries are included only when their parsed port is an integer from
1 through 65535. This applies to both simplified rows such as
`gpu-box 11434 tcp ollama` and listener-style rows such as
`TCP 127.0.0.1:8080 (node)`.
