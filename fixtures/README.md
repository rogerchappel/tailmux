# Fixtures

These files power tests and README smoke commands. They are intentionally fake and deterministic:

- `tailscale-status.json`: sample `tailscale status --json` output.
- `ssh_config`: sample OpenSSH aliases.
- `ports.txt`: simplified listener rows plus one common listener-style line.
  Both formats accept only integer ports in the TCP/UDP range 1 through 65535;
  out-of-range rows are ignored.
