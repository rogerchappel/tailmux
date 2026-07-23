import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";

const testsDirectory = resolve("dist/tests");

let entries;
try {
  entries = await readdir(testsDirectory, { withFileTypes: true });
} catch (error) {
  console.error(`Unable to discover compiled tests in ${testsDirectory}: ${error.message}`);
  process.exit(1);
}

const testFiles = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".test.js"))
  .map((entry) => resolve(testsDirectory, entry.name))
  .sort();

if (testFiles.length === 0) {
  console.error(`No compiled test files found in ${testsDirectory}`);
  process.exit(1);
}

console.log(`Running ${testFiles.length} compiled test files`);

const child = spawn(process.execPath, ["--test", ...testFiles], {
  stdio: "inherit"
});

child.on("error", (error) => {
  console.error(`Unable to start the Node.js test runner: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
