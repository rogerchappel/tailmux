import assert from "node:assert/strict";
import test from "node:test";
import { renderInventoryJson, renderInventoryTable } from "../src/render.js";

test("renderers produce table and JSON output", () => {
  const inventory = { peers: [{ name: "gpu", host: "gpu.tailnet", addresses: [], aliases: [], source: ["ssh" as const], tags: [], online: true, sshEndpoints: [{ alias: "gpu-admin", hostName: "gpu.tailnet", user: "roger", port: 2222, identityFile: "~/.ssh/gpu" }] }], ports: [{ host: "gpu", port: 22, protocol: "tcp" as const }] };
  assert.match(renderInventoryTable(inventory), /gpu-admin=roger@gpu\.tailnet:2222 \(~\/\.ssh\/gpu\)/);
  assert.deepEqual(JSON.parse(renderInventoryJson(inventory)).peers[0].sshEndpoints[0], { alias: "gpu-admin", hostName: "gpu.tailnet", user: "roger", port: 2222, identityFile: "~/.ssh/gpu" });
});
