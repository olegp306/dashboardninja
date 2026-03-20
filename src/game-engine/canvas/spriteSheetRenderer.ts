/**
 * Image-based sprite blit — nearest-neighbor, direction mirror, shadow.
 */

import type { SpriteAnimationName } from "@/game-engine/canvas/spriteTypes";
import type { FacingDir } from "@/game-engine/canvas/spriteAnimator";
import { getAnimationTiming } from "@/game-engine/canvas/spriteRegistry";
import { SHEET_FRAME_H, SHEET_FRAME_W, getSpriteSheetRow } from "@/game-engine/canvas/spriteSheetLayout";
import { selectionPulse } from "@/game-engine/canvas/spriteAnimator";

export function drawSpriteFrame(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  animation: SpriteAnimationName,
  frame: number,
  facing: FacingDir,
  dx: number,
  dy: number,
  destW: number,
  destH: number,
  now: number,
  opts: { selected: boolean; offlineTint: boolean },
): void {
  const timing = getAnimationTiming(animation);
  const col = frame % timing.frames;
  const row = getSpriteSheetRow(animation, facing);
  const sx = col * SHEET_FRAME_W;
  const sy = row * SHEET_FRAME_H;

  const cx = dx + destW / 2;
  const cy = dy + destH / 2;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.ellipse(cx, dy + destH + 2, destW * 0.38, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(cx, cy);
  if (facing === "right") ctx.scale(-1, 1);
  if (opts.offlineTint) ctx.filter = "grayscale(0.85) brightness(0.75)";
  ctx.drawImage(img, sx, sy, SHEET_FRAME_W, SHEET_FRAME_H, -destW / 2, -destH / 2, destW, destH);
  ctx.filter = "none";

  if (opts.selected) {
    const p = selectionPulse(now);
    ctx.strokeStyle = `rgba(253,224,71,${0.45 + p * 0.5})`;
    ctx.lineWidth = 2.5 + p * 2;
    ctx.shadowColor = "rgba(250,204,21,0.55)";
    ctx.shadowBlur = 5 + p * 5;
    ctx.beginPath();
    ctx.arc(0, 0, destW / 2 + 4 + p * 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}
