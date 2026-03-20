import { MissionControl } from "@/presentation/components/MissionControl";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <p className="text-xs uppercase tracking-widest text-cyan-400">Dashboard Ninja</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-100">OpenClaw Multi-Agent Mission Control</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Leonardo, Raphael, Donatello, Michelangelo, and Splinter operator cockpit.
        </p>
      </header>
      <MissionControl />
    </main>
  );
}
