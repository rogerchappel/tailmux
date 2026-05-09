import type { Port } from "./types.js";

export function parsePorts(input: string, host = "local"): Port[] {
  const ports: Port[] = [];
  for (const raw of input.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const tcpMatch = line.match(/\b(TCP|UDP)\b.*?[.:](\d+)\s+\(([^)]+)\)|\b(tcp|udp)\b.*?:(\d+)\s+.*?\b(LISTEN|ESTABLISHED)\b/i);
    if (tcpMatch) {
      const protocol = ((tcpMatch[1] ?? tcpMatch[4])?.toLowerCase() ?? "unknown") as Port["protocol"];
      const port = Number.parseInt(tcpMatch[2] ?? tcpMatch[5] ?? "0", 10);
      if (Number.isFinite(port) && port > 0) {
        ports.push({
          host,
          port,
          protocol,
          process: tcpMatch[3],
          state: tcpMatch[6]
        });
      }
      continue;
    }
    const simple = line.match(/^(?<host>[\w.-]+)\s+(?<port>\d+)\s+(?<protocol>tcp|udp)(?:\s+(?<process>\S+))?/i);
    if (simple?.groups) {
      ports.push({
        host: simple.groups.host ?? host,
        port: Number.parseInt(simple.groups.port ?? "0", 10),
        protocol: (simple.groups.protocol?.toLowerCase() ?? "unknown") as Port["protocol"],
        process: simple.groups.process
      });
    }
  }
  return ports.sort((a, b) => a.host.localeCompare(b.host) || a.port - b.port);
}
