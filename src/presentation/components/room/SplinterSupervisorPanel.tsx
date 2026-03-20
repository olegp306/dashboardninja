"use client";

import { useState } from "react";
import type { Agent, AgentId, Task, TaskPriority, TaskStatus } from "@/domain/types";
import type { MissionFilters } from "@/presentation/components/room/FiltersBar";
import { MissionQueue } from "@/presentation/components/room/MissionQueue";
import type { DashboardSkin } from "@/presentation/theme/skins";
import { skinTokens } from "@/presentation/theme/skins";

export function SplinterSupervisorPanel({
  agents,
  tasks,
  createTask,
  patchTask,
  filters,
  onFiltersChange,
  skin,
}: {
  agents: Agent[];
  tasks: Task[];
  createTask: (payload: { title: string; description: string; priority: TaskPriority; assignedTo: AgentId | null }) => Promise<void>;
  patchTask: (taskId: string, patch: { status?: TaskStatus; assignedTo?: AgentId | null }) => Promise<void>;
  filters: MissionFilters;
  onFiltersChange: (next: MissionFilters) => void;
  skin: DashboardSkin;
}) {
  const theme = skinTokens[skin];
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    assignedTo: "unassigned" as AgentId | "unassigned",
  });

  return (
    <section className={["rounded-2xl border p-5", theme.border, theme.panel].join(" ")}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={["text-lg font-semibold", theme.textPrimary].join(" ")}>Splinter supervisor</h2>
          <p className={["mt-1 text-sm", theme.textMuted].join(" ")}>Create, route, and reassign mission tasks.</p>
        </div>
        <div className="text-right">
          <p className={["text-[11px]", theme.textMuted].join(" ")}>Supervisor mode</p>
          <p className={["text-sm font-medium", theme.textSecondary].join(" ")}>{skin}</p>
        </div>
      </div>

      <form
        className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.title.trim() || !form.description.trim()) return;
          void (async () => {
            await createTask({
              title: form.title.trim(),
              description: form.description.trim(),
              priority: form.priority,
              assignedTo: form.assignedTo === "unassigned" ? null : (form.assignedTo as AgentId),
            });
            setForm((prev) => ({ ...prev, title: "", description: "" }));
          })();
        }}
      >
        <input
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="Task title"
          className={["rounded border px-3 py-2 text-sm md:col-span-2", theme.border, theme.panelStrong, theme.textSecondary].join(" ")}
        />
        <input
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Task description"
          className={["rounded border px-3 py-2 text-sm md:col-span-3", theme.border, theme.panelStrong, theme.textSecondary].join(" ")}
        />
        <select
          value={form.priority}
          onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))}
          className={["rounded border px-3 py-2 text-sm", theme.border, theme.panelStrong, theme.textSecondary].join(" ")}
        >
          {(["low", "medium", "high", "critical"] as TaskPriority[]).map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        <select
          value={form.assignedTo}
          onChange={(e) => setForm((prev) => ({ ...prev, assignedTo: e.target.value as AgentId | "unassigned" }))}
          className={["rounded border px-3 py-2 text-sm", theme.border, theme.panelStrong, theme.textSecondary].join(" ")}
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
        <button type="submit" className={["md:col-span-5 rounded px-3 py-2 text-sm font-medium", theme.accentButton].join(" ")}>
          Create and route mission task
        </button>
      </form>

      <div className="mt-5">
        <MissionQueue agents={agents} tasks={tasks} filters={filters} onFiltersChange={onFiltersChange} patchTask={patchTask} skin={skin} />
      </div>
    </section>
  );
}

