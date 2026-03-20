import type { AgentPlanOutput, AgentStepOutput, Plan, Reflection, Step, StepType } from "./types";
import { tryParseJsonObject } from "../../llm-core/src/json";

const isStepType = (value: unknown): value is StepType =>
  value === "analysis" || value === "execution" || value === "communication" || value === "review";

export const parseAgentPlanOutput = (rawText: string, taskId: string): {
  plan: Plan;
  warnings: string[];
} => {
  const parsed = tryParseJsonObject(rawText);
  if (!parsed.ok) {
    return {
      plan: {
        summary: "Unparseable plan output; falling back to raw text.",
        steps: [],
        rawText,
        parseWarnings: [parsed.error],
      },
      warnings: [parsed.error],
    };
  }

  const value = parsed.value as unknown;
  if (!value || typeof value !== "object") {
    return {
      plan: { summary: "Invalid plan JSON shape.", steps: [], rawText, parseWarnings: ["not_an_object"] },
      warnings: ["not_an_object"],
    };
  }

  const obj = value as Record<string, unknown>;
  const summary = typeof obj.summary === "string" ? obj.summary : "Plan";
  const stepsRaw = Array.isArray(obj.steps) ? obj.steps : [];

  const warnings: string[] = [];
  const steps: Step[] = [];

  for (const item of stepsRaw) {
    if (!item || typeof item !== "object") {
      warnings.push("step_skipped_not_object");
      continue;
    }
    const s = item as Record<string, unknown>;
    const id = typeof s.id === "string" ? s.id : "";
    const title = typeof s.title === "string" ? s.title : "";
    const type = isStepType(s.type) ? s.type : "execution";
    if (!id || !title) {
      warnings.push("step_skipped_missing_id_title");
      continue;
    }

    const assignedTo = typeof s.assignedTo === "string" ? s.assignedTo : undefined;
    const resolvedTaskId = typeof s.taskId === "string" ? s.taskId : taskId;
    steps.push({
      id,
      taskId: resolvedTaskId,
      title,
      type,
      objective: title,
      requiresCollaborationWith: assignedTo,
    });
  }

  const plan: Plan = {
    summary,
    steps,
    rawText,
    parseWarnings: warnings.length ? warnings : undefined,
  };

  return { plan, warnings };
};

export const parseAgentPlanOutputTyped = (rawText: string, taskId: string): { value?: AgentPlanOutput; warnings: string[] } => {
  const { plan, warnings } = parseAgentPlanOutput(rawText, taskId);
  if (plan.steps.length === 0 && !plan.rawText) return { warnings };
  return {
    value: { summary: plan.summary, steps: plan.steps.map((s) => ({ id: s.id, title: s.title, type: s.type, assignedTo: s.requiresCollaborationWith })) },
    warnings,
  };
};

export const parseAgentStepOutput = (rawText: string): { value?: AgentStepOutput; warnings: string[] } => {
  const parsed = tryParseJsonObject(rawText);
  if (!parsed.ok) return { warnings: [parsed.error] };

  const obj = parsed.value as Record<string, unknown>;
  const summary = typeof obj.summary === "string" ? obj.summary : "";
  const status = obj.status;
  const okStatus = status === "completed" || status === "blocked" || status === "needs_input";
  if (!summary || !okStatus) return { warnings: ["invalid_step_json"] };

  const messageToAgent =
    obj.messageToAgent && typeof obj.messageToAgent === "object"
      ? (() => {
          const m = obj.messageToAgent as Record<string, unknown>;
          const to = typeof m.to === "string" ? m.to : "";
          const content = typeof m.content === "string" ? m.content : "";
          if (!to || !content) return undefined;
          return { to, content };
        })()
      : undefined;

  return {
    value: {
      summary,
      status,
      output: typeof obj.output === "string" ? obj.output : undefined,
      shouldEscalate: typeof obj.shouldEscalate === "boolean" ? obj.shouldEscalate : undefined,
      messageToAgent,
    },
    warnings: [],
  };
};

export const parseReflectionOutput = (rawText: string): { value?: Reflection; warnings: string[] } => {
  const parsed = tryParseJsonObject(rawText);
  if (!parsed.ok) return { warnings: [parsed.error] };

  const obj = parsed.value as Record<string, unknown>;
  const note = typeof obj.note === "string" ? obj.note : typeof obj.summary === "string" ? obj.summary : "";
  const confidence = typeof obj.confidence === "number" && Number.isFinite(obj.confidence) ? obj.confidence : 0.5;
  const next = obj.nextAction;
  const nextAction =
    next === "continue" || next === "request_help" || next === "escalate" ? next : "continue";

  if (!note) return { warnings: ["invalid_reflect_json"] };

  return {
    value: {
      confidence,
      nextAction,
      note,
      rawText,
    },
    warnings: [],
  };
};
