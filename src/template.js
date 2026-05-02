function safeName(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-|-$/g, '') || 'node';
}

export function generateTemplate(nodes, { session = 'tailmux' } = {}) {
  const panes = [];
  for (const node of nodes.filter((item) => item.online)) {
    const target = node.sshAlias || node.dnsName || node.ips[0] || node.name;
    panes.push({
      name: safeName(node.name),
      command: `ssh ${target}`,
      note: node.services.length ? `services: ${node.services.map((svc) => svc.name || svc.port).join(', ')}` : 'shell',
    });
  }
  return { version: 1, session: safeName(session), panes };
}

export function renderTemplate(template) {
  const lines = [`session: ${template.session}`, 'windows:'];
  for (const pane of template.panes) {
    lines.push(`  - name: ${pane.name}`);
    lines.push(`    command: ${JSON.stringify(pane.command)}`);
    lines.push(`    note: ${JSON.stringify(pane.note)}`);
  }
  return `${lines.join('\n')}\n`;
}
