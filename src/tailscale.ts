import type { Peer } from "./types.js";

interface TailscalePeerJson {
  HostName?: string;
  DNSName?: string;
  TailscaleIPs?: string[];
  OS?: string;
  Online?: boolean;
  Tags?: string[];
}

interface TailscaleStatusJson {
  Self?: TailscalePeerJson;
  Peer?: Record<string, TailscalePeerJson>;
}

export function normalizeDnsName(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/\.$/, "");
}

export function parseTailscaleStatus(input: string): Peer[] {
  const parsed = JSON.parse(input) as TailscaleStatusJson;
  const rows: Peer[] = [];
  const add = (peer: TailscalePeerJson | undefined, fallback: string): void => {
    if (!peer) return;
    const dns = normalizeDnsName(peer.DNSName);
    const name = peer.HostName ?? dns?.split(".")[0] ?? fallback;
    const host = dns ?? peer.TailscaleIPs?.[0] ?? name;
    rows.push({
      name,
      host,
      os: peer.OS,
      online: peer.Online,
      addresses: peer.TailscaleIPs ?? [],
      aliases: dns && dns !== name ? [dns] : [],
      source: ["tailscale"],
      tags: peer.Tags ?? []
    });
  };
  add(parsed.Self, "self");
  for (const [id, peer] of Object.entries(parsed.Peer ?? {})) add(peer, id);
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}
