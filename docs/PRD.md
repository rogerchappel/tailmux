# tailmux

Status: ready

## Scorecard

Total: 82/100
Band: build now
Last scored: 2026-04-29
Scored by: Neo

| Criterion | Points | Notes |
|---|---:|---|
| Problem pain | 18/20 | Directly addresses a repeated workflow pain. |
| Demand signal | 14/20 | Some signal, but needs more external validation. |
| V1 buildability | 17/20 | Small deterministic V1 is feasible. |
| Differentiation | 12/15 | Clear wedge versus adjacent tools. |
| Agentic workflow leverage | 15/15 | Improves agent throughput or supervision. |
| Distribution potential | 6/10 | Has demo/content potential. |

## Pitch

A Tailscale-aware tmux session launcher and status board for jumping between local AI boxes, dev servers, logs, and long-running agents.

## Why It Matters

Roger uses tmux and Tailscale heavily across multiple Macs/nodes. This solves a real daily workflow and can be demoed easily to local-AI builders.

## Qualification

Internal demand is very strong from Roger’s node setup and local AI/server workflow. External validation needs more research, but local-first AI builders often need multi-machine orchestration.

Source / adjacent research: Roger idea: tmux + Tailscale workflow for local AI and local servers between devices.

Decision: build now

## V1 Scope

- Read Tailscale peers and SSH aliases
- Launch named tmux workspaces per node/project
- Show server health and open ports
- Generate shareable session templates

## Out of Scope

- Tailscale replacement
- Remote destructive operations
- Secrets sync

## Verification

- Unit or fixture tests for core parsing/generation behavior.
- README with install, quickstart, and safety notes.
- Local-first behavior documented clearly.
- No hidden network, credential, or publish behavior.

## Agent Prompt

Build `tailmux` as a safe local orchestrator that prefers read-only discovery and explicit SSH/tmux commands.
