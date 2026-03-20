/**
 * Generates original chunky pixel mutant sheets (RGBA → PNG). Run: npm run sprites
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../public/assets/sprites");

const FW = 48;
const FH = 48;
const COLS = 6;
const ROWS = 8;
const W = COLS * FW;
const H = ROWS * FH;

const ST = [10, 10, 10, 255];

const PAL = {
  leonardo: { band: [29, 78, 216, 255], bd: [30, 58, 138, 255], skin: [63, 98, 18, 255], shell: [20, 83, 45, 255], plast: [134, 239, 172, 255] },
  raphael: { band: [185, 28, 28, 255], bd: [127, 29, 29, 255], skin: [55, 90, 22, 255], shell: [22, 101, 52, 255], plast: [190, 242, 200, 255] },
  donatello: { band: [109, 40, 217, 255], bd: [76, 29, 149, 255], skin: [52, 88, 20, 255], shell: [18, 75, 42, 255], plast: [167, 243, 208, 255] },
  michelangelo: { band: [234, 88, 12, 255], bd: [154, 52, 18, 255], skin: [68, 105, 25, 255], shell: [24, 95, 48, 255], plast: [255, 237, 213, 255] },
};

function setPx(buf, x, y, c) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  buf[i] = c[0];
  buf[i + 1] = c[1];
  buf[i + 2] = c[2];
  buf[i + 3] = c[3];
}

function rect(buf, x0, y0, x1, y1, c) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) setPx(buf, x, y, c);
}

function outline(buf, x0, y0, x1, y1) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (x === x0 || x === x1 || y === y0 || y === y1) setPx(buf, x, y, ST);
  }
}

function drawMutant(buf, ox, oy, pal, f, rowKind) {
  const x = ox + 6;
  const y = oy + 4;
  let foot = 0;
  let arm = 0;
  if (rowKind === "walkL" || rowKind === "walk") {
    foot = f % 2 === 0 ? 2 : -2;
    arm = f % 2 === 0 ? 3 : -3;
  }
  if (rowKind === "party") {
    arm = 5;
    foot = (f % 3) - 1;
  }

  rect(buf, x + 10 + foot, y + 32, x + 17 + foot, y + 41, pal.skin);
  outline(buf, x + 10 + foot, y + 32, x + 17 + foot, y + 41);
  rect(buf, x + 27 - foot, y + 32, x + 34 - foot, y + 41, pal.skin);
  outline(buf, x + 27 - foot, y + 32, x + 34 - foot, y + 41);

  rect(buf, x + 12, y + 18, x + 32, y + 32, pal.plast);
  outline(buf, x + 12, y + 18, x + 32, y + 32);

  rect(buf, x + 10, y + 12, x + 34, y + 26, pal.shell);
  outline(buf, x + 10, y + 12, x + 34, y + 26);

  rect(buf, x + 12, y + 4, x + 32, y + 14, pal.skin);
  outline(buf, x + 12, y + 4, x + 32, y + 14);

  rect(buf, x + 10, y + 2, x + 34, y + 8, pal.band);
  rect(buf, x + 10, y + 6, x + 34, y + 8, pal.bd);
  outline(buf, x + 10, y + 2, x + 34, y + 8);

  rect(buf, x + 6 + arm, y + 18, x + 11 + arm, y + 30, pal.skin);
  outline(buf, x + 6 + arm, y + 18, x + 11 + arm, y + 30);
  rect(buf, x + 33 - arm, y + 18, x + 38 - arm, y + 30, pal.skin);
  outline(buf, x + 33 - arm, y + 18, x + 38 - arm, y + 30);

  rect(buf, x + 14, y + 8, x + 17, y + 11, [248, 250, 252, 255]);
  rect(buf, x + 24, y + 8, x + 27, y + 11, [248, 250, 252, 255]);
  rect(buf, x + 15, y + 9, x + 16, y + 10, ST);
  rect(buf, x + 25, y + 9, x + 26, y + 10, ST);
}

function drawSplinter(buf, ox, oy, f) {
  const robe = [92, 62, 46, 255];
  const robeD = [60, 42, 30, 255];
  const fur = [120, 53, 15, 255];
  const staff = [68, 64, 60, 255];
  const gem = [251, 191, 36, 255];
  const x = ox + 6;
  const y = oy + 4 + (f % 2);
  rect(buf, x + 8, y + 30, x + 36, y + 42, robe);
  outline(buf, x + 8, y + 30, x + 36, y + 42);
  rect(buf, x + 10, y + 16, x + 34, y + 30, robeD);
  outline(buf, x + 10, y + 16, x + 34, y + 30);
  rect(buf, x + 12, y + 6, x + 32, y + 16, fur);
  outline(buf, x + 12, y + 6, x + 32, y + 16);
  rect(buf, x + 36, y + 8, x + 42, y + 40, staff);
  outline(buf, x + 36, y + 8, x + 42, y + 40);
  rect(buf, x + 35, y + 6, x + 40, y + 10, gem);
  outline(buf, x + 35, y + 6, x + 40, y + 10);
  rect(buf, x + 6, y + 4, x + 12, y + 10, fur);
  rect(buf, x + 32, y + 4, x + 38, y + 10, fur);
}

const ROWS_KIND = ["idle", "walk", "idle", "walk", "idle", "party", "idleL", "walkL"];
const FRAME_COUNT = [4, 6, 3, 4, 3, 5, 4, 6];

function sheetFor(id) {
  const buf = Buffer.alloc(W * H * 4);
  const pal = PAL[id];
  for (let row = 0; row < ROWS; row++) {
    const kind = ROWS_KIND[row];
    const fc = FRAME_COUNT[row];
    for (let f = 0; f < fc; f++) {
      const ox = f * FW;
      const oy = row * FH;
      drawMutant(buf, ox, oy, pal, f, kind);
    }
  }
  return buf;
}

function sheetSplinter() {
  const buf = Buffer.alloc(W * H * 4);
  for (let row = 0; row < ROWS; row++) {
    const fc = FRAME_COUNT[row];
    for (let f = 0; f < fc; f++) {
      drawSplinter(buf, f * FW, row * FH, f + row);
    }
  }
  return buf;
}

fs.mkdirSync(OUT, { recursive: true });

for (const id of ["leonardo", "raphael", "donatello", "michelangelo", "splinter"]) {
  const raw = id === "splinter" ? sheetSplinter() : sheetFor(id);
  const outPath = path.join(OUT, `${id}.png`);
  await sharp(raw, { raw: { width: W, height: H, channels: 4 } }).png().toFile(outPath);
  console.log("wrote", outPath);
}
