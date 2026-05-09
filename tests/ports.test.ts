import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { parsePorts } from "../src/ports.js";

test("parsePorts accepts simple fixture rows", () => {
  const ports = parsePorts(readFileSync("fixtures/ports.txt", "utf8"));
  assert.equal(ports.some((port) => port.host === "gpu-box" && port.port === 11434), true);
  assert.equal(ports.some((port) => port.port === 8080), true);
});
