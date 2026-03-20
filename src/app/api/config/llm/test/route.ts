import { NextResponse } from "next/server";
import { dashboardService } from "@/application/services/dashboardService";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { prompt?: string };
    const result = await dashboardService.testLLMConnection({ prompt: body.prompt });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "LLM test failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
