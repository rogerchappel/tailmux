import assert from "node:assert/strict";
import test from "node:test";
import { renderInventoryJson, renderInventoryTable } from "../src/render.js";

test("renderers produce table and JSON output", () => {
  const inventory = { peers: [{ name: "gpu", host: "gpu.tailnet", addresses: [], aliases: [], source: ["ssh" as const], tags: [], online: true }], ports: [{ host: "gpu", port: 22, protocol: "tcp" as const }] };
  assert.match(renderInventoryTable(inventory), /gpu/);
  assert.deepEqual(JSON.parse(renderInventoryJson(inventory)).peers[0].name, "gpu");
});
