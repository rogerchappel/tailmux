import type { Inventory } from "./types.js";

export interface HealthSummary {
  totalPeers: number;
  onlinePeers: number;
  knownPorts: number;
  offlinePeers: string[];
}

export function summarizeHealth(inventory: Inventory): HealthSummary {
  return {
    totalPeers: inventory.peers.length,
    onlinePeers: inventory.peers.filter((peer) => peer.online === true).length,
    knownPorts: inventory.ports.length,
    offlinePeers: inventory.peers.filter((peer) => peer.online === false).map((peer) => peer.name).sort()
  };
}
