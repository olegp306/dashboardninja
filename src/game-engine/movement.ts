import type { AgentId } from "@/domain/types";
import type { GridPos } from "./entity";
import { SPLINTER_GRID, agentHomeGrid, gridToPixel, splinterStandGrid, TABLE_GRIDS } from "./scene";

/** Movement speed: cells per second (personality). */
export const WALK_SPEED: Record<Exclude<AgentId, "splinter">, number> = {
  leonardo: 5.5,
  raphael: 7.2,
  donatello: 5.0,
  michelangelo: 6.2,
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export const gridDist = (a: GridPos, b: GridPos) => Math.hypot(a.gx - b.gx, a.gy - b.gy);

/**
 * Step toward target on a grid (8-dir), one axis at a time (NES-like), for predictable paths.
 */
export const stepToward = (from: GridPos, to: GridPos): GridPos => {
  if (from.gx === to.gx && from.gy === to.gy) return { ...from };
  const dx = clamp(to.gx - from.gx, -1, 1);
  const dy = clamp(to.gy - from.gy, -1, 1);
  if (Math.abs(to.gx - from.gx) >= Math.abs(to.gy - from.gy)) {
    return { gx: from.gx + dx, gy: from.gy };
  }
  return { gx: from.gx, gy: from.gy + dy };
};

export const pixelLerp = (
  from: { x: number; y: number },
  to: { x: number; y: number },
  t: number,
) => ({
  x: from.x + (to.x - from.x) * t,
  y: from.y + (to.y - from.y) * t,
});

/** Target grid near another agent's table (for “walk to help”). */
export const gridNearPeerTable = (visitor: Exclude<AgentId, "splinter">, peer: Exclude<AgentId, "splinter">): GridPos => {
  const base = TABLE_GRIDS[peer];
  // Stand on a side depending on visitor to avoid overlap.
  const side: Record<string, GridPos> = {
    leonardo: { gx: -3, gy: 0 },
    raphael: { gx: 3, gy: 0 },
    donatello: { gx: 0, gy: -3 },
    michelangelo: { gx: 0, gy: 3 },
  };
  const o = side[visitor] ?? { gx: 0, gy: 0 };
  return { gx: base.gx + o.gx, gy: base.gy + o.gy };
};

export const splinterPixelPos = () => gridToPixel(splinterStandGrid());

export const gridNearSplinter = (visitor: Exclude<AgentId, "splinter">): GridPos => ({
  gx: SPLINTER_GRID.gx + (visitor === "raphael" ? 4 : -4),
  gy: SPLINTER_GRID.gy + 5,
});

export const homePixel = (id: Exclude<AgentId, "splinter">) => gridToPixel(agentHomeGrid(id));
