import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseTailscaleStatus, findNode } from '../src/index.js';

test('parses self and peer nodes from tailscale status', async () => {
  const fixture = JSON.parse(await readFile('fixtures/tailscale-status.json', 'utf8'));
  const status = parseTailscaleStatus(fixture);
  assert.equal(status.nodes.length, 3);
  assert.equal(status.self.name, 'atlas-mac');
  assert.equal(findNode(status.nodes, 'gpu').ips[0], '100.64.0.20');
});
