"use client";

const SHEETS = ["leonardo", "raphael", "donatello", "michelangelo", "splinter"] as const;

const cache = new Map<string, HTMLImageElement | null>();
let loadPromise: Promise<void> | null = null;

function loadOne(id: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      cache.set(id, img);
      resolve();
    };
    img.onerror = () => {
      cache.set(id, null);
      resolve();
    };
    img.src = `/assets/sprites/${id}.png`;
  });
}

/** Preload all squad PNGs once; safe to call multiple times. */
export function preloadSquadSpriteSheets(): Promise<void> {
  if (loadPromise) return loadPromise;
  loadPromise = Promise.all(SHEETS.map((id) => loadOne(id))).then(() => undefined);
  return loadPromise;
}

export function getSpriteSheet(id: string): HTMLImageElement | null {
  const v = cache.get(id);
  return v === undefined ? null : v;
}

export function hasSpriteSheet(id: string): boolean {
  return cache.get(id) != null;
}
