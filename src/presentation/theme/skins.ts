export type DashboardSkin = "control-room" | "pizzeria" | "minimal";

type SkinTokens = {
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
  },
  pizzeria: {
    page: "bg-neutral-950",
    panel: "bg-amber-950/35",
    panelMuted: "bg-orange-950/30",
    panelStrong: "bg-orange-950/50",
    border: "border-orange-900/60",
    textPrimary: "text-orange-50",
    textSecondary: "text-orange-100/90",
    textMuted: "text-orange-200/45",
    accentButton: "bg-red-700 text-white hover:bg-red-600",
    accentRing: "ring-red-300/35",
    cardHover: "hover:shadow-[0_12px_36px_rgba(239,68,68,0.18)]",
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
  },
};

