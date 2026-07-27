import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const temporaryRoot = mkdtempSync(join(tmpdir(), "tailmux-package-"));

try {
  const output = execFileSync(
    npmCommand,
    ["pack", "--json", "--pack-destination", temporaryRoot],
    { encoding: "utf8" }
  );
  const [packResult] = JSON.parse(output);
  const packedFiles = new Set(packResult.files.map((file) => file.path));

  const sourceTests = readdirSync("tests")
    .filter((name) => name.endsWith(".test.ts"))
    .sort();
  const expectedTestOutputs = sourceTests.map(
    (name) => `dist/tests/${name.replace(/\.ts$/, ".js")}`
  );
  const requiredFiles = [
    "dist/src/cli.js",
    "dist/src/index.d.ts",
    "dist/src/index.js",
    "scripts/run-tests.mjs",
    ...expectedTestOutputs
  ];
  const missingFiles = requiredFiles.filter((path) => !packedFiles.has(path));

  if (sourceTests.length === 0) {
    throw new Error("No TypeScript test files found to verify in the package");
  }

  if (missingFiles.length > 0) {
    throw new Error(`Packed tarball is missing required files:\n${missingFiles.join("\n")}`);
  }

  const installRoot = join(temporaryRoot, "install");
  const tarballPath = join(temporaryRoot, packResult.filename);
  execFileSync(
    npmCommand,
    ["install", "--prefix", installRoot, "--ignore-scripts", "--no-audit", "--no-fund", tarballPath],
    { stdio: "pipe" }
  );

  const installedRoot = join(installRoot, "node_modules", "tailmux");
  const manifest = JSON.parse(readFileSync(join(installedRoot, "package.json"), "utf8"));
  const expectedManifest = {
    name: "tailmux",
    version: "0.1.0",
    bin: { tailmux: "./dist/src/cli.js" },
    repository: {
      type: "git",
      url: "git+https://github.com/rogerchappel/tailmux.git"
    }
  };

  for (const [field, expected] of Object.entries(expectedManifest)) {
    if (JSON.stringify(manifest[field]) !== JSON.stringify(expected)) {
      throw new Error(
        `Packed manifest ${field} mismatch: expected ${JSON.stringify(expected)}, received ${JSON.stringify(manifest[field])}`
      );
    }
  }

  const executable = join(
    installRoot,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "tailmux.cmd" : "tailmux"
  );
  const help = execFileSync(executable, ["help"], { encoding: "utf8" });
  if (!help.includes("tailmux - local-first Tailscale/tmux workspace helper")) {
    throw new Error("Installed tailmux CLI did not print the expected help output");
  }

  const scan = execFileSync(
    executable,
    [
      "scan",
      "--tailscale",
      join(installedRoot, "fixtures", "tailscale-status.json"),
      "--ssh-config",
      join(installedRoot, "fixtures", "ssh_config"),
      "--ports",
      join(installedRoot, "fixtures", "ports.txt"),
      "--format",
      "json"
    ],
    { encoding: "utf8" }
  );
  JSON.parse(scan);

  console.log(
    `Packed and installed ${manifest.name}@${manifest.version} with ${packResult.entryCount} files; verified ${expectedTestOutputs.length} compiled tests and the tailmux CLI`
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
