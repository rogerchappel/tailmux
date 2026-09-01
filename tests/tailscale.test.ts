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

test("parseTailscaleStatus rejects malformed status containers", () => {
  const cases: Array<[string, string]> = [
    ["null", "status must be an object"],
    ["[]", "status must be an object"],
    ['{"Self":[]}', "Self must be an object"],
    ['{"Peer":[]}', "Peer must be an object"],
    ['{"Peer":{"node":null}}', "Peer.node must be an object"]
  ];
  for (const [input, message] of cases) {
    assert.throws(
      () => parseTailscaleStatus(input),
      { message: `invalid Tailscale status: ${message}`, code: "TAILMUX_TAILSCALE" }
    );
  }
});

test("parseTailscaleStatus rejects malformed consumed peer fields", () => {
  const cases: Array<[string, unknown, string]> = [
    ["HostName", 42, "must be a string"],
    ["DNSName", null, "must be a string"],
    ["OS", {}, "must be a string"],
    ["Online", "yes", "must be a boolean"],
    ["TailscaleIPs", "100.64.0.1", "must be an array of strings"],
    ["TailscaleIPs", ["100.64.0.1", 42], "must be an array of strings"],
    ["Tags", "tag:prod", "must be an array of strings"],
    ["Tags", ["tag:prod", null], "must be an array of strings"]
  ];

  for (const [field, value, reason] of cases) {
    assert.throws(
      () => parseTailscaleStatus(JSON.stringify({ Self: { [field]: value } })),
      { message: `invalid Tailscale status: Self.${field} ${reason}`, code: "TAILMUX_TAILSCALE" }
    );
  }
});
