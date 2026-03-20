import type { CharacterSpriteDefinition, SpriteAnimationName } from "@/game-engine/canvas/spriteTypes";
import { AGENT_BODY } from "@/game-engine/canvas/constants";

/** Public URL for generated PNG (see `npm run sprites`). */
export const spriteSheetPublicUrl = (id: string) => `/assets/sprites/${id}.png`;

/** Placeholder “sheet” size — procedural draws inside this box until real art lands. */
export const SQUAD_FRAME = {
  w: AGENT_BODY,
  h: AGENT_BODY,
} as const;

const anim = (
  frames: number,
  msPerFrame: number,
): { frames: number; msPerFrame: number } => ({ frames, msPerFrame });

/** Global timing — beat-em-up: snappy walk, slower idle. */
export const SPRITE_ANIMATION_TIMING: Record<SpriteAnimationName, { frames: number; msPerFrame: number }> = {
  idle: anim(4, 130),
  walk: anim(6, 68),
  selected: anim(4, 125),
  thinking: anim(3, 190),
  communicating: anim(4, 150),
  blocked: anim(3, 165),
  celebrate: anim(5, 85),
  offline: anim(2, 420),
};

export function getAnimationTiming(name: SpriteAnimationName) {
  return SPRITE_ANIMATION_TIMING[name];
}

/** Registry entry per squad member — future: spriteSheet path + UVs. */
export function createPlaceholderDefinition(id: string): CharacterSpriteDefinition {
  return {
    id,
    frameWidth: SQUAD_FRAME.w,
    frameHeight: SQUAD_FRAME.h,
    animations: { ...SPRITE_ANIMATION_TIMING },
  };
}

export const SQUAD_REGISTRY: Record<string, CharacterSpriteDefinition> = {
  leonardo: createPlaceholderDefinition("leonardo"),
  raphael: createPlaceholderDefinition("raphael"),
  donatello: createPlaceholderDefinition("donatello"),
  michelangelo: createPlaceholderDefinition("michelangelo"),
};
