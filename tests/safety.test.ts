import assert from "node:assert/strict";
import test from "node:test";
import { requiresExplicitExecution, summarizeRisks } from "../src/safety.js";

test("safety helpers summarize execution risk", () => {
  const plans = [{ label: "x", command: ["tmux"], risk: "local-write" as const }];
  assert.equal(requiresExplicitExecution(plans), true);
  assert.deepEqual(summarizeRisks(plans), ["local-write"]);
});
