export interface SshHost {
  alias: string;
  hostName?: string;
  user?: string;
  port?: number;
  identityFile?: string;
}

const ignoredAliases = new Set(["*", "?"]);

export function parseSshConfig(input: string): SshHost[] {
  const hosts: SshHost[] = [];
  let current: SshHost[] = [];

  for (const raw of input.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    if (!line) continue;
    const [keywordRaw, ...rest] = line.split(/\s+/);
    const keyword = keywordRaw?.toLowerCase();
    const value = rest.join(" ");
    if (keyword === "host") {
      current = rest
        .filter((alias) => alias && !alias.includes("*") && !alias.includes("?") && !ignoredAliases.has(alias))
        .map((alias) => ({ alias }));
      hosts.push(...current);
      continue;
    }
    for (const host of current) {
      if (keyword === "hostname") host.hostName = value;
      if (keyword === "user") host.user = value;
      if (keyword === "port") host.port = Number.parseInt(value, 10);
      if (keyword === "identityfile") host.identityFile = value;
    }
  }

  return hosts.filter((host) => host.alias.length > 0).sort((a, b) => a.alias.localeCompare(b.alias));
}
