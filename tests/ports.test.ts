import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { parsePorts } from "../src/ports.js";

test("parsePorts accepts simple fixture rows", () => {
  const ports = parsePorts(readFileSync("fixtures/ports.txt", "utf8"));
  assert.equal(ports.some((port) => port.host === "gpu-box" && port.port === 11434), true);
  assert.equal(ports.some((port) => port.port === 8080), true);
});

test("parsePorts enforces valid port boundaries in simple rows", () => {
  const ports = parsePorts([
    "local 1 tcp low",
    "local 65535 udp high",
    "local 0 tcp invalid",
    "local 65536 tcp invalid",
    "local 70000 udp invalid"
  ].join("\n"));

  assert.deepEqual(ports.map(({ port }) => port), [1, 65535]);
});

test("parsePorts enforces valid port boundaries in listener rows", () => {
  const ports = parsePorts([
    "TCP 127.0.0.1:1 (low)",
    "UDP 127.0.0.1:65535 (high)",
    "TCP 127.0.0.1:0 (invalid)",
    "TCP 127.0.0.1:65536 (invalid)",
    "UDP 127.0.0.1:70000 (invalid)"
  ].join("\n"));

  assert.deepEqual(ports.map(({ port }) => port), [1, 65535]);
});
