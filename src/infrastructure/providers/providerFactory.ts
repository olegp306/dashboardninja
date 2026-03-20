import type { AgentProvider } from "@/domain/contracts";
import { runtimeConfig } from "@/infrastructure/config/runtimeConfig";
import { MockAgentProvider } from "@/infrastructure/providers/mock/mockAgentProvider";
import { OpenClawHttpAdapter } from "@/infrastructure/providers/openclaw/openClawAdapter";
import { OpenClawAgentProvider } from "@/infrastructure/providers/openclaw/openClawAgentProvider";

export function createAgentProvider(): AgentProvider {
  if (runtimeConfig.mode === "mock") {
    return new MockAgentProvider();
  }

  const adapter = new OpenClawHttpAdapter(runtimeConfig.openclaw.baseUrl, runtimeConfig.openclaw.apiToken);
  return new OpenClawAgentProvider(adapter);
}

