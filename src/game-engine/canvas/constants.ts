import type { TurtleId } from "./types";

/** World size matches `scene.ts` SCENE grid. */
export const WORLD = {
  cellPx: 10,
  cols: 56,
  rows: 36,
} as const;

export const worldPixelSize = () => ({
  width: WORLD.cols * WORLD.cellPx,
  height: WORLD.rows * WORLD.cellPx,
});

/** Turtle body size in world pixels (sprite footprint) — larger for beat-em-up readability. */
export const AGENT_BODY = 46;

export const TURTLE_COLORS: Record<TurtleId, { fill: string; stroke: string; label: string }> = {
  leonardo: { fill: "#1d4ed8", stroke: "#0f172a", label: "L" },
  raphael: { fill: "#b91c1c", stroke: "#0f172a", label: "R" },
  donatello: { fill: "#6d28d9", stroke: "#0f172a", label: "D" },
  michelangelo: { fill: "#ea580c", stroke: "#0f172a", label: "M" },
};

export const SPLINTER_COLOR = { fill: "#92400e", stroke: "#0f172a", label: "★" };
