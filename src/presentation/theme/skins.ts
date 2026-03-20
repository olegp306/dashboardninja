export type DashboardSkin = "control-room" | "pizzeria" | "minimal" | "game";

export type SkinTokens = {
  page: string;
  panel: string;
  panelMuted: string;
  panelStrong: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentButton: string;
  accentRing: string;
  cardHover: string;
  floor?: string;
  table?: string;
};

export const skinTokens: Record<DashboardSkin, SkinTokens> = {
  "control-room": {
    page: "bg-zinc-950",
    panel: "bg-zinc-900/70",
    panelMuted: "bg-zinc-900/45",
    panelStrong: "bg-zinc-900/90",
    border: "border-zinc-800",
    textPrimary: "text-zinc-100",
    textSecondary: "text-zinc-300",
    textMuted: "text-zinc-500",
    accentButton: "bg-cyan-700 text-white hover:bg-cyan-600",
    accentRing: "ring-cyan-300/35",
    cardHover: "hover:shadow-[0_12px_36px_rgba(34,211,238,0.18)]",
    floor: "bg-zinc-950",
    table: "bg-zinc-900/70",
  },
  pizzeria: {
    page: "bg-neutral-950",
    panel: "bg-amber-950/45",
    panelMuted: "bg-orange-950/35",
    panelStrong: "bg-orange-950/55",
    border: "border-amber-900/70",
    textPrimary: "text-amber-50",
    textSecondary: "text-amber-100/90",
    textMuted: "text-amber-200/55",
    accentButton: "bg-red-700 text-white hover:bg-red-600",
    accentRing: "ring-red-300/35",
    cardHover: "hover:shadow-[0_12px_36px_rgba(239,68,68,0.18)]",
    floor:
      "bg-[linear-gradient(90deg,rgba(120,53,15,0.22)_1px,transparent_1px),linear-gradient(rgba(120,53,15,0.22)_1px,transparent_1px),radial-gradient(circle_at_15%_10%,rgba(251,146,60,0.08),transparent_42%)] [background-size:26px_26px,26px_26px,100%_100%]",
    table: "bg-amber-900/45",
  },
  minimal: {
    page: "bg-zinc-100",
    panel: "bg-white",
    panelMuted: "bg-zinc-50",
    panelStrong: "bg-white",
    border: "border-zinc-200",
    textPrimary: "text-zinc-900",
    textSecondary: "text-zinc-700",
    textMuted: "text-zinc-500",
    accentButton: "bg-zinc-900 text-white hover:bg-zinc-800",
    accentRing: "ring-zinc-400/35",
    cardHover: "hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]",
    floor: "bg-zinc-100",
    table: "bg-white",
  },
  /** NES / Dendy inspired — pixel borders, limited palette (presentation only). */
  game: {
    page: "bg-[#0f0820]",
    panel: "bg-[#1a0f2e]/95",
    panelMuted: "bg-[#24143d]/85",
    panelStrong: "bg-[#2d1b4e]/95",
    border: "border-[#5eead4]/35",
    textPrimary: "text-[#ecfccb]",
    textSecondary: "text-[#bef264]/90",
    textMuted: "text-[#84cc16]/55",
    accentButton: "bg-[#f97316] text-black border-4 border-black shadow-[4px_4px_0_#000] hover:brightness-110",
    accentRing: "ring-[#fbbf24]/50",
    cardHover: "hover:shadow-[6px_6px_0_#000]",
    floor: "bg-[#12081f]",
    table: "bg-[#2d1b4e]/90",
  },
};

export const designTokens = {
  spacing: {
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
    xl: "gap-6",
  },
  radius: {
    card: "rounded-xl",
    panel: "rounded-2xl",
    pill: "rounded-full",
  },
  shadow: {
    soft: "shadow-[0_8px_20px_rgba(0,0,0,0.08)]",
    card: "shadow-[0_10px_24px_rgba(0,0,0,0.12)]",
  },
  type: {
    h1: "text-2xl font-semibold tracking-tight",
    h2: "text-lg font-semibold",
    body: "text-sm leading-relaxed",
    caption: "text-xs",
  },
};

export const statusTokens: Record<
  "idle" | "working" | "blocked" | "offline",
  { dot: string; glow: string; chip: string }
> = {
  idle: {
    dot: "bg-amber-400",
    glow: "shadow-[0_0_16px_rgba(250,204,21,0.25)]",
    chip: "bg-amber-950/55 text-amber-100 ring-1 ring-amber-700/35",
  },
  working: {
    dot: "bg-emerald-400",
    glow: "shadow-[0_0_16px_rgba(16,185,129,0.30)]",
    chip: "bg-emerald-950/55 text-emerald-100 ring-1 ring-emerald-700/35",
  },
  blocked: {
    dot: "bg-red-400",
    glow: "shadow-[0_0_16px_rgba(248,113,113,0.30)]",
    chip: "bg-red-950/55 text-red-100 ring-1 ring-red-700/35",
  },
  offline: {
    dot: "bg-zinc-400",
    glow: "shadow-[0_0_12px_rgba(161,161,170,0.22)]",
    chip: "bg-zinc-800 text-zinc-200 ring-1 ring-zinc-700/55",
  },
};

