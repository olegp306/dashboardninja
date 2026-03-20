import type { AgentVisualState } from "@/game-engine/entity";
import type { SpriteAnimationName } from "@/game-engine/canvas/spriteTypes";

/**
 * Maps domain + motion state → sprite animation (data-driven layer).
 * Rendering stays dumb; this stays easy to tune.
 */
export function resolveSpriteAnimation(input: {
  online: boolean;
  visual: AgentVisualState;
  walking: boolean;
  selected: boolean;
  celebrate: boolean;
}): SpriteAnimationName {
  if (!input.online) return "offline";
  if (input.celebrate) return "celebrate";
  if (input.visual === "error") return "blocked";
  if (input.visual === "thinking") return "thinking";
  if (input.visual === "communicating") return "communicating";
  if (input.walking) return "walk";
  if (input.selected) return "selected";
  return "idle";
}
