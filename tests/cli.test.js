import test from 'node:test';
import assert from 'node:assert/strict';
import { main } from '../src/cli.js';


test('status command renders fixture-backed board', async () => {
  let output = '';
  const io = { stdout: { write: (chunk) => { output += chunk; } } };
  const code = await main(['status', '--tailscale', 'fixtures/tailscale-status.json', '--ssh-config', 'fixtures/ssh_config', '--ports', 'fixtures/ports.json'], io);
  assert.equal(code, 0);
  assert.match(output, /gpu-box/);
  assert.match(output, /degraded/);
});

test('plan command prints dry-run commands', async () => {
  let output = '';
  const io = { stdout: { write: (chunk) => { output += chunk; } } };
  await main(['plan', '--tailscale', 'fixtures/tailscale-status.json', '--ssh-config', 'fixtures/ssh_config', '--session', 'demo'], io);
  assert.match(output, /tmux new-session/);
  assert.match(output, /ssh gpu-box/);
});

test('template command can render JSON', async () => {
  let output = '';
  const io = { stdout: { write: (chunk) => { output += chunk; } } };
  await main(['template', '--tailscale', 'fixtures/tailscale-status.json', '--ssh-config', 'fixtures/ssh_config', '--json'], io);
  const parsed = JSON.parse(output);
  assert.equal(parsed.session, 'tailmux');
  assert.ok(parsed.panes.some((pane) => pane.name === 'gpu-box'));
});
