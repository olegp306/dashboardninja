"use client";

import { memo, useMemo } from "react";
import type { AgentId, DashboardState } from "@/domain/types";
import { GameCanvas } from "@/game-engine/canvas/GameCanvas";

export const RetroGameScene = memo(function RetroGameScene({
  state,
  selectedAgentId,
  onSelectAgent,
  onSelectTable,
  recentlyUpdatedTaskIds,
}: {
  state: DashboardState;
  selectedAgentId: AgentId;
  onSelectAgent: (id: AgentId) => void;
  onSelectTable: (id: Exclude<AgentId, "splinter"> | "splinter") => void;
  recentlyUpdatedTaskIds: string[];
}) {
  const fallback = useMemo(
    () => (
      <div className="flex h-full min-h-[280px] flex-col gap-3 border-4 border-dashed border-zinc-600 bg-zinc-900/80 p-4 font-pixel text-xs text-zinc-300">
        <p className="text-amber-200/90">Canvas renderer unavailable. Use quick-select below (same wiring as the scene).</p>
        <div className="flex flex-wrap gap-2">
          {state.agents.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onSelectAgent(a.id)}
              className={[
                "border-2 border-black px-2 py-1 shadow-[2px_2px_0_#000]",
                selectedAgentId === a.id ? "bg-yellow-900/80 text-yellow-100" : "bg-zinc-800 text-zinc-200",
              ].join(" ")}
            >
              {a.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-zinc-700 pt-2">
          <span className="text-zinc-500">tables:</span>
          <button
            type="button"
            className="border-2 border-black bg-amber-950 px-2 py-1 text-amber-100 shadow-[2px_2px_0_#000]"
            onClick={() => onSelectTable("splinter")}
          >
            Splinter HQ
          </button>
          {(["leonardo", "raphael", "donatello", "michelangelo"] as const).map((id) => (
            <button
              key={id}
              type="button"
              className="border-2 border-black bg-zinc-800 px-2 py-1 text-zinc-200 shadow-[2px_2px_0_#000]"
              onClick={() => onSelectTable(id)}
            >
              {id}
            </button>
          ))}
        </div>
      </div>
    ),
    [onSelectAgent, onSelectTable, selectedAgentId, state.agents],
  );

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden border-4 border-black bg-[#0b0614] shadow-[6px_6px_0_#000]">
      <GameCanvas
        state={state}
        selectedAgentId={selectedAgentId}
        onSelectAgent={onSelectAgent}
        onSelectTable={onSelectTable}
        recentlyUpdatedTaskIds={recentlyUpdatedTaskIds}
        fallback={fallback}
      />
    </div>
  );
});
