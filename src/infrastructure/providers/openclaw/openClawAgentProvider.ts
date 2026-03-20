import type { AgentProvider } from "@/domain/contracts";
import type {
  DashboardState,
  TaskAssignInput,
  TaskCreateInput,
  TaskStatusInput,
} from "@/domain/types";
import type { OpenClawAdapter } from "@/domain/contracts";

/**
 * Live provider scaffold:
 * - Uses `OpenClawAdapter` methods once OpenClaw integration contracts are confirmed.
 * - For now, adapter methods are TODOs, so live mode will throw by design.
 */
export class OpenClawAgentProvider implements AgentProvider {
  constructor(private readonly adapter: OpenClawAdapter) {}

  async getDashboardState(): Promise<DashboardState> {
    const remote = await this.adapter.fetchRemoteSnapshot();
    return remote;
  }

  async createTask(input: TaskCreateInput): Promise<DashboardState> {
    await this.adapter.createRemoteTask(input);
    const remote = await this.adapter.fetchRemoteSnapshot();
    return remote;
  }

  async assignTask(input: TaskAssignInput): Promise<DashboardState> {
    await this.adapter.assignRemoteTask(input);
    const remote = await this.adapter.fetchRemoteSnapshot();
    return remote;
  }

  async updateTaskStatus(input: TaskStatusInput): Promise<DashboardState> {
    await this.adapter.updateRemoteTaskStatus(input);
    const remote = await this.adapter.fetchRemoteSnapshot();
    return remote;
  }

  async tickSimulation(): Promise<DashboardState> {
    // In live mode, realtime updates should come from a dedicated realtime channel.
    // For now we just fetch the latest snapshot.
    const remote = await this.adapter.fetchRemoteSnapshot();
    return remote;
  }
}

