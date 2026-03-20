"use client";

import { memo } from "react";
import type { Agent } from "@/domain/types";
import type { AgentVisualState } from "@/game-engine/entity";
import { animationClassForAgent, animationClassWalking } from "@/game-engine/animation";

export const AgentSprite = memo(function AgentSprite({
  agent,
  x,
  y,
  visual,
  walking,
  selected,
  color,
  glyph,
  onClick,
  icon,
  progress,
  bubble,
  bubbleKey,
  thinkingOverlay,
  criticalFlash,
}: {
  agent: Agent;
  x: number;
  y: number;
  visual: AgentVisualState;
  walking: boolean;
  selected: boolean;
  color: string;
  glyph: string;
  onClick: () => void;
  icon: string;
  progress: number;
  bubble?: string | null;
  bubbleKey?: string;
  /** Extra overlay e.g. "..." for thinking */
  thinkingOverlay?: boolean;
  /** Urgent / critical mission marker */
  criticalFlash?: boolean;
}) {
  const unit = 32;
  const bodyAnim = walking ? animationClassWalking(true) : animationClassForAgent(visual);

  return (
    <div className="absolute" style={{ left: x, top: y, width: unit, height: unit + 18, zIndex: 12 }}>
      {/* Task / status icon */}
      <div className="pointer-events-none absolute -top-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-0 font-pixel text-[13px] leading-none drop-shadow-[2px_2px_0_#000]">
        {criticalFlash ? (
          <span className="animate-pulse text-[11px] text-yellow-300">⚡</span>
        ) : null}
        <span>{icon}</span>
      </div>

      {visual === "error" ? (
        <div className="pointer-events-none absolute -top-[3.25rem] left-1/2 z-30 -translate-x-1/2 font-pixel text-[14px] text-amber-300 drop-shadow-[2px_2px_0_#000]">
          ❗
        </div>
      ) : null}

      {bubble ? (
        <div
          key={bubbleKey ?? bubble}
          className="pointer-events-none absolute -top-[2.75rem] left-1/2 z-30 max-w-[160px] -translate-x-1/2 animate-nes-bubble border-2 border-black bg-white px-1.5 py-0.5 font-pixel text-[8px] leading-tight text-black shadow-[3px_3px_0_#000]"
        >
          💬 {bubble}
        </div>
      ) : null}

      {thinkingOverlay ? (
        <div className="pointer-events-none absolute -top-6 left-1/2 z-25 -translate-x-1/2 rounded border-2 border-black bg-zinc-900 px-1 font-pixel text-[9px] text-lime-200 shadow-[2px_2px_0_#000]">
          …
        </div>
      ) : null}

      {/* Shadow */}
      <div
        className="pointer-events-none absolute bottom-1 left-1/2 z-0 h-2 w-[70%] -translate-x-1/2 rounded-[100%] bg-black/55 blur-[1px]"
        style={{ width: unit * 0.72 }}
      />

      <button
        type="button"
        onClick={onClick}
        className={[
          "relative z-10 h-8 w-8 border-4 border-black font-pixel text-[15px] leading-none shadow-[4px_4px_0_#000]",
          color,
          bodyAnim,
          selected ? "ring-4 ring-yellow-300 ring-offset-2 ring-offset-[#1e1236]" : "",
          visual === "error" ? "animate-nes-error" : "",
          "hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-cyan-300",
        ].join(" ")}
        aria-label={agent.name}
        title={agent.name}
      >
        <span className="flex h-full w-full items-center justify-center drop-shadow-[1px_1px_0_#000]">{glyph}</span>
      </button>

      {/* Name plate */}
      <div className="pointer-events-none absolute -bottom-5 left-1/2 z-10 w-max min-w-[3rem] -translate-x-1/2 border-2 border-black bg-black/80 px-1 text-center font-pixel text-[7px] uppercase leading-none text-white shadow-[2px_2px_0_#000]">
        {agent.name.split(" ")[0] ?? agent.name}
      </div>

      {/* Progress */}
      <div className="absolute -bottom-[1.15rem] left-0 right-0 h-1 border-2 border-black bg-zinc-900">
        <div
          className={[
            "h-full",
            visual === "error" ? "bg-rose-500" : visual === "offline" ? "bg-zinc-600" : "bg-emerald-400",
          ].join(" ")}
          style={{ width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` }}
        />
      </div>
    </div>
  );
});
