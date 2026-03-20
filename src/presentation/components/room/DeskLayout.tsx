"use client";

import type { Agent, AgentId } from "@/domain/types";
import { DeskStation } from "@/presentation/components/room/DeskStation";
import type { DashboardSkin } from "@/presentation/theme/skins";
import { skinTokens } from "@/presentation/theme/skins";

export function DeskLayout({
  agents,
  selectedAgentId,
  onSelectAgent,
  currentTaskTitlesById,
  skin,
}: {
  agents: Agent[];
  selectedAgentId: AgentId;
  onSelectAgent: (id: AgentId) => void;
  currentTaskTitlesById: Record<string, string>;
  skin: DashboardSkin;
}) {
  const theme = skinTokens[skin];
  return (
    <div className={["rounded-2xl border p-4", theme.border, theme.panelMuted].join(" ")}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        {agents.map((agent) => {
          const currentTaskTitle =
            agent.currentTaskId ? currentTaskTitlesById[agent.currentTaskId] : null;

          return (
            <div key={agent.id} className="min-w-0">
              <DeskStation
                agent={agent}
                selected={agent.id === selectedAgentId}
                onClick={onSelectAgent}
                currentTaskTitle={currentTaskTitle}
                skin={skin}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

