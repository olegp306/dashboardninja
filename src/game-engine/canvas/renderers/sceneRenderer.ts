import type { AgentId, DashboardState } from "@/domain/types";
import { resolveVisualState, taskStatusIcon } from "@/game-engine/agentVisual";
import { SCENE, SPLINTER_GRID, TABLE_GRIDS, gridToPixel } from "@/game-engine/scene";
import type { MissionSimulation } from "@/game-engine/canvas/missionSimulation";
import { AGENT_BODY } from "@/game-engine/canvas/constants";
import type { TurtleId } from "@/game-engine/canvas/types";
import { drawTileMap } from "@/game-engine/canvas/renderers/tileMapRenderer";
import { agentHitBox, drawUnitHud, splinterHitBox } from "@/game-engine/canvas/renderers/agentRenderer";
import { drawTurtleHero, drawMentorHero, drawMissionGlyph } from "@/game-engine/canvas/renderers/characterRenderer";
import {
  drawBlockedIcon,
  drawCelebrationBurst,
  drawDestinationMarker,
  drawScanlines,
  drawSpeechBubble,
  drawTablePulse,
  drawThinkingDots,
} from "@/game-engine/canvas/renderers/effectsRenderer";

const TURTLES: TurtleId[] = ["leonardo", "raphael", "donatello", "michelangelo"];

const statusProgress = (status: string) => {
  switch (status) {
    case "queued":
      return 0.12;
    case "assigned":
      return 0.28;
    case "in_progress":
      return 0.62;
    case "done":
      return 1;
    case "failed":
      return 0.18;
    default:
      return 0;
  }
};

export type SceneRenderArgs = {
  worldW: number;
  worldH: number;
  now: number;
  sim: MissionSimulation;
  state: DashboardState;
  selectedAgentId: AgentId;
  recentlyUpdatedTaskIds: string[];
};

function bubbleFor(state: DashboardState, id: AgentId): string | null {
  const recent = state.agentMessages.slice(0, 14);
  const m = recent.find((x) => x.from === id || x.to === id);
  if (!m) return null;
  return m.content.length > 48 ? `${m.content.slice(0, 45)}…` : m.content;
}

function currentTask(state: DashboardState, id: TurtleId) {
  return state.tasks.find((t) => t.assignedTo === id && (t.status === "assigned" || t.status === "in_progress"));
}

function isCelebrating(state: DashboardState, id: TurtleId, recentlyUpdatedTaskIds: string[]): boolean {
  return recentlyUpdatedTaskIds.some((rid) => {
    const t = state.tasks.find((x) => x.id === rid);
    return t?.status === "done" && t.assignedTo === id;
  });
}

export function renderScene(ctx: CanvasRenderingContext2D, args: SceneRenderArgs): void {
  const { worldW, worldH, now, sim, state, selectedAgentId, recentlyUpdatedTaskIds } = args;

  const tasksByAssignee: Partial<Record<AgentId, number>> = {};
  for (const a of state.agents) {
    tasksByAssignee[a.id] = state.tasks.filter((t) => t.assignedTo === a.id).length;
  }
  const queuedAndAssigned = state.tasks.filter((t) => t.status === "queued" || t.status === "assigned").length;

  drawTileMap(ctx, worldW, worldH, tasksByAssignee, queuedAndAssigned, now);

  let seed = 0;
  const pulseSplat = recentlyUpdatedTaskIds.some((rid) => {
    const t = state.tasks.find((x) => x.id === rid);
    return t && (t.status === "queued" || t.assignedTo === "splinter");
  });
  if (pulseSplat) drawTablePulse(ctx, SPLINTER_GRID, now, seed++);

  for (const id of TURTLES) {
    const pulse = recentlyUpdatedTaskIds.some((rid) => state.tasks.find((t) => t.id === rid)?.assignedTo === id);
    if (pulse) drawTablePulse(ctx, TABLE_GRIDS[id], now, seed++);
  }

  const spl = sim.splinterPosition();
  drawMentorHero(ctx, spl.x, spl.y - 8, selectedAgentId === "splinter", now);

  const recentMsgs = state.agentMessages.slice(0, 14);
  for (const agent of state.agents) {
    if (agent.id === "splinter") continue;
    const id = agent.id as TurtleId;
    const pos = sim.positions[id];
    const task = currentTask(state, id);
    const icon = task ? taskStatusIcon(task.status) : "·";
    const progress = task ? statusProgress(task.status) : 0;
    const visual = resolveVisualState(agent, state.agentLLM[agent.id], recentMsgs);
    const walking = sim.walking[id];
    const facing = sim.facing[id];
    const celebrate = isCelebrating(state, id, recentlyUpdatedTaskIds);

    if (walking) {
      const tm = sim.targetMarker(id);
      drawDestinationMarker(ctx, tm.x + AGENT_BODY / 2, tm.y + AGENT_BODY - 4, now);
    }

    drawTurtleHero(ctx, id, pos.x, pos.y, {
      facing,
      walking,
      selected: selectedAgentId === agent.id,
      visual,
      now,
      celebrate,
      online: agent.online,
      settling: sim.settling[id],
      settleProgress: sim.settleProgress[id],
    });

    if (celebrate) {
      drawCelebrationBurst(ctx, pos.x + AGENT_BODY / 2, pos.y + AGENT_BODY / 2, now);
    }

    drawMissionGlyph(
      ctx,
      pos.x + AGENT_BODY / 2,
      pos.y,
      icon,
      now,
      task?.priority === "critical",
      selectedAgentId === agent.id,
    );

    drawUnitHud(ctx, pos.x, pos.y, agent.name, progress, visual);

    const cx = pos.x + AGENT_BODY / 2;
    const top = pos.y;

    const b = bubbleFor(state, agent.id);
    if (visual === "thinking") {
      drawThinkingDots(ctx, cx, top, now);
    } else if (b) {
      drawSpeechBubble(ctx, cx, top - 18, `💬 ${b}`);
    }
    if (visual === "error") {
      drawBlockedIcon(ctx, cx, top - 4, now);
    }
  }

  drawScanlines(ctx, worldW, worldH);
}

export function hitTestWorld(wx: number, wy: number, sim: MissionSimulation): import("@/game-engine/canvas/types").HitTarget {
  const spl = sim.splinterPosition();
  const sb = splinterHitBox(spl);
  if (inRect(wx, wy, sb)) return { kind: "agent", id: "splinter" };

  for (const id of TURTLES) {
    const pos = sim.positions[id];
    const b = agentHitBox(pos);
    if (inRect(wx, wy, b)) return { kind: "agent", id };
  }

  if (hitTable(wx, wy, SPLINTER_GRID)) return { kind: "table", id: "splinter" };
  for (const id of TURTLES) {
    if (hitTable(wx, wy, TABLE_GRIDS[id])) return { kind: "table", id };
  }

  return { kind: "none" };
}

function inRect(wx: number, wy: number, r: { x: number; y: number; w: number; h: number }) {
  return wx >= r.x && wy >= r.y && wx <= r.x + r.w && wy <= r.y + r.h;
}

function hitTable(wx: number, wy: number, grid: { gx: number; gy: number }) {
  const pos = gridToPixel(grid);
  const w = 10 * SCENE.cellPx;
  const h = 5 * SCENE.cellPx;
  return inRect(wx, wy, { x: pos.x, y: pos.y, w, h });
}
