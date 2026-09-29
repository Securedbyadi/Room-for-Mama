/*
 * Mother-side actions. Visitors never read tables: every action runs here,
 * and anything about an existing booking first checks the manage token.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MIN = 60_000;
const zone = z.string().min(3).max(64).refine((z_) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: z_ });
    return true;
  } catch {
    return false;
  }
}, "Unknown time zone");
const hm = z.string().regex(/^\d{2}:\d{2}$/).optional();
const token = z.string().min(32).max(128);

type Slots = { start: string; end: string }[];

/* ---------- reading her quiet moment ---------- */

export const readMoment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ text: z.string().min(1).max(600), fallbackZone: zone }).parse(d))
  .handler(async ({ data }) => {
    const { parseMoment } = await import("./moment-parse");
    const fallback = parseMoment(data.text, data.fallbackZone);
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ...fallback, city: null as string | null, days: [] as number[] };
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "Extract only days, times and city from a mother's note about when she has a quiet moment. It may be in any language. Reply with JSON only: {\"city\": string|null, \"zone\": IANA time zone for that city or null, \"days\": array of weekday numbers 0=Sunday..6=Saturday (empty if any day), \"not_before\": \"HH:MM\" 24h local or null, \"not_after\": \"HH:MM\" 24h local or null}. Nothing else.",
            },
            { role: "user", content: data.text },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) throw new Error(`AI ${res.status}`);
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const raw = JSON.parse(json.choices?.[0]?.message?.content ?? "{}") as Record<string, unknown>;
      const parsed = z
        .object({
          city: z.string().max(80).nullable().optional(),
          zone: z.string().nullable().optional(),
          days: z.array(z.number().int().min(0).max(6)).optional(),
          not_before: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
          not_after: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
        })
        .safeParse(raw);
      if (!parsed.success) throw new Error("AI shape");
      const p = parsed.data;
      const z2 = p.zone && zone.safeParse(p.zone).success ? p.zone : fallback.zone;
      return {
        zone: z2,
        city: p.city ?? null,
        days: p.days ?? [],
        notBeforeLocal: p.not_before ?? undefined,
        notAfterLocal: p.not_after ?? undefined,
      };
    } catch (e) {
      console.error("readMoment", e);
      return { ...fallback, city: null as string | null, days: [] as number[] };
    }
  });

/* ---------- public config ---------- */

export const getHelplines = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ zone }).parse(d))
  .handler(async ({ data }) => {
    const { admin, helplinesForZone } = await import("./rfm.server");
    return helplinesForZone(await admin(), data.zone);
  });

/* ---------- finding times ---------- */

export const findTimes = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ zone, notBeforeLocal: hm, notAfterLocal: hm, days: z.array(z.number().int().min(0).max(6)).max(7).optional() }).parse(d),
  )
  .handler(async ({ data }): Promise<Slots> => {
    const { admin, loadSettings, rulesFrom, busyCalls } = await import("./rfm.server");
    const { findSlots, localParts } = await import("./time-engine");
    const db = await admin();
    const s = await loadSettings(db);
    const all = findSlots({
      rules: rulesFrom(s),
      busy: await busyCalls(db),
      from: new Date(),
      motherZone: data.zone,
      durationMin: 20,
      noticeH: s.notice_new_h,
      maxAheadDays: s.weeks_ahead * 7,
      notBeforeLocal: data.notBeforeLocal,
      notAfterLocal: data.notAfterLocal,
      count: data.days && data.days.length ? 40 : 3,
    });
    const days = data.days ?? [];
    const picked = days.length ? all.filter((x) => days.includes(localParts(data.zone, x.start).weekday)).slice(0, 3) : all;
    return picked.map((x) => ({ start: x.start.toISOString(), end: x.end.toISOString() }));
  });

/* ---------- booking a hello call ---------- */

const bookInput = z.object({
  start: z.string().datetime(),
  firstName: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).optional(),
  zone,
  city: z.string().trim().max(80).nullable().optional(),
  days: z.array(z.number().int().min(0).max(6)).max(7).optional(),
  notBeforeLocal: hm,
  notAfterLocal: hm,
});

