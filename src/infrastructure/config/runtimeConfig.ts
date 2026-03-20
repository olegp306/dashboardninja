const toBool = (value: string | undefined) => {
  if (!value) return false;
  return ["1", "true", "yes", "y", "on"].includes(value.toLowerCase());
};

const mockMode = toBool(process.env.MOCK_MODE);
const liveMode = toBool(process.env.LIVE_MODE);

// Backwards-compatible fallback.
const openclawMode = (process.env.OPENCLAW_MODE ?? "").toLowerCase();
const openclawWantsMock = openclawMode === "mock";
const openclawWantsLive = openclawMode === "live";

export const runtimeConfig = {
  mode: liveMode || openclawWantsLive ? "live" : mockMode || openclawWantsMock ? "mock" : "mock",
  openclaw: {
    baseUrl: process.env.OPENCLAW_BASE_URL ?? "",
    apiToken: process.env.OPENCLAW_API_TOKEN ?? "",
  },
};

