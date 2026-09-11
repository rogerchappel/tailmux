import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readNamedFile } from "./fs-input.js";
import { parsePorts } from "./ports.js";
import { parseSshConfig } from "./ssh-config.js";
import { parseTailscaleStatus } from "./tailscale.js";
import { createInventory, mergePeers } from "./inventory.js";
import type { Inventory } from "./types.js";

const execFileAsync = promisify(execFile);

export interface DiscoveryOptions {
  tailscalePath?: string | undefined;
  sshConfigPath?: string | undefined;
  portsPath?: string | undefined;
  live?: boolean | undefined;
}

async function readOptional(path: string | undefined, label: string, flag: string, nextStep: string): Promise<string | undefined> {
  if (!path) return undefined;
  return readNamedFile(path, { label, flag, nextStep });
}

export async function discoverInventory(options: DiscoveryOptions): Promise<Inventory> {
  let tailscaleText = await readOptional(
    options.tailscalePath,
    "tailscale status file",
    "tailscale",
    "pass an existing file to --tailscale or omit it to scan without tailscale peers"
  );
  if (!tailscaleText && options.live) {
    const { stdout } = await execFileAsync("tailscale", ["status", "--json"], { timeout: 5000 });
    tailscaleText = stdout;
  }
  const sshText = await readOptional(
    options.sshConfigPath,
    "ssh config file",
    "ssh-config",
    "pass an existing file to --ssh-config or omit it to scan without SSH peers"
  );
  const portsText = await readOptional(
    options.portsPath,
    "ports file",
    "ports",
    "pass an existing file to --ports or omit it to scan without port entries"
  );
  const tailscalePeers = tailscaleText ? parseTailscaleStatus(tailscaleText) : [];
  const sshHosts = sshText ? parseSshConfig(sshText) : [];
  const ports = portsText ? parsePorts(portsText) : [];
  return createInventory(mergePeers(tailscalePeers, sshHosts), ports);
}
