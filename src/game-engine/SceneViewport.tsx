"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scales fixed pixel game content to fill available width/height (crisp pixel look, responsive).
 */
export function SceneViewport({
  sceneWidth,
  sceneHeight,
  className,
  /** Fill parent flex region (no min-height heuristic). */
  embed,
  children,
}: {
  sceneWidth: number;
  sceneHeight: number;
  className?: string;
  embed?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w <= 0 || h <= 0) return;
      const s = Math.min(w / sceneWidth, h / sceneHeight);
      setScale(Math.max(0.22, Math.min(s, 3)));
    };

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    update();
    window.addEventListener("orientationchange", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", update);
    };
  }, [sceneWidth, sceneHeight]);

  return (
    <div
      ref={ref}
      className={[
        "relative w-full overflow-hidden bg-black",
        embed ? "flex h-full min-h-0 items-center justify-center" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={embed ? undefined : { minHeight: "min(72vh, calc(100vw * 0.52))" }}
    >
      <div
        className={[
          "origin-top-left will-change-transform",
          embed ? "relative" : "absolute left-0 top-0",
        ].join(" ")}
        style={{
          width: sceneWidth,
          height: sceneHeight,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
