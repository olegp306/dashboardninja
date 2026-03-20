"use client";

import type { Agent, AgentId, AgentLLMState, LLMRuntimeMeta } from "@/domain/types";
import { TurtleAvatar } from "@/presentation/components/room/TurtleAvatar";
import { timeAgo } from "@/presentation/utils/timeAgo";
import type { DashboardSkin } from "@/presentation/theme/skins";
import { designTokens, skinTokens, statusTokens } from "@/presentation/theme/skins";
import { BrainBadge } from "@/presentation/components/ui/BrainBadge";

export function AgentCard({
  agent,
  skin,
  selected,
  currentTaskTitle,
  onSelect,
  llm,
  agentLLM,
}: {
  agent: Agent;
  skin: DashboardSkin;
  selected: boolean;
  currentTaskTitle: string | null;
  onSelect: (id: AgentId) => void;
  llm: LLMRuntimeMeta;
  agentLLM?: AgentLLMState;
}) {
  const theme = skinTokens[skin];
  const status = statusTokens[agent.status];

  return (
    <button
      type="button"
      onClick={() => onSelect(agent.id)}
      className={[
        "w-full min-h-[186px] border p-4 text-left transition duration-200",
        "hover:scale-[1.02]",
        designTokens.radius.card,
        theme.cardHover,
        theme.border,
        theme.table ?? theme.panel,
        selected ? `ring-2 ${theme.accentRing}` : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <TurtleAvatar agent={agent} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className={["truncate text-base font-semibold", theme.textPrimary].join(" ")}>{agent.name}</h3>
            <span
              className={[
                "h-2.5 w-2.5 rounded-full animate-pulse",
                status.dot,
                status.glow,
              ].join(" ")}
              title={agent.online ? "online" : "offline"}
            />
          </div>
          <p className={["mt-1 text-xs uppercase tracking-wide", theme.textMuted].join(" ")}>
            {agent.role.replaceAll("_", " ")}
          </p>
          <div className="mt-2">
            <span className={["inline-flex rounded-full px-2 py-0.5 text-[11px]", status.chip].join(" ")}>
              {agent.status}
            </span>
          </div>
          <p className={["mt-3 text-xs", theme.textSecondary].join(" ")}>
            Task:{" "}
            <span className={["font-medium", theme.textPrimary].join(" ")}>
              {currentTaskTitle ?? "None"}
            </span>
          </p>
          <p className={["mt-1 text-[11px]", theme.textMuted].join(" ")}>
            Last heartbeat: {timeAgo(agent.lastHeartbeatAt)}
          </p>
          <BrainBadge skin={skin} provider={agentLLM?.provider ?? llm.effectiveMode} meta={llm} lastTokens={agentLLM?.lastTokens} />
        </div>
      </div>
    </button>
  );
}

