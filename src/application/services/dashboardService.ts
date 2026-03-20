import type {
  DashboardState,
  TaskAssignInput,
  TaskCreateInput,
  TaskStatusInput,
} from "@/domain/types";
import { createAgentProvider } from "@/infrastructure/providers/providerFactory";

const provider = createAgentProvider();

export const dashboardService = {
  async getDashboardState(): Promise<DashboardState> {
    return provider.getDashboardState();
  },
  async createTask(input: TaskCreateInput): Promise<DashboardState> {
    return provider.createTask(input);
  },
  async assignTask(input: TaskAssignInput): Promise<DashboardState> {
    return provider.assignTask(input);
  },
  async updateTaskStatus(input: TaskStatusInput): Promise<DashboardState> {
    return provider.updateTaskStatus(input);
  },
  async tickSimulation(): Promise<DashboardState> {
    return provider.tickSimulation();
  },
};

