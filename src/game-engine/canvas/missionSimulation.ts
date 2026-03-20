import type { AgentId, DashboardState } from "@/domain/types";
import type { PixelPos } from "@/game-engine/entity";
import { SCENE, TABLE_GRIDS, gridToPixel } from "@/game-engine/scene";
import { WALK_SPEED, gridNearPeerTable, gridNearSplinter, homePixel, splinterPixelPos } from "@/game-engine/movement";
import type { TurtleId } from "./types";
import { AGENT_BODY } from "@/game-engine/canvas/constants";
import { facingFromDxDy, type FacingDir } from "@/game-engine/canvas/spriteAnimator";

const TURTLES: TurtleId[] = ["leonardo", "raphael", "donatello", "michelangelo"];

const isTurtle = (id: AgentId): id is TurtleId => id !== "splinter";

const dist = (a: PixelPos, b: PixelPos) => Math.hypot(a.x - b.x, a.y - b.y);

const normalize = (v: PixelPos): PixelPos => {
  const d = Math.hypot(v.x, v.y);
  if (d < 0.0001) return { x: 0, y: 0 };
  return { x: v.x / d, y: v.y / d };
};

const messageTargetPixel = (from: TurtleId, to: AgentId): PixelPos => {
  if (to === "splinter") return gridToPixel(gridNearSplinter(from));
  if (isTurtle(to)) return gridToPixel(gridNearPeerTable(from, to));
  return homePixel(from);
};

const messagePeerCenter = (to: AgentId): PixelPos => {
  if (to === "splinter") {
    const p = splinterPixelPos();
    return { x: p.x + AGENT_BODY / 2, y: p.y + AGENT_BODY / 2 - 4 };
  }
  if (isTurtle(to)) {
    const g = TABLE_GRIDS[to];
    return gridToPixel({ gx: g.gx + 5, gy: g.gy + 2 });
  }
  return homePixel("leonardo");
};

const tableApproachPixel = (id: TurtleId): PixelPos => {
  const g = TABLE_GRIDS[id];
  return gridToPixel({ gx: g.gx, gy: g.gy + 2 });
};

const initialPositions = (): Record<TurtleId, PixelPos> => ({
  leonardo: homePixel("leonardo"),
  raphael: homePixel("raphael"),
  donatello: homePixel("donatello"),
  michelangelo: homePixel("michelangelo"),
});

const initialWalking = (): Record<TurtleId, boolean> => ({
  leonardo: false,
  raphael: false,
  donatello: false,
  michelangelo: false,
});

const initialFacing = (): Record<TurtleId, FacingDir> => ({
  leonardo: "down",
  raphael: "down",
  donatello: "down",
  michelangelo: "down",
});

const initialBool = (): Record<TurtleId, boolean> => ({
  leonardo: false,
  raphael: false,
  donatello: false,
  michelangelo: false,
});

const initialZero = (): Record<TurtleId, number> => ({
  leonardo: 0,
  raphael: 0,
  donatello: 0,
  michelangelo: 0,
});

const SETTLE_MS = 220;

export class MissionSimulation {
  positions: Record<TurtleId, PixelPos>;
  targets: Record<TurtleId, PixelPos>;
  walking: Record<TurtleId, boolean>;
  facing: Record<TurtleId, FacingDir>;
  /** Brief post-arrival beat-em-up settle. */
  settling: Record<TurtleId, boolean>;
  /** 0..1 during settle (ease-in-out for squash). */
  settleProgress: Record<TurtleId, number>;

  private readonly seenMsg = new Set<string>();
  private readonly seenTaskPulse = new Set<string>();
  private bootUntil = 0;
  private readonly pendingHome = new Map<TurtleId, number>();
  private readonly orientPeer = new Map<TurtleId, { x: number; y: number; until: number }>();
  private readonly settleStart = new Map<TurtleId, number>();
  private prevWalking: Record<TurtleId, boolean>;

  constructor() {
    const init = initialPositions();
    this.positions = { ...init };
    this.targets = { ...init };
    this.walking = initialWalking();
    this.facing = initialFacing();
    this.settling = initialBool();
    this.settleProgress = initialZero();
    this.prevWalking = { ...initialWalking() };
  }

