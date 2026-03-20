"use client";

import type { Agent, AgentLog } from "@/domain/types";
import { timeAgo } from "@/presentation/utils/timeAgo";

const sourceTone: Record<AgentLog["source"], string> = {
  system: "bg-zinc-800 text-zinc-100 ring-1 ring-zinc-700/60",
  telegram: "bg-cyan-950/60 text-cyan-100 ring-1 ring-cyan-500/25",
  openclaw: "bg-violet-950/60 text-violet-100 ring-1 ring-violet-500/25",
  supervisor: "bg-amber-950/60 text-amber-100 ring-1 ring-amber-500/25",
};

export function AgentTimeline({ agent, logs }: { agent: Agent; logs: AgentLog[] }) {
  const items = [...logs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 18);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-100">Activity timeline</h3>
        <span className="text-[11px] text-zinc-500">{items.length} events</span>
      </div>
      <div className="mt-1 text-[11px] text-zinc-500">Source: agent {agent.name}</div>

      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-zinc-500">No activity yet.</p>
        ) : (
          items.map((log) => (
            <div key={log.id} className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-zinc-300">{log.message}</p>
                  {log.output ? <p className="mt-1 text-[11px] text-zinc-500 break-words">{log.output}</p> : null}
                </div>
                <div className="shrink-0 text-right">
                  <div className={["inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]", sourceTone[log.source]].join(" ")}>
                    <span className="capitalize">{log.source}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-500">{timeAgo(log.createdAt)}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

