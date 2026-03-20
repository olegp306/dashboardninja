import { NextResponse } from "next/server";
import { dashboardService } from "@/application/services/dashboardService";

export async function GET() {
  const state = await dashboardService.getDashboardState();
  return NextResponse.json(state);
}

