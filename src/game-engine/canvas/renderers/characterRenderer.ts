/**
 * Character facade: state → animation → sheet blit (or procedural fallback).
 */

import type { AgentVisualState } from "@/game-engine/entity";
import type { TurtleId } from "@/game-engine/canvas/types";
import type { FacingDir } from "@/game-engine/canvas/spriteAnimator";
import { getAnimationFrame, missionIconBob, selectionPulse } from "@/game-engine/canvas/spriteAnimator";
import { resolveSpriteAnimation } from "@/game-engine/canvas/characterStateMapper";
import { AGENT_BODY } from "@/game-engine/canvas/constants";
import { getSpriteSheet } from "@/game-engine/canvas/spriteImageCache";
import { drawSpriteFrame } from "@/game-engine/canvas/spriteSheetRenderer";
import { drawMentorProcedural, drawSquadMemberProcedural } from "@/game-engine/canvas/proceduralSquadCharacters";

export type TurtleHeroOpts = {
  facing: FacingDir;
  walking: boolean;
  selected: boolean;
  visual: AgentVisualState;
  now: number;
  celebrate: boolean;
  online: boolean;
  settling: boolean;
  settleProgress: number;
};

export function drawTurtleHero(
  ctx: CanvasRenderingContext2D,
  id: TurtleId,
  x: number,
  y: number,
  opts: TurtleHeroOpts,
): void {
  const { facing, walking, selected, visual, now, celebrate, online, settling, settleProgress } = opts;

  const animation = resolveSpriteAnimation({
    online,
    visual,
    walking,
    selected,
    celebrate,
  });
  const frame = getAnimationFrame(animation, now);

  const sheet = getSpriteSheet(id);
  if (sheet) {
    drawSpriteFrame(ctx, sheet, animation, frame, facing, x, y, AGENT_BODY, AGENT_BODY, now, {
      selected,
      offlineTint: !online,
    });
    return;
  }

  drawSquadMemberProcedural(ctx, id, x, y, facing, animation, frame, now, {
    selected,
    settling,
    settleT: settleProgress,
  });
}

export function drawMentorHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  selected: boolean,
  now: number,
): void {
  const sheet = getSpriteSheet("splinter");
  if (sheet) {
    drawSpriteFrame(ctx, sheet, "idle", getAnimationFrame("idle", now), "down", x, y - 8, AGENT_BODY, AGENT_BODY, now, {
      selected,
      offlineTint: false,
    });
    return;
  }
  drawMentorProcedural(ctx, x, y, now, selected);
}

export function drawMissionGlyph(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  glyph: string,
  now: number,
  critical: boolean,
  selected: boolean,
): void {
  const bob = missionIconBob(now);
  const pulse = selected ? selectionPulse(now) : 0;
  ctx.save();
  ctx.font = "13px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#000";
  ctx.fillStyle = critical ? "#fde047" : "#fff";
  ctx.strokeText(glyph, cx, topY - 8 + bob);
  ctx.fillText(glyph, cx, topY - 8 + bob);
  if (critical) {
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2 + pulse * 2;
    ctx.beginPath();
    ctx.arc(cx, topY - 12 + bob, 12 + pulse * 2, 0, Math.PI * 2);
    ctx.stroke();
  } else if (selected) {
    ctx.strokeStyle = `rgba(34,211,238,${0.35 + pulse * 0.35})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, topY - 12 + bob, 11, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}
