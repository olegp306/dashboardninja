import { mockSeed } from "@/domain/seeds/mockSeed";
import type {
  Agent,
  AgentId,
  AgentLLMState,
  AgentMessage,
  DashboardState,
  LLMRuntimeMeta,
  Task,
  TaskAssignInput,
  TaskCreateInput,
  TaskStatusInput,
} from "@/domain/types";
import { ingestMockTelegramAndOpenClawEvents } from "@/infrastructure/services/mockEventIngestionService";
import { nowIso, pushLog, nextId } from "@/infrastructure/store/runtimeHelpers";
import type { AgentBrain, BrainTask, Plan } from "../../../packages/agent-brain/src/types";
import { ProviderAgentBrain } from "../../../packages/agent-brain/src/providerBrain";
import { getLLMProvider, getResolvedLLMRuntime, getSupervisorLLMProvider } from "@/infrastructure/config/llmConfig";
import { supervisorReviewSystemPrompt } from "../../../packages/agent-brain/src/prompts/templates";
import { sanitizeForLogs } from "../../../packages/llm-core/src/safety";
import { tryParseJsonObject } from "../../../packages/llm-core/src/json";

type RuntimeStore = {
  state: DashboardState;
  brainMemory: {
    plansByTaskId: Record<string, Plan>;
    activeStepIndexByTaskId: Record<string, number>;
    failedStepsByTaskId: Record<string, number>;
    completedStepsByTaskId: Record<string, number>;
    brainsByAgentId: Record<string, AgentBrain>;
    taskMemoryByTaskId: Record<string, string[]>;
    interAgentMessagesByTaskId: Record<string, Array<{ id: string; from: AgentId; to: AgentId; content: string; createdAt: string }>>;
    reasoningHistoryByAgentId: Record<
      string,
      Array<{ id: string; taskId: string; phase: "plan" | "step" | "reflect" | "supervisor"; summary: string; createdAt: string; raw?: string }>
    >;
    lastReasoningAtByTaskId: Record<string, number>;
    tokensUsedThisTick: number;
  };
};

const globalKey = "__dashboard_ninja_runtime__";
const globalScope = globalThis as typeof globalThis & {
  [globalKey]?: RuntimeStore;
};

const getStore = (): RuntimeStore => {
  if (!globalScope[globalKey]) {
    globalScope[globalKey] = {
      state: structuredClone(mockSeed),
      brainMemory: {
        plansByTaskId: {},
        activeStepIndexByTaskId: {},
        failedStepsByTaskId: {},
        completedStepsByTaskId: {},
        brainsByAgentId: {},
        taskMemoryByTaskId: {},
        interAgentMessagesByTaskId: {},
        reasoningHistoryByAgentId: {},
        lastReasoningAtByTaskId: {},
        tokensUsedThisTick: 0,
      },
    };
  }

  return globalScope[globalKey];
};

const ensureDashboardLlmFields = (state: DashboardState) => {
  if (!state.agentMessages) state.agentMessages = [];
  if (!state.llm) {
    state.llm = {
      mode: "mock",
      effectiveMode: "mock",
      requestedMode: "mock",
      simulationForced: false,
      autonomyEnabled: true,
      openaiConfigured: false,
      models: { worker: "mock", supervisor: "mock" },
      tokensUsedThisTick: 0,
      tokenBudgetPerTick: 25_000,
    };
  }
  if (!state.agentLLM) state.agentLLM = {};
};

const applyRuntimeMetaToState = (state: DashboardState, store: RuntimeStore) => {
  ensureDashboardLlmFields(state);
  const resolved = getResolvedLLMRuntime();

  const llm: LLMRuntimeMeta = {
    mode: resolved.mode,
    effectiveMode: resolved.effectiveMode,
    requestedMode: resolved.mode,
    simulationForced: resolved.simulationForced,
    autonomyEnabled: resolved.autonomyEnabled,
    openaiConfigured: resolved.openaiConfigured,
    models: {
      worker: resolved.models.worker,
      supervisor: resolved.models.supervisor,
    },
    lastError: state.llm.lastError,
    tokensUsedThisTick: store.brainMemory.tokensUsedThisTick,
    tokenBudgetPerTick: resolved.limits.tokenBudgetPerTick,
  };

  state.llm = llm;

  for (const agent of state.agents) {
    const existing = state.agentLLM[agent.id];
    state.agentLLM[agent.id] = {
      provider: resolved.effectiveMode,
      lastTokens: existing?.lastTokens,
      lastPhase: existing?.lastPhase,
    };
  }
};

