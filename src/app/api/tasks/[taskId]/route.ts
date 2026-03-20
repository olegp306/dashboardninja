import { NextRequest, NextResponse } from "next/server";
import { dashboardService } from "@/application/services/dashboardService";
import type { TaskStatus } from "@/domain/types";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await context.params;
  const body = (await request.json()) as {
    assignedTo?: string | null;
    status?: TaskStatus;
  };

  let state = await dashboardService.getDashboardState();

  if (body.assignedTo !== undefined) {
    state = await dashboardService.assignTask({
      taskId,
      assignedTo: body.assignedTo as typeof state.tasks[number]["assignedTo"],
    });
  }

  if (body.status) {
    state = await dashboardService.updateTaskStatus({
      taskId,
      status: body.status,
    });
  }

  return NextResponse.json(state);
}

