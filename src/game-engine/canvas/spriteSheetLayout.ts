import type { SpriteAnimationName } from "@/game-engine/canvas/spriteTypes";
import type { FacingDir } from "@/game-engine/canvas/spriteAnimator";

/** Must match `scripts/generate-squad-sprites.mjs` */
export const SHEET_FRAME_W = 48;
export const SHEET_FRAME_H = 48;

/** Row index per animation (facing down / up). */
export const ANIM_ROW_DOWN: Record<SpriteAnimationName, number> = {
  idle: 0,
  walk: 1,
  thinking: 2,
  communicating: 3,
  blocked: 4,
  celebrate: 5,
  selected: 0,
  offline: 0,
};

const ROW_SIDE_IDLE = 6;
const ROW_SIDE_WALK = 7;

/**
 * Sheet row for animation + facing. Lateral rows for walk; mirrored for right.
 * “Up” reuses down rows (readable top-down MVP).
 */
export function getSpriteSheetRow(animation: SpriteAnimationName, facing: FacingDir): number {
  if (facing === "left" || facing === "right") {
    if (animation === "walk") return ROW_SIDE_WALK;
    if (animation === "communicating") return ANIM_ROW_DOWN.communicating;
    if (animation === "thinking") return ANIM_ROW_DOWN.thinking;
    if (animation === "blocked") return ANIM_ROW_DOWN.blocked;
    if (animation === "celebrate") return ANIM_ROW_DOWN.celebrate;
    return ROW_SIDE_IDLE;
  }
  return ANIM_ROW_DOWN[animation] ?? 0;
}
