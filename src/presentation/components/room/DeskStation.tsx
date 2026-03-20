"use client";

import type { Agent, AgentId } from "@/domain/types";
import { TurtleAvatar } from "@/presentation/components/room/TurtleAvatar";
import { timeAgo } from "@/presentation/utils/timeAgo";
import type { DashboardSkin } from "@/presentation/theme/skins";
import { skinTokens } from "@/presentation/theme/skins";

const statusBadgeTone: Record<string, string> = {
  idle: "bg-zinc-800 text-zinc-100 ring-1 ring-zinc-700/70",
  working: "bg-emerald-900/70 text-emerald-100 ring-1 ring-emerald-600/35",
  blocked: "bg-amber-900/70 text-amber-100 ring-1 ring-amber-600/35",
  offline: "bg-rose-900/70 text-rose-100 ring-1 ring-rose-600/35",
};

export function DeskStation({
  agent,
  currentTaskTitle,
  selected,
  onClick,
  skin,
}: {
  agent: Agent;
  currentTaskTitle?: string | null;
  selected: boolean;
  onClick: (id: AgentId) => void;
  skin: DashboardSkin;
}) {
  const theme = skinTokens[skin];
  const onlineTone = agent.online ? "bg-emerald-500" : "bg-rose-500";
  const badge = statusBadgeTone[agent.status] ?? statusBadgeTone.idle;

  return (
    <button
      type="button"
      onClick={() => onClick(agent.id)}
      className={[
        "w-full min-h-[172px] text-left transition-transform duration-150",
        "rounded-2xl border p-4",
        "hover:scale-[1.01]",
        theme.cardHover,
        selected ? `ring-2 ${theme.accentRing}` : "",
        theme.border,
        agent.id === "splinter" ? theme.panelStrong : theme.panel,
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <TurtleAvatar agent={agent} size={56} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className={["truncate text-sm font-semibold", theme.textPrimary].join(" ")}>{agent.name}</h3>
            <span className={["h-2.5 w-2.5 rounded-full", onlineTone].join(" ")} title={agent.online ? "Online" : "Offline"} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={["px-2 py-0.5 text-[11px] rounded-full", badge].join(" ")}>{agent.status}</span>
            <span className={["text-[11px]", theme.textSecondary].join(" ")}>{agent.role.replaceAll("_", " ")}</span>
          </div>

          <p className={["mt-2 text-[12px]", theme.textMuted].join(" ")}>{agent.deskLabel}</p>

          <div className="mt-3 space-y-1">
            <p className={["text-xs", theme.textSecondary].join(" ")}>
              Current task:{" "}
              <span className={["font-medium", theme.textPrimary].join(" ")}>
                {agent.currentTaskId ? currentTaskTitle ?? agent.currentTaskId : "None"}
              </span>
            </p>
            <p className={["text-[11px]", theme.textMuted].join(" ")}>
              Heartbeat: <span className={theme.textSecondary}>{timeAgo(agent.lastHeartbeatAt)}</span>
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

