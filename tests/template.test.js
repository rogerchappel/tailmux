import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTemplate, planLaunch, renderTemplate } from '../src/index.js';

test('generates templates for online nodes only', () => {
  const template = generateTemplate([
    { name: 'GPU Box', online: true, sshAlias: 'gpu', services: [{ name: 'ollama' }] },
    { name: 'offline', online: false, services: [] }
  ], { session: 'AI Lab' });
  assert.equal(template.session, 'ai-lab');
  assert.equal(template.panes.length, 1);
  assert.match(renderTemplate(template), /ssh gpu/);
});

test('plans dry-run tmux commands without executing them', () => {
  const commands = planLaunch({ session: 'demo', panes: [{ name: 'gpu', command: 'ssh gpu' }] });
  assert.deepEqual(commands, [
    'tmux new-session -d -s demo',
    'tmux rename-window -t demo:1 gpu',
    "tmux send-keys -t demo:1 'ssh gpu' C-m"
  ]);
});
