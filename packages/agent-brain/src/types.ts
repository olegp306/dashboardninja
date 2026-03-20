export type BrainTask = {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
};

export type StepType = "analysis" | "execution" | "communication" | "review";

export type Step = {
  id: string;
  taskId?: string;
  title: string;
  type: StepType;
  /**
   * Human-readable objective for logs/UI (kept for backwards compatibility with older mock brains).
   * Prefer `title` + `type` for new code paths.
   */
  objective: string;
  requiresCollaborationWith?: string;
};

export type Plan = {
  summary: string;
  steps: Step[];
  rawText?: string;
  parseWarnings?: string[];
};

export type StepResult = {
  success: boolean;
  output: string;
  escalate?: boolean;
  structured?: AgentStepOutput;
  rawText?: string;
};

export type Reflection = {
  confidence: number;
  nextAction: "continue" | "request_help" | "escalate";
  note: string;
  rawText?: string;
};

export type AgentContext = {
  agentId: string;
  task: BrainTask;
  plan: Plan;
  completedSteps: number;
  failedSteps: number;
  recentLogs?: string[];
  interAgentMessages?: Array<{ from: string; to: string; content: string; at: string }>;
};

export type AgentPlanOutput = {
  summary: string;
  steps: {
    id: string;
    title: string;
    type: StepType;
    assignedTo?: string;
  }[];
};

export type AgentStepOutput = {
  summary: string;
  status: "completed" | "blocked" | "needs_input";
  output?: string;
  shouldEscalate?: boolean;
  messageToAgent?: {
    to: string;
    content: string;
  };
};

export interface AgentBrain {
  plan(task: BrainTask): Promise<Plan>;
  executeStep(input: { task: BrainTask; step: Step }): Promise<StepResult>;
  reflect(context: AgentContext): Promise<Reflection>;
}

