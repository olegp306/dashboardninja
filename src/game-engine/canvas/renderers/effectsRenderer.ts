import { SCENE, SPLINTER_GRID, TABLE_GRIDS, gridToPixel } from "@/game-engine/scene";

/** Speech bubble, thinking dots, blocked/warning, critical marker, table mission flash. */
export function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  text: string,
): void {
  const maxW = 160;
  ctx.font = "8px monospace";
  const lines = wrapText(ctx, text, maxW - 6);
  const lineH = 10;
  const pad = 6;
  const w = Math.min(
    maxW,
    Math.max(...lines.map((l) => ctx.measureText(l).width), 0) + pad * 2,
  );
  const h = lines.length * lineH + pad * 2;
  const x = cx - w / 2;
  const y = topY - h - 6;

  ctx.save();
  ctx.fillStyle = "#fafafa";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  if ("roundRect" in ctx && typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, 4);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#000";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  lines.forEach((line, i) => {
    ctx.fillText(line, x + pad, y + pad + i * lineH);
  });
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width <= maxW) cur = t;
    else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [text.slice(0, 24)];
}

export function drawThinkingDots(ctx: CanvasRenderingContext2D, cx: number, y: number, now: number): void {
  const phase = Math.floor(now / 180) % 4;
  const dots = ".".repeat(phase === 0 ? 1 : phase);
  ctx.save();
  ctx.fillStyle = "#1a1a1a";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  const w = 28;
  const h = 14;
  ctx.fillRect(cx - w / 2, y - h - 4, w, h);
  ctx.strokeRect(cx - w / 2, y - h - 4, w, h);
  ctx.fillStyle = "#bef264";
  ctx.font = "10px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(dots || "…", cx, y - h / 2 - 4);
  ctx.restore();
}

export function drawBlockedIcon(ctx: CanvasRenderingContext2D, cx: number, y: number, now: number): void {
  const blink = Math.sin(now / 200) > 0;
  if (!blink) return;
  ctx.save();
  ctx.fillStyle = "#fbbf24";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.font = "10px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("!", cx - 1, y);
  ctx.strokeText("!", cx - 1, y);
  ctx.restore();
}

export function drawCriticalBolt(ctx: CanvasRenderingContext2D, cx: number, y: number, now: number): void {
  const o = Math.sin(now / 120) * 0.6 + 0.4;
  ctx.save();
  ctx.globalAlpha = o;
  ctx.fillStyle = "#fde047";
  ctx.font = "11px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("⚡", cx, y - 2);
  ctx.restore();
}

export function drawTablePulse(
  ctx: CanvasRenderingContext2D,
  grid: { gx: number; gy: number },
  now: number,
  seed: number,
): void {
  const pos = gridToPixel(grid);
  const w = 10 * SCENE.cellPx;
  const h = 5 * SCENE.cellPx;
  const t = (Math.sin(now / 140 + seed) + 1) / 2;
  ctx.save();
  ctx.fillStyle = `rgba(251,191,36,${0.08 + t * 0.35})`;
  ctx.fillRect(pos.x, pos.y, w, h);
  ctx.strokeStyle = `rgba(250,204,21,${0.5 + t * 0.45})`;
  ctx.lineWidth = 3;
  ctx.strokeRect(pos.x - 1, pos.y - 1, w + 2, h + 2);
  ctx.restore();
}

/** Pin / flag at movement destination while walking. */
export function drawDestinationMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  now: number,
): void {
  const bob = Math.sin(now / 160) * 2;
  ctx.save();
  ctx.fillStyle = "rgba(251,191,36,0.35)";
  ctx.beginPath();
  ctx.arc(x, y + bob, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#fde047";
  ctx.beginPath();
  ctx.moveTo(x + 4, y - 10 + bob);
  ctx.lineTo(x + 14, y - 6 + bob);
  ctx.lineTo(x + 4, y - 2 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

export function drawCelebrationBurst(ctx: CanvasRenderingContext2D, cx: number, cy: number, now: number): void {
  const t = (now % 400) / 400;
  ctx.save();
  ctx.globalAlpha = 0.5 + Math.sin(now / 50) * 0.2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + now / 200;
    const r = 16 + t * 10;
    ctx.fillStyle = i % 2 === 0 ? "#fde047" : "#22d3ee";
    ctx.fillRect(cx + Math.cos(a) * r - 2, cy + Math.sin(a) * r - 2, 4, 4);
  }
  ctx.restore();
}

export function drawScanlines(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#000";
  for (let y = 0; y < h; y += 3) {
    ctx.fillRect(0, y, w, 1);
  }
  ctx.restore();
}

export { SPLINTER_GRID, TABLE_GRIDS };
