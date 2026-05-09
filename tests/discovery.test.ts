import assert from "node:assert/strict";
import test from "node:test";
import { discoverInventory } from "../src/discovery.js";

test("discoverInventory uses explicit files without live network", async () => {
  const inventory = await discoverInventory({ tailscalePath: "fixtures/tailscale-status.json", sshConfigPath: "fixtures/ssh_config", portsPath: "fixtures/ports.txt" });
  assert.equal(inventory.peers.length, 3);
  assert.equal(inventory.peers.find((peer) => peer.name === "gpu-box")?.aliases.includes("gpu"), true);
  assert.equal(inventory.ports.length >= 2, true);
});
