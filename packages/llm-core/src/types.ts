export type LLMMode = "mock" | "openai" | "local";

export type LLMGenerateInput = {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, unknown>;
};

export type LLMUsage = {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

export type LLMGenerateOutput = {
  text: string;
  usage?: LLMUsage;
  raw?: unknown;
};

export interface LLMProvider {
  generate(input: LLMGenerateInput): Promise<LLMGenerateOutput>;
}
