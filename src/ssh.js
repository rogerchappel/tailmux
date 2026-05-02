export function parseSshConfig(text = '') {
  const hosts = [];
  let current = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, '').trim();
    if (!line) continue;
    const [keywordRaw, ...rest] = line.split(/\s+/);
    const keyword = keywordRaw.toLowerCase();
    const value = rest.join(' ');
    if (keyword === 'host') {
      current = { aliases: rest, options: {} };
      hosts.push(current);
    } else if (current) {
      current.options[keyword] = value;
    }
  }
  return hosts
    .filter((host) => !host.aliases.some((alias) => alias.includes('*') || alias.includes('?')))
    .map((host) => ({
      aliases: host.aliases,
      hostName: host.options.hostname || host.aliases[0],
      user: host.options.user || '',
      port: host.options.port ? Number(host.options.port) : 22,
      identityFile: host.options.identityfile || '',
    }));
}

export function matchSshHost(node, hosts) {
  const candidates = new Set([node.name, node.dnsName, ...node.ips].filter(Boolean).map((v) => v.toLowerCase()));
  return hosts.find((host) => host.aliases.some((alias) => candidates.has(alias.toLowerCase()))
    || candidates.has(host.hostName.toLowerCase())) || null;
}
