import type { AgentId, AgentLog } from "@/domain/types";

export const nowIso = () => new Date().toISOString();

export const nextId = (prefix: string) => {
  const c = globalThis.crypto;
  const suffix =
    c && "randomUUID" in c && typeof c.randomUUID === "function"
      ? c.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  return `${prefix}-${suffix}`;
};

export const pushLog = (args: {
  logs: AgentLog[];
  agentId: AgentId;
  message: string;
  output?: string;
  source: AgentLog["source"];
}): void => {
  const { logs, agentId, message, output, source } = args;
  logs.unshift({
    id: nextId("log"),
    agentId,
    level: "info",
    message,
    output,
    source,
    createdAt: nowIso(),
  });

  if (logs.length > 120) logs.length = 120;
};

