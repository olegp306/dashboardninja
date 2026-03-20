# Dashboard Ninja

Full-stack TypeScript mission-control dashboard for a multi-agent OpenClaw setup.

## Status

- Mock mode implemented first (in-memory runtime + realtime simulation via SSE)
- Premium “control-room” UI with desk layout, clickable stations, and cinematic gradients
- Per-agent activity timeline + health indicators (online/offline, last heartbeat, last successful task)
- Central Splinter mission queue with filters (status, priority, assigned agent)
- OpenClaw adapter scaffold included with explicit TODO markers
- UI and orchestration logic are separated using clean architecture layers
- LLM-ready execution layer (`packages/llm-core`) with **mock**, **OpenAI**, and **local stub** providers
- Agent brains are prompt-driven with structured JSON outputs + safe fallbacks (see `packages/agent-brain`)
- **Game mode (NES / Dendy style)**: optional presentation skin — **Canvas 2D** top-down mission room (`src/game-engine/canvas/`: `GameEngine` RAF loop, tile/agent/effects renderers, `MissionSimulation` for movement). React HUD stays outside the canvas. Toggle **🎮 game (NES)** in the UI.

## Agent Roles

- Leonardo: coordinator
- Raphael: urgent executor
- Donatello: technical specialist
- Michelangelo: creative specialist
- Splinter: supervisor/orchestrator

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS v4
- Server-Sent Events (SSE) for realtime updates

## Architecture

