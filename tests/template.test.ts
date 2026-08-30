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

test("parseWorkspaceTemplate rejects supplied empty optional pane fields", () => {
  for (const field of ["host", "command", "cwd"] as const) {
    for (const value of ["", " \t\n "]) {
      const input = JSON.stringify({
        name: "bad optional field",
        session: "bad-optional-field",
        panes: [{ title: "pane", [field]: value }]
      });
      assert.throws(
        () => parseWorkspaceTemplate(input),
        (error: unknown) => {
          assert.deepEqual(
            { message: (error as Error).message, code: (error as { code?: string }).code },
            { message: `pane 0.${field} must be a non-empty string`, code: "TAILMUX_TEMPLATE" }
          );
          return true;
        }
      );
    }
  }
});

test("parseWorkspaceTemplate permits omitted optional pane fields", () => {
  const template = parseWorkspaceTemplate('{"name":"local","session":"local","panes":[{"title":"shell"}]}');
  assert.deepEqual(template.panes, [{ title: "shell", host: undefined, command: undefined, cwd: undefined }]);
});
