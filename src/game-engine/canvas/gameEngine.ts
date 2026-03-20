import type { AgentId, DashboardState } from "@/domain/types";
import { scenePixelSize } from "@/game-engine/scene";
import { MissionSimulation } from "@/game-engine/canvas/missionSimulation";
import { hitTestWorld, renderScene } from "@/game-engine/canvas/renderers/sceneRenderer";
import type { HitTarget } from "@/game-engine/canvas/types";

export type GameEngineOptions = {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  getState: () => DashboardState;
  getSelectedAgentId: () => AgentId;
  getRecentlyUpdatedTaskIds: () => string[];
  onHit: (hit: HitTarget) => void;
};

/**
 * requestAnimationFrame loop: update simulation + render scene.
 * Canvas is the only drawing surface for the mission room.
 */
export class GameEngine {
  readonly simulation = new MissionSimulation();
  private readonly canvas: HTMLCanvasElement;
  private readonly container: HTMLElement;
  private readonly getState: () => DashboardState;
  private readonly getSelectedAgentId: () => AgentId;
  private readonly getRecentlyUpdatedTaskIds: () => string[];
  private readonly onHit: (hit: HitTarget) => void;

  readonly canRender: boolean;
  private ctx: CanvasRenderingContext2D | null;
  private raf = 0;
  private lastNow = 0;
  private running = false;
  private ro: ResizeObserver | null = null;
  private readonly onPointerDown = (e: PointerEvent) => this.handlePointer(e);
  private dpr = 1;

  private world = scenePixelSize();

  constructor(options: GameEngineOptions) {
    this.canvas = options.canvas;
    this.container = options.container;
    this.getState = options.getState;
    this.getSelectedAgentId = options.getSelectedAgentId;
    this.getRecentlyUpdatedTaskIds = options.getRecentlyUpdatedTaskIds;
    this.onHit = options.onHit;
    this.ctx = this.canvas.getContext("2d", { alpha: false, desynchronized: true });
    this.canRender = !!this.ctx;
  }

  start(): void {
    if (this.running || !this.ctx || !this.canRender) return;
    this.running = true;
    this.lastNow = performance.now();
    this.world = scenePixelSize();

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.container);
    this.resize();

    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    this.raf = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    this.ro = null;
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
  }

  private tick = (now: number) => {
    if (!this.running || !this.ctx) return;
    const dt = Math.min(0.05, (now - this.lastNow) / 1000);
    this.lastNow = now;

    this.simulation.update(dt, now);
    this.renderFrame(now);

    this.raf = requestAnimationFrame(this.tick);
  };

  private resize(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const rect = this.container.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    this.dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
  }

  private renderFrame(now: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const state = this.getState();
    const rect = this.container.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    const ww = this.world.width;
    const wh = this.world.height;

    const dpr = this.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#0c0618";
    ctx.fillRect(0, 0, w, h);

    const pad = 0.014;
    const scale = Math.min(w / ww, h / wh) * (1 - pad * 2);
    const drawW = ww * scale;
    const drawH = wh * scale;
    const ox = (w - drawW) / 2;
    const oy = (h - drawH) / 2;

    ctx.translate(ox, oy);
    ctx.scale(scale, scale);

    renderScene(ctx, {
      worldW: ww,
      worldH: wh,
      now,
      sim: this.simulation,
      state,
      selectedAgentId: this.getSelectedAgentId(),
      recentlyUpdatedTaskIds: this.getRecentlyUpdatedTaskIds(),
    });
  }

  private handlePointer(e: PointerEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;
    const ww = this.world.width;
    const wh = this.world.height;
    const pad = 0.014;
    const scale = Math.min(w / ww, h / wh) * (1 - pad * 2);
    const drawW = ww * scale;
    const drawH = wh * scale;
    const ox = (w - drawW) / 2;
    const oy = (h - drawH) / 2;
    const wx = (cx - ox) / scale;
    const wy = (cy - oy) / scale;

    const hit = hitTestWorld(wx, wy, this.simulation);
    if (hit.kind !== "none") {
      this.onHit(hit);
    }
  }
}
