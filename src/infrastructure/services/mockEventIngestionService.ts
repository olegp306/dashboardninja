import type { AgentId, DashboardState } from "@/domain/types";
import { nextId, nowIso, pushLog } from "@/infrastructure/store/runtimeHelpers";

const telegramMessages = [
  "Telegram mission update received.",
  "Telegram operator message acknowledged.",
  "Incoming chat payload validated.",
  "User requested status refresh.",
  "Telegram alert escalated to supervisor.",
];

const openclawOutputs = [
  "Event stream parsed; payload guards passed.",
  "Agent telemetry batch ingested successfully.",
  "Task output chunk assembled.",
  "Routing decision computed by coordinator.",
];

const agentIds: AgentId[] = ["leonardo", "raphael", "donatello", "michelangelo", "splinter"];

export function ingestMockTelegramAndOpenClawEvents(state: DashboardState) {
  const now = nowIso();

  // 1) Heartbeats + online/offline toggling.
  for (const agent of state.agents) {
    if (agent.id === "splinter") {
      agent.online = true;
      agent.lastHeartbeatAt = now;
      continue;
    }

    // Small chance to simulate connectivity drops.
    if (Math.random() < 0.03) {
      agent.online = !agent.online;
      if (agent.online) {
        agent.lastHeartbeatAt = now;
        pushLog({
          logs: state.logs,
          agentId: agent.id,
          message: "Heartbeat resumed; agent came online.",
          source: "system",
        });
      } else {
        pushLog({
          logs: state.logs,
          agentId: agent.id,
          message: "Heartbeat lost; agent went offline.",
          source: "system",
        });
      }
      continue;
    }

    if (agent.online) {
      agent.lastHeartbeatAt = now;
    }
  }

  // 2) Telegram ingestion event.
  if (Math.random() < 0.35) {
    pushLog({
      logs: state.logs,
      agentId: "splinter",
      message: `Telegram ingest: ${telegramMessages[Math.floor(Math.random() * telegramMessages.length)]}`,
      source: "telegram",
      output: `chat_id=${Math.floor(1000 + Math.random() * 9000)}`,
    });
  }

  // 3) OpenClaw ingestion event: add a telemetry/output log for one agent.
  if (Math.random() < 0.28) {
    const target = agentIds[Math.floor(Math.random() * agentIds.length)];
    pushLog({
      logs: state.logs,
      agentId: target,
      message: `OpenClaw ingest: ${openclawOutputs[Math.floor(Math.random() * openclawOutputs.length)]}`,
      source: "openclaw",
      output: `batch_id=${nextId("batch").slice(0, 18)}`,
    });
  }
}

