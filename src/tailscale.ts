import type { Peer } from "./types.js";
import { TailmuxError } from "./errors.js";

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

function invalid(message: string): never {
  throw new TailmuxError(`invalid Tailscale status: ${message}`, "TAILMUX_TAILSCALE");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validatePeer(value: unknown, path: string): TailscalePeerJson {
  if (!isObject(value)) invalid(`${path} must be an object`);
  for (const field of ["HostName", "DNSName", "OS"] as const) {
    if (value[field] !== undefined && typeof value[field] !== "string") invalid(`${path}.${field} must be a string`);
  }
  if (value.Online !== undefined && typeof value.Online !== "boolean") invalid(`${path}.Online must be a boolean`);
  for (const field of ["TailscaleIPs", "Tags"] as const) {
    const fieldValue = value[field];
    if (fieldValue !== undefined && (!Array.isArray(fieldValue) || !fieldValue.every((item) => typeof item === "string"))) {
      invalid(`${path}.${field} must be an array of strings`);
    }
  }
  return value;
}

function validateStatus(value: unknown): TailscaleStatusJson {
  if (!isObject(value)) invalid("status must be an object");
  const result: TailscaleStatusJson = {};
  if (value.Self !== undefined) result.Self = validatePeer(value.Self, "Self");
  if (value.Peer !== undefined) {
    if (!isObject(value.Peer)) invalid("Peer must be an object");
    result.Peer = Object.fromEntries(
      Object.entries(value.Peer).map(([id, peer]) => [id, validatePeer(peer, `Peer.${id}`)])
    );
  }
  return result;
}

export function normalizeDnsName(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/\.$/, "");
}

export function parseTailscaleStatus(input: string): Peer[] {
  let value: unknown;
  try {
    value = JSON.parse(input);
  } catch {
    invalid("input must be valid JSON");
  }
  const parsed = validateStatus(value);
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
