import type { AgentId } from "@/domain/types";
import type { LLMProvider } from "../../llm-core/src";
import { clampText } from "../../llm-core/src/safety";
import { buildBrainUserPrompt } from "./prompts/promptBuilder";
import { parseAgentPlanOutput, parseAgentStepOutput, parseReflectionOutput } from "./structuredParse";
import type { AgentBrain, AgentContext, BrainTask, Plan, Reflection, Step, StepResult } from "./types";

export type ProviderBrainLimits = {
  maxResponseChars: number;
  maxTokensPlan: number;
  maxTokensStep: number;
  maxTokensReflect: number;
};

export type ProviderBrainContext = {
  getTaskMemory: (taskId: string) => string[];
  getRecentLogs: (agentId: AgentId, limit: number) => string[];
  getInterAgentMessages: (taskId: string) => Array<{ from: string; to: string; content: string }>;
  onUsage?: (usage: {
    agentId: AgentId;
    taskId: string;
    phase: "plan" | "step" | "reflect" | "supervisor";
    tokens?: number;
  }) => void;
};

export class ProviderAgentBrain implements AgentBrain {
  constructor(
    private readonly agentId: AgentId,
    private readonly llm: LLMProvider,
    private readonly limits: ProviderBrainLimits,
    private readonly ctx: ProviderBrainContext,
  ) {}

  async plan(task: BrainTask): Promise<Plan> {
    const prompts = buildBrainUserPrompt({
      agentId: this.agentId,
      kind: "plan",
      task,
      taskMemory: this.ctx.getTaskMemory(task.id),
      recentLogs: this.ctx.getRecentLogs(this.agentId, 14),
    });

    const out = await this.llm.generate({
      systemPrompt: prompts.systemPrompt,
      userPrompt: prompts.userPrompt,
      temperature: 0.25,
      maxTokens: this.limits.maxTokensPlan,
      metadata: { kind: "agent_plan", agentId: this.agentId, taskId: task.id, title: task.title, priority: task.priority },
    });

    const text = clampText(out.text, this.limits.maxResponseChars);
    this.ctx.onUsage?.({ agentId: this.agentId, taskId: task.id, phase: "plan", tokens: out.usage?.totalTokens });

    const parsed = parseAgentPlanOutput(text, task.id);
    parsed.plan.summary = clampText(parsed.plan.summary, 500);

    // Ensure at least one step exists (graceful fallback) — keeps runtime from stalling.
    if (parsed.plan.steps.length === 0) {
      parsed.plan.steps = [
        {
          id: `${task.id}-fallback-1`,
          taskId: task.id,
          title: `Execute work for "${task.title}"`,
          type: "execution",
          objective: `Execute work for "${task.title}"`,
        },
      ];
      parsed.plan.parseWarnings = [...(parsed.plan.parseWarnings ?? []), "fallback_single_step"];
    }

    return parsed.plan;
  }

  async executeStep(input: { task: BrainTask; step: Step }): Promise<StepResult> {
    const { task, step } = input;
    const prompts = buildBrainUserPrompt({
      agentId: this.agentId,
      kind: "step",
      task,
      taskMemory: this.ctx.getTaskMemory(task.id),
      recentLogs: this.ctx.getRecentLogs(this.agentId, 14),
      extra: { step },
    });

    const out = await this.llm.generate({
      systemPrompt: prompts.systemPrompt,
      userPrompt: prompts.userPrompt,
      temperature: 0.15,
      maxTokens: this.limits.maxTokensStep,
      metadata: { kind: "agent_step", agentId: this.agentId, taskId: task.id, stepId: step.id },
    });

    const text = clampText(out.text, this.limits.maxResponseChars);
    this.ctx.onUsage?.({ agentId: this.agentId, taskId: task.id, phase: "step", tokens: out.usage?.totalTokens });

    const parsed = parseAgentStepOutput(text);
    const structured = parsed.value;

    const success = structured?.status === "completed";
    const escalate = Boolean(structured?.shouldEscalate) || structured?.status === "blocked";

    return {
      success,
      output: structured?.output ?? text,
      escalate,
      structured,
      rawText: text,
    };
  }

  async reflect(context: AgentContext): Promise<Reflection> {
    const prompts = buildBrainUserPrompt({
      agentId: this.agentId,
      kind: "reflect",
      task: context.task,
      taskMemory: this.ctx.getTaskMemory(context.task.id),
      recentLogs: this.ctx.getRecentLogs(this.agentId, 14),
      optionalMessages: this.ctx.getInterAgentMessages(context.task.id).map((m) => ({
        from: m.from,
        to: m.to,
        content: m.content,
      })),
      extra: { completedSteps: context.completedSteps, failedSteps: context.failedSteps },
    });

    const out = await this.llm.generate({
      systemPrompt: prompts.systemPrompt,
      userPrompt: prompts.userPrompt,
      temperature: 0.2,
      maxTokens: this.limits.maxTokensReflect,
      metadata: { kind: "agent_reflect", agentId: this.agentId, taskId: context.task.id },
    });

    const text = clampText(out.text, this.limits.maxResponseChars);
    this.ctx.onUsage?.({ agentId: this.agentId, taskId: context.task.id, phase: "reflect", tokens: out.usage?.totalTokens });

    const parsed = parseReflectionOutput(text);
    if (parsed.value) return parsed.value;

    return {
      confidence: 0.55,
      nextAction: "continue",
      note: `Reflection fallback (unparseable). Raw stored.`,
      rawText: text,
    };
  }
}
