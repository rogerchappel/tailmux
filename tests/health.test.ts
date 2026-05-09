import assert from "node:assert/strict";
import test from "node:test";
import { summarizeHealth } from "../src/health.js";

test("summarizeHealth counts peers and offline nodes", () => {
  const summary = summarizeHealth({ peers: [
    { name: "a", host: "a", addresses: [], aliases: [], source: ["ssh"], tags: [], online: true },
    { name: "b", host: "b", addresses: [], aliases: [], source: ["ssh"], tags: [], online: false }
  ], ports: [{ host: "a", port: 22, protocol: "tcp" }] });
  assert.deepEqual(summary, { totalPeers: 2, onlinePeers: 1, knownPorts: 1, offlinePeers: ["b"] });
});
