import type {
  AgentBrain,
  AgentContext,
  BrainTask,
  Plan,
  Reflection,
  Step,
  StepResult,
} from "./types";

const randomItem = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const splitIntoStepObjectives = (task: BrainTask): Array<{ title: string; type: Step["type"] }> => {
  return [
    { title: `Analyze task scope for "${task.title}"`, type: "analysis" },
    { title: `Implement core action for "${task.title}"`, type: "execution" },
    { title: `Validate outcome and prepare handoff`, type: "review" },
  ];
};

export class MockAgentBrain implements AgentBrain {
  constructor(private readonly agentId: string) {}

  async plan(task: BrainTask): Promise<Plan> {
    const raw = splitIntoStepObjectives(task);
    const steps: Step[] = raw.map((item, index) => ({
      id: `${task.id}-step-${index + 1}`,
      taskId: task.id,
      title: item.title,
      type: item.type,
      objective: item.title,
      requiresCollaborationWith:
        Math.random() < 0.25 ? randomItem(["leonardo", "raphael", "donatello", "michelangelo"]) : undefined,
    }));
    return {
      summary: `${this.agentId} generated ${steps.length} execution steps.`,
      steps,
    };
  }

  async executeStep({ step }: { task: BrainTask; step: Step }): Promise<StepResult> {
    const success = Math.random() > 0.12;
    return {
      success,
      output: success
        ? `Completed step "${step.title}".`
        : `Step "${step.title}" encountered execution friction.`,
      escalate: !success && Math.random() > 0.5,
    };
  }

  async reflect(context: AgentContext): Promise<Reflection> {
    const confidence = Math.max(
      0.2,
      Math.min(0.98, 0.45 + context.completedSteps * 0.12 - context.failedSteps * 0.1),
    );
    const nextAction: Reflection["nextAction"] =
      context.failedSteps > context.completedSteps
        ? "request_help"
        : context.failedSteps > 1
          ? "escalate"
          : "continue";

    return {
      confidence,
      nextAction,
      note: `Reflection by ${context.agentId}: confidence=${confidence.toFixed(2)} next=${nextAction}`,
    };
  }
}

