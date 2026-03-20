import type { LLMGenerateInput, LLMGenerateOutput, LLMProvider } from "./types";

type OpenAIChatResponse = {
  choices?: Array<{
    message?: { content?: string | null };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: { message?: string };
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const isTransientStatus = (status: number) => status === 408 || status === 409 || status === 429 || status >= 500;

export class OpenAIProvider implements LLMProvider {
  constructor(
    private readonly args: {
      apiKey: string;
      model: string;
      baseUrl?: string;
      timeoutMs: number;
    },
  ) {}

  async generate(input: LLMGenerateInput): Promise<LLMGenerateOutput> {
    const url = `${(this.args.baseUrl ?? "https://api.openai.com").replace(/\/$/, "")}/v1/chat/completions`;

    const body = {
      model: this.args.model,
      temperature: input.temperature ?? 0.2,
      max_tokens: input.maxTokens,
      messages: [
        { role: "system", content: input.systemPrompt },
        { role: "user", content: input.userPrompt },
      ],
    };

    const attempt = async (retry: boolean): Promise<LLMGenerateOutput> => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.args.timeoutMs);
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.args.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        const rawText = await response.text();
        let parsed: OpenAIChatResponse | null = null;
        try {
          parsed = JSON.parse(rawText) as OpenAIChatResponse;
        } catch {
          parsed = null;
        }

        if (!response.ok) {
          const message =
            parsed?.error?.message ??
            `OpenAI HTTP ${response.status}: ${rawText.slice(0, 500)}`;
          if (!retry && isTransientStatus(response.status)) {
            await sleep(350);
            return await attempt(true);
          }
          throw new Error(message);
        }

        const text = parsed?.choices?.[0]?.message?.content?.trim() ?? "";
        if (!text) {
          throw new Error("OpenAI returned an empty completion.");
        }

        return {
          text,
          usage: {
            promptTokens: parsed?.usage?.prompt_tokens,
            completionTokens: parsed?.usage?.completion_tokens,
            totalTokens: parsed?.usage?.total_tokens,
          },
          raw: parsed ?? rawText,
        };
      } catch (err) {
        const name = err instanceof Error ? err.name : "";
        const isAbort = name === "AbortError";
        if (!retry && isAbort) {
          await sleep(250);
          return await attempt(true);
        }
        throw err instanceof Error ? err : new Error("OpenAI request failed.");
      } finally {
        clearTimeout(timer);
      }
    };

    return await attempt(false);
  }
}
