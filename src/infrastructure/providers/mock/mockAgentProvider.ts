import type { AgentProvider } from "@/domain/contracts";
import type { TaskAssignInput, TaskCreateInput, TaskStatusInput } from "@/domain/types";
import { runtimeStore } from "@/infrastructure/store/runtimeStore";

export class MockAgentProvider implements AgentProvider {
  async getDashboardState() {
    return runtimeStore.readState();
  }

  async createTask(input: TaskCreateInput) {
    return runtimeStore.createTask(input);
  }

  async assignTask(input: TaskAssignInput) {
    return runtimeStore.assignTask(input);
  }

  async updateTaskStatus(input: TaskStatusInput) {
    return runtimeStore.updateTaskStatus(input);
  }

  async tickSimulation() {
    return runtimeStore.tickSimulation();
  }
}

