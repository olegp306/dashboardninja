"use client";

import type { Agent, AgentId } from "@/domain/types";
import { DeskStation } from "@/presentation/components/room/DeskStation";

function deskSpanClass(id: AgentId) {
  // Stable layout for known roles; unknown agents will fall back to a default tile.
  switch (id) {
    case "leonardo":
      return "lg:col-span-1";
    case "raphael":
      return "lg:col-span-1";
    case "donatello":
      return "lg:col-span-1";
    case "michelangelo":
      return "lg:col-span-1";
    case "splinter":
      return "lg:col-span-1 lg:row-span-2";
    default:
      return "lg:col-span-1";
  }
}

function deskPositionClass(id: AgentId) {
  switch (id) {
    case "leonardo":
      return "lg:row-start-1 lg:col-start-1";
    case "raphael":
      return "lg:row-start-1 lg:col-start-2";
    case "donatello":
      return "lg:row-start-2 lg:col-start-1";
    case "michelangelo":
      return "lg:row-start-2 lg:col-start-2";
    case "splinter":
      return "lg:row-start-1 lg:col-start-3";
    default:
      return "";
  }
}

export function DeskLayout({
  agents,
  selectedAgentId,
  onSelectAgent,
  currentTaskTitlesById,
}: {
  agents: Agent[];
  selectedAgentId: AgentId;
  onSelectAgent: (id: AgentId) => void;
  currentTaskTitlesById: Record<string, string>;
}) {
  return (
    <div className="relative rounded-3xl border border-zinc-800 bg-[radial-gradient(circle_at_30%_10%,rgba(34,211,238,0.10),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.10),transparent_40%),linear-gradient(to_bottom,rgba(15,23,42,0.40),rgba(0,0,0,0.10))] p-4">
      <div className="absolute inset-0 pointer-events-none rounded-3xl [mask-image:radial-gradient(circle_at_50%_20%,black,transparent_55%)] bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative grid grid-cols-1 gap-3 lg:grid-cols-3 lg:grid-rows-2">
        {agents.map((agent) => {
          const position = deskPositionClass(agent.id);
          const span = deskSpanClass(agent.id);
          const currentTaskTitle =
            agent.currentTaskId ? currentTaskTitlesById[agent.currentTaskId] : null;

          return (
            <div key={agent.id} className={[position, span].join(" ").trim()}>
              <DeskStation
                agent={agent}
                selected={agent.id === selectedAgentId}
                onClick={onSelectAgent}
                currentTaskTitle={currentTaskTitle}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

