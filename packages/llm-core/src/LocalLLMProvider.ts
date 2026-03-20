import type { LLMGenerateInput, LLMGenerateOutput, LLMProvider } from "./types";

/**
 * TODO(LocalLLM): Wire to Ollama / LM Studio / other local inference servers.
 * Intentionally not implemented: we don't want a fake "working" integration.
 */
export class LocalLLMProvider implements LLMProvider {
  async generate(input: LLMGenerateInput): Promise<LLMGenerateOutput> {
    void input;
    throw new Error("LocalLLMProvider is not implemented yet (Ollama/LM Studio adapter TODO).");
  }
}
