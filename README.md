# Dashboard Ninja

Full-stack TypeScript mission-control dashboard for a multi-agent OpenClaw setup.

## Status

- Mock mode implemented first (in-memory runtime + realtime simulation via SSE)
- Premium “control-room” UI with desk layout, clickable stations, and cinematic gradients
- Per-agent activity timeline + health indicators (online/offline, last heartbeat, last successful task)
- Central Splinter mission queue with filters (status, priority, assigned agent)
- OpenClaw adapter scaffold included with explicit TODO markers
- UI and orchestration logic are separated using clean architecture layers

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
```

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
   - [http://localhost:3000](http://localhost:3000)

## API Endpoints (Mock Mode)

- `GET /api/state` - current state snapshot
- `GET /api/stream` - SSE realtime stream of state updates
- `POST /api/tasks` - create a task
- `PATCH /api/tasks/:taskId` - update assignment and/or status

## OpenClaw Integration Notes

- Current implementation is intentionally scaffold-only.
- No undocumented OpenClaw APIs are assumed.
- Use `src/infrastructure/providers/openclaw/openClawAdapter.ts` and replace TODOs once official API contracts are available.

## Docker

Build and run with Docker:

```bash
docker compose up --build
```

App will be available at [http://localhost:3000](http://localhost:3000).

