#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { discoverInventory } from "./discovery.js";
import { formatCommand, planTmux } from "./planner.js";
import { renderInventoryJson, renderInventoryTable } from "./render.js";
import { parseWorkspaceTemplate, stringifyWorkspaceTemplate } from "./template.js";
import { minimalTemplate } from "./template-presets.js";

interface ParsedArgs { command?: string; positional: string[]; flags: Record<string, string | boolean>; }

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = { positional: [], flags: {} };
  parsed.command = argv.shift();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg) continue;
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[index + 1];
      if (next && !next.startsWith("--")) { parsed.flags[key] = next; index += 1; }
      else parsed.flags[key] = true;
    } else parsed.positional.push(arg);
  }
  return parsed;
}

function usage(): string {
  return `tailmux - local-first Tailscale/tmux workspace helper\n\nCommands:\n  scan [--tailscale file] [--ssh-config file] [--ports file] [--live] [--format table|json]\n  template <file> [--dry-run]
  init-template [--session name]\n  launch <file> [--execute]\n  status [same flags as scan]\n\nSafety:\n  tailmux does not call Tailscale, SSH, or tmux unless --live or --execute is supplied.\n`;
}

function flagString(flags: Record<string, string | boolean>, name: string): string | undefined {
  const value = flags[name];
  return typeof value === "string" ? value : undefined;
}

async function run(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (!args.command || args.command === "help" || args.flags.help) { process.stdout.write(usage()); return 0; }
  if (args.command === "scan" || args.command === "status") {
    const inventory = await discoverInventory({
      tailscalePath: flagString(args.flags, "tailscale"),
      sshConfigPath: flagString(args.flags, "ssh-config"),
      portsPath: flagString(args.flags, "ports"),
      live: args.flags.live === true
    });
    process.stdout.write(args.flags.format === "json" ? renderInventoryJson(inventory) : renderInventoryTable(inventory));
    return 0;
  }
  if (args.command === "init-template") {
    process.stdout.write(stringifyWorkspaceTemplate(minimalTemplate(flagString(args.flags, "session") ?? "tailmux")));
    return 0;
  }
  if (args.command === "template" || args.command === "launch") {
    const file = args.positional[0];
    if (!file) throw new Error(`${args.command} requires a template file`);
    const template = parseWorkspaceTemplate(await readFile(file, "utf8"));
    if (args.command === "template") { process.stdout.write(stringifyWorkspaceTemplate(template)); return 0; }
    const plans = planTmux(template);
    for (const plan of plans) process.stdout.write(`${plan.risk.padEnd(18)} ${formatCommand(plan.command)}\n`);
    if (args.flags.execute === true) {
      for (const plan of plans) {
        const result = spawnSync(plan.command[0], plan.command.slice(1), { stdio: "inherit" });
        if (result.status !== 0) return result.status ?? 1;
      }
    }
    return 0;
  }
  process.stderr.write(usage());
  return 2;
}

run().then((code) => { process.exitCode = code; }).catch((error: unknown) => {
  process.stderr.write(`tailmux: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
