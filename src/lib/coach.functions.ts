/* Coach-only actions. Every call checks the coach role first. */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: { rpc: (fn: "has_role", args: { _user_id: string; _role: "coach" }) => PromiseLike<{ data: boolean | null }> }; userId: string };

const COACH_EMAIL = "adilmushtaq088@gmail.com";

type CoachCtx = Ctx & {
  supabase: Ctx["supabase"] & {
    auth: { getUser: () => Promise<{ data: { user: { email?: string; email_confirmed_at?: string | null } | null }; error: unknown }> };
  };
};

async function isAllowedCoach(ctx: CoachCtx) {
  const { data, error } = await ctx.supabase.auth.getUser();
  return !error && data.user?.email?.toLowerCase() === COACH_EMAIL && Boolean(data.user.email_confirmed_at);
}

async function mustBeCoach(ctx: CoachCtx) {
  if (!(await isAllowedCoach(ctx))) throw new Error("Forbidden");
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "coach" });
  if (!data) throw new Error("Forbidden");
}

/** Only the named, verified coach account can claim and use the coach role. */
export const whoAmI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await isAllowedCoach(context))) return { coach: false };
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "coach" });
    if (data) return { coach: true };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("role", "coach").neq("user_id", context.userId);
    await supabaseAdmin.from("user_roles").upsert({ user_id: context.userId, role: "coach" }, { onConflict: "user_id,role" });
    return { coach: true };
  });

export const coachData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await mustBeCoach(context);
    const db = context.supabase;
    const since = new Date(Date.now() - 12 * 60 * 60_000).toISOString();
    const [settings, calls, needs, mothers, notes, log, outbox, helplines, plans] = await Promise.all([
      db.from("settings").select("*").eq("id", 1).single(),
      db.from("calls").select("id, mother_id, kind, week, starts_at, ends_at, status, moves_used, small_step, mothers(first_name, zone, status)").in("status", ["booked", "held", "done", "missed"]).gte("starts_at", since).order("starts_at").limit(60),
      db.from("needs_you").select("id, kind, mother_id, call_id, plan_id, created_at, mothers(first_name), plans(reference, paid_reference, amount, currency)").is("resolved_at", null).order("created_at"),
      db.from("mothers").select("id, first_name, zone, city, status, created_at").order("created_at", { ascending: false }).limit(200),
      db.from("private_notes").select("id, mother_id, body, created_at").order("created_at", { ascending: false }),
      db.from("automation_log").select("id, type, minutes_saved, created_at, mothers(first_name)").order("created_at", { ascending: false }).limit(500),
      db.from("email_outbox").select("id, to_email, kind, subject, body, action_label, created_at").order("created_at", { ascending: false }).limit(40),
      db.from("helplines").select("*").order("country").order("sort"),
      db.from("plans").select("id, mother_id, status, reference, amount, currency").order("created_at", { ascending: false }),
    ]);
    return {
      settings: settings.data,
      calls: calls.data ?? [],
      needs: needs.data ?? [],
      mothers: mothers.data ?? [],
      notes: notes.data ?? [],
      log: log.data ?? [],
      outbox: outbox.data ?? [],
      helplines: helplines.data ?? [],
      plans: plans.data ?? [],
    };
  });

const windowSchema = z.object({ days: z.array(z.number().int().min(0).max(6)), start: z.string().regex(/^\d{2}:\d{2}$/), end: z.string().regex(/^\d{2}:\d{2}$/) });

export const saveRules = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        windows: z.array(windowSchema).min(1).max(6),
        max_per_day: z.number().int().min(1).max(12),
        buffer_min: z.number().int().min(0).max(60),
        notice_new_h: z.number().int().min(0).max(72),
        notice_move_h: z.number().int().min(0).max(24),
        weeks_ahead: z.number().int().min(1).max(12),
        meet_link: z.string().url().max(300),
        coach_email: z.string().email().max(254),
        payment: z.object({ bank: z.string().max(300), raast: z.string().max(100), jazzcash: z.string().max(100), wise: z.string().max(300) }),
        prices: z.object({ pkr: z.number().int().min(0), usd: z.number().int().min(0), founding_pkr: z.number().int().min(0), founding_usd: z.number().int().min(0), founding_spots: z.number().int().min(0).max(1000) }),
        not_a_fit_note: z.string().min(1).max(1000),
        minutes: z.record(z.number().int().min(0).max(240)),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await mustBeCoach(context);
    const { error } = await context.supabase.from("settings").update(data).eq("id", 1);
    if (error) throw new Error("Could not save");
    return { ok: true };
  });

export const saveHelpline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid().optional(), country: z.string().min(1).max(60), zones: z.array(z.string().max(64)).max(20), name: z.string().min(1).max(120), number: z.string().min(1).max(40), hours: z.string().max(60).nullable(), sort: z.number().int(), remove: z.boolean().optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await mustBeCoach(context);
    const { id, remove, ...row } = data;
    if (id && remove) await context.supabase.from("helplines").delete().eq("id", id);
    else if (id) await context.supabase.from("helplines").update(row).eq("id", id);
    else await context.supabase.from("helplines").insert(row);
    return { ok: true };
  });