  syncDashboard(state: DashboardState): void {
    const now = performance.now();
    if (this.bootUntil === 0) this.bootUntil = now + 900;

    for (const m of state.agentMessages) {
      if (this.seenMsg.has(m.id)) continue;
      this.seenMsg.add(m.id);
      if (!isTurtle(m.from)) continue;
      const from = m.from;
      this.targets[from] = messageTargetPixel(from, m.to);
      this.pendingHome.set(from, now + 2600);
      const peer = messagePeerCenter(m.to);
      this.orientPeer.set(from, { x: peer.x, y: peer.y, until: now + 2600 });
    }

    if (now < this.bootUntil) return;

    for (const task of state.tasks) {
      if (!task.assignedTo || task.assignedTo === "splinter") continue;
      const id = task.assignedTo as TurtleId;
      if (task.status !== "assigned" && task.status !== "in_progress") continue;
      const key = `${task.id}:${task.updatedAt}`;
      if (this.seenTaskPulse.has(key)) continue;
      this.seenTaskPulse.add(key);
      this.targets[id] = tableApproachPixel(id);
      this.pendingHome.set(id, now + 2400);
      const g = TABLE_GRIDS[id];
      const center = gridToPixel({ gx: g.gx + 5, gy: g.gy + 2 });
      this.orientPeer.set(id, { x: center.x, y: center.y, until: now + 2400 });
    }
  }

  update(dt: number, now: number): void {
    for (const [id, t] of this.pendingHome) {
      if (now >= t) {
        this.targets[id] = homePixel(id);
        this.pendingHome.delete(id);
      }
    }

    for (const id of TURTLES) {
      const speed = WALK_SPEED[id] * SCENE.cellPx;
      const cur = this.positions[id];
      const tgt = this.targets[id];
      const wobble =
        id === "michelangelo" ? Math.sin(now / 220) * 1.2 + Math.cos(now / 410) * 0.8 : 0;
      const to = { x: tgt.x, y: tgt.y + wobble };
      const punch = 1 + Math.sin(now / 58) * 0.07 * (dist(cur, to) > 3 ? 1 : 0);
      const step = speed * dt * punch;
      const d = dist(cur, to);
      this.walking[id] = d > 2.8;
      const prev = { ...cur };
      if (d <= step || d < 0.5) {
        this.positions[id] = { x: to.x, y: to.y };
      } else {
        const n = normalize({ x: to.x - cur.x, y: to.y - cur.y });
        this.positions[id] = { x: cur.x + n.x * step, y: cur.y + n.y * step };
      }
      const after = this.positions[id];
      const dx = after.x - prev.x;
      const dy = after.y - prev.y;
      if (Math.hypot(dx, dy) > 0.35) {
        this.facing[id] = facingFromDxDy(dx, dy);
      } else {
        const o = this.orientPeer.get(id);
        if (o && now < o.until) {
          const dx2 = o.x - after.x;
          const dy2 = o.y - after.y;
          if (Math.hypot(dx2, dy2) > 0.4) {
            this.facing[id] = facingFromDxDy(dx2, dy2);
          }
        }
      }

      const home = homePixel(id);
      if (!this.walking[id] && dist(after, home) < 14) {
        const g = TABLE_GRIDS[id];
        const tc = gridToPixel({ gx: g.gx + 5, gy: g.gy + 2 });
        this.facing[id] = facingFromDxDy(tc.x - after.x, tc.y - after.y);
      }

      if (this.prevWalking[id] && !this.walking[id]) {
        this.settleStart.set(id, now);
      }
      this.prevWalking[id] = this.walking[id];

      const ss = this.settleStart.get(id);
      const settling = ss !== undefined && now < ss + SETTLE_MS;
      this.settling[id] = settling;
      this.settleProgress[id] =
        ss !== undefined ? Math.min(1, Math.max(0, (now - ss) / SETTLE_MS)) : 0;
      if (ss !== undefined && now >= ss + SETTLE_MS) {
        this.settleStart.delete(id);
        this.settling[id] = false;
        this.settleProgress[id] = 0;
      }
    }
  }

  splinterPosition(): PixelPos {
    return splinterPixelPos();
  }

  targetMarker(id: TurtleId): PixelPos {
    return this.targets[id];
  }
}
