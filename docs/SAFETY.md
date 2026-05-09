# Safety Notes

`tailmux` has two explicit consent gates:

- `--live`: allow local read-only Tailscale CLI discovery.
- `--execute`: allow local tmux session creation, which may start SSH commands visible in the template.

Review templates before sharing or executing them. Treat template commands like shell scripts.
