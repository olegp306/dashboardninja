"use client";

import { useMemo, useState } from "react";
import { useMissionStream } from "@/presentation/hooks/useMissionStream";
import type { AgentId } from "@/domain/types";
import { AgentDetailPanel } from "@/presentation/components/room/AgentDetailPanel";
import type { MissionFilters } from "@/presentation/components/room/FiltersBar";
import type { DashboardSkin } from "@/presentation/theme/skins";
import { designTokens, skinTokens } from "@/presentation/theme/skins";
import { AgentCard } from "@/presentation/components/ui/AgentCard";
import { AgentTable } from "@/presentation/components/ui/AgentTable";
import { SupervisorPanel } from "@/presentation/components/ui/SupervisorPanel";
import { ActivityFeed } from "@/presentation/components/ui/ActivityFeed";
import { RetroGameScene } from "@/game-engine/RetroGameScene";
import { GameHUD } from "@/game-engine/GameHUD";
import { GameConsoleLog } from "@/game-engine/GameConsoleLog";

export function MissionControl() {
  const { state, summary, loading, error, createTask, patchTask, recentlyUpdatedTaskIds } = useMissionStream();
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

  const messagesForSelectedAgent = useMemo(() => {
    if (!state) return [];
    return state.agentMessages.filter((m) => m.from === selectedAgentId || m.to === selectedAgentId).slice(0, 12);
  }, [state, selectedAgentId]);

  if (loading || !state || !summary) {
    return <div className="text-zinc-300">Initializing control room...</div>;
  }

  if (skin === "game") {
    return (
      <div className="flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-[#050508] font-pixel text-zinc-100">
        <GameHUD summary={summary} skin={skin} onSkinChange={setSkin} llm={state.llm} />

        {error ? (
          <div className="shrink-0 border-y border-amber-800 bg-amber-950/70 px-2 py-1.5 text-[10px] text-amber-100">
            {error}
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col gap-1 px-1 pb-0 pt-0 lg:flex-row lg:gap-2 lg:px-2 lg:pb-1">
          <div className="flex min-h-0 flex-1 flex-col lg:basis-[72%]">
            <RetroGameScene
              state={state}
              selectedAgentId={selectedAgentId}
              onSelectAgent={setSelectedAgentId}
              onSelectTable={(id) => setSelectedAgentId(id === "splinter" ? "splinter" : id)}
              recentlyUpdatedTaskIds={recentlyUpdatedTaskIds}
            />
          </div>

          <aside className="flex max-h-full w-full min-w-0 shrink-0 flex-col gap-1.5 overflow-hidden border-4 border-black bg-[#12081f] p-1.5 shadow-[4px_4px_0_#000] lg:w-[22%] lg:max-w-[300px]">
            <SupervisorPanel
              skin={skin}
              compact
              agents={state.agents}
              tasks={state.tasks}
              filters={filters}
              onFiltersChange={setFilters}
              createTask={(payload) => createTask(payload)}
              patchTask={(taskId, patch) => patchTask(taskId, patch)}
              recentlyUpdatedTaskIds={recentlyUpdatedTaskIds}
            />
            {selectedAgent ? (
              <div className="min-h-0 flex-1 overflow-y-auto text-[11px] leading-snug [&_h2]:text-sm [&_h3]:text-xs [&_section]:!p-2">
                <AgentDetailPanel
                  agent={selectedAgent}
                  tasks={tasksForSelectedAgent}
                  logs={logsForSelectedAgent}
                  messages={messagesForSelectedAgent}
                  llm={state.llm}
                  agentLLM={state.agentLLM[selectedAgent.id]}
                  tasksById={tasksById}
                  patchTask={(taskId, patch) => patchTask(taskId, patch)}
                  skin={skin}
                />
              </div>
            ) : (
              <div className="shrink-0 border-2 border-black bg-black/50 p-2 text-[10px] text-zinc-400">
                Select a unit or table.
              </div>
            )}
            <p className="shrink-0 border-t-2 border-black/60 pt-1.5 text-[9px] leading-tight text-zinc-600">
              ★ HQ / tables / units — same routing as before.
            </p>
          </aside>
        </div>

        <GameConsoleLog logs={state.logs} />
      </div>
    );
  }

  return (
    <div className={["space-y-4 px-4 py-6 md:px-6 xl:px-8", theme.page].join(" ")}>
      <header
        className={["border p-4", "rounded-2xl", theme.border, theme.panel].join(" ")}
      >
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
              className={[
                "mt-1 w-full md:w-48 border px-2 py-2 text-sm rounded",
                theme.border,
                theme.panelStrong,
                theme.textSecondary,
              ].join(" ")}
            >
              <option value="control-room">control-room</option>
              <option value="pizzeria">pizzeria</option>
              <option value="minimal">minimal</option>
              <option value="game">🎮 game (NES)</option>
            </select>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard skin={skin} theme={theme} label="Active agents" value={summary.activeAgents.toString()} />
          <StatCard skin={skin} theme={theme} label="Live tasks" value={summary.activeTasks.toString()} />
          <StatCard skin={skin} theme={theme} label="Queued tasks" value={summary.queuedTasks.toString()} />
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
            {skin === "pizzeria" ? (
              <div className={["rounded-2xl border p-4", theme.border, theme.floor ?? theme.panelMuted].join(" ")}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {state.agents
                    .filter((a) => a.id !== "splinter")
                    .map((agent) => (
                      <AgentTable
                        key={agent.id}
                        agent={agent}
                        skin={skin}
                        selected={agent.id === selectedAgentId}
                        taskTitle={agent.currentTaskId ? currentTaskTitlesById[agent.currentTaskId] ?? null : null}
                        onSelect={setSelectedAgentId}
                        llm={state.llm}
                        agentLLM={state.agentLLM[agent.id]}
                      />
                    ))}
                </div>
                <div className="mt-4 flex justify-center">
                  {(() => {
                    const splinter = state.agents.find((a) => a.id === "splinter");
                    if (!splinter) return null;
                    return (
                      <div className="w-full max-w-md">
                        <AgentTable
                          agent={splinter}
                          skin={skin}
                          selected={splinter.id === selectedAgentId}
                          taskTitle={`${summary.activeTasks} active tasks`}
                          onSelect={setSelectedAgentId}
                          large
                          subtitle={`${state.agents.filter((a) => a.online).length}/${state.agents.length} online`}
                          llm={state.llm}
                          agentLLM={state.agentLLM[splinter.id]}
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className={["rounded-2xl border p-4", theme.border, theme.panelMuted].join(" ")}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {state.agents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      skin={skin}
                      selected={agent.id === selectedAgentId}
                      currentTaskTitle={agent.currentTaskId ? currentTaskTitlesById[agent.currentTaskId] ?? null : null}
                      onSelect={setSelectedAgentId}
                      llm={state.llm}
                      agentLLM={state.agentLLM[agent.id]}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            {selectedAgent ? (
              <AgentDetailPanel
                agent={selectedAgent}
                tasks={tasksForSelectedAgent}
                logs={logsForSelectedAgent}
                messages={messagesForSelectedAgent}
                llm={state.llm}
                agentLLM={state.agentLLM[selectedAgent.id]}
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

        <aside className="xl:col-span-4 space-y-3">
          <SupervisorPanel
            skin={skin}
            agents={state.agents}
            tasks={state.tasks}
            filters={filters}
            onFiltersChange={setFilters}
            createTask={(payload) => createTask(payload)}
            patchTask={(taskId, patch) => patchTask(taskId, patch)}
            recentlyUpdatedTaskIds={recentlyUpdatedTaskIds}
          />
        </aside>
      </section>

      <ActivityFeed skin={skin} logs={state.logs} title="Global activity log" />
    </div>
  );
}

function StatCard({
  skin,
  theme,
  label,
  value,
}: {
  skin: DashboardSkin;
  theme: (typeof skinTokens)[DashboardSkin];
  label: string;
  value: string;
}) {
  return (
    <div
      className={[
        "border px-4 py-3",
        skin === "game" ? "rounded-none border-4 border-black shadow-[4px_4px_0_#000]" : "rounded-lg",
        theme.border,
        theme.panelStrong,
      ].join(" ")}
    >
      <p className={["text-xs uppercase tracking-wide", theme.textMuted].join(" ")}>{label}</p>
      <p className={["mt-1 text-2xl font-semibold", theme.textPrimary, designTokens.shadow.soft].join(" ")}>{value}</p>
    </div>
  );
}