const appendTaskMemoryLine = (store: RuntimeStore, taskId: string, line: string) => {
  const maxItems = 18;
  const maxChars = 240;
  const safe = sanitizeForLogs(line, maxChars);
  const bucket = store.brainMemory.taskMemoryByTaskId[taskId] ?? [];
  bucket.push(safe);
  if (bucket.length > maxItems) bucket.splice(0, bucket.length - maxItems);
  store.brainMemory.taskMemoryByTaskId[taskId] = bucket;
};

const appendInterAgentMessage = (state: DashboardState, store: RuntimeStore, message: Omit<AgentMessage, "id" | "createdAt">) => {
  const item: AgentMessage = {
    id: nextId("msg"),
    createdAt: nowIso(),
    ...message,
  };
  state.agentMessages.unshift(item);
  const bucket = store.brainMemory.interAgentMessagesByTaskId[message.taskId] ?? [];
  bucket.push({ id: item.id, from: message.from, to: message.to, content: item.content, createdAt: item.createdAt });
  if (bucket.length > 40) bucket.splice(0, bucket.length - 40);
  store.brainMemory.interAgentMessagesByTaskId[message.taskId] = bucket;
};

const appendReasoningHistory = (
  store: RuntimeStore,
  agentId: AgentId,
  entry: { taskId: string; phase: "plan" | "step" | "reflect" | "supervisor"; summary: string; raw?: string },
) => {
  const bucket = store.brainMemory.reasoningHistoryByAgentId[agentId] ?? [];
  bucket.unshift({
    id: nextId("reason"),
    createdAt: nowIso(),
    ...entry,
  });
  if (bucket.length > 60) bucket.length = 60;
  store.brainMemory.reasoningHistoryByAgentId[agentId] = bucket;
};

const bumpAgentTokens = (
  state: DashboardState,
  store: RuntimeStore,
  agentId: AgentId,
  tokens: number | undefined,
  phase: AgentLLMState["lastPhase"],
) => {
  if (!tokens) return;
  ensureDashboardLlmFields(state);
  store.brainMemory.tokensUsedThisTick += tokens;
  const prev = state.agentLLM[agentId] ?? { provider: state.llm.effectiveMode };
  state.agentLLM[agentId] = { ...prev, lastTokens: tokens, lastPhase: phase };
};