export const resolveNeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await mustBeCoach(context);
    const r = await import("./rfm.server");
    const db = await r.admin();
    const s = await r.loadSettings(db);
    const { data: need } = await db.from("needs_you").select("*").eq("id", data.id).single();
    if (!need) return { ok: false };
    if (need.kind === "payment_check" && need.plan_id) {
      await db.from("plans").update({ status: "confirmed", confirmed_at: new Date().toISOString() }).eq("id", need.plan_id);
      await db.from("calls").update({ status: "booked" }).eq("plan_id", need.plan_id).eq("status", "held");
      const { data: m } = await db.from("mothers").select("email").eq("id", need.mother_id!).single();
      if (m) await r.queueEmail(db, { motherId: need.mother_id, to: m.email, kind: "confirmed", subject: r.callTitle("make_room"), lines: ["All four are yours. The invites are on their way."] });
      await r.logAutomation(db, s, "payment", need.mother_id);
    }
    if (need.kind === "third_move" && need.call_id) {
      // One more free move for her.
      await db.from("calls").update({ moves_used: 1 }).eq("id", need.call_id);
    }
    await db.from("needs_you").update({ resolved_at: new Date().toISOString() }).eq("id", data.id);
    return { ok: true };
  });

export const afterHello = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ motherId: z.string().uuid(), outcome: z.enum(["offer", "not_a_fit", "missed"]), callId: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await mustBeCoach(context);
    const r = await import("./rfm.server");
    const db = await r.admin();
    const s = await r.loadSettings(db);
    const origin = await r.requestOrigin();
    const { data: m } = await db.from("mothers").select("email").eq("id", data.motherId).single();
    const { data: link } = await db.from("mother_links").select("token").eq("mother_id", data.motherId).maybeSingle();
    if (!m) return { ok: false };
    const url = link ? r.manageUrl(origin, link.token) : origin;
    if (data.outcome === "offer") {
      await db.from("mothers").update({ status: "offered" }).eq("id", data.motherId);
      await r.queueEmail(db, { motherId: data.motherId, to: m.email, kind: "offer", subject: "Make Room with Room for Mama", lines: ["Thank you for the hello call. Here’s Make Room: four half hours, one a week."], action: { label: "See my four times", url } });
      await r.logAutomation(db, s, "offer", data.motherId);
    } else if (data.outcome === "not_a_fit") {
      await db.from("mothers").update({ status: "not_a_fit" }).eq("id", data.motherId);
      await r.queueEmail(db, { motherId: data.motherId, to: m.email, kind: "not-a-fit", subject: "Hello call with Room for Mama", lines: [s.not_a_fit_note] });
    } else if (data.callId) {
      await db.from("calls").update({ status: "missed" }).eq("id", data.callId);
    }
    return { ok: true };
  });

export const setSmallStep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ callId: z.string().uuid(), step: z.string().trim().min(1).max(280) }).parse(d))
  .handler(async ({ data, context }) => {
    await mustBeCoach(context);
    await context.supabase.from("calls").update({ small_step: data.step }).eq("id", data.callId);
    return { ok: true };
  });

export const addNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ motherId: z.string().uuid(), body: z.string().trim().min(1).max(2000) }).parse(d))
  .handler(async ({ data, context }) => {
    await mustBeCoach(context);
    await context.supabase.from("private_notes").insert({ mother_id: data.motherId, body: data.body });
    return { ok: true };
  });

export const shareHelplines = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ motherId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await mustBeCoach(context);
    const r = await import("./rfm.server");
    const db = await r.admin();
    const { data: m } = await db.from("mothers").select("email, zone").eq("id", data.motherId).single();
    if (!m) return { ok: false };
    const lines = await r.helplinesForZone(db, m.zone);
    await r.queueEmail(db, { motherId: data.motherId, to: m.email, kind: "helplines", subject: "Room for Mama", lines: ["Here are the helplines near you, in case they’re useful.", ...(lines.length ? lines.map((l) => `${l.name}: ${l.number}${l.hours ? ` (${l.hours})` : ""}`) : ["Call your local emergency number, or find a free helpline at findahelpline.com."])] });
    return { ok: true };
  });

/** Coach's own Baby's up: one tap sends that mother 3 new times. */
export const coachBabysUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ callId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await mustBeCoach(context);
    const r = await import("./rfm.server");
    const te = await import("./time-engine");
    const db = await r.admin();
    const s = await r.loadSettings(db);
    const { data: call } = await db.from("calls").select("*, mothers(email, zone)").eq("id", data.callId).single();
    const m = call?.mothers as unknown as { email: string; zone: string } | null;
    if (!call || !m) return { ok: false };
    const opts = te.babysUpOptions({ call: { start: new Date(call.starts_at), end: new Date(call.ends_at) }, now: new Date(), motherZone: m.zone, durationMin: (new Date(call.ends_at).getTime() - new Date(call.starts_at).getTime()) / 60_000, rules: r.rulesFrom(s), busy: await r.busyCalls(db) });
    const origin = await r.requestOrigin();
    const { data: link } = await db.from("mother_links").select("token").eq("mother_id", call.mother_id).maybeSingle();
    await db.from("move_log").insert({ call_id: call.id, moved_by: "coach", from_at: call.starts_at, to_at: null });
    await r.queueEmail(db, { motherId: call.mother_id, to: m.email, kind: "coach-babys-up", subject: r.callTitle(call.kind), lines: ["My baby’s up, so I need to move our call. Pick whichever of these suits you:", ...opts.map((o) => `${te.fmtLong(o.start, m.zone)}, your time`)], action: { label: "Pick a new time", url: link ? r.manageUrl(origin, link.token) : origin } });
    await r.logAutomation(db, s, "move", call.mother_id);
    return { ok: true, count: opts.length };
  });

export const runNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await mustBeCoach(context);
    const { runTick } = await import("./automations.server");
    const { requestOrigin } = await import("./rfm.server");
    return runTick(await requestOrigin());
  });
