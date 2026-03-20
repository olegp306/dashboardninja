"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AgentId, DashboardState } from "@/domain/types";
import { GameEngine } from "@/game-engine/canvas/gameEngine";
import { preloadSquadSpriteSheets } from "@/game-engine/canvas/spriteImageCache";
import type { HitTarget } from "@/game-engine/canvas/types";

export function GameCanvas({
  state,
  selectedAgentId,
  onSelectAgent,
  onSelectTable,
  recentlyUpdatedTaskIds,
  fallback,
}: {
  state: DashboardState;
  selectedAgentId: AgentId;
  onSelectAgent: (id: AgentId) => void;
  onSelectTable: (id: Exclude<AgentId, "splinter"> | "splinter") => void;
  recentlyUpdatedTaskIds: string[];
  /** Shown if 2D context is unavailable (rare). */
  fallback: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const stateRef = useRef(state);
  const selectedRef = useRef(selectedAgentId);
  const recentRef = useRef(recentlyUpdatedTaskIds);
  const selectAgentRef = useRef(onSelectAgent);
  const selectTableRef = useRef(onSelectTable);

  const [canvasFailed, setCanvasFailed] = useState(false);

  useEffect(() => {
    void preloadSquadSpriteSheets();
  }, []);

  useEffect(() => {
    stateRef.current = state;
    selectedRef.current = selectedAgentId;
    recentRef.current = recentlyUpdatedTaskIds;
    selectAgentRef.current = onSelectAgent;
    selectTableRef.current = onSelectTable;
  }, [state, selectedAgentId, recentlyUpdatedTaskIds, onSelectAgent, onSelectTable]);

  useEffect(() => {
    if (canvasFailed) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const engine = new GameEngine({
      canvas,
      container,
      getState: () => stateRef.current,
      getSelectedAgentId: () => selectedRef.current,
      getRecentlyUpdatedTaskIds: () => recentRef.current,
      onHit: (hit: HitTarget) => {
        if (hit.kind === "agent") selectAgentRef.current(hit.id);
        else if (hit.kind === "table") selectTableRef.current(hit.id);
      },
    });

    if (!engine.canRender) {
      queueMicrotask(() => {
        setCanvasFailed(true);
      });
      return;
    }

    engine.simulation.syncDashboard(stateRef.current);
    engine.start();
    engineRef.current = engine;

    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, [canvasFailed]);

  useEffect(() => {
    engineRef.current?.simulation.syncDashboard(state);
  }, [state]);

  if (canvasFailed) {
    return <>{fallback}</>;
  }

  return (
    <div ref={containerRef} className="relative h-full min-h-0 w-full flex-1 bg-[#0c0618]">
      <canvas ref={canvasRef} className="block h-full w-full touch-none" style={{ imageRendering: "pixelated" }} />
    </div>
  );
}
