import test from 'node:test';
import assert from 'node:assert/strict';
import { buildInventory, summarizeHealth } from '../src/index.js';

test('builds sorted inventory with health summary', () => {
  const tailscale = { nodes: [
    { name: 'b', dnsName: 'b.ts.net', ips: ['100.1'], online: false, tags: [] },
    { name: 'a', dnsName: 'a.ts.net', ips: ['100.2'], online: true, tags: [] }
  ] };
  const nodes = buildInventory(tailscale, [{ aliases: ['a'], hostName: 'a.ts.net', port: 22 }], { a: [{ port: 80, open: true }] });
  assert.deepEqual(nodes.map((node) => node.name), ['a', 'b']);
  assert.equal(nodes[0].sshAlias, 'a');
  assert.deepEqual(summarizeHealth(nodes), { total: 2, online: 1, offline: 1, serviceCount: 1 });
});
