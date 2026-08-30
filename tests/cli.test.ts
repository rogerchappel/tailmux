import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

test("CLI parser enforces command positional arity", () => {
  for (const command of ["scan", "status", "init-template"]) {
    assert.throws(
      () => parseArgs([command, "unexpected"]),
      new RegExp(`${command} does not accept positional arguments`)
    );
  }
  for (const command of ["template", "launch"]) {
    assert.throws(
      () => parseArgs([command]),
      new RegExp(`${command} requires exactly one template file`)
    );
    assert.throws(
      () => parseArgs([command, "one.json", "two.json"]),
      new RegExp(`${command} requires exactly one template file`)
    );
  }
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

test("CLI rejects an empty host instead of planning local execution", () => {
  const directory = mkdtempSync(join(tmpdir(), "tailmux-empty-host-"));
  const template = join(directory, "template.json");
  writeFileSync(template, '{"name":"unsafe","session":"unsafe","panes":[{"title":"remote","host":"","command":"hostname"}]}');

  const result = spawnSync(process.execPath, ["dist/src/cli.js", "launch", template], { encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /pane 0\.host must be a non-empty string/);
  assert.doesNotMatch(result.stdout, /tmux|hostname/);
});

test("CLI reports invalid options with a nonzero exit", () => {
  const result = spawnSync(process.execPath, ["dist/src/cli.js", "scan", "--format", "yaml"], { encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /tailmux: unsupported --format value: yaml/);
  assert.equal(result.stdout, "");
});

test("CLI reports invalid positional arity with a nonzero exit", () => {
  const cases = [
    { args: ["scan", "unexpected"], message: "scan does not accept positional arguments" },
    { args: ["status", "unexpected"], message: "status does not accept positional arguments" },
    { args: ["init-template", "unexpected"], message: "init-template does not accept positional arguments" },
    { args: ["template"], message: "template requires exactly one template file" },
    { args: ["template", "one.json", "two.json"], message: "template requires exactly one template file" },
    { args: ["launch"], message: "launch requires exactly one template file" },
    { args: ["launch", "one.json", "two.json"], message: "launch requires exactly one template file" }
  ];

  for (const testCase of cases) {
    const result = spawnSync(process.execPath, ["dist/src/cli.js", ...testCase.args], { encoding: "utf8" });
    assert.equal(result.status, 1, testCase.args.join(" "));
    assert.equal(result.stderr, `tailmux: ${testCase.message}\n`);
    assert.equal(result.stdout, "");
  }
});
