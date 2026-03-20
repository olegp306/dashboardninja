"use client";

import type { Agent, AgentId, AgentLLMState, LLMRuntimeMeta } from "@/domain/types";
import { TurtleAvatar } from "@/presentation/components/room/TurtleAvatar";
import { statusTokens, skinTokens, type DashboardSkin } from "@/presentation/theme/skins";
import { AgentBrainBadge } from "@/presentation/components/ui/BrainBadge";

export function AgentTable({
  agent,
  skin,
  selected,
  taskTitle,
  onSelect,
  large,
  subtitle,
  llm,
  agentLLM,
}: {
  agent: Agent;
  skin: DashboardSkin;
  selected: boolean;
  taskTitle: string | null;
  onSelect: (id: AgentId) => void;
  large?: boolean;
  subtitle?: string;
  llm: LLMRuntimeMeta;
  agentLLM?: AgentLLMState;
}) {
  const theme = skinTokens[skin];
  const st = statusTokens[agent.status];

  return (
    <button
      type="button"
      onClick={() => onSelect(agent.id)}
      className={[
        "group border transition duration-200 hover:scale-[1.03] p-3",
        "relative overflow-hidden",
        large ? "min-h-[210px] rounded-[28px]" : "min-h-[170px] rounded-[24px]",
        theme.border,
        theme.table ?? theme.panel,
        selected ? `ring-2 ${theme.accentRing}` : "",
      ].join(" ")}
    >
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div
          className={[
            "mb-3 rounded-full border p-2 transition",
            large ? "h-28 w-28" : "h-22 w-22",
            "bg-zinc-950/35",
            st.glow,
          ].join(" ")}
        >
          <div className="flex h-full w-full items-center justify-center">
            <TurtleAvatar agent={agent} size={large ? 72 : 58} />
          </div>
        </div>
        <p className={["text-sm font-semibold", theme.textPrimary].join(" ")}>{agent.name}</p>
        <p className={["mt-1 text-xs", theme.textMuted].join(" ")}>{subtitle ?? agent.role.replaceAll("_", " ")}</p>
        <p className={["mt-2 text-xs", theme.textSecondary].join(" ")}>
          {taskTitle ? taskTitle : "No active task"}
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <AgentBrainBadge agentLLM={agentLLM} />
          <span className={["text-[10px]", theme.textMuted].join(" ")}>
            {llm.simulationForced ? "sim" : "live"} · {llm.effectiveMode}
          </span>
        </div>
      </div>
      <span
        className={[
          "absolute right-3 top-3 h-2.5 w-2.5 rounded-full animate-pulse",
          st.dot,
          st.glow,
        ].join(" ")}
      />
    </button>
  );
}

