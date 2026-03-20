import type {
  Agent,
  AgentLog,
  DashboardState,
  TaskAssignInput,
  TaskCreateInput,
  TaskStatusInput,
  Task,
} from "@/domain/types";

export interface AgentProvider {
  getDashboardState(): Promise<DashboardState>;
  createTask(input: TaskCreateInput): Promise<DashboardState>;
  assignTask(input: TaskAssignInput): Promise<DashboardState>;
  updateTaskStatus(input: TaskStatusInput): Promise<DashboardState>;
  tickSimulation(): Promise<DashboardState>;
}

export type OpenClawRemoteSnapshot = {
  generatedAt: string;
  agents: Agent[];
  tasks: Task[];
  logs: AgentLog[];
};

export interface OpenClawAdapter {
  /**
   * Fetches a remote snapshot from the OpenClaw control plane.
   * TODO(OpenClaw): wire to real OpenClaw endpoints once API contracts are documented.
   */
  fetchRemoteSnapshot(): Promise<OpenClawRemoteSnapshot>;
  createRemoteTask(input: TaskCreateInput): Promise<void>;
  assignRemoteTask(input: TaskAssignInput): Promise<void>;
  updateRemoteTaskStatus(input: TaskStatusInput): Promise<void>;
}