export const bookHello = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => bookInput.parse(d))
  .handler(async ({ data }) => {
    const r = await import("./rfm.server");
    const te = await import("./time-engine");
    const db = await r.admin();
    const s = await r.loadSettings(db);
    const rules = r.rulesFrom(s);
    const origin = await r.requestOrigin();

    // Rate limit: 5 per email, 20 per connection, per hour.
    // cf-connecting-ip is set by the hosting edge and can't be supplied by the browser.
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const ip = (getRequestHeader("cf-connecting-ip") ?? "unknown").trim();
    const since = new Date(Date.now() - 60 * MIN).toISOString();
    const email = data.email.toLowerCase();
    const [{ count: byEmail }, { count: byIp }] = await Promise.all([
      db.from("booking_attempts").select("id", { count: "exact", head: true }).eq("email", email).gte("created_at", since),
      db.from("booking_attempts").select("id", { count: "exact", head: true }).eq("ip", ip).gte("created_at", since),
    ]);
    if ((byEmail ?? 0) >= 5 || (byIp ?? 0) >= 20) return { ok: false as const, reason: "busy" as const };
    await db.from("booking_attempts").insert({ email, ip });

    const start = new Date(data.start);
    const end = new Date(start.getTime() + 20 * MIN);
    const now = Date.now();
    const busy = await r.busyCalls(db);
    const valid =
      start.getUTCMinutes() % 30 === 0 &&
      start.getTime() >= now + s.notice_new_h * 60 * MIN &&
      start.getTime() <= now + s.weeks_ahead * 7 * 24 * 60 * MIN &&
      te.fitsWindows(rules, start, 20) &&
      te.callsOnCoachDay(rules, busy, start) < rules.maxPerDay &&
      te.isFree(start, end, busy, rules.bufferMin);
    if (!valid) return { ok: false as const, reason: "taken" as const };

    // Reuse her record if she has booked before with this email.
    const tok = r.newToken();
    const profile = {
      first_name: data.firstName,
      phone: data.phone || null,
      zone: data.zone,
      city: data.city ?? null,
      moment_days: data.days ?? [],
      moment_not_before: data.notBeforeLocal ?? null,
      moment_not_after: data.notAfterLocal ?? null,
      token_hash: r.hashToken(tok),
    };
    const { data: existing } = await db.from("mothers").select("id").eq("email", email).order("created_at").limit(1).maybeSingle();
    let motherId: string;
    let isNew = false;
    if (existing) {
      motherId = existing.id;
      await db.from("mothers").update(profile).eq("id", motherId);
      await db.from("mother_links").delete().eq("mother_id", motherId);
    } else {
      const { data: mother, error: mErr } = await db.from("mothers").insert({ ...profile, email }).select("id").single();
      if (mErr || !mother) throw new Error("Could not save");
      motherId = mother.id;
      isNew = true;
    }
    await db.from("mother_links").insert({ mother_id: motherId, token: tok });

    const { data: call, error: cErr } = await db
      .from("calls")
      .insert({
        mother_id: motherId,
        kind: "hello",
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        blocked_until: end.toISOString(),
        status: "booked",
      })
      .select("id")
      .single();
    if (cErr || !call) {
      if (isNew) await db.from("mothers").delete().eq("id", motherId);
      if (cErr?.code === "23P01") return { ok: false as const, reason: "taken" as const };
      throw new Error("Could not save");
    }

    const invite = [{ id: call.id, start, end, kind: "hello" }];
    const url = r.manageUrl(origin, tok);
    await r.queueEmail(db, {
      motherId,
      to: email,
      kind: "booked",
      subject: r.callTitle("hello"),
      lines: [
        `You’re in. ${r.whenLine(start, data.zone)}`,
        "If the baby wakes, tap Baby’s up and pick another time. No need to explain.",
        `Video: ${s.meet_link}`,
      ],
      action: { label: "See my call", url },
      ics: invite,
    });
    await r.queueEmail(db, {
      motherId,
      to: s.coach_email,
      kind: "coach-invite",
      subject: r.callTitle("hello"),
      lines: [`${te.fmtLong(start, s.coach_zone)}, your time.`, `Video: ${s.meet_link}`],
      ics: invite,
    });
    await r.logAutomation(db, s, "booked", motherId);
    return { ok: true as const, token: tok };
  });

/* ---------- waitlist ---------- */

export const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        firstName: z.string().trim().min(1).max(60),
        email: z.string().trim().email().max(254),
        zone,
        city: z.string().trim().max(80).nullable().optional(),
        days: z.array(z.number().int().min(0).max(6)).max(7).optional(),
        notBeforeLocal: hm,
        notAfterLocal: hm,
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { admin } = await import("./rfm.server");
    const db = await admin();
    await db.from("waitlist").insert({
      first_name: data.firstName,
      email: data.email.toLowerCase(),
      zone: data.zone,
      city: data.city ?? null,
      days: data.days ?? [],
      not_before: data.notBeforeLocal ?? null,
      not_after: data.notAfterLocal ?? null,
    });
    return { ok: true };
  });

