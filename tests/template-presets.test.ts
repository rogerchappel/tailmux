import assert from "node:assert/strict";
import test from "node:test";
import { minimalTemplate } from "../src/template-presets.js";

test("minimalTemplate creates a local-only starter", () => {
  const template = minimalTemplate("demo");
  assert.equal(template.session, "demo");
  assert.equal(template.panes[0]?.host, undefined);
});
