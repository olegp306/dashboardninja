import type {
  AgentId,
  DashboardState,
  TaskAssignInput,
  TaskCreateInput,
  TaskStatusInput,
} from "@/domain/types";
import { createAgentProvider } from "@/infrastructure/providers/providerFactory";
import { getLLMProvider, getResolvedLLMRuntime } from "@/infrastructure/config/llmConfig";
import { runtimeStore } from "@/infrastructure/store/runtimeStore";

const provider = createAgentProvider();

export const dashboardService = {
  getLLMConfig() {
    const resolved = getResolvedLLMRuntime();
    return {
      mode: resolved.mode,
      effectiveMode: resolved.effectiveMode,
      simulationForced: resolved.simulationForced,
      autonomyEnabled: resolved.autonomyEnabled,
      openaiConfigured: resolved.openaiConfigured,
      models: resolved.models,
      limits: resolved.limits,
      openai: {
        apiKeyPresent: resolved.openai.apiKeyPresent,
        baseUrl: resolved.openai.baseUrl,
      },
      localLlmEnabled: resolved.localLlmEnabled,
    };
  },

  async testLLMConnection(payload: { prompt?: string }) {
    const resolved = getResolvedLLMRuntime();
    const llm = getLLMProvider();
    const prompt = payload.prompt?.trim() || "Reply with JSON: {\"ok\":true}";
    const out = await llm.generate({
      systemPrompt: "You are a connectivity test harness. Respond with concise JSON only.",
      userPrompt: prompt,
      temperature: 0,
      maxTokens: 120,
      metadata: { kind: "llm_test" },
    });
    return {
      ok: true,
      effectiveMode: resolved.effectiveMode,
      output: out.text,
      usage: out.usage,
    };
  },

  getReasoningHistory(agentId: AgentId) {
    return runtimeStore.getReasoningHistory(agentId);
  },

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