/* ---------- manage link ---------- */

async function motherByToken(t: string) {
  const r = await import("./rfm.server");
  const db = await r.admin();
  const { data } = await db.from("mothers").select("*").eq("token_hash", r.hashToken(t)).maybeSingle();
  if (!data) throw new Error("Not found");
  return { r, db, mother: data };
}

export const getManage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ token }).parse(d))
  .handler(async ({ data }) => {
    const { r, db, mother } = await motherByToken(data.token);
    const s = await r.loadSettings(db);
    const [{ data: calls }, { data: plans }, lines] = await Promise.all([
      db
        .from("calls")
        .select("id, kind, week, starts_at, ends_at, status, moves_used, clock_note, keep_spot_sent_at, keep_spot_confirmed_at, small_step")
        .eq("mother_id", mother.id)
        .order("starts_at"),
      db.from("plans").select("id, status, amount, currency, founding, reference, paid_reference, hold_expires_at").eq("mother_id", mother.id).order("created_at", { ascending: false }).limit(1),
      r.helplinesForZone(db, mother.zone),
    ]);
    const plan = plans?.[0] ?? null;
    return {
      mother: { firstName: mother.first_name, zone: mother.zone, status: mother.status },
      calls: calls ?? [],
      plan,
      meetLink: s.meet_link,
      payment: plan && (plan.status === "held" || plan.status === "paid_pending") ? s.payment : null,
      helplines: lines,
    };
  });

export const babysUpTimes = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ token, callId: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<Slots> => {
    const { r, db, mother } = await motherByToken(data.token);
    const te = await import("./time-engine");
    const s = await r.loadSettings(db);
    const { data: call } = await db.from("calls").select("*").eq("id", data.callId).eq("mother_id", mother.id).single();
    if (!call) throw new Error("Not found");
    const dur = (new Date(call.ends_at).getTime() - new Date(call.starts_at).getTime()) / MIN;
    // The time she's leaving stays busy, so it's never offered back.
    const opts = te.babysUpOptions({
      call: { start: new Date(call.starts_at), end: new Date(call.ends_at) },
      now: new Date(),
      motherZone: mother.zone,
      durationMin: dur,
      rules: r.rulesFrom(s),
      busy: await r.busyCalls(db),
    });
    return opts.map((x) => ({ start: x.start.toISOString(), end: x.end.toISOString() }));
  });

