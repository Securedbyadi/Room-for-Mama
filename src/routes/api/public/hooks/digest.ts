import { createFileRoute } from "@tanstack/react-router";
import { guardCron } from "@/lib/cron-guard.server";

export const Route = createFileRoute("/api/public/hooks/digest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await guardCron(request);
        if (denied) return denied;
        const { runDigest } = await import("@/lib/automations.server");
        return Response.json({ ok: true, ...(await runDigest()) });
      },
    },
  },
});
