import { createLLMProvider, normalizeLlmMode, type LLMMode, type LLMProvider } from "../../../packages/llm-core/src";
import { runtimeConfig } from "@/infrastructure/config/runtimeConfig";

const toBool = (value: string | undefined) => {
  if (!value) return false;
  return ["1", "true", "yes", "y", "on"].includes(value.toLowerCase());
};

const toInt = (value: string | undefined, fallback: number) => {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) ? n : fallback;
};

export type ResolvedLLMRuntime = {
  mode: LLMMode;
  effectiveMode: LLMMode;
  simulationForced: boolean;
  autonomyEnabled: boolean;
  openaiConfigured: boolean;
  models: {
    worker: string;
    supervisor: string;
  };
  limits: {
    timeoutMs: number;
    maxResponseChars: number;
    maxStepsPerTask: number;
    tokenBudgetPerTick: number;
    debounceMs: number;
  };
  openai: {
    apiKeyPresent: boolean;
    baseUrl?: string;
  };
  localLlmEnabled: boolean;
};

let cachedProvider: LLMProvider | null = null;
let cachedFingerprint: string | null = null;

const fingerprint = () =>
  [
    process.env.LLM_MODE ?? "",
    process.env.SIMULATION_MODE ?? "",
    process.env.OPENAI_API_KEY ? "1" : "0",
    process.env.OPENAI_MODEL ?? "",
    process.env.OPENAI_BASE_URL ?? "",
    process.env.OPENAI_TIMEOUT_MS ?? "",
    process.env.WORKER_MODEL ?? "",
    process.env.SUPERVISOR_MODEL ?? "",
    process.env.MAX_STEPS_PER_TASK ?? "",
    process.env.TOKEN_BUDGET_PER_TICK ?? "",
    process.env.LLM_MAX_RESPONSE_CHARS ?? "",
    process.env.AGENT_AUTONOMY ?? "",
    process.env.LOCAL_LLM_ENABLED ?? "",
  ].join("|");

export const getResolvedLLMRuntime = (): ResolvedLLMRuntime => {
  const requested = normalizeLlmMode(process.env.LLM_MODE);
  const simulationForced = runtimeConfig.simulation.enabled === true;
  const openaiConfigured = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0);
  const effectiveMode: LLMMode =
    simulationForced ? "mock" : requested === "openai" && !openaiConfigured ? "mock" : requested;

  const autonomyRaw = process.env.AGENT_AUTONOMY;
  const autonomyEnabled = autonomyRaw ? toBool(autonomyRaw) : true;

  return {
    mode: requested,
    effectiveMode,
    simulationForced,
    autonomyEnabled,
    openaiConfigured,
    models: {
      worker: process.env.WORKER_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      supervisor: process.env.SUPERVISOR_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4.1",
    },
    limits: {
      timeoutMs: toInt(process.env.OPENAI_TIMEOUT_MS, 45_000),
      maxResponseChars: toInt(process.env.LLM_MAX_RESPONSE_CHARS, 12_000),
      maxStepsPerTask: toInt(process.env.MAX_STEPS_PER_TASK, 12),
      tokenBudgetPerTick: toInt(process.env.TOKEN_BUDGET_PER_TICK, 25_000),
      debounceMs: toInt(process.env.LLM_DEBOUNCE_MS, 750),
    },
    openai: {
      apiKeyPresent: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0),
      baseUrl: process.env.OPENAI_BASE_URL,
    },
    localLlmEnabled: toBool(process.env.LOCAL_LLM_ENABLED),
  };
};

export const getLLMProvider = (): LLMProvider => {
  const fp = fingerprint();
  if (cachedProvider && cachedFingerprint === fp) return cachedProvider;

  const resolved = getResolvedLLMRuntime();

  if (resolved.effectiveMode === "mock") {
    cachedProvider = createLLMProvider({ mode: "mock" });
    cachedFingerprint = fp;
    return cachedProvider;
  }

  if (resolved.effectiveMode === "local") {
    cachedProvider = createLLMProvider({ mode: "local" });
    cachedFingerprint = fp;
    return cachedProvider;
  }

  const apiKey = process.env.OPENAI_API_KEY ?? "";
  if (!apiKey) {
    // Fail safe: fall back to mock rather than crashing the dashboard at import time.
    cachedProvider = createLLMProvider({ mode: "mock" });
    cachedFingerprint = fp;
    return cachedProvider;
  }

  cachedProvider = createLLMProvider({
    mode: "openai",
    apiKey,
    model: resolved.models.worker,
    baseUrl: resolved.openai.baseUrl,
    timeoutMs: resolved.limits.timeoutMs,
  });
  cachedFingerprint = fp;
  return cachedProvider;
};

export const getSupervisorLLMProvider = (): LLMProvider => {
  const resolved = getResolvedLLMRuntime();
  if (resolved.effectiveMode === "mock") return createLLMProvider({ mode: "mock" });
  if (resolved.effectiveMode === "local") return createLLMProvider({ mode: "local" });

  const apiKey = process.env.OPENAI_API_KEY ?? "";
  if (!apiKey) return createLLMProvider({ mode: "mock" });

  return createLLMProvider({
    mode: "openai",
    apiKey,
    model: resolved.models.supervisor,
    baseUrl: resolved.openai.baseUrl,
    timeoutMs: resolved.limits.timeoutMs,
  });
};
