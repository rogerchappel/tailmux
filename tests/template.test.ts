import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { parseWorkspaceTemplate } from "../src/template.js";

test("parseWorkspaceTemplate validates named panes", () => {
  const template = parseWorkspaceTemplate(readFileSync("examples/ai-lab.json", "utf8"));
  assert.equal(template.session, "ai-lab");
  assert.equal(template.panes.length, 3);
  assert.throws(() => parseWorkspaceTemplate('{"name":"bad","session":"x","panes":[]}'), /non-empty/);
});
