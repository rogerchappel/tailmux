import assert from "node:assert/strict";
import test from "node:test";
import { mergePeers } from "../src/inventory.js";

test("mergePeers joins SSH aliases onto Tailscale hosts", () => {
  const peers = mergePeers([
    { name: "gpu-box", host: "gpu-box.tailnet.ts.net", addresses: ["100.1.1.1"], aliases: ["gpu-box.tailnet.ts.net"], source: ["tailscale"], tags: [] }
  ], [{ alias: "gpu", hostName: "gpu-box.tailnet.ts.net", user: "roger" }]);
  assert.equal(peers.length, 1);
  assert.deepEqual(peers[0]?.source, ["tailscale", "ssh"]);
  assert.equal(peers[0]?.user, "roger");
  assert.equal(peers[0]?.aliases.includes("gpu"), true);
});
