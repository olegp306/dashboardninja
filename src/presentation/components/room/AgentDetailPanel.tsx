"use client";

import { useMemo } from "react";
import type { Agent, AgentId, AgentLog, Task, TaskStatus } from "@/domain/types";
import { timeAgo } from "@/presentation/utils/timeAgo";
import { AgentTimeline } from "@/presentation/components/room/AgentTimeline";

const statusBadgeTone: Record<string, string> = {
  queued: "bg-zinc-800 text-zinc-100 ring-1 ring-zinc-700/60",
  assigned: "bg-sky-950/60 text-sky-100 ring-1 ring-sky-500/25",
  in_progress: "bg-violet-950/60 text-violet-100 ring-1 ring-violet-500/25",
  done: "bg-emerald-950/60 text-emerald-100 ring-1 ring-emerald-500/25",
  failed: "bg-rose-950/60 text-rose-100 ring-1 ring-rose-500/25",
};

export function AgentDetailPanel({
  agent,
  tasks,
  logs,
  tasksById,
  patchTask,
}: {
  agent: Agent;
  tasks: Task[];
  logs: AgentLog[];
  tasksById: Record<string, Task>;
  patchTask: (taskId: string, patch: { status?: TaskStatus; assignedTo?: AgentId | null }) => Promise<void>;
}) {
  const lastSuccessful = useMemo(() => {
    if (!agent.lastSuccessfulTaskId) return null;
    return tasksById[agent.lastSuccessfulTaskId] ?? null;
  }, [agent.lastSuccessfulTaskId, tasksById]);

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">{agent.name}</h2>
          <p className="mt-1 text-sm text-zinc-400">Role: {agent.role.replaceAll("_", " ")}</p>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <span
              className={[
                "h-2.5 w-2.5 rounded-full",
                agent.online ? "bg-emerald-500" : "bg-rose-500",
              ].join(" ")}
              title={agent.online ? "Online" : "Offline"}
            />
            <span className="text-sm text-zinc-200">{agent.online ? "Online" : "Offline"}</span>
          </div>
          <div className="mt-1 text-xs text-zinc-500">Last heartbeat: {timeAgo(agent.lastHeartbeatAt)}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-3">
          <p className="text-xs uppercase tracking-wide text-zinc-400">Operational status</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className={["inline-flex items-center rounded-full px-2 py-1 text-xs", statusBadgeTone[agent.status] ?? "bg-zinc-800 text-zinc-100"].join(" ")}>
              {agent.status}
            </span>
            <span className="text-xs text-zinc-500">Current task: {agent.currentTaskId ? tasksById[agent.currentTaskId]?.title ?? agent.currentTaskId : "None"}</span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-3">
          <p className="text-xs uppercase tracking-wide text-zinc-400">Last successful task</p>
          <div className="mt-2">
            {lastSuccessful ? (
              <>
                <p className="text-sm font-medium text-zinc-100">{lastSuccessful.title}</p>
                <p className="text-xs text-zinc-500">Completed: {timeAgo(lastSuccessful.updatedAt)}</p>
              </>
            ) : (
              <p className="text-xs text-zinc-500">No successful tasks yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-zinc-200">Assigned tasks</h3>
        <div className="mt-3 space-y-2">
          {tasks.length === 0 ? (
            <p className="text-xs text-zinc-500">No tasks assigned to this agent.</p>
          ) : (
            tasks.slice(0, 8).map((task) => (
              <div key={task.id} className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-100 truncate">{task.title}</p>
                    <p className="mt-1 text-[11px] text-zinc-500 truncate">{task.description}</p>
                  </div>
                  <div className="shrink-0">
                    <span className={["inline-flex items-center rounded-full px-2 py-1 text-[11px]", statusBadgeTone[task.status]].join(" ")}>
                      {task.status}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="text-[11px] text-zinc-500">Priority:</label>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-200">
                    {task.priority}
                  </span>

                  <div className="ml-auto">
                    <select
                      value={task.status}
                      onChange={(event) => patchTask(task.id, { status: event.target.value as TaskStatus })}
                      className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-200"
                      aria-label={`Update status for ${task.title}`}
                    >
                      {["queued", "assigned", "in_progress", "done", "failed"].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AgentTimeline agent={agent} logs={logs} />
    </section>
  );
}

