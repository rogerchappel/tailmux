export type PeerSource = "tailscale" | "ssh" | "template";

export interface Peer {
  name: string;
  host: string;
  user?: string;
  os?: string;
  online?: boolean;
  addresses: string[];
  aliases: string[];
  source: PeerSource[];
  tags: string[];
}

export interface Port {
  host: string;
  port: number;
  protocol: "tcp" | "udp" | "unknown";
  process?: string;
  pid?: number;
  state?: string;
}

export interface WorkspacePane {
  title: string;
  host?: string;
  command?: string;
  cwd?: string;
}

export interface WorkspaceTemplate {
  name: string;
  description?: string;
  session: string;
  panes: WorkspacePane[];
}

export interface CommandPlan {
  label: string;
  command: string[];
  risk: "read" | "local-write" | "remote-interactive";
}

export interface Inventory {
  peers: Peer[];
  ports: Port[];
}
