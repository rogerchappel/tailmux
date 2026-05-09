import type { Inventory } from "./types.js";

export function renderInventoryTable(inventory: Inventory): string {
  const lines = ["NAME         HOST                         ONLINE  SOURCES      PORTS"];
  for (const peer of inventory.peers) {
    const ports = inventory.ports.filter((port) => port.host === peer.name || port.host === peer.host).map((port) => `${port.port}/${port.protocol}`).join(",");
    lines.push([
      peer.name.padEnd(12),
      peer.host.padEnd(28),
      String(peer.online ?? "?").padEnd(7),
      peer.source.join(",").padEnd(12),
      ports || "-"
    ].join(" "));
  }
  return `${lines.join("\n")}\n`;
}

export function renderInventoryJson(inventory: Inventory): string {
  return `${JSON.stringify(inventory, null, 2)}\n`;
}
