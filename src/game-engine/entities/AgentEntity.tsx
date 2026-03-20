"use client";

import { memo } from "react";
import type { Agent } from "@/domain/types";
import type { AgentVisualState } from "@/game-engine/entity";
import { animationClassForAgent } from "@/game-engine/animation";

export const AgentEntity = memo(function AgentEntity({
  agent,
  x,
  y,
  visual,
  color,
  glyph,
  onClick,
  icon,
  progress,
  bubble,
  bubbleKey,
}: {
  agent: Agent;
  x: number;
  y: number;
  visual: AgentVisualState;
  color: string;
  glyph: string;
  onClick: () => void;
  icon: string;
  progress: number;
  bubble?: string | null;
  bubbleKey?: string;
}) {
  const w = 28;
  const h = 28;

  return (
    <div className="absolute" style={{ left: x, top: y, width: w, height: h, zIndex: 10 }}>
      {bubble ? (
        <div
          key={bubbleKey ?? bubble}
          className="pointer-events-none absolute -top-10 left-1/2 z-20 max-w-[140px] -translate-x-1/2 animate-nes-bubble border-2 border-black bg-white px-1.5 py-0.5 font-pixel text-[8px] leading-tight text-black shadow-[3px_3px_0_#000]"
        >
          💬 {bubble}
        </div>
      ) : null}

      <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 font-pixel text-[12px] leading-none drop-shadow-[2px_2px_0_#000]">
        {icon}
      </div>

      <button
        type="button"
        onClick={onClick}
        className={[
          "relative h-7 w-7 border-4 border-black font-pixel text-[14px] leading-none shadow-[3px_3px_0_#000] transition-transform",
          color,
          animationClassForAgent(visual),
          "hover:brightness-110 hover:ring-2 hover:ring-yellow-200 focus:outline-none focus:ring-2 focus:ring-cyan-300",
        ].join(" ")}
        aria-label={agent.name}
        title={agent.name}
      >
        <span className="flex h-full w-full items-center justify-center drop-shadow-[1px_1px_0_#000]">{glyph}</span>
      </button>

      <div className="mt-0.5 h-1 w-full border-2 border-black bg-black/40">
        <div
          className="h-full bg-emerald-400"
          style={{ width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` }}
        />
      </div>
    </div>
  );
});
