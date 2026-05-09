import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";

test("CLI scan emits JSON from fixtures", () => {
  const stdout = execFileSync(process.execPath, ["dist/cli.js", "scan", "--tailscale", "fixtures/tailscale-status.json", "--ssh-config", "fixtures/ssh_config", "--format", "json"], { encoding: "utf8" });
  const parsed = JSON.parse(stdout);
  assert.equal(parsed.peers.some((peer: { name: string }) => peer.name === "gpu-box"), true);
});

test("CLI launch is dry-run by default", () => {
  const stdout = execFileSync(process.execPath, ["dist/cli.js", "launch", "examples/ai-lab.json"], { encoding: "utf8" });
  assert.match(stdout, /tmux new-session/);
  assert.match(stdout, /remote-interactive/);
});
