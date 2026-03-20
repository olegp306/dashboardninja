import type { PixelPos } from "@/game-engine/entity";
import type { AgentVisualState } from "@/game-engine/entity";
import { AGENT_BODY } from "@/game-engine/canvas/constants";

export function agentHitBox(pos: PixelPos): { x: number; y: number; w: number; h: number } {
  return { x: pos.x, y: pos.y, w: AGENT_BODY, h: AGENT_BODY };
}

export function splinterHitBox(pos: PixelPos): { x: number; y: number; w: number; h: number } {
  return { x: pos.x, y: pos.y - 8, w: AGENT_BODY, h: AGENT_BODY };
}

/** Name + progress strip under procedural sprite. */
export function drawUnitHud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  progress: number,
  visual: AgentVisualState,
): void {
  const w = AGENT_BODY;
  ctx.save();
  ctx.font = "7px monospace";
  const short = label.split(" ")[0] ?? label;
  const tw = ctx.measureText(short).width;
  ctx.fillStyle = "rgba(0,0,0,0.88)";
  ctx.fillRect(x + w / 2 - tw / 2 - 4, y + AGENT_BODY + 2, tw + 8, 12);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + w / 2 - tw / 2 - 4, y + AGENT_BODY + 2, tw + 8, 12);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(short, x + w / 2, y + AGENT_BODY + 8);

  const barY = y + AGENT_BODY + 16;
  ctx.fillStyle = "#18181b";
  ctx.fillRect(x, barY, w, 5);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, barY, w, 5);
  ctx.fillStyle = visual === "error" ? "#f43f5e" : visual === "offline" ? "#71717a" : "#34d399";
  ctx.fillRect(x + 1, barY + 1, (w - 2) * Math.min(1, Math.max(0, progress)), 3);
  ctx.restore();
}
