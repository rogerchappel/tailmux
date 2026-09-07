import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { parseWorkspaceTemplate } from "../src/template.js";

function assertTemplateError(input: string, message: string): void {
  assert.throws(
    () => parseWorkspaceTemplate(input),
    (error: unknown) => {
      assert.deepEqual(
        { message: (error as Error).message, code: (error as { code?: string }).code },
        { message, code: "TAILMUX_TEMPLATE" }
      );
      return true;
    }
  );
}

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

test("parseWorkspaceTemplate rejects supplied non-string optional pane fields", () => {
  for (const field of ["host", "command", "cwd"] as const) {
    for (const value of [null, false, 42, ["hostname"], { value: "hostname" }]) {
      const input = JSON.stringify({
        name: "invalid optional field",
        session: "invalid-optional-field",
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

test("parseWorkspaceTemplate reports malformed JSON as a template error", () => {
  assertTemplateError('{"name":', "template must be valid JSON");
});

test("parseWorkspaceTemplate requires an object at the top level", () => {
  for (const value of [null, [], "template", 42, true]) {
    assertTemplateError(JSON.stringify(value), "template must be an object");
  }
});

test("parseWorkspaceTemplate rejects invalid descriptions", () => {
  for (const description of [null, false, 42, [], {}]) {
    assertTemplateError(
      JSON.stringify({ name: "invalid", description, session: "invalid", panes: [{ title: "pane" }] }),
      "template.description must be a string"
    );
  }
});

test("parseWorkspaceTemplate rejects malformed pane containers", () => {
  for (const panes of [undefined, null, {}, "pane", 42, []]) {
    const template = { name: "invalid", session: "invalid", ...(panes === undefined ? {} : { panes }) };
    assertTemplateError(JSON.stringify(template), "template.panes must be a non-empty array");
  }
});
