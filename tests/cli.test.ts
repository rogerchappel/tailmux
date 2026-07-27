import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync, spawnSync } from "node:child_process";
import { parseArgs } from "../src/cli-args.js";

test("CLI parser keeps boolean options separate from positionals", () => {
  assert.deepEqual(parseArgs(["launch", "--execute", "examples/ai-lab.json"]), {
    command: "launch",
    positional: ["examples/ai-lab.json"],
    flags: { execute: true }
  });
  assert.deepEqual(parseArgs(["launch", "examples/ai-lab.json", "--execute"]), {
    command: "launch",
    positional: ["examples/ai-lab.json"],
    flags: { execute: true }
  });
});

test("CLI parser accepts value options independent of ordering", () => {
  assert.deepEqual(parseArgs(["scan", "--live", "--format", "json"]), {
    command: "scan",
    positional: [],
    flags: { live: true, format: "json" }
  });
});

test("CLI parser rejects unknown options, missing values, and formats", () => {
  assert.throws(() => parseArgs(["launch", "--unknown"]), /unknown option: --unknown/);
  assert.throws(() => parseArgs(["scan", "--format"]), /option --format requires a value/);
  assert.throws(
    () => parseArgs(["scan", "--format", "yaml"]),
    /unsupported --format value: yaml \(expected table or json\)/
  );
});

test("CLI scan emits JSON from fixtures", () => {
  const stdout = execFileSync(process.execPath, ["dist/src/cli.js", "scan", "--tailscale", "fixtures/tailscale-status.json", "--ssh-config", "fixtures/ssh_config", "--format", "json"], { encoding: "utf8" });
  const parsed = JSON.parse(stdout);
  assert.equal(parsed.peers.some((peer: { name: string }) => peer.name === "gpu-box"), true);
});

test("CLI help exposes the documented source entry point", () => {
  const stdout = execFileSync(process.execPath, ["dist/src/cli.js", "help"], { encoding: "utf8" });
  assert.match(stdout, /^tailmux - local-first Tailscale\/tmux workspace helper/);
  assert.match(stdout, /scan \[--tailscale file\]/);
});

test("CLI launch is dry-run by default", () => {
  const stdout = execFileSync(process.execPath, ["dist/src/cli.js", "launch", "examples/ai-lab.json"], { encoding: "utf8" });
  assert.match(stdout, /tmux new-session/);
  assert.match(stdout, /remote-interactive/);
});

test("CLI reports invalid options with a nonzero exit", () => {
  const result = spawnSync(process.execPath, ["dist/src/cli.js", "scan", "--format", "yaml"], { encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /tailmux: unsupported --format value: yaml/);
  assert.equal(result.stdout, "");
});
