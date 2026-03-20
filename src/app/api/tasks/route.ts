import { NextRequest, NextResponse } from "next/server";
import { dashboardService } from "@/application/services/dashboardService";
import type { TaskCreateInput } from "@/domain/types";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<TaskCreateInput>;

  if (!body.title || !body.description || !body.priority) {
    return NextResponse.json({ error: "title, description, and priority are required." }, { status: 400 });
  }

  const state = await dashboardService.createTask({
    title: body.title,
    description: body.description,
    priority: body.priority,
    assignedTo: body.assignedTo ?? null,
  });

  return NextResponse.json(state, { status: 201 });
}

