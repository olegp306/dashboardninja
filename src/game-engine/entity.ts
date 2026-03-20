import type { AgentId } from "@/domain/types";

/** Grid coordinates (integer cells). */
export type GridPos = { gx: number; gy: number };

/** Pixel position inside the scene (top-left of sprite). */
export type PixelPos = { x: number; y: number };

export type AgentVisualState =
  | "idle"
  | "working"
  | "thinking"
  | "communicating"
  | "error"
  | "offline";

export type SceneEntityId = AgentId | `table-${string}` | "splinter-desk";

export type TableKind = "leonardo" | "raphael" | "donatello" | "michelangelo" | "splinter";
