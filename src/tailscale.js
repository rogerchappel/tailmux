import { assertObject } from './errors.js';

function peerToNode(id, peer) {
  const hostName = peer.HostName || peer.DNSName || peer.TailscaleIPs?.[0] || id;
  const dnsName = (peer.DNSName || '').replace(/\.$/, '');
  return {
    id,
    name: hostName,
    dnsName,
    ips: peer.TailscaleIPs || [],
    online: Boolean(peer.Online),
    os: peer.OS || 'unknown',
    user: peer.User || '',
    tags: peer.Tags || [],
    lastSeen: peer.LastSeen || null,
    exitNode: Boolean(peer.ExitNode),
  };
}

export function parseTailscaleStatus(statusJson) {
  const root = assertObject(statusJson, 'tailscale status');
  const self = root.Self ? peerToNode('self', root.Self) : null;
  const peers = Object.entries(root.Peer || {}).map(([id, peer]) => peerToNode(id, peer));
  return { self, peers, nodes: [self, ...peers].filter(Boolean) };
}

export function findNode(nodes, query) {
  if (!query) return null;
  const wanted = query.toLowerCase();
  return nodes.find((node) => [node.name, node.dnsName, ...node.ips]
    .filter(Boolean)
    .some((candidate) => candidate.toLowerCase().includes(wanted))) || null;
}
