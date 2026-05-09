import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { parseTailscaleStatus } from "../src/tailscale.js";

test("parseTailscaleStatus normalizes peers deterministically", () => {
  const peers = parseTailscaleStatus(readFileSync("fixtures/tailscale-status.json", "utf8"));
  assert.equal(peers.length, 3);
  assert.deepEqual(peers.map((peer) => peer.name), ["gpu-box", "mini-lab", "work-mac"]);
  assert.equal(peers[0]?.host, "gpu-box.tailnet.ts.net");
  assert.equal(peers[0]?.online, true);
});
