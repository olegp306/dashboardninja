import { NextResponse } from "next/server";
import { dashboardService } from "@/application/services/dashboardService";
import type { AgentId } from "@/domain/types";
import { AGENT_IDS } from "@/domain/types";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!AGENT_IDS.includes(id as AgentId)) {
    return NextResponse.json({ error: "Unknown agent id" }, { status: 404 });
  }

  return NextResponse.json({ agentId: id, items: dashboardService.getReasoningHistory(id as AgentId) });
}
