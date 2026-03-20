/**
 * Data-driven sprite contract — swap sprite sheets later without changing gameplay code.
 */

export type SpriteAnimationName =
  | "idle"
  | "walk"
  | "selected"
  | "thinking"
  | "communicating"
  | "blocked"
  | "celebrate"
  | "offline";

export type AnimationDefinition = {
  /** Logical frames (sheet columns or procedural phases). */
  frames: number;
  msPerFrame: number;
};

export type CharacterArchetype = "leader" | "bruiser" | "tech" | "freeSpirit";

export type CharacterSpriteDefinition = {
  id: string;
  frameWidth: number;
  frameHeight: number;
  /** Future: sheet URL + UV rects; now drives procedural phases only. */
  animations: Record<SpriteAnimationName, AnimationDefinition>;
};

export type SquadRenderContext = {
  facing: import("@/game-engine/canvas/spriteAnimator").FacingDir;
  now: number;
  frame: number;
  animation: SpriteAnimationName;
  selected: boolean;
  settling: boolean;
};
