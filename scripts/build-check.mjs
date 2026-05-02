import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.name.endsWith('.js')) files.push(path);
  }
  return files;
}

for (const file of await walk('src')) {
  const source = await readFile(file, 'utf8');
  if (source.includes('child_process') || source.includes('exec(')) {
    throw new Error(`${file} appears to execute subprocesses; MVP must stay dry-run`);
  }
  await import(new URL(`../${file}`, import.meta.url));
}

console.log('build-check ok');
