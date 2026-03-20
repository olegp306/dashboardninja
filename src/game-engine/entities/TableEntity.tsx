"use client";

import { memo } from "react";
import { SCENE, gridToPixel } from "@/game-engine/scene";
import type { GridPos } from "@/game-engine/entity";

export const TableEntity = memo(function TableEntity({
  grid,
  label,
  accent,
  onClick,
  taskCount,
  highlight,
}: {
  grid: GridPos;
  label: string;
  accent: string;
  onClick: () => void;
  taskCount: number;
  highlight?: boolean;
}) {
  const pos = gridToPixel(grid);
  const w = 10 * SCENE.cellPx;
  const h = 5 * SCENE.cellPx;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "absolute select-none border-4 border-black text-left font-pixel text-[10px] leading-tight shadow-[4px_4px_0_#000]",
        accent,
        highlight ? "ring-4 ring-yellow-300/80" : "",
      ].join(" ")}
      style={{ left: pos.x, top: pos.y, width: w, height: h }}
      aria-label={`Table ${label}`}
    >
      <div className="border-b-4 border-black/40 bg-black/20 px-1 py-0.5 text-[9px] uppercase tracking-widest text-white">
        {label}
      </div>
      <div className="px-1 py-1 text-[9px] text-white/90">tasks: {taskCount}</div>
    </button>
  );
});
