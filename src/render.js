import { nodeHealth, serviceState, summarizeHealth } from './health.js';

function pad(value, width) {
  return String(value ?? '').padEnd(width, ' ');
}

export function renderStatus(nodes) {
  const summary = summarizeHealth(nodes);
  const lines = [
    `tailmux status: ${summary.online}/${summary.total} online, ${summary.serviceCount} services tracked`,
    '',
    `${pad('node', 18)} ${pad('state', 9)} ${pad('ssh', 14)} services`,
    `${'-'.repeat(18)} ${'-'.repeat(9)} ${'-'.repeat(14)} ${'-'.repeat(24)}`,
  ];
  for (const node of nodes) {
    const services = node.services.length
      ? node.services.map((svc) => `${svc.name || svc.port}:${serviceState(svc)}`).join(', ')
      : '-';
    lines.push(`${pad(node.name, 18)} ${pad(nodeHealth(node), 9)} ${pad(node.sshAlias || '-', 14)} ${services}`);
  }
  return `${lines.join('\n')}\n`;
}

export function renderJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}
