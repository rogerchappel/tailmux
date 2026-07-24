export interface ParsedArgs {
  command?: string | undefined;
  positional: string[];
  flags: Record<string, string | boolean>;
}

interface CommandSpec {
  booleanFlags: ReadonlySet<string>;
  valueFlags: ReadonlySet<string>;
}

const scanSpec: CommandSpec = {
  booleanFlags: new Set(["help", "live"]),
  valueFlags: new Set(["format", "ports", "ssh-config", "tailscale"])
};

const commandSpecs: Record<string, CommandSpec> = {
  scan: scanSpec,
  status: scanSpec,
  "init-template": {
    booleanFlags: new Set(["help"]),
    valueFlags: new Set(["session"])
  },
  template: {
    booleanFlags: new Set(["dry-run", "help"]),
    valueFlags: new Set()
  },
  launch: {
    booleanFlags: new Set(["execute", "help"]),
    valueFlags: new Set()
  },
  help: {
    booleanFlags: new Set(),
    valueFlags: new Set()
  }
};

export function parseArgs(argv: readonly string[]): ParsedArgs {
  const [first, ...rest] = argv;
  const command = first === "--help" ? "help" : first;
  const parsed: ParsedArgs = { command, positional: [], flags: {} };
  const spec = command ? commandSpecs[command] : undefined;

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (!arg) continue;
    if (!arg.startsWith("--")) {
      parsed.positional.push(arg);
      continue;
    }

    const key = arg.slice(2);
    if (!spec || (!spec.booleanFlags.has(key) && !spec.valueFlags.has(key))) {
      throw new Error(`unknown option: --${key}`);
    }
    if (spec.booleanFlags.has(key)) {
      parsed.flags[key] = true;
      continue;
    }

    const value = rest[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`option --${key} requires a value`);
    }
    parsed.flags[key] = value;
    index += 1;
  }

  const format = parsed.flags.format;
  if (typeof format === "string" && format !== "table" && format !== "json") {
    throw new Error(`unsupported --format value: ${format} (expected table or json)`);
  }

  return parsed;
}
