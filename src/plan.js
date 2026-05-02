export function planLaunch(template, { attach = false } = {}) {
  const commands = [];
  commands.push(`tmux new-session -d -s ${shellQuote(template.session)}`);
  template.panes.forEach((pane, index) => {
    if (index > 0) commands.push(`tmux new-window -t ${shellQuote(template.session)} -n ${shellQuote(pane.name)}`);
    else commands.push(`tmux rename-window -t ${shellQuote(template.session)}:1 ${shellQuote(pane.name)}`);
    commands.push(`tmux send-keys -t ${shellQuote(template.session)}:${index + 1} ${shellQuote(pane.command)} C-m`);
  });
  if (attach) commands.push(`tmux attach-session -t ${shellQuote(template.session)}`);
  return commands;
}

export function shellQuote(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_./:@=-]+$/.test(text)) return text;
  return `'${text.replaceAll("'", "'\\''")}'`;
}