```text
src/
  app/
    api/
      state/route.ts        # initial dashboard snapshot
      stream/route.ts       # realtime state stream (SSE)
      tasks/route.ts        # create task
      tasks/[taskId]/route.ts # assign/reassign and status updates
    page.tsx
  application/
    services/dashboardService.ts
  domain/
    contracts.ts           # provider + adapter contracts
    types.ts               # dashboard domain types
    seeds/mockSeed.ts
  infrastructure/
    store/runtimeStore.ts
    services/mockEventIngestionService.ts
    providers/mock/mockAgentProvider.ts
    providers/openclaw/openClawAgentProvider.ts
    providers/openclaw/openClawAdapter.ts
    providers/providerFactory.ts
    config/runtimeConfig.ts
  presentation/
    components/MissionControl.tsx
    components/room/DeskLayout.tsx
    components/room/DeskStation.tsx
    components/room/AgentDetailPanel.tsx
    components/room/AgentTimeline.tsx
    components/room/SplinterSupervisorPanel.tsx
    components/room/MissionQueue.tsx
    components/room/FiltersBar.tsx
    hooks/useMissionStream.ts
    utils/timeAgo.ts
  game-engine/
    canvas/                 # GameCanvas, GameEngine, sprite sheets (`public/assets/sprites/*.png`), SpriteRegistry, sheet blit + procedural fallback
    RetroGameScene.tsx      # mounts GameCanvas + DOM fallback if 2D context fails
  public/assets/sprites/    # PNG sheets from `npm run sprites` (original pixel blocks, not TMNT assets)
packages/
  llm-core/                 # LLM provider interfaces + OpenAI/Mock/Local(stub) implementations
  agent-brain/              # prompt templates + structured parsing + ProviderAgentBrain
```

## LLM provider selection (Mock vs OpenAI vs Local stub)

This project supports **two independent concepts**:

- **Dashboard mode** (`MOCK_MODE` / `LIVE_MODE`): whether tasks/logs come from the in-memory runtime vs OpenClaw remote snapshot.
- **LLM execution mode** (`LLM_MODE`): whether agent reasoning uses simulated JSON (`mock`), real OpenAI (`openai`), or the local stub (`local`).

Rules:

- `LLM_MODE=mock` → `MockLLMProvider` (deterministic-ish simulated JSON; safe for demos)
- `LLM_MODE=openai` → `OpenAIProvider` (requires `OPENAI_API_KEY`)
- `LLM_MODE=local` → `LocalLLMProvider` (**stub / not implemented yet**)

Additional safety switches:

- `SIMULATION_MODE=true` forces **effective** LLM mode to `mock` even if `LLM_MODE=openai` (keeps “simulation” safe)
- `AGENT_AUTONOMY=false` disables autonomous worker ticks (supervisor routing may still occur)

Optional model split:

- `WORKER_MODEL` defaults to `OPENAI_MODEL`
- `SUPERVISOR_MODEL` defaults to `OPENAI_MODEL` (Splinter uses the supervisor provider instance)

Cost controls:

- `TOKEN_BUDGET_PER_TICK`, `MAX_STEPS_PER_TASK`, `LLM_MAX_RESPONSE_CHARS`, `LLM_DEBOUNCE_MS`

### Useful endpoints

- `GET /api/config/llm` - non-secret LLM configuration snapshot
- `POST /api/config/llm/test` - `{ "prompt": "..." }` connectivity test (returns model output + usage when available)
- `GET /api/agents/:id/reasoning-history` - lightweight reasoning timeline (in-memory)

## Step-by-Step Delivery Mapping

1. Architecture: layered domain/application/infrastructure/presentation separation
2. File structure: clean folders under `src/`
3. Core types: centralized in `src/domain/types.ts`
4. First working dashboard: `src/app/page.tsx` + `MissionControl`
5. Mock realtime simulation: `/api/stream` + `runtimeStore.tickSimulation()`
6. Task controls: create, assign/reassign, update status
7. OpenClaw adapter scaffolding: `OpenClawHttpAdapter` TODO placeholders only
8. Final README: this document

## Local Run

1. Copy environment values:
   - Windows: create a `.env` file next to `.env.example` (copy values)
   - Example mode: `MOCK_MODE=true` and `LIVE_MODE=false`
2. Install dependencies:
   - `npm install`
3. Start:
   - `npm run dev`
4. Open:
   - [http://localhost:3000](http://localhost:3000) or [http://127.0.0.1:3000](http://127.0.0.1:3000)

### Game sprite sheets (NES mode)

- Generated PNGs live under `public/assets/sprites/` (`leonardo`, `raphael`, `donatello`, `michelangelo`, `splinter`).
- Regenerate after editing `scripts/generate-squad-sprites.mjs`: `npm run sprites`
- The canvas preloads these on mount; if a sheet fails to load, agents fall back to procedural silhouettes.

### Troubleshooting: `ERR_CONNECTION_REFUSED` on localhost

This means **nothing is listening** on that port (usually the dev server is not running or exited).

1. **Start the dev server from the project root** (folder that contains `package.json`):
   ```bash
   cd c:\Repos\dashboardninja
   npm run dev
   ```
2. **Wait until you see** `✓ Ready` (or similar) in the terminal. **Leave that terminal open** — closing it stops the server.
3. **Use the URL with the port**: `http://localhost:3000` — not `http://localhost` alone (that uses port 80 and is often empty).
4. If the terminal says **port is in use** and picks another port (e.g. 3001), open **`http://localhost:3001`** instead.
5. **Free port 3000** (Windows, PowerShell as admin if needed):
   ```text
   netstat -ano | findstr :3000
   taskkill /PID <pid_from_last_column> /F
   ```
   Then run `npm run dev` again.
6. **Firewall**: allow Node.js / `node.exe` on private networks, or temporarily try with Windows Firewall off to test (re-enable after).
7. **Proxy/VPN**: disable system or browser proxy for local addresses, or add `localhost` / `127.0.0.1` to bypass list.

## API Endpoints (Mock Mode)

- `GET /api/state` - current state snapshot
- `GET /api/stream` - SSE realtime stream of state updates
- `POST /api/tasks` - create a task
- `PATCH /api/tasks/:taskId` - update assignment and/or status
- `GET /api/config/llm` - LLM configuration snapshot (no secrets)
- `POST /api/config/llm/test` - LLM connectivity test
- `GET /api/agents/:id/reasoning-history` - per-agent reasoning history (in-memory)

## OpenClaw Integration Notes

- Current implementation is intentionally scaffold-only.
- No undocumented OpenClaw APIs are assumed.
- Use `src/infrastructure/providers/openclaw/openClawAdapter.ts` and replace TODOs once official API contracts are available.

## Known limitations / future work

- `LocalLLMProvider` is intentionally a stub (Ollama/LM Studio wiring comes next; no fake “working” integration).
- `OpenClawLLMBridge` is scaffold-only for future routing via OpenClaw once contracts exist.
- Reasoning history and task memory are **in-memory** (resets on server restart).

## Docker

Build and run with Docker:

```bash
docker compose up --build
```

App will be available at [http://localhost:3000](http://localhost:3000).

