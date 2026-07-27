# tailmux

Tailscale-aware tmux session launcher and status board for jumping between local AI boxes, dev servers, logs, and long-running agents.

`tailmux` is local-first: it reads fixture files or local config by default, prints command plans before launching anything, and requires explicit flags before it calls Tailscale, SSH, or tmux.

## Install

`tailmux` is not published to the npm registry. The registry package with this
name is a different project. Install and run this repository from a source
checkout:

```bash
git clone https://github.com/rogerchappel/tailmux.git
cd tailmux
npm ci
npm run build
node dist/src/cli.js help
```

The project is configured for reviewed GitHub releases, rather than npm
publishing. Until a release artifact is attached to a GitHub release, the source
checkout above is the supported installation path.

## Quickstart with fixtures

Run these commands from the built source checkout:

```bash
node dist/src/cli.js scan \
  --tailscale fixtures/tailscale-status.json \
  --ssh-config fixtures/ssh_config \
  --ports fixtures/ports.txt

node dist/src/cli.js scan --tailscale fixtures/tailscale-status.json --format json
node dist/src/cli.js template examples/ai-lab.json
node dist/src/cli.js launch examples/ai-lab.json
```

`launch` prints a tmux plan. To actually create the tmux session:

```bash
node dist/src/cli.js launch examples/ai-lab.json --execute
```

## Commands

- `scan`: build a status board from explicit Tailscale, SSH, and port files.
- `status`: alias of `scan` for dashboard-style use.
- `template`: validate and normalize a workspace JSON template.
- `launch`: print a tmux command plan; add `--execute` to run it.

## Live discovery

By default, `tailmux` makes no network calls and shells out to nothing. Add `--live` to ask the local Tailscale CLI for status:

```bash
node dist/src/cli.js scan --live --ssh-config ~/.ssh/config
```

## Template format

```json
{
  "name": "AI lab",
  "session": "ai-lab",
  "panes": [
    { "title": "local", "command": "pwd" },
    { "title": "gpu", "host": "gpu", "command": "nvidia-smi || uname -a" }
  ]
}
```

## Safety

- No hidden network calls.
- No implicit SSH or tmux execution.
- No secret sync.
- No remote destructive operations.
- Dry-run command plans are the default.

See [docs/ORCHESTRATION.md](docs/ORCHESTRATION.md) and [SECURITY.md](SECURITY.md).

## Development

```bash
npm ci
npm run check
npm test
npm run build
npm run smoke
bash scripts/validate.sh
```

## License

MIT

## Security

`tailmux` is local-first and does not call Tailscale, SSH, or tmux without explicit opt-in:

- No network calls or live discovery unless `--live` is passed
- No tmux sessions created unless `--execute` is passed
- All output is deterministic when using `--format json`
- No telemetry, analytics, or external services

Workspace templates and fixture files are **not** executed as code — they are parsed for hostnames, commands, and pane layouts. Commands listed in templates are printed for review and only executed with `--execute`.

Generated launch plans target the new tmux session instead of fixed window and
pane numbers, so custom `base-index` and `pane-base-index` settings are
supported.

## Limitations

- Workspace templates assume tmux is installed on the host machine
- Tailscale live discovery requires the `tailscale` CLI to be available on PATH
- SSH alias resolution only works with OpenSSH `~/.ssh/config` format
- No support for WezTerm, iTerm2, or other terminal multiplexers
- Requires Node.js 20 or newer
