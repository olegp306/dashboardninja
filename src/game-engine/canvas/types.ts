import type { AgentId } from "@/domain/types";

export type TurtleId = Exclude<AgentId, "splinter">;

export type HitTarget =
  | { kind: "agent"; id: AgentId }
  | { kind: "table"; id: Exclude<AgentId, "splinter"> | "splinter" }
  | { kind: "none" };

export type VisualSnapshot = {
  bubbleText: string | null;
  visual: import("@/game-engine/entity").AgentVisualState;
  taskIcon: string;
  progress: number;
  critical: boolean;
  thinking: boolean;
};
