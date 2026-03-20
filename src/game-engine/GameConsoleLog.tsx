"use client";

import { memo, useEffect, useRef } from "react";
import type { AgentLog } from "@/domain/types";

const agentLabel: Record<string, string> = {
  leonardo: "Leonardo",
  raphael: "Raphael",
  donatello: "Donatello",
  michelangelo: "Michelangelo",
  splinter: "Splinter",
};

/** Retro event feed — always visible strip, auto-scroll to latest. */
export const GameConsoleLog = memo(function GameConsoleLog({ logs }: { logs: AgentLog[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const tail = logs.slice(-48);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [logs]);

  return (
    <div className="flex h-[7.25rem] shrink-0 flex-col border-t-4 border-black bg-[#080510] font-pixel shadow-[0_-4px_0_#000]">
      <div className="flex shrink-0 items-center justify-between border-b border-emerald-900/50 bg-black/40 px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-emerald-500/90">
        <span className="text-cyan-400/90">◆ mission log</span>
        <span className="text-zinc-500">{logs.length} lines</span>
      </div>
      <div
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-1.5 text-[10px] leading-snug text-lime-100/95"
        ref={ref}
      >
        {tail.length === 0 ? (
          <p className="text-zinc-600">… standing by for field reports …</p>
        ) : (
          <ul className="space-y-1">
            {tail.map((log) => {
              const who = agentLabel[log.agentId] ?? log.agentId;
              const line = formatEventLine(who, log.message);
              return (
                <li key={log.id} className="flex gap-2 border-l-2 border-l-fuchsia-500/50 pl-2">
                  <span
                    className={[
                      "shrink-0 font-bold",
                      log.level === "error" ? "text-rose-400" : log.level === "warn" ? "text-amber-300" : "text-cyan-400",
                    ].join(" ")}
                  >
                    {log.level === "error" ? "!" : log.level === "warn" ? "?" : ">"}
                  </span>
                  <span className="min-w-0 break-words text-zinc-100">{line}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
});

function formatEventLine(who: string, message: string): string {
  const m = message.trim();
  if (m.length < 72) return `${who}: ${m}`;
  return `${who}: ${m.slice(0, 68)}…`;
}
