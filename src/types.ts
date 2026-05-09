export type PeerSource = "tailscale" | "ssh" | "template";

export interface Peer {
  name: string;
  host: string;
  user?: string | undefined;
  os?: string | undefined;
  online?: boolean | undefined;
  addresses: string[];
  aliases: string[];
  source: PeerSource[];
  tags: string[];
}

export interface Port {
  host: string;
  port: number;
  protocol: "tcp" | "udp" | "unknown";
  process?: string | undefined;
  pid?: number | undefined;
  state?: string | undefined;
}

export interface WorkspacePane {
  title: string;
  host?: string | undefined;
  command?: string | undefined;
  cwd?: string | undefined;
}

export interface WorkspaceTemplate {
  name: string;
  description?: string | undefined;
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
