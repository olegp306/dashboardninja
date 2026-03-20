"use client";

import type { Agent, AgentId, Task, TaskPriority, TaskStatus } from "@/domain/types";
import { FiltersBar, type MissionFilters } from "@/presentation/components/room/FiltersBar";
import type { DashboardSkin } from "@/presentation/theme/skins";
import { skinTokens } from "@/presentation/theme/skins";

const priorityTone: Record<TaskPriority, { badge: string; dot: string }> = {
  low: { badge: "bg-zinc-800 text-zinc-100", dot: "bg-zinc-400" },
  medium: { badge: "bg-sky-950/70 text-sky-100", dot: "bg-sky-400" },
  high: { badge: "bg-violet-950/70 text-violet-100", dot: "bg-violet-400" },
  critical: { badge: "bg-rose-950/70 text-rose-100", dot: "bg-rose-400" },
};

const statusBadgeTone: Record<TaskStatus, string> = {
  queued: "bg-zinc-800 text-zinc-100 ring-1 ring-zinc-700/60",
  assigned: "bg-sky-950/60 text-sky-100 ring-1 ring-sky-500/25",
  in_progress: "bg-violet-950/60 text-violet-100 ring-1 ring-violet-500/25",
  done: "bg-emerald-950/60 text-emerald-100 ring-1 ring-emerald-500/25",
  failed: "bg-rose-950/60 text-rose-100 ring-1 ring-rose-500/25",
};

const priorityOrder: Record<TaskPriority, number> = { low: 0, medium: 1, high: 2, critical: 3 };

export function MissionQueue({
  agents,
  tasks,
  filters,
  onFiltersChange,
  patchTask,
  skin,
}: {
  agents: Agent[];
  tasks: Task[];
  filters: MissionFilters;
  onFiltersChange: (next: MissionFilters) => void;
  patchTask: (taskId: string, patch: { status?: TaskStatus; assignedTo?: AgentId | null }) => Promise<void>;
  skin: DashboardSkin;
}) {
  const theme = skinTokens[skin];
  const filtered = tasks
    .filter((t) => (filters.status === "any" ? true : t.status === filters.status))
    .filter((t) => (filters.priority === "any" ? true : t.priority === filters.priority))
    .filter((t) => (filters.assignedTo === "any" ? true : (t.assignedTo ?? "unassigned") === filters.assignedTo))
    .sort((a, b) => {
      const byPriority = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (byPriority !== 0) return byPriority;
      return b.updatedAt.localeCompare(a.updatedAt);
    });

  return (
    <div className={["rounded-2xl border p-5", theme.border, theme.panel].join(" ")}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className={["text-lg font-semibold", theme.textPrimary].join(" ")}>Mission queue</h2>
          <p className={["mt-1 text-sm", theme.textMuted].join(" ")}>Visible to Splinter supervisor.</p>
        </div>
      </div>

      <div className="mt-4">
        <FiltersBar
          filters={filters}
          onChange={onFiltersChange}
          agents={agents.map((a) => ({ id: a.id, name: a.name }))}
          skin={skin}
        />
      </div>

      <div className="mt-4 space-y-2">
        {filtered.length === 0 ? (
          <p className={["text-xs", theme.textMuted].join(" ")}>No tasks match the current filters.</p>
        ) : (
          filtered.slice(0, 14).map((task) => {
            const assignedAgent = task.assignedTo ? agents.find((a) => a.id === task.assignedTo) : null;
            return (
              <div key={task.id} className={["rounded-xl border p-3", theme.border, theme.panelMuted].join(" ")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={["text-sm truncate", theme.textPrimary].join(" ")}>{task.title}</p>
                    <p className={["mt-1 text-[11px] truncate", theme.textMuted].join(" ")}>{task.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={["inline-flex items-center rounded-full px-2 py-1 text-[11px] ", statusBadgeTone[task.status]].join(" ")}>
                      {task.status}
                    </span>
                    <div className={["mt-1 text-[11px]", theme.textMuted].join(" ")}>{task.updatedAt ? new Date(task.updatedAt).toLocaleTimeString() : ""}</div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={["inline-flex items-center rounded-full px-2 py-1 text-[11px]", priorityTone[task.priority].badge].join(" ")}>
                    {task.priority}
                  </span>
                  <span className={["text-[11px]", theme.textMuted].join(" ")}>
                    Assigned: {assignedAgent ? assignedAgent.name : "Unassigned"}
                  </span>

                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <select
                      value={task.assignedTo ?? "unassigned"}
                      onChange={(e) => {
                        const assignedTo = e.target.value === "unassigned" ? null : (e.target.value as AgentId);
                        void patchTask(task.id, { assignedTo });
                      }}
                      className={["rounded px-2 py-1 text-xs", theme.panelStrong, theme.textSecondary].join(" ")}
                      aria-label={`Assign ${task.title}`}
                    >
                      <option value="unassigned">Unassigned</option>
                      {agents
                        .filter((a) => a.id !== "splinter")
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                    </select>
                    <select
                      value={task.status}
                      onChange={(e) => {
                        const status = e.target.value as TaskStatus;
                        void patchTask(task.id, { status });
                      }}
                      className={["rounded px-2 py-1 text-xs", theme.panelStrong, theme.textSecondary].join(" ")}
                      aria-label={`Update status for ${task.title}`}
                    >
                      {(["queued", "assigned", "in_progress", "done", "failed"] as TaskStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

