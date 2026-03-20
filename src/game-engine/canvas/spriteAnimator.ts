/**
 * Frame indices + motion feel — future: drive from SpriteRegistry / sheet UVs.
 */

import type { SpriteAnimationName } from "@/game-engine/canvas/spriteTypes";
import { getAnimationTiming } from "@/game-engine/canvas/spriteRegistry";

export type FacingDir = "up" | "down" | "left" | "right";

export function facingFromDxDy(dx: number, dy: number): FacingDir {
  if (Math.hypot(dx, dy) < 0.08) return "down";
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}

export function getAnimationFrame(anim: SpriteAnimationName, nowMs: number): number {
  const t = getAnimationTiming(anim);
  return Math.floor(nowMs / t.msPerFrame) % t.frames;
}

/** 16-bit walk: punchy vertical bob synced to frame. */
export function walkStrideBob(nowMs: number, frame: number): number {
  return Math.sin(nowMs / 58 + frame * 1.1) * 2.8;
}

/** Arrival squash — one-shot feel (caller passes 0..1). */
export function settleSquash(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 0;
  return Math.sin(t * Math.PI) * 3;
}

/** Selection ring pulse 0..1. */
export function selectionPulse(nowMs: number): number {
  return (Math.sin(nowMs / 210) + 1) / 2;
}

/** Mission icon bounce. */
export function missionIconBob(nowMs: number): number {
  return Math.sin(nowMs / 175) * 2.2;
}
