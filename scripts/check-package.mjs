import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const output = execFileSync(npmCommand, ["pack", "--dry-run", "--json"], {
  encoding: "utf8"
});
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
  console.error("No TypeScript test files found to verify in the package");
  process.exit(1);
}

if (missingFiles.length > 0) {
  console.error(`Package dry run is missing required files:\n${missingFiles.join("\n")}`);
  process.exit(1);
}

console.log(
  `Package dry run contains ${packResult.entryCount} files, including ${expectedTestOutputs.length} compiled tests`
);
