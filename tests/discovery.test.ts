import assert from "node:assert/strict";
import test from "node:test";
import { discoverInventory } from "../src/discovery.js";

test("discoverInventory uses explicit files without live network", async () => {
  const inventory = await discoverInventory({ tailscalePath: "fixtures/tailscale-status.json", sshConfigPath: "fixtures/ssh_config", portsPath: "fixtures/ports.txt" });
  assert.equal(inventory.peers.length, 4);
  assert.equal(inventory.peers.find((peer) => peer.name === "gpu-box")?.aliases.includes("gpu"), true);
  assert.equal(inventory.peers.find((peer) => peer.name === "gpu-box")?.aliases.includes("gpu-ip"), true);
  assert.equal(inventory.peers.find((peer) => peer.name === "gpu-box")?.aliases.includes("gpu-equals"), true);
  assert.equal(inventory.peers.find((peer) => peer.name === "gpu-box")?.aliases.includes("gpu-spaced"), true);
  assert.equal(inventory.peers.some((peer) => peer.name === "gpu-equals"), false);
  assert.deepEqual(inventory.peers.find((peer) => peer.name === "gpu-box")?.sshEndpoints?.filter((endpoint) => ["gpu-equals", "gpu-ip", "gpu-spaced"].includes(endpoint.alias)).map((endpoint) => ({ alias: endpoint.alias, port: endpoint.port, identityFile: endpoint.identityFile })), [
    { alias: "gpu-equals", port: 2222, identityFile: "~/.ssh/gpu key" },
    { alias: "gpu-ip", port: undefined, identityFile: undefined },
    { alias: "gpu-spaced", port: 65535, identityFile: "~/.ssh/gpu spaced key" }
  ]);
  assert.equal(inventory.ports.length >= 2, true);
});
