import type { AgentId } from "@/domain/types";
import type { GridPos } from "./entity";

/** Scene is a fixed top-down room (grid cells). */
export const SCENE = {
  /** Larger cells for readability; still grid-snapped movement. */
  cellPx: 10,
  cols: 56,
  rows: 36,
} as const;

export const scenePixelSize = () => ({
  width: SCENE.cols * SCENE.cellPx,
  height: SCENE.rows * SCENE.cellPx,
});

/** Splinter: center top — elevated “boss” desk. */
export const SPLINTER_GRID: GridPos = { gx: 28, gy: 4 };

/** Turtle desks — 2×2 layout. */
export const TABLE_GRIDS: Record<Exclude<AgentId, "splinter">, GridPos> = {
  leonardo: { gx: 12, gy: 14 },
  raphael: { gx: 40, gy: 14 },
  donatello: { gx: 12, gy: 26 },
  michelangelo: { gx: 40, gy: 26 },
};

/** Default stand positions (near own table, “pixel” offset). */
export const HOME_OFFSET: Record<Exclude<AgentId, "splinter">, GridPos> = {
  leonardo: { gx: 2, gy: 2 },
  raphael: { gx: -2, gy: 2 },
  donatello: { gx: 2, gy: -2 },
  michelangelo: { gx: -2, gy: -2 },
};

export const gridToPixel = (g: GridPos) => ({
  x: g.gx * SCENE.cellPx,
  y: g.gy * SCENE.cellPx,
});

export const agentHomeGrid = (id: Exclude<AgentId, "splinter">): GridPos => ({
  gx: TABLE_GRIDS[id].gx + HOME_OFFSET[id].gx,
  gy: TABLE_GRIDS[id].gy + HOME_OFFSET[id].gy,
});

export const splinterStandGrid = (): GridPos => ({ gx: SPLINTER_GRID.gx, gy: SPLINTER_GRID.gy + 3 });
