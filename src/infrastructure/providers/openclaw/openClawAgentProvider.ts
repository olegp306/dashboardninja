import type { AgentProvider } from "@/domain/contracts";
import type {
  DashboardState,
  TaskAssignInput,
  TaskCreateInput,
  TaskStatusInput,
} from "@/domain/types";
import type { OpenClawAdapter } from "@/domain/contracts";

const normalizeDashboardState = (remote: DashboardState): DashboardState => {
  if (!remote.agentMessages) remote.agentMessages = [];
  if (!remote.llm) {
    remote.llm = {
      mode: "mock",
      effectiveMode: "mock",
      requestedMode: "mock",
      simulationForced: false,
      autonomyEnabled: true,
      openaiConfigured: false,
      models: { worker: "unknown", supervisor: "unknown" },
      tokensUsedThisTick: 0,
      tokenBudgetPerTick: 25_000,
    };
  }
  if (!remote.agentLLM) remote.agentLLM = {};
  return remote;
};

/**
 * Live provider scaffold:
 * - Uses `OpenClawAdapter` methods once OpenClaw integration contracts are confirmed.
 * - For now, adapter methods are TODOs, so live mode will throw by design.
 */
export class OpenClawAgentProvider implements AgentProvider {
  constructor(private readonly adapter: OpenClawAdapter) {}

  async getDashboardState(): Promise<DashboardState> {
    const remote = await this.adapter.fetchRemoteSnapshot();
    return normalizeDashboardState(remote as unknown as DashboardState);
  }

  async createTask(input: TaskCreateInput): Promise<DashboardState> {
    await this.adapter.createRemoteTask(input);
    const remote = await this.adapter.fetchRemoteSnapshot();
    return normalizeDashboardState(remote as unknown as DashboardState);
  }

  async assignTask(input: TaskAssignInput): Promise<DashboardState> {
    await this.adapter.assignRemoteTask(input);
    const remote = await this.adapter.fetchRemoteSnapshot();
    return normalizeDashboardState(remote as unknown as DashboardState);
  }

  async updateTaskStatus(input: TaskStatusInput): Promise<DashboardState> {
    await this.adapter.updateRemoteTaskStatus(input);
    const remote = await this.adapter.fetchRemoteSnapshot();
    return normalizeDashboardState(remote as unknown as DashboardState);
  }

  async tickSimulation(): Promise<DashboardState> {
    // In live mode, realtime updates should come from a dedicated realtime channel.
    // For now we just fetch the latest snapshot.
    const remote = await this.adapter.fetchRemoteSnapshot();
    return normalizeDashboardState(remote as unknown as DashboardState);
  }
}

