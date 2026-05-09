import assert from "node:assert/strict";
import test from "node:test";
import { planTmux, formatCommand } from "../src/planner.js";

test("planTmux returns dry-run-safe command plans", () => {
  const plans = planTmux({ name: "Demo", session: "demo", panes: [{ title: "one", command: "pwd" }, { title: "two", host: "gpu", command: "uptime" }] });
  assert.equal(plans.length, 4);
  assert.equal(plans[0]?.command[0], "tmux");
  assert.match(formatCommand(plans[1]!.command), /ssh gpu uptime/);
  assert.equal(plans[1]?.risk, "remote-interactive");
});
