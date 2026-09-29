/* Accepts the platform cron secret or the scheduler's private key. */
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { timingSafeEqual } from "node:crypto";

export async function guardCron(request: Request): Promise<Response | null> {
  const token = /^Bearer (\S+)$/.exec(request.headers.get("authorization") ?? "")?.[1];
  if (token) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("cron_keys").select("key").eq("id", 1).maybeSingle();
    if (data && data.key.length === token.length && timingSafeEqual(Buffer.from(data.key), Buffer.from(token))) return null;
  }
  return authenticateCronRequest(request);
}
