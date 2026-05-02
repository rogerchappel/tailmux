#!/usr/bin/env node
import { parseArgs, usage } from './config.js';
import { readJson, readText } from './fs.js';
import { TailmuxError } from './errors.js';
import { parseTailscaleStatus } from './tailscale.js';
import { parseSshConfig } from './ssh.js';
import { buildInventory } from './inventory.js';
import { renderJson, renderStatus } from './render.js';
import { generateTemplate, renderTemplate } from './template.js';
import { planLaunch } from './plan.js';

async function loadInventory(args) {
  if (!args.tailscale) throw new TailmuxError('--tailscale fixture is required for the MVP');
  const tailscale = parseTailscaleStatus(await readJson(args.tailscale));
  const sshHosts = parseSshConfig(await readText(args.sshConfig, { optional: true }));
  const ports = await readJson(args.ports, { optional: true, fallback: {} });
  return buildInventory(tailscale, sshHosts, ports);
}

export async function main(argv = process.argv.slice(2), io = process) {
  const args = parseArgs(argv);
  const command = args._[0];
  if (!command || args.help || args.h) {
    io.stdout.write(usage());
    return 0;
  }
  const nodes = await loadInventory(args);
  if (command === 'status') {
    io.stdout.write(args.json ? renderJson(nodes) : renderStatus(nodes));
    return 0;
  }
  if (command === 'template') {
    const template = generateTemplate(nodes, { session: args.session || 'tailmux' });
    io.stdout.write(args.json ? renderJson(template) : renderTemplate(template));
    return 0;
  }
  if (command === 'plan') {
    const template = generateTemplate(nodes, { session: args.session || 'tailmux' });
    io.stdout.write(`${planLaunch(template, { attach: Boolean(args.attach) }).join('\n')}\n`);
    return 0;
  }
  throw new TailmuxError(`Unknown command: ${command}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().then((code) => process.exit(code)).catch((error) => {
    process.stderr.write(`tailmux: ${error.message}\n`);
    process.exit(1);
  });
}
