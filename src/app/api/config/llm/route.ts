import { NextResponse } from "next/server";
import { dashboardService } from "@/application/services/dashboardService";

export async function GET() {
  return NextResponse.json(dashboardService.getLLMConfig());
}
