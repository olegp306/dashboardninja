import { LocalLLMProvider } from "./LocalLLMProvider";
import { MockLLMProvider } from "./MockLLMProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import type { LLMMode, LLMProvider } from "./types";

export type LLMProviderFactoryInput =
  | { mode: "mock" }
  | {
      mode: "openai";
      apiKey: string;
      model: string;
      baseUrl?: string;
      timeoutMs: number;
    }
  | { mode: "local" };

export const createLLMProvider = (input: LLMProviderFactoryInput): LLMProvider => {
  if (input.mode === "mock") return new MockLLMProvider();
  if (input.mode === "local") return new LocalLLMProvider();
  return new OpenAIProvider({
    apiKey: input.apiKey,
    model: input.model,
    baseUrl: input.baseUrl,
    timeoutMs: input.timeoutMs,
  });
};

export const normalizeLlmMode = (raw: string | undefined): LLMMode => {
  const v = (raw ?? "mock").toLowerCase();
  if (v === "openai" || v === "local" || v === "mock") return v;
  return "mock";
};
