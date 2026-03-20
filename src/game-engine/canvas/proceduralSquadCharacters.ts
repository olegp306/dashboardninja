/**
 * Original mutant-squad silhouettes — layered procedural “sprites”.
 * Replace drawSquadMemberProcedural with sheet blit when assets exist.
 */

import type { CharacterArchetype, SpriteAnimationName } from "@/game-engine/canvas/spriteTypes";
import type { FacingDir } from "@/game-engine/canvas/spriteAnimator";
import { walkStrideBob, selectionPulse } from "@/game-engine/canvas/spriteAnimator";
import { AGENT_BODY } from "@/game-engine/canvas/constants";
import type { TurtleId } from "@/game-engine/canvas/types";

const ST = "#0a0a0a";
const SKIN = "#3f6212";
const SKIN_HI = "#4d7c0f";

const ARCH: Record<
  CharacterArchetype,
  { band: string; bandDark: string; accent: string; wideChest: number; arm: number }
> = {
  leader: { band: "#1d4ed8", bandDark: "#1e3a8a", accent: "#93c5fd", wideChest: 1.12, arm: 1 },
  bruiser: { band: "#b91c1c", bandDark: "#7f1d1d", accent: "#fca5a5", wideChest: 1.22, arm: 1.35 },
  tech: { band: "#6d28d9", bandDark: "#4c1d95", accent: "#c4b5fd", wideChest: 0.92, arm: 0.85 },
  freeSpirit: { band: "#ea580c", bandDark: "#9a3412", accent: "#fdba74", wideChest: 1.02, arm: 1.05 },
};

export function turtleIdToArchetype(id: TurtleId): CharacterArchetype {
  switch (id) {
    case "leonardo":
      return "leader";
    case "raphael":
      return "bruiser";
    case "donatello":
      return "tech";
    case "michelangelo":
      return "freeSpirit";
    default:
      return "leader";
  }
}

