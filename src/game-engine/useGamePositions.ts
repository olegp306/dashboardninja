"use client";

import { useEffect, useRef, useState } from "react";
import type { AgentId, DashboardState } from "@/domain/types";
import type { PixelPos } from "./entity";
import { SCENE, gridToPixel } from "./scene";
import { WALK_SPEED, gridNearPeerTable, gridNearSplinter, homePixel, splinterPixelPos } from "./movement";

type TurtleId = Exclude<AgentId, "splinter">;

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

const initialPositions = (): Record<TurtleId, PixelPos> => ({
  leonardo: homePixel("leonardo"),
  raphael: homePixel("raphael"),
  donatello: homePixel("donatello"),
  michelangelo: homePixel("michelangelo"),
});

/**
 * Smooth pixel movement; walks triggered by real inter-agent messages (no fake data).
 * Position state updates are throttled (~30fps) to limit React re-renders.
 */
export function useGamePositions(state: DashboardState | null) {
  const [positions, setPositions] = useState<Record<TurtleId, PixelPos>>(initialPositions);
  const targetRef = useRef<Record<TurtleId, PixelPos>>(initialPositions());
  const seenMsgRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!state) return;
    for (const m of state.agentMessages) {
      if (seenMsgRef.current.has(m.id)) continue;
      seenMsgRef.current.add(m.id);
      if (!isTurtle(m.from)) continue;
      const from = m.from;
      targetRef.current[from] = messageTargetPixel(from, m.to);
      window.setTimeout(() => {
        targetRef.current[from] = homePixel(from);
      }, 2600);
    }
  }, [state, state?.agentMessages]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let lastEmit = performance.now();
    const posWork = { ...initialPositions() };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      for (const id of TURTLES) {
        const speed = WALK_SPEED[id] * SCENE.cellPx;
        const cur = posWork[id];
        const tgt = targetRef.current[id];
        const wobble =
          id === "michelangelo" ? Math.sin(now / 220) * 1.2 + Math.cos(now / 410) * 0.8 : 0;
        const to = { x: tgt.x, y: tgt.y + wobble };
        const step = speed * dt;
        const d = dist(cur, to);
        if (d <= step || d < 0.5) {
          posWork[id] = { ...to };
        } else {
          const n = normalize({ x: to.x - cur.x, y: to.y - cur.y });
          posWork[id] = { x: cur.x + n.x * step, y: cur.y + n.y * step };
        }
      }

      if (now - lastEmit >= 33) {
        lastEmit = now;
        setPositions({
          leonardo: { ...posWork.leonardo },
          raphael: { ...posWork.raphael },
          donatello: { ...posWork.donatello },
          michelangelo: { ...posWork.michelangelo },
        });
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return {
    turtlePositions: positions,
    splinterPosition: splinterPixelPos(),
  };
}
