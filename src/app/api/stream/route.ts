import { dashboardService } from "@/application/services/dashboardService";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const write = async () => {
        const state = await dashboardService.tickSimulation();
        controller.enqueue(encoder.encode(`event: state\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(state)}\n\n`));
      };

      void write();
      const interval = setInterval(() => {
        void write();
      }, 3000);

      return () => {
        clearInterval(interval);
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

