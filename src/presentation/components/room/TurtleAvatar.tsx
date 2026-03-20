"use client";

import type { Agent } from "@/domain/types";

const palettes = [
  { gradient: "from-blue-500/20 to-blue-900/35 border-blue-500/40", glow: "shadow-[0_0_26px_rgba(59,130,246,0.35)]" },
  { gradient: "from-red-500/20 to-red-900/35 border-red-500/40", glow: "shadow-[0_0_26px_rgba(239,68,68,0.35)]" },
  { gradient: "from-purple-500/20 to-purple-900/35 border-purple-500/40", glow: "shadow-[0_0_26px_rgba(168,85,247,0.35)]" },
  { gradient: "from-orange-500/20 to-orange-900/35 border-orange-500/40", glow: "shadow-[0_0_26px_rgba(249,115,22,0.35)]" },
  { gradient: "from-amber-500/20 to-amber-900/35 border-amber-500/40", glow: "shadow-[0_0_26px_rgba(245,158,11,0.35)]" },
] as const;

function hashString(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

export function TurtleAvatar({ agent, size = 56 }: { agent: Agent; size?: number }) {
  const palette = palettes[hashString(agent.avatarSeed + agent.id) % palettes.length];

  return (
    <div
      className={[
        "relative flex items-center justify-center rounded-2xl border bg-zinc-950/40",
        palette.gradient,
        palette.glow,
      ].join(" ")}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.16),transparent_60%)]" />
      <svg width={Math.max(24, size - 18)} height={Math.max(24, size - 18)} viewBox="0 0 64 64" className="relative">
        {/* Stylized turtle shell (purely geometric placeholder). */}
        <path
          d="M32 10c-12 0-20 9-20 20 0 18 10 24 20 24s20-6 20-24c0-11-8-20-20-20Z"
          fill="rgba(17,24,39,0.35)"
        />
        <path
          d="M32 13c-10.5 0-17.5 8-17.5 17.5 0 15.5 9 21 17.5 21s17.5-5.5 17.5-21C49.5 21 42.5 13 32 13Z"
          fill="rgba(0,0,0,0)"
          stroke="rgba(255,255,255,0.20)"
          strokeWidth="2"
        />
        <path
          d="M32 20c-7 0-12 5-12 12 0 10 5.5 14 12 14s12-4 12-14c0-7-5-12-12-12Z"
          fill="rgba(255,255,255,0.06)"
        />
        {/* Face */}
        <circle cx="26.5" cy="31" r="2.2" fill="rgba(255,255,255,0.35)" />
        <circle cx="37.5" cy="31" r="2.2" fill="rgba(255,255,255,0.35)" />
        <path
          d="M30 37c1.2 1 2.8 1 4 0"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute bottom-1 right-2 text-[10px] font-semibold text-zinc-200/90">
        {agent.name.split(" ")[0]}
      </div>
    </div>
  );
}