export const moveMyCall = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ token, callId: z.string().uuid(), start: z.string().datetime() }).parse(d))
  .handler(async ({ data }) => {
    const { r, db, mother } = await motherByToken(data.token);
    const te = await import("./time-engine");
    const s = await r.loadSettings(db);
    const { data: call } = await db.from("calls").select("*").eq("id", data.callId).eq("mother_id", mother.id).single();
    if (!call || call.status !== "booked") return { kind: "too-late" as const };
    const oldStart = new Date(call.starts_at);
    const dur = new Date(call.ends_at).getTime() - oldStart.getTime();
    const newStart = new Date(data.start);
    const newEnd = new Date(newStart.getTime() + dur);
    // A move the coach started (her Baby's up) counts on the coach's side, not hers.
    const coachMove = call.coach_move_pending;
    const result = te.moveCall({
      call: { start: oldStart, end: new Date(call.ends_at) },
      movesSoFar: coachMove ? 0 : call.moves_used,
      now: new Date(),
      newSlot: { start: newStart, end: newEnd },
    });
    if (result.kind === "too-late") return { kind: "too-late" as const };
    if (result.kind === "needs-coach") {
      await db.from("needs_you").insert({ kind: "third_move", mother_id: mother.id, call_id: call.id });
      return { kind: "needs-coach" as const };
    }
    const rules = r.rulesFrom(s);
    const busy = await r.busyCalls(db, call.id);
    const now = Date.now();
    const ok =
      newStart.getUTCMinutes() % 30 === 0 &&
      newStart.getUTCSeconds() === 0 &&
      newStart.getTime() >= now + s.notice_move_h * 60 * MIN &&
      newStart.getTime() <= now + s.weeks_ahead * 7 * 24 * 60 * MIN &&
      te.fitsWindows(rules, newStart, dur / MIN) &&
      te.callsOnCoachDay(rules, busy, newStart) < rules.maxPerDay &&
      te.isFree(newStart, newEnd, busy, rules.bufferMin);
    if (!ok) return { kind: "taken" as const };
    const { error } = await db
      .from("calls")
      .update({
        starts_at: newStart.toISOString(),
        ends_at: newEnd.toISOString(),
        ...(coachMove ? { coach_move_pending: false } : { moves_used: call.moves_used + 1 }),
        keep_spot_sent_at: null,
        keep_spot_confirmed_at: null,
        reminder_sent_at: null,
      })
      .eq("id", call.id);
    if (error) return { kind: "taken" as const };
    await db.from("move_log").insert({ call_id: call.id, moved_by: coachMove ? "coach" : "mother", from_at: oldStart.toISOString(), to_at: newStart.toISOString() });
    const origin = await r.requestOrigin();
    const invite = [{ id: call.id, start: newStart, end: newEnd, kind: call.kind }];
    await r.queueEmail(db, {
      motherId: mother.id,
      to: mother.email,
      kind: "moved",
      subject: r.callTitle(call.kind),
      lines: [`Moved. ${r.whenLine(newStart, mother.zone)}`, "Moving is always free."],
      action: { label: "See my call", url: r.manageUrl(origin, data.token) },
      ics: invite,
    });
    await r.queueEmail(db, {
      motherId: mother.id,
      to: s.coach_email,
      kind: "coach-invite",
      subject: r.callTitle(call.kind),
      lines: [`Moved to ${te.fmtLong(newStart, s.coach_zone)}, your time.`],
      ics: invite,
    });
    await r.logAutomation(db, s, "move", mother.id);
    return { kind: "moved" as const, start: newStart.toISOString() };
  });

export const keepMySpot = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ token, callId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { r, db, mother } = await motherByToken(data.token);
    const s = await r.loadSettings(db);
    await db
      .from("calls")
      .update({ keep_spot_confirmed_at: new Date().toISOString() })
      .eq("id", data.callId)
      .eq("mother_id", mother.id);
    void s;
    return { ok: true };
  });

/* ---------- Make Room ---------- */

type PlanMother = { zone: string; moment_days: number[]; moment_not_before: string | null; moment_not_after: string | null };

/** Four weekly times, preferring the days and times she said she's free. */
async function proposePlan(r: typeof import("./rfm.server"), db: import("./rfm.server").Admin, mother: PlanMother) {
  const te = await import("./time-engine");
  const s = await r.loadSettings(db);
  const rules = r.rulesFrom(s);
  const busy = await r.busyCalls(db);
  const motherZone = mother.zone;
  const search = (withPrefs: boolean) =>
    te.findSlots({
      rules,
      busy,
      from: new Date(),
      motherZone,
      durationMin: 30,
      noticeH: s.notice_new_h,
      maxAheadDays: s.weeks_ahead * 7 - 21,
      count: 80,
      onePerDay: false,
      notBeforeLocal: withPrefs ? mother.moment_not_before ?? undefined : undefined,
      notAfterLocal: withPrefs ? mother.moment_not_after ?? undefined : undefined,
    }).filter((c) => !withPrefs || !mother.moment_days.length || mother.moment_days.includes(te.localParts(motherZone, c.start).weekday));
  // Her own days and times first; if nothing fits, any open weekly time.
  for (const withPrefs of [true, false]) {
    for (const c of search(withPrefs)) {
      const weeks = te.planWeekly({ firstStart: c.start, weeks: 4, durationMin: 30, motherZone, rules });
      if (weeks.every((w) => te.fitsWindows(rules, w.start, 30) && te.isFree(w.start, w.end, busy, rules.bufferMin) && te.callsOnCoachDay(rules, busy, w.start) < rules.maxPerDay)) {
        return { s, weeks };
      }
    }
  }
  return { s, weeks: [] as import("./time-engine").WeeklyCall[] };
}

async function priceFor(db: import("./rfm.server").Admin, s: import("./rfm.server").Settings, motherZone: string) {
  const { count } = await db.from("plans").select("id", { count: "exact", head: true }).in("status", ["held", "paid_pending", "confirmed", "paused", "done"]);
  const founding = (count ?? 0) < s.prices.founding_spots;
  const pk = motherZone === "Asia/Karachi";
  return {
    founding,
    currency: pk ? ("PKR" as const) : ("USD" as const),
    amount: pk ? (founding ? s.prices.founding_pkr : s.prices.pkr) : founding ? s.prices.founding_usd : s.prices.usd,
  };
}

