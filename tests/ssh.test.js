import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseSshConfig, matchSshHost } from '../src/index.js';

test('parses concrete SSH host aliases', async () => {
  const hosts = parseSshConfig(await readFile('fixtures/ssh_config', 'utf8'));
  assert.equal(hosts.length, 2);
  assert.equal(hosts[1].port, 2222);
});

test('matches node identity to SSH host', async () => {
  const hosts = parseSshConfig(await readFile('fixtures/ssh_config', 'utf8'));
  const match = matchSshHost({ name: 'gpu-box', dnsName: 'gpu-box.tailnet.ts.net', ips: [] }, hosts);
  assert.equal(match.aliases[0], 'gpu-box');
});
