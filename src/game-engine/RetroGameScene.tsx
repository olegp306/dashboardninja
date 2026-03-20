"use client";

import { memo, useMemo } from "react";
import type { AgentId, DashboardState } from "@/domain/types";
import { SCENE, TABLE_GRIDS, SPLINTER_GRID, scenePixelSize } from "@/game-engine/scene";
import { auraClassForSplinter } from "@/game-engine/animation";
import { resolveVisualState, taskStatusIcon } from "@/game-engine/agentVisual";
import { useGamePositions } from "@/game-engine/useGamePositions";
import { TableEntity } from "@/game-engine/entities/TableEntity";
import { AgentEntity } from "@/game-engine/entities/AgentEntity";

const TURTLE_STYLE: Record<Exclude<AgentId, "splinter">, { color: string; glyph: string }> = {
  leonardo: { color: "bg-blue-700", glyph: "L" },
  raphael: { color: "bg-red-700", glyph: "R" },
  donatello: { color: "bg-violet-700", glyph: "D" },
  michelangelo: { color: "bg-orange-600", glyph: "M" },
};

const statusProgress = (status: string) => {
  switch (status) {
    case "queued":
      return 0.12;
    case "assigned":
      return 0.28;
    case "in_progress":
      return 0.62;
    case "done":
      return 1;
    case "failed":
      return 0.18;
    default:
      return 0;
  }
};

export const RetroGameScene = memo(function RetroGameScene({
  state,
  selectedAgentId,
  onSelectAgent,
  onSelectTable,
}: {
  state: DashboardState;
  selectedAgentId: AgentId;
  onSelectAgent: (id: AgentId) => void;
  onSelectTable: (id: Exclude<AgentId, "splinter"> | "splinter") => void;
}) {
  const { turtlePositions, splinterPosition } = useGamePositions(state);
  const size = scenePixelSize();

  const tasksByAssignee = useMemo(() => {
    const map: Partial<Record<AgentId, number>> = {};
    for (const a of state.agents) {
      map[a.id] = state.tasks.filter((t) => t.assignedTo === a.id).length;
    }
    return map;
  }, [state.agents, state.tasks]);

  const recentMsgs = useMemo(() => state.agentMessages.slice(0, 14), [state.agentMessages]);

  const bubbleFor = (id: AgentId): { text: string | null; key?: string } => {
    const m = recentMsgs.find((x) => x.from === id || x.to === id);
    if (!m) return { text: null };
    const text = m.content.length > 48 ? `${m.content.slice(0, 45)}…` : m.content;
    return { text, key: m.id };
  };

  const currentTask = (id: Exclude<AgentId, "splinter">) =>
    state.tasks.find((t) => t.assignedTo === id && (t.status === "assigned" || t.status === "in_progress"));

  return (
    <div className="relative w-full overflow-hidden border-4 border-black bg-[#2d1b4e] shadow-[8px_8px_0_#000]">
      {/* CRT / scanlines */}
      <div
        className="pointer-events-none absolute inset-0 z-[5] opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 2px, transparent 4px)",
        }}
      />

      {/* Floor */}
      <div
        className="relative"
        style={{
          width: size.width,
          height: size.height,
          backgroundImage: [
            "linear-gradient(90deg, rgba(0,0,0,0.35) 1px, transparent 1px)",
            "linear-gradient(rgba(0,0,0,0.35) 1px, transparent 1px)",
            "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.06), transparent 45%)",
          ].join(","),
          backgroundSize: `${SCENE.cellPx * 2}px ${SCENE.cellPx * 2}px, ${SCENE.cellPx * 2}px ${SCENE.cellPx * 2}px, 100% 100%`,
        }}
      >
        {/* Walls */}
        <div className="pointer-events-none absolute inset-0 border-[6px] border-[#1a0f2e]" />
        <div className="pointer-events-none absolute left-2 top-2 font-pixel text-[10px] text-white/70">
          TOP-DOWN / NES MODE
        </div>

        {/* Splinter desk (boss) */}
        <TableEntity
          grid={SPLINTER_GRID}
          label="Splinter HQ"
          accent="bg-[#3b2b1a]"
          onClick={() => onSelectTable("splinter")}
          taskCount={state.tasks.filter((t) => t.status === "queued" || t.status === "assigned").length}
          highlight={selectedAgentId === "splinter"}
        />

        {/* Turtle tables */}
        {(Object.keys(TABLE_GRIDS) as Exclude<AgentId, "splinter">[]).map((id) => (
          <TableEntity
            key={id}
            grid={TABLE_GRIDS[id]}
            label={`${id}`}
            accent={id === "leonardo" ? "bg-blue-900/80" : id === "raphael" ? "bg-red-900/80" : id === "donatello" ? "bg-violet-900/80" : "bg-orange-900/80"}
            onClick={() => onSelectTable(id)}
            taskCount={tasksByAssignee[id] ?? 0}
            highlight={selectedAgentId === id}
          />
        ))}

        {/* Splinter character */}
        <div className="absolute z-[8]" style={{ left: splinterPosition.x, top: splinterPosition.y - 8 }}>
          <div className={`pointer-events-none absolute -inset-3 rounded-full bg-amber-400/25 blur-[2px] ${auraClassForSplinter()}`} />
          <button
            type="button"
            onClick={() => onSelectAgent("splinter")}
            className={[
              "relative h-8 w-8 border-4 border-black bg-amber-800 font-pixel text-[12px] text-white shadow-[4px_4px_0_#000]",
              selectedAgentId === "splinter" ? "ring-2 ring-yellow-300" : "",
              "hover:brightness-110",
            ].join(" ")}
            title="Splinter"
            aria-label="Splinter"
          >
            🐀
          </button>
          <div className="mt-0.5 h-1 w-full border-2 border-black bg-black/40">
            <div
              className="h-full bg-amber-300"
              style={{
                width: `${Math.min(100, state.tasks.filter((t) => t.status !== "done").length * 10)}%`,
              }}
            />
          </div>
        </div>

        {/* Turtles */}
        {state.agents
          .filter((a) => a.id !== "splinter")
          .map((agent) => {
            const id = agent.id as Exclude<AgentId, "splinter">;
            const pos = turtlePositions[id];
            const task = currentTask(id);
            const icon = task ? taskStatusIcon(task.status) : "·";
            const progress = task ? statusProgress(task.status) : 0;
            const visual = resolveVisualState(agent, state.agentLLM[agent.id], recentMsgs);
            const st = TURTLE_STYLE[id];
            const bubble = bubbleFor(agent.id);
            return (
              <AgentEntity
                key={agent.id}
                agent={agent}
                x={pos.x}
                y={pos.y}
                visual={visual}
                color={st.color}
                glyph={st.glyph}
                onClick={() => onSelectAgent(agent.id)}
                icon={icon}
                progress={progress}
                bubble={bubble.text}
                bubbleKey={bubble.key}
              />
            );
          })}
      </div>
    </div>
  );
});
