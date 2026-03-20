"use client";

import { useMemo } from "react";
import type { Agent, AgentId, AgentLLMState, AgentLog, AgentMessage, LLMRuntimeMeta, Task, TaskStatus } from "@/domain/types";
import { timeAgo } from "@/presentation/utils/timeAgo";
import { AgentTimeline } from "@/presentation/components/room/AgentTimeline";
import type { DashboardSkin } from "@/presentation/theme/skins";
import { skinTokens } from "@/presentation/theme/skins";
import { BrainBadge } from "@/presentation/components/ui/BrainBadge";

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
  messages,
  llm,
  agentLLM,
  tasksById,
  patchTask,
  skin,
}: {
  agent: Agent;
  tasks: Task[];
  logs: AgentLog[];
  messages: AgentMessage[];
  llm: LLMRuntimeMeta;
  agentLLM?: AgentLLMState;
  tasksById: Record<string, Task>;
  patchTask: (taskId: string, patch: { status?: TaskStatus; assignedTo?: AgentId | null }) => Promise<void>;
  skin: DashboardSkin;
}) {
  const theme = skinTokens[skin];
  const lastSuccessful = useMemo(() => {
    if (!agent.lastSuccessfulTaskId) return null;
    return tasksById[agent.lastSuccessfulTaskId] ?? null;
  }, [agent.lastSuccessfulTaskId, tasksById]);

  return (
    <section className={["rounded-2xl border p-5", theme.border, theme.panel].join(" ")}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={["text-lg font-semibold", theme.textPrimary].join(" ")}>{agent.name}</h2>
          <p className={["mt-1 text-sm", theme.textMuted].join(" ")}>Role: {agent.role.replaceAll("_", " ")}</p>
          <div className="mt-2">
            <BrainBadge skin={skin} provider={agentLLM?.provider ?? llm.effectiveMode} meta={llm} lastTokens={agentLLM?.lastTokens} />
          </div>
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
            <span className={["text-sm", theme.textSecondary].join(" ")}>{agent.online ? "Online" : "Offline"}</span>
          </div>
          <div className={["mt-1 text-xs", theme.textMuted].join(" ")}>Last heartbeat: {timeAgo(agent.lastHeartbeatAt)}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className={["rounded-xl border p-3", theme.border, theme.panelMuted].join(" ")}>
          <p className={["text-xs uppercase tracking-wide", theme.textMuted].join(" ")}>Operational status</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className={["inline-flex items-center rounded-full px-2 py-1 text-xs", statusBadgeTone[agent.status] ?? "bg-zinc-800 text-zinc-100"].join(" ")}>
              {agent.status}
            </span>
            <span className={["text-xs", theme.textMuted].join(" ")}>Current task: {agent.currentTaskId ? tasksById[agent.currentTaskId]?.title ?? agent.currentTaskId : "None"}</span>
          </div>
        </div>

        <div className={["rounded-xl border p-3", theme.border, theme.panelMuted].join(" ")}>
          <p className={["text-xs uppercase tracking-wide", theme.textMuted].join(" ")}>Last successful task</p>
          <div className="mt-2">
            {lastSuccessful ? (
              <>
                <p className={["text-sm font-medium", theme.textPrimary].join(" ")}>{lastSuccessful.title}</p>
                <p className={["text-xs", theme.textMuted].join(" ")}>Completed: {timeAgo(lastSuccessful.updatedAt)}</p>
              </>
            ) : (
              <p className={["text-xs", theme.textMuted].join(" ")}>No successful tasks yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className={["text-sm font-semibold", theme.textSecondary].join(" ")}>Inter-agent messages</h3>
        <div className="mt-2 space-y-2">
          {messages.length === 0 ? (
            <p className={["text-xs", theme.textMuted].join(" ")}>No direct messages yet.</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={["rounded-xl border p-3", theme.border, theme.panelMuted].join(" ")}>
                <p className={["text-[11px]", theme.textSecondary].join(" ")}>
                  <span className={["font-medium", theme.textPrimary].join(" ")}>{m.from}</span>
                  {" → "}
                  <span className={["font-medium", theme.textPrimary].join(" ")}>{m.to}</span>
                  <span className={["ml-2 text-[10px]", theme.textMuted].join(" ")}>{timeAgo(m.createdAt)}</span>
                </p>
                <p className={["mt-1 text-xs", theme.textMuted].join(" ")}>{m.content}</p>
                <p className={["mt-1 text-[10px]", theme.textMuted].join(" ")}>task: {m.taskId}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4">
        <h3 className={["text-sm font-semibold", theme.textSecondary].join(" ")}>Assigned tasks</h3>
        <div className="mt-3 space-y-2">
          {tasks.length === 0 ? (
            <p className={["text-xs", theme.textMuted].join(" ")}>No tasks assigned to this agent.</p>
          ) : (
            tasks.slice(0, 8).map((task) => (
              <div key={task.id} className={["rounded-xl border p-3", theme.border, theme.panelMuted].join(" ")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={["text-sm truncate", theme.textPrimary].join(" ")}>{task.title}</p>
                    <p className={["mt-1 text-[11px] truncate", theme.textMuted].join(" ")}>{task.description}</p>
                  </div>
                  <div className="shrink-0">
                    <span className={["inline-flex items-center rounded-full px-2 py-1 text-[11px]", statusBadgeTone[task.status]].join(" ")}>
                      {task.status}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className={["text-[11px]", theme.textMuted].join(" ")}>Priority:</label>
                  <span className={["rounded-full px-2 py-0.5 text-[11px]", theme.panelStrong, theme.textSecondary].join(" ")}>
                    {task.priority}
                  </span>

                  <div className="ml-auto">
                    <select
                      value={task.status}
                      onChange={(event) => patchTask(task.id, { status: event.target.value as TaskStatus })}
                      className={["rounded px-2 py-1 text-xs", theme.panelStrong, theme.textSecondary].join(" ")}
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

      <AgentTimeline agent={agent} logs={logs} skin={skin} />
    </section>
  );
}

