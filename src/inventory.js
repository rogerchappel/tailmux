import { matchSshHost } from './ssh.js';

export function buildInventory(tailscale, sshHosts = [], ports = {}) {
  return tailscale.nodes.map((node) => {
    const ssh = matchSshHost(node, sshHosts);
    const nodePorts = ports[node.name] || ports[node.dnsName] || ports[node.ips[0]] || [];
    return {
      ...node,
      sshAlias: ssh?.aliases?.[0] || '',
      sshUser: ssh?.user || '',
      sshPort: ssh?.port || 22,
      services: nodePorts,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export function filterInventory(nodes, { online, tag } = {}) {
  return nodes.filter((node) => {
    if (online !== undefined && node.online !== online) return false;
    if (tag && !node.tags.includes(tag)) return false;
    return true;
  });
}
