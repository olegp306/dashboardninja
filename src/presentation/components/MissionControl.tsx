"use client";

import { useMemo, useState } from "react";
import { useMissionStream } from "@/presentation/hooks/useMissionStream";
import type { AgentId } from "@/domain/types";
import { DeskLayout } from "@/presentation/components/room/DeskLayout";
import { AgentDetailPanel } from "@/presentation/components/room/AgentDetailPanel";
import { SplinterSupervisorPanel } from "@/presentation/components/room/SplinterSupervisorPanel";
import type { MissionFilters } from "@/presentation/components/room/FiltersBar";
import type { DashboardSkin } from "@/presentation/theme/skins";
import { skinTokens } from "@/presentation/theme/skins";

export function MissionControl() {
  const { state, summary, loading, error, createTask, patchTask } = useMissionStream();
  const [skin, setSkin] = useState<DashboardSkin>("control-room");
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>("leonardo");
  const [filters, setFilters] = useState<MissionFilters>({
    status: "queued",
    priority: "any",
    assignedTo: "any",
  });
  const theme = skinTokens[skin];

  const selectedAgent = useMemo(
    () => state?.agents.find((agent) => agent.id === selectedAgentId) ?? null,
    [state, selectedAgentId],
  );

  const tasksById = useMemo(() => {
    if (!state) return {};
    return state.tasks.reduce<Record<string, (typeof state.tasks)[number]>>((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {});
  }, [state]);

  const currentTaskTitlesById = useMemo(() => {
    if (!state) return {};
    return state.tasks.reduce<Record<string, string>>((acc, task) => {
      acc[task.id] = task.title;
      return acc;
    }, {});
  }, [state]);

  const tasksForSelectedAgent = useMemo(() => {
    if (!state) return [];
    return state.tasks.filter((task) => task.assignedTo === selectedAgentId);
  }, [state, selectedAgentId]);

  const logsForSelectedAgent = useMemo(() => {
    if (!state) return [];
    return state.logs.filter((log) => log.agentId === selectedAgentId);
  }, [state, selectedAgentId]);

  if (loading || !state || !summary) {
    return <div className="text-zinc-300">Initializing control room...</div>;
  }

  return (
    <div className={["space-y-4", theme.page].join(" ")}>
      <header className={["rounded-2xl border p-4", theme.border, theme.panel].join(" ")}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={["text-xs uppercase tracking-widest", theme.textMuted].join(" ")}>Dashboard Ninja</p>
            <h1 className={["mt-1 text-2xl font-semibold", theme.textPrimary].join(" ")}>
              OpenClaw Multi-Agent Mission Control
            </h1>
          </div>
          <div className="w-full md:w-auto">
            <label className={["text-xs", theme.textMuted].join(" ")}>Skin</label>
            <select
              value={skin}
              onChange={(e) => setSkin(e.target.value as DashboardSkin)}
              className={["mt-1 w-full md:w-48 rounded border px-2 py-2 text-sm", theme.border, theme.panelStrong, theme.textSecondary].join(" ")}
            >
              <option value="control-room">control-room</option>
              <option value="pizzeria">pizzeria</option>
              <option value="minimal">minimal</option>
            </select>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard theme={theme} label="Active agents" value={summary.activeAgents.toString()} />
          <StatCard theme={theme} label="Live tasks" value={summary.activeTasks.toString()} />
          <StatCard theme={theme} label="Queued tasks" value={summary.queuedTasks.toString()} />
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-amber-700 bg-amber-950/60 px-3 py-2 text-sm text-amber-200">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8 space-y-4">
          <div>
            <h2 className={["mb-2 text-lg font-semibold", theme.textPrimary].join(" ")}>Mission room agents</h2>
            <DeskLayout
              agents={state.agents}
              selectedAgentId={selectedAgentId}
              onSelectAgent={setSelectedAgentId}
              currentTaskTitlesById={currentTaskTitlesById}
              skin={skin}
            />
          </div>

          <div>
            {selectedAgent ? (
              <AgentDetailPanel
                agent={selectedAgent}
                tasks={tasksForSelectedAgent}
                logs={logsForSelectedAgent}
                tasksById={tasksById}
                patchTask={(taskId, patch) => patchTask(taskId, patch)}
                skin={skin}
              />
            ) : (
              <div className={["rounded-2xl border p-5 text-sm", theme.border, theme.panel, theme.textMuted].join(" ")}>
                Select an agent card to inspect details.
              </div>
            )}
          </div>
        </div>

        <aside className="xl:col-span-4">
          <SplinterSupervisorPanel
            agents={state.agents}
            tasks={state.tasks}
            createTask={(payload) => createTask(payload)}
            patchTask={(taskId, patch) => patchTask(taskId, patch)}
            filters={filters}
            onFiltersChange={setFilters}
            skin={skin}
          />
        </aside>
      </section>

      <section className={["rounded-2xl border p-4", theme.border, theme.panelMuted].join(" ")}>
        <h2 className={["text-sm font-semibold", theme.textPrimary].join(" ")}>Global activity log</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          {state.logs.slice(0, 10).map((log) => (
            <div key={log.id} className={["rounded-lg border p-2", theme.border, theme.panelStrong].join(" ")}>
              <p className={["text-xs", theme.textSecondary].join(" ")}>{log.agentId}: {log.message}</p>
              <p className={["text-[11px]", theme.textMuted].join(" ")}>{new Date(log.createdAt).toLocaleTimeString()} | {log.source}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  theme,
  label,
  value,
}: {
  theme: (typeof skinTokens)[DashboardSkin];
  label: string;
  value: string;
}) {
  return (
    <div className={["rounded-lg border px-4 py-3", theme.border, theme.panelStrong].join(" ")}>
      <p className={["text-xs uppercase tracking-wide", theme.textMuted].join(" ")}>{label}</p>
      <p className={["mt-1 text-2xl font-semibold", theme.textPrimary].join(" ")}>{value}</p>
    </div>
  );
}

