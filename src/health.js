export function summarizeHealth(nodes) {
  const online = nodes.filter((node) => node.online).length;
  const offline = nodes.length - online;
  const serviceCount = nodes.reduce((sum, node) => sum + node.services.length, 0);
  return { total: nodes.length, online, offline, serviceCount };
}

export function serviceState(service) {
  if (service.open === true) return 'open';
  if (service.open === false) return 'closed';
  return 'unknown';
}

export function nodeHealth(node) {
  if (!node.online) return 'offline';
  if (node.services.some((service) => service.open === false)) return 'degraded';
  return 'healthy';
}
