import type { Inventory, Peer } from "./types.js";
import type { SshHost } from "./ssh-config.js";

function keyFor(peer: Pick<Peer, "name" | "host" | "addresses">): string {
  return peer.addresses[0] ?? peer.host ?? peer.name;
}

export function mergePeers(tailscalePeers: Peer[], sshHosts: SshHost[]): Peer[] {
  const byKey = new Map<string, Peer>();
  const addPeer = (peer: Peer): void => {
    const key = keyFor(peer);
    byKey.set(key, { ...peer, aliases: [...new Set(peer.aliases)], source: [...new Set(peer.source)] });
  };
  for (const peer of tailscalePeers) addPeer(peer);

  for (const ssh of sshHosts) {
    const host = ssh.hostName ?? ssh.alias;
    const match = [...byKey.values()].find((peer) => peer.host === host || peer.name === ssh.alias || peer.aliases.includes(host));
    if (match) {
      match.user = ssh.user ?? match.user;
      match.aliases = [...new Set([...match.aliases, ssh.alias])];
      match.source = [...new Set([...match.source, "ssh" as const])];
    } else {
      addPeer({ name: ssh.alias, host, user: ssh.user, addresses: [], aliases: [ssh.alias], source: ["ssh"], tags: [] });
    }
  }
  return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function createInventory(peers: Peer[], ports: Inventory["ports"] = []): Inventory {
  return { peers: peers.slice().sort((a, b) => a.name.localeCompare(b.name)), ports };
}
