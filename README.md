# tailmux

Tailscale-aware tmux session launcher and status board for jumping between local AI boxes, dev servers, logs, and long-running agents.

`tailmux` is local-first: it reads fixture files or local config by default, prints command plans before launching anything, and requires explicit flags before it calls Tailscale, SSH, or tmux.

## Install

```bash
npm install -g tailmux
```

From source:

```bash
npm install
npm run build
node dist/src/cli.js help
```

## Quickstart with fixtures

```bash
tailmux scan \
  --tailscale fixtures/tailscale-status.json \
  --ssh-config fixtures/ssh_config \
  --ports fixtures/ports.txt

tailmux scan --tailscale fixtures/tailscale-status.json --format json
tailmux template examples/ai-lab.json
tailmux launch examples/ai-lab.json
```

`launch` prints a tmux plan. To actually create the tmux session:

```bash
tailmux launch examples/ai-lab.json --execute
```

## Commands

- `scan`: build a status board from explicit Tailscale, SSH, and port files.
- `status`: alias of `scan` for dashboard-style use.
- `template`: validate and normalize a workspace JSON template.
- `launch`: print a tmux command plan; add `--execute` to run it.

## Live discovery

By default, `tailmux` makes no network calls and shells out to nothing. Add `--live` to ask the local Tailscale CLI for status:

```bash
tailmux scan --live --ssh-config ~/.ssh/config
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
npm install
npm run check
npm test
npm run build
npm run smoke
bash scripts/validate.sh
```

## License

MIT
