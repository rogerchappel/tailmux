# Contributing

Thanks for helping improve `tailmux`.

## Local workflow

```bash
npm install
npm run check
npm test
npm run smoke
bash scripts/validate.sh
```

## Principles

- Keep default behavior deterministic and local-first.
- Add fixtures for parser changes.
- Prefer dry-run plans over direct execution.
- Make consent flags obvious for network or execution behavior.
- Keep templates shareable and readable JSON.

## Pull requests

Please include:

- What changed and why.
- Fixture/test coverage for parser or planner changes.
- Safety impact: whether the change can execute commands, use the network, or expose hostnames.