const withState = (mutate: (state: DashboardState) => void): DashboardState => {
  const store = getStore();
  mutate(store.state);
  store.state.generatedAt = nowIso();
  applyRuntimeMetaToState(store.state, store);
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

const pickAgentForTask = (task: Task, agents: Agent[]): AgentId => {
  const online = agents.filter((agent) => agent.id !== "splinter" && agent.online);
  const byId = (id: AgentId) => online.find((agent) => agent.id === id)?.id;

  if (task.priority === "critical") return byId("raphael") ?? online[0]?.id ?? "leonardo";
  if (task.priority === "high") return byId("leonardo") ?? online[0]?.id ?? "raphael";
  if (task.description.toLowerCase().includes("patch") || task.description.toLowerCase().includes("parser")) {
    return byId("donatello") ?? online[0]?.id ?? "leonardo";
  }
  if (task.description.toLowerCase().includes("brief") || task.description.toLowerCase().includes("creative")) {
    return byId("michelangelo") ?? online[0]?.id ?? "leonardo";
  }
  return online[0]?.id ?? "leonardo";
};

const toBrainTask = (task: Task): BrainTask => ({
  id: task.id,
  title: task.title,
  description: task.description,
  priority: task.priority,
});

const ensureBrain = (store: RuntimeStore, agentId: AgentId): AgentBrain => {
  if (!store.brainMemory.brainsByAgentId[agentId]) {
    const resolved = getResolvedLLMRuntime();
    const provider = getLLMProvider();

    const ctx = {
      getTaskMemory: (taskId: string) => store.brainMemory.taskMemoryByTaskId[taskId] ?? [],
      getRecentLogs: (id: AgentId, limit: number) =>
        store.state.logs
          .filter((l) => l.agentId === id)
          .slice(0, limit)
          .map((l) => sanitizeForLogs(`${l.message}${l.output ? ` | ${l.output}` : ""}`, 220)),
      getInterAgentMessages: (taskId: string) =>
        (store.brainMemory.interAgentMessagesByTaskId[taskId] ?? []).map((m) => ({
          from: m.from,
          to: m.to,
          content: m.content,
        })),
      onUsage: (usage: { agentId: AgentId; taskId: string; phase: "plan" | "step" | "reflect" | "supervisor"; tokens?: number }) => {
        bumpAgentTokens(store.state, store, usage.agentId, usage.tokens, usage.phase);
      },
    };

    store.brainMemory.brainsByAgentId[agentId] = new ProviderAgentBrain(
      agentId,
      provider,
      {
        maxResponseChars: resolved.limits.maxResponseChars,
        maxTokensPlan: 900,
        maxTokensStep: 700,
        maxTokensReflect: 500,
      },
      ctx,
    );
  }
  return store.brainMemory.brainsByAgentId[agentId];
};

const runSupervisorRouting = (store: RuntimeStore) => {
  const { state } = store;
  const queued = state.tasks.filter((task) => task.status === "queued");
  for (const task of queued) {
    const target = pickAgentForTask(task, state.agents);
    task.assignedTo = target;
    task.status = "assigned";
    task.updatedAt = nowIso();
    pushLog({
      logs: state.logs,
      agentId: "splinter",
      message: `Supervisor assigned "${task.title}" to ${target}.`,
      source: "supervisor",
      output: `reason=auto-routing`,
    });
  }
};

type SupervisorReview = {
  summary?: string;
  blockedTasks?: Array<{ taskId: string; reason: string }>;
  suggestions?: Array<{
    taskId: string;
    action: "reassign" | "pause" | "approve" | "reject";
    targetAgent?: string;
    note?: string;
  }>;
  comment?: string;
};

const parseSupervisorReview = (text: string): SupervisorReview | null => {
  const parsed = tryParseJsonObject(text);
  if (!parsed.ok) return null;
  const value = parsed.value;
  if (!value || typeof value !== "object") return null;
  return value as SupervisorReview;
};

const runSupervisorLLMReview = async (store: RuntimeStore) => {
  const { state, brainMemory } = store;
  ensureDashboardLlmFields(state);

  const workload = {
    activeTasks: state.tasks.filter((t) => t.status === "assigned" || t.status === "in_progress").length,
    queuedTasks: state.tasks.filter((t) => t.status === "queued").length,
    onlineAgents: state.agents.filter((a) => a.id !== "splinter" && a.online).length,
  };

  const snapshot = {
    generatedAt: state.generatedAt,
    workload,
    tasks: state.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      assignedTo: t.assignedTo,
    })),
    agents: state.agents.map((a) => ({
      id: a.id,
      online: a.online,
      status: a.status,
      currentTaskId: a.currentTaskId,
    })),
    recentFailures: state.logs
      .filter((l) => l.level === "warn" || l.message.toLowerCase().includes("fail"))
      .slice(0, 12)
      .map((l) => sanitizeForLogs(`${l.agentId}: ${l.message}`, 220)),
  };

  const supervisor = getSupervisorLLMProvider();
  try {
    const out = await supervisor.generate({
      systemPrompt: supervisorReviewSystemPrompt(),
      userPrompt: JSON.stringify(snapshot),
      temperature: 0.1,
      maxTokens: 700,
      metadata: { kind: "supervisor_review" },
    });

    bumpAgentTokens(state, store, "splinter", out.usage?.totalTokens, "supervisor");
    appendReasoningHistory(store, "splinter", {
      taskId: "system",
      phase: "supervisor",
      summary: "Supervisor LLM review",
      raw: out.text,
    });

    const review = parseSupervisorReview(out.text);
    const comment = review?.comment ?? review?.summary;
    if (comment) {
      pushLog({
        logs: state.logs,
        agentId: "splinter",
        message: `Supervisor note: ${sanitizeForLogs(comment, 240)}`,
        source: "supervisor",
      });
    }

    for (const suggestion of review?.suggestions ?? []) {
      if (!suggestion?.taskId || !suggestion.action) continue;
      const task = state.tasks.find((t) => t.id === suggestion.taskId);
      if (!task) continue;

      if (suggestion.action === "reassign" && suggestion.targetAgent) {
        const target = suggestion.targetAgent as AgentId;
        const okTarget = state.agents.some((a) => a.id === target && a.id !== "splinter");
        if (!okTarget) continue;
        task.assignedTo = target;
        task.status = "assigned";
        task.updatedAt = nowIso();
        pushLog({
          logs: state.logs,
          agentId: "splinter",
          message: `Splinter re-routed task "${task.title}" to ${target}.`,
          source: "supervisor",
          output: sanitizeForLogs(suggestion.note ?? "reassign", 240),
        });
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Supervisor LLM failed";
    state.llm.lastError = sanitizeForLogs(msg, 500);
    pushLog({
      logs: state.logs,
      agentId: "splinter",
      message: `Supervisor LLM unavailable; continuing with heuristics.`,
      source: "supervisor",
      output: state.llm.lastError,
    });
    void brainMemory;
  }
};

const runAutonomousWorkers = async (store: RuntimeStore) => {
  const { state, brainMemory } = store;
  const resolved = getResolvedLLMRuntime();
  if (!resolved.autonomyEnabled) return;

  const activeTasks = state.tasks.filter(
    (task) => task.assignedTo && (task.status === "assigned" || task.status === "in_progress"),
  );

  for (const task of activeTasks) {
    if (!task.assignedTo) continue;
    const agent = state.agents.find((item) => item.id === task.assignedTo);
    if (!agent || !agent.online) continue;

    // Token budgeting (soft guard): stop heavy reasoning if we've blown the tick budget.
    if (brainMemory.tokensUsedThisTick > resolved.limits.tokenBudgetPerTick) {
      pushLog({
        logs: state.logs,
        agentId: agent.id,
        message: `Paused reasoning: token budget exceeded for this tick.`,
        source: "system",
      });
      continue;
    }

    const brain = ensureBrain(store, agent.id);
    if (!brainMemory.plansByTaskId[task.id]) {
      const plan = await brain.plan(toBrainTask(task));
      brainMemory.plansByTaskId[task.id] = plan;
      brainMemory.activeStepIndexByTaskId[task.id] = 0;
      brainMemory.failedStepsByTaskId[task.id] = 0;
      brainMemory.completedStepsByTaskId[task.id] = 0;
      task.status = "in_progress";
      task.updatedAt = nowIso();

      appendTaskMemoryLine(store, task.id, `Plan: ${plan.summary}`);
      appendReasoningHistory(store, agent.id, { taskId: task.id, phase: "plan", summary: plan.summary, raw: plan.rawText });
      pushLog({
        logs: state.logs,
        agentId: agent.id,
        message: `${agent.name} created a ${plan.steps.length}-step plan`,
        source: "system",
        output: sanitizeForLogs(plan.summary, 300),
      });
    }

    const plan = brainMemory.plansByTaskId[task.id];
    const index = brainMemory.activeStepIndexByTaskId[task.id] ?? 0;

    // Hard cap to avoid infinite loops if plans balloon.
    if (plan.steps.length > resolved.limits.maxStepsPerTask) {
      pushLog({
        logs: state.logs,
        agentId: agent.id,
        message: `Plan too large; truncating to max steps (${resolved.limits.maxStepsPerTask}).`,
        source: "system",
      });
      plan.steps = plan.steps.slice(0, resolved.limits.maxStepsPerTask);
    }

    const step = plan.steps[index];
    if (!step) {
      task.status = "done";
      task.updatedAt = nowIso();
      pushLog({
        logs: state.logs,
        agentId: agent.id,
        message: `Task completed autonomously: "${task.title}"`,
        source: "system",
      });
      continue;
    }

    const debounceKey = task.id;
    const now = Date.now();
    const last = brainMemory.lastReasoningAtByTaskId[debounceKey] ?? 0;
    if (now - last < resolved.limits.debounceMs) {
      continue;
    }
    brainMemory.lastReasoningAtByTaskId[debounceKey] = now;

    const collaborator = step.requiresCollaborationWith;
    if (collaborator && collaborator !== agent.id) {
      const helpRequest = sanitizeForLogs(`Need help on "${task.title}" — ${step.title}`, 220);
      appendInterAgentMessage(state, store, {
        taskId: task.id,
        from: agent.id,
        to: collaborator as AgentId,
        content: helpRequest,
      });
      pushLog({
        logs: state.logs,
        agentId: agent.id,
        message: `${agent.name} requested help from ${collaborator}.`,
        source: "system",
        output: `step=${step.id}`,
      });
      pushLog({
        logs: state.logs,
        agentId: collaborator as AgentId,
        message: `${collaborator} received a concise help request from ${agent.id}.`,
        source: "system",
        output: `task=${task.id}`,
      });
    }

    const result = await brain.executeStep({ task: toBrainTask(task), step });
    if (result.structured?.messageToAgent) {
      const { to, content } = result.structured.messageToAgent;
      appendInterAgentMessage(state, store, {
        taskId: task.id,
        from: agent.id,
        to: to as AgentId,
        content: sanitizeForLogs(content, 240),
      });
    }

    if (result.success) {
      brainMemory.completedStepsByTaskId[task.id] = (brainMemory.completedStepsByTaskId[task.id] ?? 0) + 1;
      brainMemory.activeStepIndexByTaskId[task.id] = index + 1;
      appendTaskMemoryLine(store, task.id, `Step OK: ${step.title}`);
      appendReasoningHistory(store, agent.id, {
        taskId: task.id,
        phase: "step",
        summary: result.structured?.summary ?? `Executed step: ${step.title}`,
        raw: result.rawText,
      });
      pushLog({
        logs: state.logs,
        agentId: agent.id,
        message: `Executed step: ${step.title}`,
        source: "system",
        output: sanitizeForLogs(result.output, 500),
      });
    } else {
      brainMemory.failedStepsByTaskId[task.id] = (brainMemory.failedStepsByTaskId[task.id] ?? 0) + 1;
      appendTaskMemoryLine(store, task.id, `Step issue: ${step.title}`);
      appendReasoningHistory(store, agent.id, {
        taskId: task.id,
        phase: "step",
        summary: result.structured?.summary ?? `Step failed: ${step.title}`,
        raw: result.rawText,
      });
      pushLog({
        logs: state.logs,
        agentId: agent.id,
        message: `Step failed: ${step.title}`,
        source: "system",
        output: sanitizeForLogs(result.output, 500),
      });
      if (result.escalate) {
        pushLog({
          logs: state.logs,
          agentId: "splinter",
          message: `Escalation from ${agent.id} on task "${task.title}".`,
          source: "supervisor",
        });
      }
    }

    const reflection = await brain.reflect({
      agentId: agent.id,
      task: toBrainTask(task),
      plan,
      completedSteps: brainMemory.completedStepsByTaskId[task.id] ?? 0,
      failedSteps: brainMemory.failedStepsByTaskId[task.id] ?? 0,
    });
    appendReasoningHistory(store, agent.id, { taskId: task.id, phase: "reflect", summary: reflection.note, raw: reflection.rawText });
    pushLog({
      logs: state.logs,
      agentId: agent.id,
      message: `Reflection: ${reflection.note}`,
      source: "system",
      output: `next=${reflection.nextAction}`,
    });

    if ((brainMemory.activeStepIndexByTaskId[task.id] ?? 0) >= plan.steps.length) {
      task.status = "done";
      task.updatedAt = nowIso();
    } else {
      task.status = "in_progress";
      task.updatedAt = nowIso();
    }
  }
};

export const runtimeStore = {
  readState(): DashboardState {
    const store = getStore();
    applyRuntimeMetaToState(store.state, store);
    return structuredClone(store.state);
  },

  getReasoningHistory(agentId: AgentId) {
    const store = getStore();
    return structuredClone(store.brainMemory.reasoningHistoryByAgentId[agentId] ?? []);
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

  async tickSimulation(): Promise<DashboardState> {
    const store = getStore();
    const { state } = store;

    ensureDashboardLlmFields(state);
    store.brainMemory.tokensUsedThisTick = 0;
    state.llm.lastError = undefined;

    // Simulate incoming external events.
    ingestMockTelegramAndOpenClawEvents(state);

    // Splinter supervisor routing + autonomous execution pass.
    runSupervisorRouting(store);
    await runSupervisorLLMReview(store);
    await runAutonomousWorkers(store);

    setAgentStatusByTask(state.agents, state.tasks);
    recomputeAgentLastSuccessful(state.agents, state.tasks);
    recomputeSplinterStatus(state.agents, state.tasks);
    state.generatedAt = nowIso();
    applyRuntimeMetaToState(state, store);

    return structuredClone(state);
  },
};

