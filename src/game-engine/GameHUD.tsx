"use client";

import type { DashboardSkin } from "@/presentation/theme/skins";
import type { LLMRuntimeMeta } from "@/domain/types";

type Summary = { activeAgents: number; activeTasks: number; queuedTasks: number };

export function GameHUD({
  summary,
  skin,
  onSkinChange,
  llm,
}: {
  summary: Summary;
  skin: DashboardSkin;
  onSkinChange: (s: DashboardSkin) => void;
  llm: LLMRuntimeMeta;
}) {
  const modeBadge = llm.simulationForced ? "SIM" : "LIVE";
  const modeClass = llm.simulationForced
    ? "border-amber-400 bg-amber-950 text-amber-200"
    : "border-emerald-400 bg-emerald-950 text-emerald-200";

  return (
    <header className="flex shrink-0 flex-col gap-1.5 border-b-4 border-black bg-gradient-to-r from-[#1a0f2e] via-[#12081f] to-[#1a0f2e] px-2 py-1.5 font-pixel text-zinc-100 shadow-[0_4px_0_#000] sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="min-w-0">
        <p className="text-[8px] uppercase tracking-[0.3em] text-fuchsia-400/90">Pizza Ops — tactical</p>
        <h1 className="truncate text-sm font-normal leading-tight text-white sm:text-base">
          OpenClaw <span className="text-cyan-300">MD</span> Mission
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <div className="flex flex-wrap gap-1">
          <HudPill label="ag" value={summary.activeAgents} accent="bg-blue-900/90 border-blue-500" />
          <HudPill label="go" value={summary.activeTasks} accent="bg-rose-900/90 border-rose-400" />
          <HudPill label="q" value={summary.queuedTasks} accent="bg-violet-900/90 border-violet-400" />
        </div>

        <div
          className={[
            "border-2 px-1.5 py-0.5 font-pixel text-[9px] uppercase tracking-widest shadow-[2px_2px_0_#000]",
            modeClass,
          ].join(" ")}
        >
          {modeBadge} · {llm.effectiveMode}
        </div>

        <label className="flex items-center gap-1 text-[9px] uppercase tracking-[0.15em] text-zinc-500">
          skin
          <select
            value={skin}
            onChange={(e) => onSkinChange(e.target.value as DashboardSkin)}
            className="border-2 border-black bg-zinc-900 px-1 py-0.5 font-pixel text-[9px] text-lime-200 shadow-[2px_2px_0_#000] focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="control-room">control-room</option>
            <option value="pizzeria">pizzeria</option>
            <option value="minimal">minimal</option>
            <option value="game">🎮 game (NES)</option>
          </select>
        </label>
      </div>
    </header>
  );
}

function HudPill({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div
      className={[
        "flex items-baseline gap-1 border-2 border-black px-1.5 py-0.5 font-pixel text-[9px] uppercase tracking-wider shadow-[2px_2px_0_#000]",
        accent,
      ].join(" ")}
    >
      <span className="text-white/70">{label}</span>
      <span className="text-sm text-white tabular-nums">{value}</span>
    </div>
  );
}
