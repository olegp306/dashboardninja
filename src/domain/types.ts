export const AGENT_IDS = [
  "leonardo",
  "raphael",
  "donatello",
  "michelangelo",
  "splinter",
] as const;

export type AgentId = (typeof AGENT_IDS)[number];
export type AgentRole =
  | "coordinator"
  | "urgent_executor"
  | "technical_specialist"
  | "creative_specialist"
  | "supervisor";
export type AgentStatus = "idle" | "working" | "blocked" | "offline";
export type TaskStatus = "queued" | "assigned" | "in_progress" | "done" | "failed";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export type Agent = {
  id: AgentId;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  currentTaskId: string | null;
  avatarSeed: string;
  deskLabel: string;
  // Health indicators for the control room UI.
  online: boolean;
  lastHeartbeatAt: string | null;
  lastSuccessfulTaskId: string | null;
  lastSuccessfulTaskAt: string | null;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: AgentId | null;
  createdAt: string;
  updatedAt: string;
};

export type AgentLog = {
  id: string;
  agentId: AgentId;
  level: "info" | "warn" | "error";
  message: string;
  source: "system" | "telegram" | "openclaw" | "supervisor";
  output?: string;
  createdAt: string;
};

export type DashboardState = {
  generatedAt: string;
  agents: Agent[];
  tasks: Task[];
  logs: AgentLog[];
};

export type TaskCreateInput = {
  title: string;
  description: string;
  priority: TaskPriority;
  assignedTo: AgentId | null;
};

export type TaskAssignInput = {
  taskId: string;
  assignedTo: AgentId | null;
};

export type TaskStatusInput = {
  taskId: string;
  status: TaskStatus;
};

