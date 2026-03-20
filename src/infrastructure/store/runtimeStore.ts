import { mockSeed } from "@/domain/seeds/mockSeed";
import type {
  Agent,
  AgentId,
  DashboardState,
  Task,
  TaskAssignInput,
  TaskCreateInput,
  TaskStatus,
  TaskStatusInput,
} from "@/domain/types";
import { ingestMockTelegramAndOpenClawEvents } from "@/infrastructure/services/mockEventIngestionService";
import { nowIso, pushLog, nextId } from "@/infrastructure/store/runtimeHelpers";

type RuntimeStore = {
  state: DashboardState;
};

const globalKey = "__dashboard_ninja_runtime__";
const globalScope = globalThis as typeof globalThis & {
  [globalKey]?: RuntimeStore;
};

const getStore = (): RuntimeStore => {
  if (!globalScope[globalKey]) {
    globalScope[globalKey] = {
      state: structuredClone(mockSeed),
    };
  }

  return globalScope[globalKey];
};

const withState = (mutate: (state: DashboardState) => void): DashboardState => {
  const store = getStore();
  mutate(store.state);
  store.state.generatedAt = nowIso();
  return structuredClone(store.state);
};

const setAgentStatusByTask = (agents: Agent[], tasks: Task[]) => {
  const activeAgents = new Set(
    tasks
      .filter((task) => task.status === "assigned" || task.status === "in_progress")
      .map((task) => task.assignedTo)
      .filter(Boolean) as AgentId[],
  );
  for (const agent of agents) {
    const current = tasks.find(
      (task) =>
        task.assignedTo === agent.id &&
        (task.status === "assigned" || task.status === "in_progress"),
    );

    if (agent.id !== "splinter") {
      if (!agent.online) {
        agent.status = "offline";
        agent.currentTaskId = null;
        continue;
      }

      agent.status = activeAgents.has(agent.id) ? "working" : "idle";
      agent.currentTaskId = current?.id ?? null;
    }
  }
};

const recomputeAgentLastSuccessful = (agents: Agent[], tasks: Task[]) => {
  for (const agent of agents) {
    const successful = tasks
      .filter((task) => task.assignedTo === agent.id && task.status === "done")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    const top = successful[0];
    agent.lastSuccessfulTaskId = top?.id ?? null;
    agent.lastSuccessfulTaskAt = top?.updatedAt ?? null;
  }
};

const recomputeSplinterStatus = (agents: Agent[], tasks: Task[]) => {
  const splinter = agents.find((agent) => agent.id === "splinter");
  if (!splinter) return;

  const active = tasks.some((t) => t.status === "queued" || t.status === "assigned" || t.status === "in_progress");
  splinter.status = active ? "working" : "idle";
  // Keep Splinter online; heartbeat managed by ingestion.
};

export const runtimeStore = {
  readState(): DashboardState {
    return structuredClone(getStore().state);
  },

  createTask(input: TaskCreateInput): DashboardState {
    return withState((state) => {
      const createdAt = nowIso();
      const task: Task = {
        id: nextId("task"),
        title: input.title,
        description: input.description,
        priority: input.priority,
        status: input.assignedTo ? "assigned" : "queued",
        assignedTo: input.assignedTo,
        createdAt,
        updatedAt: createdAt,
      };
      state.tasks.unshift(task);
      pushLog({
        logs: state.logs,
        agentId: "splinter",
        message: `Created task "${task.title}"`,
        output: `priority=${task.priority}`,
        source: "supervisor",
      });
      if (input.assignedTo) {
        pushLog({
          logs: state.logs,
          agentId: "splinter",
          message: `Assigned task "${task.title}" to ${input.assignedTo}.`,
          source: "supervisor",
        });
      }
      setAgentStatusByTask(state.agents, state.tasks);
      recomputeAgentLastSuccessful(state.agents, state.tasks);
      recomputeSplinterStatus(state.agents, state.tasks);
    });
  },

  assignTask(input: TaskAssignInput): DashboardState {
    return withState((state) => {
      const task = state.tasks.find((item) => item.id === input.taskId);
      if (!task) return;
      task.assignedTo = input.assignedTo;
      task.status = input.assignedTo ? "assigned" : "queued";
      task.updatedAt = nowIso();
      pushLog({
        logs: state.logs,
        agentId: "splinter",
        message: `Task "${task.title}" reassigned.`,
        output: `assignedTo=${input.assignedTo ?? "none"}`,
        source: "supervisor",
      });
      setAgentStatusByTask(state.agents, state.tasks);
      recomputeAgentLastSuccessful(state.agents, state.tasks);
      recomputeSplinterStatus(state.agents, state.tasks);
    });
  },

  updateTaskStatus(input: TaskStatusInput): DashboardState {
    return withState((state) => {
      const task = state.tasks.find((item) => item.id === input.taskId);
      if (!task) return;
      task.status = input.status;
      task.updatedAt = nowIso();
      if (task.assignedTo) {
        pushLog({
          logs: state.logs,
          agentId: task.assignedTo,
          message: `Task status changed: ${task.title}`,
          output: `status=${input.status}`,
          source: "openclaw",
        });
      }
      setAgentStatusByTask(state.agents, state.tasks);
      recomputeAgentLastSuccessful(state.agents, state.tasks);
      recomputeSplinterStatus(state.agents, state.tasks);
    });
  },

  tickSimulation(): DashboardState {
    return withState((state) => {
      // Simulate incoming external events.
      ingestMockTelegramAndOpenClawEvents(state);

      const active = state.tasks.filter((task) => task.status === "assigned" || task.status === "in_progress");
      if (active.length > 0) {
        const target = active[Math.floor(Math.random() * active.length)];
        const transitions: Record<TaskStatus, TaskStatus[]> = {
          queued: ["assigned"],
          assigned: ["in_progress"],
          in_progress: ["in_progress", "done"],
          done: ["done"],
          failed: ["failed", "queued"],
        };
        const candidates = transitions[target.status];
        target.status = candidates[Math.floor(Math.random() * candidates.length)];
        target.updatedAt = nowIso();
        if (target.assignedTo) {
          pushLog({
            logs: state.logs,
            agentId: target.assignedTo,
            message: `Simulation tick on "${target.title}"`,
            output: `status=${target.status}`,
            source: "system",
          });

          // On success, record last successful task via recompute step.
        }
      }
      setAgentStatusByTask(state.agents, state.tasks);
      recomputeAgentLastSuccessful(state.agents, state.tasks);
      recomputeSplinterStatus(state.agents, state.tasks);
    });
  },
};

