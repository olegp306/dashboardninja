"use client";

import { useState } from "react";
import type { Agent, AgentId, Task, TaskPriority, TaskStatus } from "@/domain/types";
import type { MissionFilters } from "@/presentation/components/room/FiltersBar";
import { MissionQueue } from "@/presentation/components/room/MissionQueue";

export function SplinterSupervisorPanel({
  agents,
  tasks,
  createTask,
  patchTask,
  filters,
  onFiltersChange,
}: {
  agents: Agent[];
  tasks: Task[];
  createTask: (payload: { title: string; description: string; priority: TaskPriority; assignedTo: AgentId | null }) => Promise<void>;
  patchTask: (taskId: string, patch: { status?: TaskStatus; assignedTo?: AgentId | null }) => Promise<void>;
  filters: MissionFilters;
  onFiltersChange: (next: MissionFilters) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    assignedTo: "unassigned" as AgentId | "unassigned",
  });

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Splinter supervisor</h2>
          <p className="mt-1 text-sm text-zinc-500">Create, route, and reassign mission tasks.</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-zinc-500">Supervisor mode</p>
          <p className="text-sm text-zinc-200 font-medium">Control-room</p>
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
          className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 md:col-span-2"
        />
        <input
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Task description"
          className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 md:col-span-3"
        />
        <select
          value={form.priority}
          onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))}
          className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
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
          className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
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
        <button type="submit" className="md:col-span-5 rounded bg-cyan-700 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600">
          Create and route mission task
        </button>
      </form>

      <div className="mt-5">
        <MissionQueue agents={agents} tasks={tasks} filters={filters} onFiltersChange={onFiltersChange} patchTask={patchTask} />
      </div>
    </section>
  );
}

