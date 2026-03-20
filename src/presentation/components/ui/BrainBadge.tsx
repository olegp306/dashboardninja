import type { AgentLLMState, LLMRuntimeMeta, LLMProviderKind } from "@/domain/types";
import type { DashboardSkin } from "@/presentation/theme/skins";
import { skinTokens } from "@/presentation/theme/skins";

const tone = (kind: LLMProviderKind) => {
  if (kind === "openai") return "bg-emerald-950/50 text-emerald-100 ring-1 ring-emerald-500/25";
  if (kind === "local") return "bg-sky-950/50 text-sky-100 ring-1 ring-sky-500/25";
  return "bg-zinc-900 text-zinc-100 ring-1 ring-zinc-700/40";
};

export function BrainBadge({
  skin,
  provider,
  meta,
  lastTokens,
}: {
  skin: DashboardSkin;
  provider: LLMProviderKind;
  meta: LLMRuntimeMeta;
  lastTokens?: number;
}) {
  const theme = skinTokens[skin];
  const sim = meta.simulationForced ? "sim" : "live";
  return (
    <div className={["mt-2 flex flex-wrap items-center gap-2", theme.textMuted].join(" ")}>
      <span className={["inline-flex items-center rounded-full px-2 py-0.5 text-[10px]", tone(provider)].join(" ")}>
        {provider}
      </span>
      <span className={["inline-flex items-center rounded-full px-2 py-0.5 text-[10px]", theme.panelStrong, theme.textSecondary].join(" ")}>
        {sim}
      </span>
      {typeof lastTokens === "number" ? (
        <span className={["text-[10px]", theme.textMuted].join(" ")}>tok {lastTokens}</span>
      ) : null}
    </div>
  );
}

export function AgentBrainBadge({ agentLLM }: { agentLLM?: AgentLLMState }) {
  if (!agentLLM) return null;
  return (
    <span className={["inline-flex items-center rounded-full px-2 py-0.5 text-[10px]", tone(agentLLM.provider)].join(" ")}>
      brain:{agentLLM.provider}
    </span>
  );
}
