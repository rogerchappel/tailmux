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

test("mergePeers joins SSH aliases addressed by a Tailscale IP", () => {
  const peers = mergePeers([
    {
      name: "gpu-box",
      host: "gpu-box.tailnet.ts.net",
      online: true,
      addresses: ["100.1.1.1", "fd7a:115c:a1e0::1"],
      aliases: ["gpu-box.tailnet.ts.net"],
      source: ["tailscale"],
      tags: ["tag:ai"]
    }
  ], [{ alias: "gpu", hostName: "100.1.1.1", user: "roger" }]);

  assert.deepEqual(peers, [{
    name: "gpu-box",
    host: "gpu-box.tailnet.ts.net",
    online: true,
    addresses: ["100.1.1.1", "fd7a:115c:a1e0::1"],
    aliases: ["gpu-box.tailnet.ts.net", "gpu"],
    source: ["tailscale", "ssh"],
    tags: ["tag:ai"],
    user: "roger",
    sshEndpoints: [{ alias: "gpu", hostName: "100.1.1.1", user: "roger" }]
  }]);
});

test("mergePeers preserves per-alias SSH connection settings", () => {
  const peers = mergePeers([
    { name: "gpu-box", host: "gpu-box.tailnet.ts.net", addresses: [], aliases: [], source: ["tailscale"], tags: [] }
  ], [
    { alias: "gpu-equals", hostName: "gpu-box.tailnet.ts.net", user: "roger", port: 2222, identityFile: "~/.ssh/gpu key" },
    { alias: "gpu-spaced", hostName: "gpu-box.tailnet.ts.net", user: "roger", port: 65535, identityFile: "~/.ssh/gpu spaced key" }
  ]);

  assert.equal(peers.length, 1);
  assert.deepEqual(peers[0]?.sshEndpoints, [
    { alias: "gpu-equals", hostName: "gpu-box.tailnet.ts.net", user: "roger", port: 2222, identityFile: "~/.ssh/gpu key" },
    { alias: "gpu-spaced", hostName: "gpu-box.tailnet.ts.net", user: "roger", port: 65535, identityFile: "~/.ssh/gpu spaced key" }
  ]);
});

test("mergePeers preserves distinct peers when their derived keys collide", () => {
  const peers = mergePeers([
    { name: "primary", host: "primary.tailnet.ts.net", online: true, addresses: ["100.1.1.1"], aliases: [], source: ["tailscale"], tags: ["tag:prod"] },
    { name: "secondary", host: "secondary.tailnet.ts.net", online: false, addresses: ["100.1.1.1"], aliases: [], source: ["tailscale"], tags: ["tag:test"] }
  ], []);

  assert.deepEqual(peers.map((peer) => peer.name), ["primary", "secondary"]);
  assert.deepEqual(peers[0]?.tags, ["tag:prod"]);
  assert.deepEqual(peers[1]?.tags, ["tag:test"]);
});
