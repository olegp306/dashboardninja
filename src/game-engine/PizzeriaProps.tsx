"use client";

import { memo } from "react";
import { SCENE, gridToPixel } from "@/game-engine/scene";
import type { GridPos } from "@/game-engine/entity";

const Block = ({ grid, w, h, label, className }: { grid: GridPos; w: number; h: number; label: string; className: string }) => {
  const p = gridToPixel(grid);
  return (
    <div
      className={["pointer-events-none absolute border-4 border-black font-pixel text-[8px] leading-tight text-white shadow-[4px_4px_0_#000]", className].join(" ")}
      style={{
        left: p.x,
        top: p.y,
        width: w * SCENE.cellPx,
        height: h * SCENE.cellPx,
      }}
    >
      <div className="border-b-2 border-black/40 bg-black/30 px-1 py-0.5 text-[7px] uppercase tracking-wider">{label}</div>
    </div>
  );
};

/** Decorative pizzeria / arcade props (non-interactive). */
export const PizzeriaProps = memo(function PizzeriaProps() {
  return (
    <>
      <Block grid={{ gx: 4, gy: 10 }} w={6} h={5} label="🍕 counter" className="bg-amber-900/85" />
      <Block grid={{ gx: 44, gy: 8 }} w={7} h={6} label="🕹 arcade" className="bg-fuchsia-950/80" />
      <Block grid={{ gx: 24, gy: 30 }} w={8} h={3} label="🚪 kitchen" className="bg-zinc-800/90" />
      <div
        className="pointer-events-none absolute left-1/2 top-3 z-[4] -translate-x-1/2 border-4 border-pink-400 bg-pink-600 px-3 py-1 font-pixel text-[10px] uppercase tracking-[0.2em] text-white shadow-[4px_4px_0_#000] animate-nes-neon"
        style={{ imageRendering: "pixelated" }}
      >
        Pizza Ops
      </div>
    </>
  );
});
