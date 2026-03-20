"use client";

import type { AgentId, TaskPriority, TaskStatus } from "@/domain/types";

export type MissionFilters = {
  status: TaskStatus | "any";
  priority: TaskPriority | "any";
  assignedTo: AgentId | "any";
};

export function FiltersBar({
  filters,
  onChange,
  agents,
}: {
  filters: MissionFilters;
  onChange: (next: MissionFilters) => void;
  agents: { id: AgentId; name: string }[];
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div>
          <label className="text-[11px] text-zinc-500">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value as MissionFilters["status"] })}
            className="mt-1 w-full rounded bg-zinc-800 px-2 py-2 text-sm text-zinc-200"
          >
            <option value="any">Any</option>
            {(["queued", "assigned", "in_progress", "done", "failed"] as TaskStatus[]).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] text-zinc-500">Priority</label>
          <select
            value={filters.priority}
            onChange={(e) => onChange({ ...filters, priority: e.target.value as MissionFilters["priority"] })}
            className="mt-1 w-full rounded bg-zinc-800 px-2 py-2 text-sm text-zinc-200"
          >
            <option value="any">Any</option>
            {(["low", "medium", "high", "critical"] as TaskPriority[]).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] text-zinc-500">Assigned to</label>
          <select
            value={filters.assignedTo}
            onChange={(e) =>
              onChange({ ...filters, assignedTo: e.target.value as MissionFilters["assignedTo"] })
            }
            className="mt-1 w-full rounded bg-zinc-800 px-2 py-2 text-sm text-zinc-200"
          >
            <option value="any">Any</option>
            {agents
              .filter((a) => a.id !== "splinter")
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
}

