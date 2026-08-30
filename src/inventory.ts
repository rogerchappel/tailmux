import type { Inventory, Peer, SshEndpoint } from "./types.js";
import type { SshHost } from "./ssh-config.js";

export function mergePeers(tailscalePeers: Peer[], sshHosts: SshHost[]): Peer[] {
  const peers: Peer[] = [];
  const addPeer = (peer: Peer): void => {
    peers.push({
      ...peer,
      aliases: [...new Set(peer.aliases)],
      source: [...new Set(peer.source)],
      ...(peer.sshEndpoints ? { sshEndpoints: [...peer.sshEndpoints].sort((a, b) => a.alias.localeCompare(b.alias)) } : {})
    });
  };
  for (const peer of tailscalePeers) addPeer(peer);

  for (const ssh of sshHosts) {
    const host = ssh.hostName ?? ssh.alias;
    const endpoint: SshEndpoint = {
      alias: ssh.alias,
      hostName: host,
      ...(ssh.user !== undefined ? { user: ssh.user } : {}),
      ...(ssh.port !== undefined ? { port: ssh.port } : {}),
      ...(ssh.identityFile !== undefined ? { identityFile: ssh.identityFile } : {})
    };
    const match = peers.find((peer) =>
      peer.host === host ||
      peer.name === ssh.alias ||
      peer.aliases.includes(host) ||
      peer.addresses.includes(host)
    );
    if (match) {
      match.user = ssh.user ?? match.user;
      match.aliases = [...new Set([...match.aliases, ssh.alias])];
      match.source = [...new Set([...match.source, "ssh" as const])];
      match.sshEndpoints = [...(match.sshEndpoints ?? []), endpoint].sort((a, b) => a.alias.localeCompare(b.alias));
    } else {
      addPeer({ name: ssh.alias, host, user: ssh.user, addresses: [], aliases: [ssh.alias], source: ["ssh"], tags: [], sshEndpoints: [endpoint] });
    }
  }
  return peers.sort((a, b) => a.name.localeCompare(b.name));
}

export function createInventory(peers: Peer[], ports: Inventory["ports"] = []): Inventory {
  return { peers: peers.slice().sort((a, b) => a.name.localeCompare(b.name)), ports };
}
