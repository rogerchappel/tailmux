export interface SshHost {
  alias: string;
  hostName?: string;
  user?: string;
  port?: number;
  identityFile?: string;
}

function tokenize(line: string): string[] {
  const tokens: string[] = [];
  let token = "";
  let quote: "'" | '"' | undefined;

  const finishToken = () => {
    if (token) tokens.push(token);
    token = "";
  };

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === "\\" && index + 1 < line.length) {
      token += line[index + 1];
      index += 1;
      continue;
    }
    if (quote) {
      if (character === quote) quote = undefined;
      else token += character;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "#") break;
    if (character && /\s/.test(character)) {
      finishToken();
      continue;
    }
    token += character;
  }
  finishToken();
  return tokens;
}

export function parseSshConfig(input: string): SshHost[] {
  const hosts: SshHost[] = [];
  let current: SshHost[] = [];

  for (const raw of input.split(/\r?\n/)) {
    const [keywordRaw, ...rest] = tokenize(raw);
    if (!keywordRaw) continue;
    const keyword = keywordRaw?.toLowerCase();
    const value = rest.join(" ");
    if (keyword === "host") {
      current = rest
        .filter((alias) => alias && !alias.startsWith("!") && !alias.includes("*") && !alias.includes("?"))
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