export const makeRoomPreview = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ token }).parse(d))
  .handler(async ({ data }) => {
    const { r, db, mother } = await motherByToken(data.token);
    if (mother.status !== "offered") return { calls: [], price: null };
    const { s, weeks } = await proposePlan(r, db, mother.zone);
    return {
      calls: weeks.map((w) => ({ start: w.start.toISOString(), end: w.end.toISOString(), clockNote: w.clockNote ?? null })),
      price: await priceFor(db, s, mother.zone),
    };
  });

export const holdMakeRoom = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ token }).parse(d))
  .handler(async ({ data }) => {
    const { r, db, mother } = await motherByToken(data.token);
    if (mother.status !== "offered") return { ok: false as const };
    const { s, weeks } = await proposePlan(r, db, mother.zone);
    if (weeks.length !== 4) return { ok: false as const };
    const price = await priceFor(db, s, mother.zone);
    const reference = `RM${Math.floor(100000 + Math.random() * 900000)}`;
    const { data: plan, error } = await db
      .from("plans")
      .insert({
        mother_id: mother.id,
        amount: price.amount,
        currency: price.currency,
        founding: price.founding,
        reference,
        hold_expires_at: new Date(Date.now() + 48 * 60 * MIN).toISOString(),
      })
      .select("id")
      .single();
    if (error || !plan) return { ok: false as const };
    const { error: cErr } = await db.from("calls").insert(
      weeks.map((w, i) => ({
        mother_id: mother.id,
        plan_id: plan.id,
        kind: "make_room",
        week: i + 1,
        starts_at: w.start.toISOString(),
        ends_at: w.end.toISOString(),
        blocked_until: w.end.toISOString(),
        status: "held",
        clock_note: w.clockNote ?? null,
      })),
    );
    if (cErr) {
      await db.from("plans").delete().eq("id", plan.id);
      return { ok: false as const };
    }
    await db.from("mothers").update({ status: "make_room" }).eq("id", mother.id);
    await r.logAutomation(db, s, "four_calls", mother.id);
    return { ok: true as const };
  });

export const markPaid = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ token, reference: z.string().trim().min(2).max(60) }).parse(d))
  .handler(async ({ data }) => {
    const { r, db, mother } = await motherByToken(data.token);
    const { data: plan } = await db.from("plans").select("id, status").eq("mother_id", mother.id).eq("status", "held").maybeSingle();
    if (!plan) return { ok: false };
    await db.from("plans").update({ status: "paid_pending", paid_reference: data.reference, paid_at: new Date().toISOString() }).eq("id", plan.id);
    await db.from("needs_you").insert({ kind: "payment_check", mother_id: mother.id, plan_id: plan.id });
    void r;
    return { ok: true };
  });

export const cancelMine = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ token }).parse(d))
  .handler(async ({ data }) => {
    const { db, mother } = await motherByToken(data.token);
    const { data: plan } = await db.from("plans").select("id, status").eq("mother_id", mother.id).in("status", ["held", "paid_pending", "confirmed"]).maybeSingle();
    const now = new Date().toISOString();
    if (plan) {
      const { count: done } = await db.from("calls").select("id", { count: "exact", head: true }).eq("plan_id", plan.id).eq("status", "done");
      const pause = (done ?? 0) > 0;
      await db.from("calls").update({ status: "cancelled" }).eq("plan_id", plan.id).in("status", ["held", "booked"]).gte("starts_at", now);
      await db.from("plans").update({ status: pause ? "paused" : "cancelled" }).eq("id", plan.id);
      await db.from("mothers").update({ status: pause ? "paused" : "offered" }).eq("id", mother.id);
      return { kind: pause ? ("paused" as const) : ("refund" as const) };
    }
    await db.from("calls").update({ status: "cancelled" }).eq("mother_id", mother.id).in("status", ["held", "booked"]).gte("starts_at", now);
    return { kind: "cancelled" as const };
  });

export const deleteMyData = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ token }).parse(d))
  .handler(async ({ data }) => {
    const { db, mother } = await motherByToken(data.token);
    await db.from("mothers").delete().eq("id", mother.id);
    await db.from("waitlist").delete().eq("email", mother.email);
    return { ok: true };
  });
