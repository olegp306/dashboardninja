import type { AgentVisualState } from "./entity";

export const animationClassForAgent = (state: AgentVisualState): string => {
  switch (state) {
    case "idle":
      return "animate-nes-breathe";
    case "working":
      return "animate-nes-work";
    case "thinking":
      return "animate-nes-think";
    case "communicating":
      return "animate-nes-talk";
    case "error":
      return "animate-nes-error";
    case "offline":
      return "opacity-40 grayscale";
    default:
      return "";
  }
};

export const auraClassForSplinter = (): string => "animate-nes-aura";

export const animationClassWalking = (walking: boolean): string => (walking ? "animate-nes-walk" : "");