export function drawSquadMemberProcedural(
  ctx: CanvasRenderingContext2D,
  id: TurtleId,
  x: number,
  y: number,
  facing: FacingDir,
  animation: SpriteAnimationName,
  frame: number,
  now: number,
  opts: { selected: boolean; settling: boolean; settleT: number },
): void {
  const arch = ARCH[turtleIdToArchetype(id)];
  const W = AGENT_BODY;
  const cx = x + W / 2;
  const cy = y + W / 2;

  let bob = 0;
  if (animation === "walk") {
    bob = walkStrideBob(now, frame);
  } else if (animation === "idle" || animation === "selected") {
    bob = frame % 2 === 0 ? 0 : -1.2;
  } else if (animation === "celebrate") {
    bob = Math.sin(now / 55) * 2.5;
  } else if (animation === "blocked") {
    bob = Math.sin(now / 90) * 1.5;
  }

  const settleY = opts.settling ? Math.sin(opts.settleT * Math.PI) * 2 : 0;

  ctx.save();

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.48)";
  ctx.beginPath();
  ctx.ellipse(cx, y + W + 2, W * 0.42, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(cx, cy + bob + settleY);
  if (facing === "left") ctx.scale(-1, 1);
  else if (facing === "right") ctx.scale(1, 1);
  else if (facing === "up") ctx.scale(1, -1);
  ctx.translate(-cx, -cy - bob - settleY);

  if (animation === "offline") ctx.globalAlpha = 0.38;

  if (facing === "up") {
    drawBackShell(ctx, x, y, W, arch);
  } else {
    drawFrontBody(ctx, x, y, W, arch, id, animation, frame, now);
  }

  ctx.globalAlpha = 1;
  ctx.restore();

  if (opts.selected) {
    const p = selectionPulse(now);
    ctx.save();
    ctx.strokeStyle = `rgba(253,224,71,${0.45 + p * 0.5})`;
    ctx.lineWidth = 2.5 + p * 2.5;
    ctx.shadowColor = "rgba(250,204,21,0.55)";
    ctx.shadowBlur = 6 + p * 6;
    ctx.beginPath();
    ctx.arc(cx, cy + bob + settleY, W / 2 + 5 + p * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawBackShell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  W: number,
  arch: (typeof ARCH)["leader"],
): void {
  const cx = x + W / 2;
  ctx.fillStyle = "#14532d";
  ctx.beginPath();
  ctx.ellipse(cx, y + W * 0.42, W * 0.38, W * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ST;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, y + W * 0.38, W * 0.22, 0.3, Math.PI - 0.3);
  ctx.stroke();
  ctx.fillStyle = arch.bandDark;
  ctx.fillRect(x + W * 0.2, y + W - 10, W * 0.6, 6);
  ctx.strokeStyle = ST;
  ctx.strokeRect(x + W * 0.2, y + W - 10, W * 0.6, 6);
  ctx.fillStyle = SKIN;
  ctx.beginPath();
  ctx.arc(cx, y + W - 6, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawFrontBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  W: number,
  arch: (typeof ARCH)["leader"],
  id: TurtleId,
  animation: SpriteAnimationName,
  frame: number,
  now: number,
): void {
  const cx = x + W / 2;
  const chestW = W * 0.72 * arch.wideChest;

  const walkPhase = animation === "walk" ? frame % 6 : 0;
  const legL = animation === "walk" ? (walkPhase < 3 ? 3 : -3) : 0;
  const legR = -legL;
  const armSwing =
    animation === "walk"
      ? Math.sin((walkPhase / 6) * Math.PI * 2) * 4
      : animation === "celebrate"
        ? Math.sin(now / 40) * 6
        : animation === "communicating"
          ? 2
          : 0;

  // Legs / boots (weight low)
  ctx.fillStyle = "#27272a";
  ctx.strokeStyle = ST;
  ctx.lineWidth = 2;
  ctx.fillRect(x + W * 0.22 + legL, y + W - 10, 9, 10);
  ctx.strokeRect(x + W * 0.22 + legL, y + W - 10, 9, 10);
  ctx.fillRect(x + W * 0.58 + legR, y + W - 10, 9, 10);
  ctx.strokeRect(x + W * 0.58 + legR, y + W - 10, 9, 10);

  // Plastron (chest)
  ctx.fillStyle = "#86efac";
  ctx.beginPath();
  ctx.moveTo(x + (W - chestW) / 2, y + W * 0.42);
  ctx.lineTo(x + (W - chestW) / 2 + chestW, y + W * 0.42);
  ctx.lineTo(x + (W - chestW) / 2 + chestW - 4, y + W * 0.78);
  ctx.lineTo(x + (W - chestW) / 2 + 4, y + W * 0.78);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = ST;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Shell mass behind
  ctx.fillStyle = "#166534";
  ctx.beginPath();
  ctx.ellipse(cx, y + W * 0.38, W * 0.36, W * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ST;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Arms
  const aw = 8 * arch.arm;
  const ah = 16 * arch.arm;
  ctx.fillStyle = SKIN_HI;
  ctx.fillRect(x + 4 + armSwing, y + W * 0.36, aw, ah);
  ctx.strokeStyle = ST;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 4 + armSwing, y + W * 0.36, aw, ah);
  ctx.fillRect(x + W - 4 - aw - armSwing, y + W * 0.36, aw, ah);
  ctx.strokeRect(x + W - 4 - aw - armSwing, y + W * 0.36, aw, ah);

  // Tech goggles (donatello)
  const goggleY = y + 14;

  // Head
  ctx.fillStyle = SKIN;
  ctx.beginPath();
  ctx.arc(cx, y + 16, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ST;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Bandana + personality
  ctx.fillStyle = arch.band;
  ctx.fillRect(x + 6, y + 6, W - 12, 9);
  ctx.strokeStyle = ST;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 6, y + 6, W - 12, 9);
  ctx.fillStyle = arch.bandDark;
  ctx.fillRect(x + 6, y + 10, W - 12, 4);

  if (id === "donatello") {
    ctx.fillStyle = "#312e81";
    ctx.fillRect(x + 10, goggleY, W - 20, 6);
    ctx.strokeStyle = ST;
    ctx.strokeRect(x + 10, goggleY, W - 20, 6);
    ctx.fillStyle = "#a5b4fc";
    ctx.fillRect(x + 12, goggleY + 1, 8, 4);
    ctx.fillRect(x + W - 20, goggleY + 1, 8, 4);
    ctx.fillStyle = arch.accent;
    ctx.fillRect(cx - 2, y + 4, 4, 3);
  }

  if (id === "raphael") {
    ctx.fillStyle = "#7f1d1d";
    ctx.beginPath();
    ctx.arc(x + 8, y + W * 0.5, 5, 0, Math.PI * 2);
    ctx.arc(x + W - 8, y + W * 0.5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ST;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  if (id === "michelangelo") {
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 10);
    ctx.lineTo(x, y + 18);
    ctx.lineTo(x + 6, y + 14);
    ctx.fillStyle = arch.band;
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + W - 4, y + 10);
    ctx.lineTo(x + W, y + 18);
    ctx.lineTo(x + W - 6, y + 14);
    ctx.fill();
    ctx.stroke();
  }

  // Eyes
  ctx.fillStyle = "#fefce8";
  ctx.fillRect(x + 11, y + 14, 4, 4);
  ctx.fillRect(x + W - 15, y + 14, 4, 4);
  ctx.fillStyle = ST;
  ctx.fillRect(x + 12, y + 15, 2, 2);
  ctx.fillRect(x + W - 14, y + 15, 2, 2);

  if (animation === "blocked") {
    ctx.fillStyle = "#fecaca";
    ctx.font = "bold 11px monospace";
    ctx.fillText("!", cx - 3, y + 4);
  }
  if (animation === "communicating") {
    ctx.strokeStyle = ST;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + W - 4, y + 18);
    ctx.quadraticCurveTo(x + W + 8, y + 12, x + W + 4, y + 6);
    ctx.stroke();
  }
}

/** Mentor — brown, robe, staff, centered stance. */
export function drawMentorProcedural(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  now: number,
  selected: boolean,
): void {
  const W = AGENT_BODY;
  const cx = x + W / 2;
  const cy = y + W / 2;
  const idle = Math.floor(now / 140) % 4;
  const bob = Math.sin(now / 420 + idle * 0.2) * 1.2;

  ctx.save();
  ctx.translate(0, bob);

  ctx.fillStyle = "rgba(251,191,36,0.16)";
  ctx.beginPath();
  ctx.arc(cx, cy, 28 + Math.sin(now / 500) * 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.ellipse(cx, y + W + 2, W * 0.4, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5c3d2e";
  ctx.beginPath();
  ctx.moveTo(x + 6, y + W - 2);
  ctx.lineTo(x + 10, y + 14);
  ctx.lineTo(x + W - 10, y + 14);
  ctx.lineTo(x + W - 6, y + W - 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = ST;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.strokeStyle = "#d6c4a8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 22);
  ctx.lineTo(x + W - 8, y + 24);
  ctx.stroke();

  ctx.fillStyle = "#78350f";
  ctx.beginPath();
  ctx.ellipse(cx, y + 14, 11, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ST;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#92400e";
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 6);
  ctx.lineTo(x + 12, y - 2);
  ctx.lineTo(x + 14, y + 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + W - 8, y + 6);
  ctx.lineTo(x + W - 12, y - 2);
  ctx.lineTo(x + W - 14, y + 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#57534e";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + W + 2, y + 6);
  ctx.lineTo(x + W - 4, y + W);
  ctx.stroke();
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(x + W + 2, y + 5, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ST;
  ctx.stroke();

  if (selected) {
    const p = selectionPulse(now);
    ctx.strokeStyle = `rgba(253,224,71,${0.5 + p * 0.45})`;
    ctx.lineWidth = 2 + p * 2;
    ctx.shadowColor = "rgba(250,204,21,0.5)";
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, W / 2 + 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}
