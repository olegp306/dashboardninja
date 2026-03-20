"use client";

import { memo } from "react";
import { SCENE, scenePixelSize } from "@/game-engine/scene";

/** Tiled floor + walls — presentation only. */
export const TileMap = memo(function TileMap() {
  const { width, height } = scenePixelSize();
  const tile = SCENE.cellPx * 2;

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: "#1e1236",
          backgroundImage: [
            "linear-gradient(90deg, rgba(0,0,0,0.45) 1px, transparent 1px)",
            "linear-gradient(rgba(0,0,0,0.45) 1px, transparent 1px)",
            "radial-gradient(ellipse at 50% 0%, rgba(251,113,133,0.12), transparent 55%)",
            "radial-gradient(ellipse at 10% 90%, rgba(34,211,238,0.08), transparent 50%)",
          ].join(","),
          backgroundSize: `${tile}px ${tile}px, ${tile}px ${tile}px, 100% 100%, 100% 100%`,
        }}
      />
      {/* Wall border */}
      <div
        className="pointer-events-none absolute inset-0 border-[8px] border-[#0b0614]"
        style={{ boxShadow: "inset 0 0 0 4px rgba(94,234,212,0.15)" }}
      />
      {/* Floor vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.45) 100%)",
        }}
      />
      <div className="pointer-events-none absolute bottom-2 left-2 font-pixel text-[9px] text-white/40">
        {width}×{height}px map
      </div>
    </>
  );
});
