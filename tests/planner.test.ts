import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import test from "node:test";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { planTmux, formatCommand } from "../src/planner.js";

test("planTmux returns dry-run-safe command plans", () => {
  const plans = planTmux({ name: "Demo", session: "demo", panes: [{ title: "one", command: "pwd" }, { title: "two", host: "gpu", command: "uptime" }] });
  assert.equal(plans.length, 4);
  assert.equal(plans[0]?.command[0], "tmux");
  assert.match(formatCommand(plans[1]!.command), /ssh gpu uptime/);
  assert.equal(plans[1]?.risk, "remote-interactive");
});

test("planTmux targets splits without assuming tmux base indices", () => {
  const plans = planTmux({
    name: "Demo",
    session: "demo",
    panes: [
      { title: "one", command: "pwd" },
      { title: "two", command: "pwd" },
      { title: "three", command: "pwd" }
    ]
  });

  assert.deepEqual(plans.slice(1, 3).map((plan) => plan.command.slice(0, 4)), [
    ["tmux", "split-window", "-t", "demo"],
    ["tmux", "split-window", "-t", "demo"]
  ]);
});

test("planned splits execute with non-default tmux base indices", { skip: spawnSync("tmux", ["-V"]).error ? "tmux is not installed" : false }, (context) => {
  const socket = `tailmux-test-${process.pid}-${Date.now()}`;
  const directory = mkdtempSync(join(tmpdir(), "tailmux-test-"));
  const config = join(directory, "tmux.conf");
  writeFileSync(config, "set-option -g base-index 1\nset-option -g pane-base-index 1\n");
  const tmux = (...args: string[]) => spawnSync("tmux", ["-L", socket, "-f", config, ...args], { encoding: "utf8" });
  context.after(() => {
    tmux("kill-server");
    rmSync(directory, { recursive: true });
  });

  const plans = planTmux({
    name: "Indexed",
    session: "indexed",
    panes: [
      { title: "one", command: "sleep 30" },
      { title: "two", command: "sleep 30" },
      { title: "three", command: "sleep 30" }
    ]
  });

  for (const plan of plans.slice(0, -1)) {
    const result = tmux(...plan.command.slice(1));
    assert.equal(result.status, 0, result.stderr);
  }

  const panes = tmux("list-panes", "-t", "indexed", "-F", "#{window_index}.#{pane_index}");
  assert.equal(panes.status, 0, panes.stderr);
  assert.deepEqual(panes.stdout.trim().split("\n").sort(), ["1.1", "1.2", "1.3"]);
});
