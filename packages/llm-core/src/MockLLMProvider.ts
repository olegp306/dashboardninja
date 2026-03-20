import type { LLMGenerateInput, LLMGenerateOutput, LLMProvider } from "./types";

const randomItem = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

/**
 * Deterministic-ish mock LLM:
 * - Preserves the old "simulation brain" behavior (random-ish plans/steps) but returns JSON text
 *   so downstream structured parsing can be exercised in mock mode too.
 */
export class MockLLMProvider implements LLMProvider {
  async generate(input: LLMGenerateInput): Promise<LLMGenerateOutput> {
    const meta = (input.metadata ?? {}) as Record<string, unknown>;
    const kind = typeof meta.kind === "string" ? meta.kind : "generic";

    if (kind === "agent_plan") {
      const taskId = String(meta.taskId ?? "task");
      const title = String(meta.title ?? "Task");
      const priority = String(meta.priority ?? "medium");
      const agentId = String(meta.agentId ?? "agent");

      const steps = [
        {
          id: `${taskId}-step-1`,
          taskId,
          title: `Analyze scope for "${title}"`,
          type: "analysis",
          assignedTo: agentId,
        },
        {
          id: `${taskId}-step-2`,
          taskId,
          title: `Execute core work for "${title}"`,
          type: "execution",
          assignedTo: agentId,
        },
        {
          id: `${taskId}-step-3`,
          taskId,
          title: `Validate outcome and handoff`,
          type: "review",
          assignedTo: agentId,
        },
      ] as const;

      // Occasionally simulate collaboration needs (keeps inter-agent chatter in mock mode).
      if (Math.random() < 0.25) {
        const idx = Math.floor(Math.random() * steps.length);
        (steps as unknown as { assignedTo?: string }[])[idx]!.assignedTo = randomItem([
          "leonardo",
          "raphael",
          "donatello",
          "michelangelo",
        ]);
      }

      const text = JSON.stringify({
        summary: `${agentId} drafted a ${steps.length}-step plan (${priority}).`,
        steps,
      });

      return { text, usage: { totalTokens: Math.floor(120 + Math.random() * 80) } };
    }

    if (kind === "agent_step") {
      const success = Math.random() > 0.12;
      const text = JSON.stringify({
        summary: success ? "Step executed successfully (simulated)." : "Step hit friction (simulated).",
        status: success ? "completed" : Math.random() > 0.5 ? "blocked" : "needs_input",
        output: success ? "ok=true" : "ok=false; retry recommended",
        shouldEscalate: !success && Math.random() > 0.5,
        messageToAgent:
          Math.random() < 0.18
            ? {
                to: randomItem(["leonardo", "raphael", "donatello", "michelangelo"]),
                content: "Quick assist needed on this step (simulated).",
              }
            : undefined,
      });
      return { text, usage: { totalTokens: Math.floor(90 + Math.random() * 60) } };
    }

    if (kind === "agent_reflect") {
      const completed = Number(meta.completedSteps ?? 0);
      const failed = Number(meta.failedSteps ?? 0);
      const confidence = Math.max(0.2, Math.min(0.98, 0.45 + completed * 0.12 - failed * 0.1));
      const nextAction =
        failed > completed ? "request_help" : failed > 1 ? "escalate" : "continue";
      const text = JSON.stringify({
        summary: `Reflection: confidence=${confidence.toFixed(2)} next=${nextAction}`,
        confidence,
        nextAction,
        note: `Simulated reflection note.`,
      });
      return { text, usage: { totalTokens: Math.floor(70 + Math.random() * 50) } };
    }

    if (kind === "supervisor_review") {
      const text = JSON.stringify({
        summary: "Supervisor scan complete (simulated).",
        blockedTasks: [],
        suggestions: [],
        comment: "System looks stable; continue monitoring.",
      });
      return { text, usage: { totalTokens: Math.floor(110 + Math.random() * 70) } };
    }

    // Generic fallback
    return {
      text: JSON.stringify({ summary: "Mock LLM response", echo: input.userPrompt.slice(0, 240) }),
      usage: { totalTokens: 32 },
    };
  }
}
