"use client";

import { useMemo, useState } from "react";
import { useMissionStream } from "@/presentation/hooks/useMissionStream";
import type { AgentId } from "@/domain/types";
import { DeskLayout } from "@/presentation/components/room/DeskLayout";
import { AgentDetailPanel } from "@/presentation/components/room/AgentDetailPanel";
import { SplinterSupervisorPanel } from "@/presentation/components/room/SplinterSupervisorPanel";
import type { MissionFilters } from "@/presentation/components/room/FiltersBar";

export function MissionControl() {
  const { state, summary, loading, error, createTask, patchTask } = useMissionStream();
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>("leonardo");
  const [filters, setFilters] = useState<MissionFilters>({
    status: "queued",
    priority: "any",
    assignedTo: "any",
  });

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
    <div className="relative space-y-5">
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.12),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.10),transparent_40%)]" />

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard label="Active agents" value={summary.activeAgents.toString()} />
        <StatCard label="Live tasks" value={summary.activeTasks.toString()} />
        <StatCard label="Queued tasks" value={summary.queuedTasks.toString()} />
      </div>

      {error && (
        <div className="relative rounded-lg border border-amber-700 bg-amber-950/60 px-3 py-2 text-sm text-amber-200">
          {error}
        </div>
      )}

      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">Mission control room</h2>
          <DeskLayout
            agents={state.agents}
            selectedAgentId={selectedAgentId}
            onSelectAgent={setSelectedAgentId}
            currentTaskTitlesById={currentTaskTitlesById}
          />
        </div>

        <div className="lg:col-span-1">
          {selectedAgent ? (
            <AgentDetailPanel
              agent={selectedAgent}
              tasks={tasksForSelectedAgent}
              logs={logsForSelectedAgent}
              tasksById={tasksById}
              patchTask={(taskId, patch) => patchTask(taskId, patch)}
            />
          ) : (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm text-zinc-400">
              Select a desk to inspect agent status.
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <SplinterSupervisorPanel
            agents={state.agents}
            tasks={state.tasks}
            createTask={(payload) => createTask(payload)}
            patchTask={(taskId, patch) => patchTask(taskId, patch)}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

