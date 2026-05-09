import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { parsePorts } from "./ports.js";
import { parseSshConfig } from "./ssh-config.js";
import { parseTailscaleStatus } from "./tailscale.js";
import { createInventory, mergePeers } from "./inventory.js";
import type { Inventory } from "./types.js";

const execFileAsync = promisify(execFile);

export interface DiscoveryOptions {
  tailscalePath?: string;
  sshConfigPath?: string;
  portsPath?: string;
  live?: boolean;
}

async function readOptional(path: string | undefined): Promise<string | undefined> {
  if (!path) return undefined;
  return readFile(path, "utf8");
}

export async function discoverInventory(options: DiscoveryOptions): Promise<Inventory> {
  let tailscaleText = await readOptional(options.tailscalePath);
  if (!tailscaleText && options.live) {
    const { stdout } = await execFileAsync("tailscale", ["status", "--json"], { timeout: 5000 });
    tailscaleText = stdout;
  }
  const sshText = await readOptional(options.sshConfigPath);
  const portsText = await readOptional(options.portsPath);
  const tailscalePeers = tailscaleText ? parseTailscaleStatus(tailscaleText) : [];
  const sshHosts = sshText ? parseSshConfig(sshText) : [];
  const ports = portsText ? parsePorts(portsText) : [];
  return createInventory(mergePeers(tailscalePeers, sshHosts), ports);
}
