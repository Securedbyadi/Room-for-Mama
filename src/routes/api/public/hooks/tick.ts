import { createFileRoute } from "@tanstack/react-router";
import { guardCron } from "@/lib/cron-guard.server";

export const Route = createFileRoute("/api/public/hooks/tick")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await guardCron(request);
        if (denied) return denied;
        const { runTick } = await import("@/lib/automations.server");
        const done = await runTick(new URL(request.url).origin);
        return Response.json({ ok: true, done });
      },
    },
  },
});
