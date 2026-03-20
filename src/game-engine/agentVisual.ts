import type { Agent, AgentLLMState, AgentMessage } from "@/domain/types";
import type { AgentVisualState } from "./entity";

export const taskStatusIcon = (status: string): string => {
  switch (status) {
    case "in_progress":
      return "🛠";
    case "assigned":
      return "📋";
    case "queued":
      return "⏳";
    case "done":
      return "✅";
    case "failed":
      return "⚠️";
    default:
      return "·";
  }
};

export const resolveVisualState = (
  agent: Agent,
  agentLLM: AgentLLMState | undefined,
  /** Newest-first slice from `state.agentMessages` (no wall-clock reads in render). */
  recentMessages: AgentMessage[],
): AgentVisualState => {
  if (!agent.online) return "offline";

  const hot = recentMessages.slice(0, 5);
  const recentComm = hot.some((m) => m.from === agent.id || m.to === agent.id);
  if (recentComm) return "communicating";

  if (agent.status === "blocked") return "error";
  if (agent.status === "working") return "working";

  if (agentLLM?.lastPhase === "reflect" || agentLLM?.lastPhase === "plan") return "thinking";

  return "idle";
};
