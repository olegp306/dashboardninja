"use client";

import { useEffect, useMemo, useState } from "react";
import type { DashboardState, TaskPriority, TaskStatus } from "@/domain/types";

type NewTaskPayload = {
  title: string;
  description: string;
  priority: TaskPriority;
  assignedTo: string | null;
};

export const useMissionStream = () => {
  const [state, setState] = useState<DashboardState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentlyUpdatedTaskIds, setRecentlyUpdatedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const response = await fetch("/api/state");
        if (!response.ok) throw new Error("Could not load initial mission state.");
        const data = (await response.json()) as DashboardState;
        setState(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown bootstrap error.");
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();

    const source = new EventSource("/api/stream");
    source.addEventListener("state", (event) => {
      const data = JSON.parse((event as MessageEvent<string>).data) as DashboardState;
      setState((prev) => {
        if (!prev) return data;
        const prevMap = new Map(prev.tasks.map((task) => [task.id, task.updatedAt]));
        const changed = data.tasks
          .filter((task) => prevMap.get(task.id) && prevMap.get(task.id) !== task.updatedAt)
          .map((task) => task.id);
        if (changed.length > 0) {
          setRecentlyUpdatedTaskIds(changed);
          window.setTimeout(() => setRecentlyUpdatedTaskIds([]), 1100);
        }
        return data;
      });
      setError(null);
    });
    source.onerror = () => setError("Realtime stream interrupted. Retrying...");

    return () => source.close();
  }, []);

  const summary = useMemo(() => {
    if (!state) return null;
    return {
      activeAgents: state.agents.filter((agent) => agent.status === "working").length,
      activeTasks: state.tasks.filter((task) => task.status === "assigned" || task.status === "in_progress").length,
      queuedTasks: state.tasks.filter((task) => task.status === "queued").length,
    };
  }, [state]);

  const createTask = async (payload: NewTaskPayload) => {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Task creation failed.");
    }
    setState((await response.json()) as DashboardState);
  };

  const patchTask = async (taskId: string, patch: { assignedTo?: string | null; status?: TaskStatus }) => {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) throw new Error("Task update failed.");
    setState((await response.json()) as DashboardState);
  };

  return { state, summary, loading, error, createTask, patchTask, recentlyUpdatedTaskIds };
};

