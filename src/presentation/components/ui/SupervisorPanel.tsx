"use client";

import { useMemo, useState } from "react";
import type { Agent, AgentId, Task, TaskPriority, TaskStatus } from "@/domain/types";
import { skinTokens, type DashboardSkin } from "@/presentation/theme/skins";
import type { MissionFilters } from "@/presentation/components/room/FiltersBar";
import { TaskPanel } from "@/presentation/components/ui/TaskPanel";

export function SupervisorPanel({
  skin,
  agents,
  tasks,
  filters,
  onFiltersChange,
  createTask,
  patchTask,
  recentlyUpdatedTaskIds,
}: {
  skin: DashboardSkin;
  agents: Agent[];
  tasks: Task[];
  filters: MissionFilters;
  onFiltersChange: (next: MissionFilters) => void;
  createTask: (payload: { title: string; description: string; priority: TaskPriority; assignedTo: AgentId | null }) => Promise<void>;
  patchTask: (taskId: string, patch: { status?: TaskStatus; assignedTo?: AgentId | null }) => Promise<void>;
  recentlyUpdatedTaskIds: string[];
}) {
  const theme = skinTokens[skin];
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    assignedTo: "unassigned" as AgentId | "unassigned",
  });

  const activeTaskCount = useMemo(
    () => tasks.filter((t) => t.status === "assigned" || t.status === "in_progress").length,
    [tasks],
  );
  const onlineCount = useMemo(() => agents.filter((a) => a.online).length, [agents]);

  return (
    <section className={["rounded-2xl border p-4", theme.border, theme.panel].join(" ")}>
      <div className="flex items-center justify-between">
        <h2 className={["text-lg font-semibold", theme.textPrimary].join(" ")}>Supervisor Panel</h2>
        <p className={["text-xs", theme.textMuted].join(" ")}>{skin}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className={["rounded-lg border p-2", theme.border, theme.panelStrong].join(" ")}>
          <p className={["text-[11px]", theme.textMuted].join(" ")}>Active tasks</p>
          <p className={["text-lg font-semibold", theme.textPrimary].join(" ")}>{activeTaskCount}</p>
        </div>
        <div className={["rounded-lg border p-2", theme.border, theme.panelStrong].join(" ")}>
          <p className={["text-[11px]", theme.textMuted].join(" ")}>System health</p>
          <p className={["text-lg font-semibold", theme.textPrimary].join(" ")}>
            {onlineCount}/{agents.length} online
          </p>
        </div>
      </div>

      <form
        className="mt-3 grid grid-cols-1 gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.title.trim() || !form.description.trim()) return;
          void createTask({
            title: form.title.trim(),
            description: form.description.trim(),
            priority: form.priority,
            assignedTo: form.assignedTo === "unassigned" ? null : form.assignedTo,
          });
          setForm((p) => ({ ...p, title: "", description: "" }));
        }}
      >
        <input
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="Task title"
          className={["rounded border px-3 py-2 text-sm", theme.border, theme.panelStrong, theme.textSecondary].join(" ")}
        />
        <input
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="Task description"
          className={["rounded border px-3 py-2 text-sm", theme.border, theme.panelStrong, theme.textSecondary].join(" ")}
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={form.priority}
            onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as TaskPriority }))}
            className={["rounded border px-3 py-2 text-sm", theme.border, theme.panelStrong, theme.textSecondary].join(" ")}
          >
            {(["low", "medium", "high", "critical"] as TaskPriority[]).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={form.assignedTo}
            onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value as AgentId | "unassigned" }))}
            className={["rounded border px-3 py-2 text-sm", theme.border, theme.panelStrong, theme.textSecondary].join(" ")}
          >
            <option value="unassigned">Unassigned</option>
            {agents.filter((a) => a.id !== "splinter").map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className={["rounded px-3 py-2 text-sm font-medium", theme.accentButton].join(" ")}>
          Create Task
        </button>
      </form>

      <div className="mt-4">
        <TaskPanel
          skin={skin}
          agents={agents}
          tasks={tasks}
          filters={filters}
          onFiltersChange={onFiltersChange}
          patchTask={patchTask}
          recentlyUpdatedTaskIds={recentlyUpdatedTaskIds}
        />
      </div>
    </section>
  );
}

