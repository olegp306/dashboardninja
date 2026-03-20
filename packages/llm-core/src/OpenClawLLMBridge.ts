import type { LLMGenerateInput, LLMGenerateOutput, LLMProvider } from "./types";

/**
 * TODO(OpenClaw): Future integration point for routing LLM calls through OpenClaw.
 * Scaffold only — no undocumented "magic" endpoints here.
 */
export class OpenClawLLMBridge implements LLMProvider {
  async generate(input: LLMGenerateInput): Promise<LLMGenerateOutput> {
    void input;
    throw new Error("OpenClawLLMBridge is not implemented yet (await OpenClaw LLM routing contract).");
  }
}
