# tailmux

Tailscale-aware tmux session templates, status boards, and safe launch plans for local-first developer fleets.

`tailmux` helps you jump between local AI boxes, dev servers, logs, and long-running agent machines without hiding network or destructive behavior. The MVP reads fixtures, renders useful local status, and prints commands for review instead of executing SSH or tmux for you.

## Install

```bash
npm install -g tailmux
```

For local development:

```bash
npm install
npm test
```

## Quickstart with fixtures

```bash
node src/cli.js status \
  --tailscale fixtures/tailscale-status.json \
  --ssh-config fixtures/ssh_config \
  --ports fixtures/ports.json

node src/cli.js template \
  --tailscale fixtures/tailscale-status.json \
  --ssh-config fixtures/ssh_config \
  --ports fixtures/ports.json \
  --session ai-lab

node src/cli.js plan \
  --tailscale fixtures/tailscale-status.json \
  --ssh-config fixtures/ssh_config \
  --session ai-lab
```

## Commands

- `status` — render node health, SSH alias, and service/port state.
- `template` — generate a shareable tmux session template for online nodes.
- `plan` — print dry-run `tmux`/`ssh` commands for human review.

## Safety notes

The current MVP is intentionally local-first and fixture-driven:

- no hidden network calls
- no subprocess execution of `tailscale`, `ssh`, or `tmux`
- no destructive operations
- no secrets sync
- generated commands are printed only

See `docs/PRD.md`, `docs/TASKS.md`, and `docs/ORCHESTRATION.md` for scope and guardrails.
