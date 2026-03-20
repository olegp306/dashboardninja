import type { AgentId } from "@/domain/types";
import type { BrainTask } from "../types";
import { agentSystemPrompt } from "./templates";

export const buildBrainUserPrompt = (args: {
  agentId: AgentId;
  kind: "plan" | "step" | "reflect";
  task: BrainTask;
  taskMemory: string[];
  recentLogs: string[];
  optionalMessages?: Array<{ from: string; to: string; content: string }>;
  extra?: Record<string, unknown>;
}) => {
  const lines: string[] = [];
  lines.push(`KIND: ${args.kind}`);
  lines.push(`AGENT: ${args.agentId}`);
  lines.push("");
  lines.push("TASK:");
  lines.push(`id: ${args.task.id}`);
  lines.push(`title: ${args.task.title}`);
  lines.push(`priority: ${args.task.priority}`);
  lines.push(`description: ${args.task.description}`);
  lines.push("");

  if (args.taskMemory.length > 0) {
    lines.push("TASK_MEMORY (short, bounded):");
    for (const item of args.taskMemory) lines.push(`- ${item}`);
    lines.push("");
  }

  if (args.recentLogs.length > 0) {
    lines.push("RECENT_LOGS (sanitized, bounded):");
    for (const item of args.recentLogs) lines.push(`- ${item}`);
    lines.push("");
  }

  if (args.optionalMessages && args.optionalMessages.length > 0) {
    lines.push("INTER_AGENT_MESSAGES:");
    for (const m of args.optionalMessages) {
      lines.push(`- ${m.from} -> ${m.to}: ${m.content}`);
    }
    lines.push("");
  }

  if (args.extra) {
    lines.push("EXTRA:");
    lines.push(JSON.stringify(args.extra, null, 2));
    lines.push("");
  }

  lines.push("OUTPUT REQUIREMENTS:");
  lines.push("- Respond with JSON ONLY (no markdown, no commentary).");
  if (args.kind === "plan") {
    lines.push("- JSON must match: { summary: string, steps: Array<{ id, title, type, assignedTo? }> }");
    lines.push(`- type must be one of: "analysis" | "execution" | "communication" | "review"`);
    lines.push("- Keep steps <= 8 unless absolutely necessary.");
  } else if (args.kind === "step") {
    lines.push(
      '- JSON must match: { summary: string, status: "completed"|"blocked"|"needs_input", output?: string, shouldEscalate?: boolean, messageToAgent?: { to: string, content: string } }',
    );
  } else {
    lines.push(
      '- JSON must match: { summary: string, confidence: number, nextAction: "continue"|"request_help"|"escalate", note: string }',
    );
  }

  return {
    systemPrompt: agentSystemPrompt(args.agentId),
    userPrompt: lines.join("\n"),
  };
};
