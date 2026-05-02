import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { TailmuxError } from './errors.js';

export async function readText(path, { optional = false } = {}) {
  if (!path) return '';
  try {
    return await readFile(resolve(path), 'utf8');
  } catch (error) {
    if (optional && error.code === 'ENOENT') return '';
    throw new TailmuxError(`Unable to read ${path}: ${error.message}`, { path });
  }
}

export async function readJson(path, { optional = false, fallback = null } = {}) {
  const text = await readText(path, { optional });
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new TailmuxError(`Invalid JSON in ${path}: ${error.message}`, { path });
  }
}
