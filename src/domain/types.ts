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

export type LLMProviderKind = "mock" | "openai" | "local";

export type AgentMessage = {
  id: string;
  taskId: string;
  from: AgentId;
  to: AgentId;
  content: string;
  createdAt: string;
};

export type LLMRuntimeMeta = {
  mode: LLMProviderKind;
  effectiveMode: LLMProviderKind;
  requestedMode: LLMProviderKind;
  simulationForced: boolean;
  autonomyEnabled: boolean;
  openaiConfigured: boolean;
  models: { worker: string; supervisor: string };
  lastError?: string;
  tokensUsedThisTick: number;
  tokenBudgetPerTick: number;
};

export type AgentLLMState = {
  provider: LLMProviderKind;
  lastTokens?: number;
  lastPhase?: "plan" | "step" | "reflect" | "supervisor";
};

export type DashboardState = {
  generatedAt: string;
  agents: Agent[];
  tasks: Task[];
  logs: AgentLog[];
  agentMessages: AgentMessage[];
  llm: LLMRuntimeMeta;
  agentLLM: Record<string, AgentLLMState>;
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

