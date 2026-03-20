import type { AgentId } from "@/domain/types";
import { SCENE, SPLINTER_GRID, TABLE_GRIDS, gridToPixel } from "@/game-engine/scene";

const TILE = 32;

/** Floor, walls, decorative blocks, mission tables (Canvas). */
export function drawTileMap(
  ctx: CanvasRenderingContext2D,
  worldW: number,
  worldH: number,
  tasksByAssignee: Partial<Record<AgentId, number>>,
  queuedAndAssignedCount: number,
  now: number,
): void {
  ctx.save();
  ctx.fillStyle = "#1e1236";
  ctx.fillRect(0, 0, worldW, worldH);

  // Checker tiles (32×32 world units)
  for (let y = 0; y < worldH; y += TILE) {
    for (let x = 0; x < worldW; x += TILE) {
      const ix = Math.floor(x / TILE);
      const iy = Math.floor(y / TILE);
      if ((ix + iy) % 2 === 0) {
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fillRect(x, y, TILE, TILE);
      }
    }
  }

  // Fine grid (movement cells)
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1;
  const step = SCENE.cellPx * 2;
  for (let x = 0; x <= worldW; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, worldH);
    ctx.stroke();
  }
  for (let y = 0; y <= worldH; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(worldW, y);
    ctx.stroke();
  }

  // Wall frame
  ctx.strokeStyle = "#0b0614";
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, worldW - 8, worldH - 8);
  ctx.strokeStyle = "rgba(94,234,212,0.15)";
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, worldW - 20, worldH - 20);

  // Props (pizzeria)
  drawBlock(ctx, gridToPixel({ gx: 4, gy: 10 }), 6, 5, "#a16207", "counter");
  drawBlock(ctx, gridToPixel({ gx: 44, gy: 8 }), 7, 6, "#701a75", "arcade");
  drawBlock(ctx, gridToPixel({ gx: 24, gy: 30 }), 8, 3, "#3f3f46", "kitchen");

  // Neon sign
  const neonX = worldW / 2;
  ctx.font = "10px monospace";
  ctx.textAlign = "center";
  const pulse = 0.75 + Math.sin(now / 280) * 0.25;
  ctx.fillStyle = `rgba(244,114,182,${pulse})`;
  ctx.fillRect(neonX - 72, 10, 144, 22);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.strokeRect(neonX - 72, 10, 144, 22);
  ctx.fillStyle = "#fff";
  ctx.fillText("PIZZA OPS", neonX, 25);

  // Splinter HQ desk
  drawTable(ctx, SPLINTER_GRID, "#3b2b1a", "HQ", queuedAndAssignedCount);

  const ids = Object.keys(TABLE_GRIDS) as Exclude<AgentId, "splinter">[];
  const accents: Record<string, string> = {
    leonardo: "#1e3a8a",
    raphael: "#7f1d1d",
    donatello: "#5b21b6",
    michelangelo: "#9a3412",
  };
  for (const id of ids) {
    drawTable(ctx, TABLE_GRIDS[id], accents[id] ?? "#334155", id.slice(0, 3), tasksByAssignee[id] ?? 0);
  }

  ctx.restore();
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  pos: { x: number; y: number },
  gw: number,
  gh: number,
  fill: string,
  label: string,
) {
  const w = gw * SCENE.cellPx;
  const h = gh * SCENE.cellPx;
  ctx.fillStyle = fill;
  ctx.fillRect(pos.x, pos.y, w, h);
  const g = ctx.createLinearGradient(pos.x, pos.y, pos.x, pos.y + h);
  g.addColorStop(0, "rgba(255,255,255,0.12)");
  g.addColorStop(0.35, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = g;
  ctx.fillRect(pos.x, pos.y, w, h);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  ctx.strokeRect(pos.x, pos.y, w, h);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(pos.x, pos.y, w, 14);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 8px monospace";
  ctx.textAlign = "left";
  ctx.fillText(label, pos.x + 4, pos.y + 10);
  // Stools / props hint
  ctx.fillStyle = "#3f3f46";
  ctx.fillRect(pos.x + w - 14, pos.y + h - 12, 10, 10);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.strokeRect(pos.x + w - 14, pos.y + h - 12, 10, 10);
}

function drawTable(
  ctx: CanvasRenderingContext2D,
  grid: { gx: number; gy: number },
  fill: string,
  title: string,
  taskCount: number,
) {
  const pos = gridToPixel(grid);
  const w = 10 * SCENE.cellPx;
  const h = 5 * SCENE.cellPx;
  ctx.fillStyle = fill;
  ctx.fillRect(pos.x, pos.y, w, h);
  const g = ctx.createLinearGradient(pos.x, pos.y, pos.x, pos.y + h);
  g.addColorStop(0, "rgba(255,255,255,0.1)");
  g.addColorStop(0.5, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.25)");
  ctx.fillStyle = g;
  ctx.fillRect(pos.x, pos.y, w, h);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  ctx.strokeRect(pos.x, pos.y, w, h);
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(pos.x, pos.y, w, 16);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 8px monospace";
  ctx.textAlign = "left";
  ctx.fillText(title, pos.x + 4, pos.y + 11);
  ctx.font = "8px monospace";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(`missions ${taskCount}`, pos.x + 4, pos.y + h - 6);
  // Booth / chairs
  ctx.fillStyle = "#27272a";
  ctx.fillRect(pos.x + 4, pos.y + h - 2, 8, 4);
  ctx.fillRect(pos.x + w - 12, pos.y + h - 2, 8, 4);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.strokeRect(pos.x + 4, pos.y + h - 2, 8, 4);
  ctx.strokeRect(pos.x + w - 12, pos.y + h - 2, 8, 4);
}
