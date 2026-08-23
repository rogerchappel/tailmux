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
    const [directive, ...trailing] = tokenize(raw);
    if (!directive) continue;
    const equalsIndex = directive.indexOf("=");
    const keywordRaw = equalsIndex >= 0 ? directive.slice(0, equalsIndex) : directive;
    const inlineValue = equalsIndex >= 0 ? directive.slice(equalsIndex + 1) : undefined;
    let rest = inlineValue === undefined ? trailing : [...(inlineValue ? [inlineValue] : []), ...trailing];
    if (inlineValue === undefined && rest[0] === "=") {
      rest = rest.slice(1);
    } else if (inlineValue === undefined && rest[0]?.startsWith("=")) {
      const separatorValue = rest[0].slice(1);
      rest = [...(separatorValue ? [separatorValue] : []), ...rest.slice(1)];
    }
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
    if (keyword === "match") {
      current = [];
      continue;
    }
    if (!value) continue;
    for (const host of current) {
      if (keyword === "hostname" && host.hostName === undefined) host.hostName = value;
      if (keyword === "user" && host.user === undefined) host.user = value;
      if (keyword === "port" && host.port === undefined) {
        if (!/^\d+$/.test(value)) continue;
        const port = Number(value);
        if (port >= 1 && port <= 65535) host.port = port;
      }
      if (keyword === "identityfile" && host.identityFile === undefined) host.identityFile = value;
    }
  }

  return hosts.filter((host) => host.alias.length > 0).sort((a, b) => a.alias.localeCompare(b.alias));
}
