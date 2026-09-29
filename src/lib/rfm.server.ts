/*
 * Server-only helpers for Room for Mama. Loaded inside server-function
 * handlers after the caller is checked (manage token or coach role).
 */
import { createHash, randomBytes } from "node:crypto";
import { fmtLong, type BusyInterval, type CoachRules, type CoachWindow } from "./time-engine";
import { SAFETY_NOTE } from "./helplines";

export type Admin = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];

export async function admin(): Promise<Admin> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export function newToken(): string {
  return randomBytes(32).toString("base64url");
}
export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export interface Settings {
  coach_zone: string;
  windows: CoachWindow[];
  max_per_day: number;
  buffer_min: number;
  notice_new_h: number;
  notice_move_h: number;
  weeks_ahead: number;
  meet_link: string;
  coach_email: string;
  payment: { bank: string; raast: string; jazzcash: string; wise: string };
  prices: { pkr: number; usd: number; founding_pkr: number; founding_usd: number; founding_spots: number };
  not_a_fit_note: string;
  minutes: Record<string, number>;
}

export async function loadSettings(db: Admin): Promise<Settings> {
  const { data, error } = await db.from("settings").select("*").eq("id", 1).single();
  if (error || !data) throw new Error("Settings missing");
  return data as unknown as Settings;
}

export function rulesFrom(s: Settings): CoachRules {
  return { zone: s.coach_zone, windows: s.windows, maxPerDay: s.max_per_day, bufferMin: s.buffer_min };
}

/** Every held or booked call on the coach's calendar. */
export async function busyCalls(db: Admin, excludeCallId?: string): Promise<BusyInterval[]> {
  const { data } = await db
    .from("calls")
    .select("id, starts_at, ends_at")
    .in("status", ["held", "booked"])
    .gte("ends_at", new Date(Date.now() - 86_400_000).toISOString());
  return (data ?? [])
    .filter((c) => c.id !== excludeCallId)
    .map((c) => ({ start: new Date(c.starts_at), end: new Date(c.ends_at) }));
}

export async function logAutomation(db: Admin, s: Settings, type: string, motherId: string | null) {
  await db.from("automation_log").insert({ type, mother_id: motherId, minutes_saved: s.minutes[type] ?? 0 });
}

export async function requestOrigin(): Promise<string> {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    return new URL(getRequest().url).origin;
  } catch {
    return "https://project--8231fb8c-ff69-494f-8d74-3b09d1464059.lovable.app";
  }
}

/** One branded template, one action each. Stored for the email preview page. */
export async function queueEmail(
  db: Admin,
  opts: {
    motherId: string | null;
    to: string;
    kind: string;
    subject: string;
    lines: string[];
    action?: { label: string; url: string } | undefined;
  },
) {
  await db.from("email_outbox").insert({
    mother_id: opts.motherId,
    to_email: opts.to,
    kind: opts.kind,
    subject: opts.subject,
    body: [...opts.lines, "", SAFETY_NOTE].join("\n"),
    action_label: opts.action?.label ?? null,
    action_url: opts.action?.url ?? null,
  });
}

export function callTitle(kind: string): string {
  return kind === "hello" ? "Hello call with Room for Mama" : "Half hour with Room for Mama";
}

export function whenLine(start: Date, zone: string): string {
  return `${fmtLong(start, zone)}, your time.`;
}

export async function helplinesForZone(db: Admin, zone: string) {
  const { data } = await db
    .from("helplines")
    .select("name, number, hours, zones, sort")
    .contains("zones", [zone])
    .order("sort");
  return (data ?? []).map((h) => ({ name: h.name, number: h.number, hours: h.hours ?? "" }));
}

export function manageUrl(origin: string, token: string): string {
  return `${origin}/manage/${token}`;
}
