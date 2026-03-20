import type { OpenClawAdapter } from "@/domain/contracts";
import type { OpenClawRemoteSnapshot } from "@/domain/contracts";
import type { TaskAssignInput, TaskCreateInput, TaskStatusInput } from "@/domain/types";

/**
 * TODO(OpenClaw): Replace placeholders with real integration once API contracts are documented.
 * This scaffold intentionally avoids inventing unsupported or undocumented OpenClaw endpoints.
 */
export class OpenClawHttpAdapter implements OpenClawAdapter {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
  ) {}

  async fetchRemoteSnapshot(): Promise<OpenClawRemoteSnapshot> {
    void this.baseUrl;
    void this.token;
    throw new Error("TODO(OpenClaw): Implement fetchRemoteSnapshot using documented OpenClaw API.");
  }

  async createRemoteTask(input: TaskCreateInput): Promise<void> {
    void input;
    throw new Error("TODO(OpenClaw): Implement createRemoteTask using documented OpenClaw API.");
  }

  async assignRemoteTask(input: TaskAssignInput): Promise<void> {
    void input;
    throw new Error("TODO(OpenClaw): Implement assignRemoteTask using documented OpenClaw API.");
  }

  async updateRemoteTaskStatus(input: TaskStatusInput): Promise<void> {
    void input;
    throw new Error("TODO(OpenClaw): Implement updateRemoteTaskStatus using documented OpenClaw API.");
  }
}

