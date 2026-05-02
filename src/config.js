export function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }
    const [keyRaw, inline] = token.slice(2).split('=', 2);
    const key = keyRaw.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (inline !== undefined) args[key] = inline;
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) args[key] = argv[++i];
    else args[key] = true;
  }
  return args;
}

export function usage() {
  return `tailmux <command> [options]

Commands:
  status       Render local fixture-backed node health
  template     Generate a shareable tmux session template
  plan         Print dry-run tmux/ssh commands from a template

Options:
  --tailscale <file>    tailscale status --json fixture
  --ssh-config <file>   SSH config fixture
  --ports <file>        service/port fixture JSON
  --session <name>      tmux session name
  --json                JSON output where supported
`;
}
