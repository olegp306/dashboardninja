"use client";

import type { Agent, AgentId, Task, TaskPriority, TaskStatus } from "@/domain/types";
import { FiltersBar, type MissionFilters } from "@/presentation/components/room/FiltersBar";
import type { DashboardSkin } from "@/presentation/theme/skins";
import { skinTokens } from "@/presentation/theme/skins";

const statusList: TaskStatus[] = ["queued", "assigned", "in_progress", "done", "failed"];
const priorityOrder: Record<TaskPriority, number> = { low: 0, medium: 1, high: 2, critical: 3 };

export function TaskPanel({
  skin,
  agents,
  tasks,
  filters,
  onFiltersChange,
  patchTask,
  recentlyUpdatedTaskIds,
}: {
  skin: DashboardSkin;
  agents: Agent[];
  tasks: Task[];
  filters: MissionFilters;
  onFiltersChange: (next: MissionFilters) => void;
  patchTask: (taskId: string, patch: { status?: TaskStatus; assignedTo?: AgentId | null }) => Promise<void>;
  recentlyUpdatedTaskIds: string[];
}) {
  const theme = skinTokens[skin];
  const filtered = tasks
    .filter((t) => (filters.status === "any" ? true : t.status === filters.status))
    .filter((t) => (filters.priority === "any" ? true : t.priority === filters.priority))
    .filter((t) => (filters.assignedTo === "any" ? true : (t.assignedTo ?? "unassigned") === filters.assignedTo))
    .sort((a, b) => {
      const p = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (p !== 0) return p;
      return b.updatedAt.localeCompare(a.updatedAt);
    });

  return (
    <div className={["space-y-3 rounded-xl border p-3", theme.border, theme.panelMuted].join(" ")}>
      <FiltersBar
        filters={filters}
        onChange={onFiltersChange}
        agents={agents.map((a) => ({ id: a.id, name: a.name }))}
        skin={skin}
      />
      <div className="space-y-2">
        {filtered.slice(0, 10).map((task) => (
          <div
            key={task.id}
            className={[
              "rounded-lg border p-2 transition-colors duration-500",
              theme.border,
              theme.panelStrong,
              recentlyUpdatedTaskIds.includes(task.id) ? "bg-cyan-900/25" : "",
            ].join(" ")}
          >
            <p className={["truncate text-sm font-medium", theme.textPrimary].join(" ")}>{task.title}</p>
            <p className={["mt-1 text-[11px]", theme.textMuted].join(" ")}>{task.priority} | {task.status}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select
                value={task.assignedTo ?? "unassigned"}
                onChange={(e) => void patchTask(task.id, { assignedTo: e.target.value === "unassigned" ? null : (e.target.value as AgentId) })}
                className={["rounded px-2 py-1 text-xs", theme.panelStrong, theme.textSecondary].join(" ")}
              >
                <option value="unassigned">Unassigned</option>
                {agents.filter((a) => a.id !== "splinter").map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <select
                value={task.status}
                onChange={(e) => void patchTask(task.id, { status: e.target.value as TaskStatus })}
                className={["rounded px-2 py-1 text-xs", theme.panelStrong, theme.textSecondary].join(" ")}
              >
                {statusList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

