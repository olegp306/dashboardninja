"use client";

import type { AgentLog } from "@/domain/types";
import { skinTokens, type DashboardSkin } from "@/presentation/theme/skins";

export function ActivityFeed({
  skin,
  logs,
  title = "Activity Feed",
}: {
  skin: DashboardSkin;
  logs: AgentLog[];
  title?: string;
}) {
  const theme = skinTokens[skin];
  return (
    <section className={["rounded-2xl border p-4", theme.border, theme.panelMuted].join(" ")}>
      <h3 className={["text-sm font-semibold", theme.textPrimary].join(" ")}>{title}</h3>
      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        {logs.slice(0, 10).map((log) => (
          <div key={log.id} className={["rounded-lg border p-2", theme.border, theme.panelStrong].join(" ")}>
            <p className={["text-xs", theme.textSecondary].join(" ")}>{log.agentId} | {log.message}</p>
            <p className={["text-[11px]", theme.textMuted].join(" ")}>
              {new Date(log.createdAt).toLocaleTimeString()} | {log.source}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

