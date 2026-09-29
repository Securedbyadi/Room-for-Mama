/* The 5-minute job and the 07:00 Lahore digest. Each action writes automation_log. */
import * as r from "./rfm.server";
import { fmtLong, fmtTime } from "./time-engine";

const MIN = 60_000;

async function linkFor(db: r.Admin, motherId: string, origin: string) {
  const { data } = await db.from("mother_links").select("token").eq("mother_id", motherId).maybeSingle();
  return data ? r.manageUrl(origin, data.token) : `${origin}/`;
}

export async function runTick(origin: string, now = new Date()) {
  const db = await r.admin();
  const s = await r.loadSettings(db);
  const iso = (ms: number) => new Date(now.getTime() + ms).toISOString();
  const done: Record<string, number> = {};
  const bump = (k: string) => (done[k] = (done[k] ?? 0) + 1);

  // 1. Unpaid holds end after 48 h.
  const { data: expired } = await db.from("plans").select("id, mother_id").eq("status", "held").lt("hold_expires_at", now.toISOString());
  for (const p of expired ?? []) {
    await db.from("calls").update({ status: "released" }).eq("plan_id", p.id).eq("status", "held");
    await db.from("plans").update({ status: "released" }).eq("id", p.id);
    await db.from("mothers").update({ status: "offered" }).eq("id", p.mother_id);
    bump("hold_ended");
  }

  const { data: calls } = await db
    .from("calls")
    .select("id, mother_id, kind, starts_at, ends_at, status, created_at, keep_spot_sent_at, keep_spot_confirmed_at, reminder_sent_at, thanks_sent_at, small_step, mothers(first_name, email, zone)")
    .in("status", ["booked", "done"])
    .gte("starts_at", iso(-3 * 24 * 60 * MIN))
    .lte("starts_at", iso(25 * 60 * MIN));

  for (const c of calls ?? []) {
    const m = c.mothers as unknown as { first_name: string; email: string; zone: string } | null;
    if (!m) continue;
    const start = new Date(c.starts_at).getTime();
    const end = new Date(c.ends_at).getTime();
    const url = await linkFor(db, c.mother_id, origin);

    // 2. Keep my spot, 24 h before a hello call (none if booked later).
    if (c.kind === "hello" && c.status === "booked" && !c.keep_spot_sent_at && start - now.getTime() <= 24 * 60 * MIN && start - new Date(c.created_at).getTime() > 24 * 60 * MIN) {
      await r.queueEmail(db, { motherId: c.mother_id, to: m.email, kind: "keep-spot", subject: r.callTitle(c.kind), lines: [`Tomorrow at ${fmtTime(new Date(start), m.zone)}, your time. Still good for you?`], action: { label: "Keep my spot", url } });
      await db.from("calls").update({ keep_spot_sent_at: now.toISOString() }).eq("id", c.id);
      await r.logAutomation(db, s, "keep_spot", c.mother_id);
      bump("keep_spot");
      continue;
    }

    // 3. Not tapped by 3 h before: the time goes to the first on the waitlist.
    if (c.kind === "hello" && c.status === "booked" && c.keep_spot_sent_at && !c.keep_spot_confirmed_at && start - now.getTime() <= 3 * 60 * MIN && start > now.getTime()) {
      const { data: first } = await db.from("waitlist").select("id, email").eq("status", "waiting").order("created_at").limit(1).maybeSingle();
      if (first) {
        await db.from("calls").update({ status: "released" }).eq("id", c.id);
        await db.from("waitlist").update({ status: "offered" }).eq("id", first.id);
        await r.queueEmail(db, { motherId: null, to: first.email, kind: "waitlist-open", subject: r.callTitle("hello"), lines: [`A time opened: ${fmtLong(new Date(start), s.coach_zone)} (Lahore). Pick it if it suits you.`], action: { label: "Pick a time", url: `${origin}/fit-check` } });
        await r.queueEmail(db, { motherId: c.mother_id, to: m.email, kind: "released", subject: r.callTitle(c.kind), lines: ["I gave your time to a mama who was waiting. Book again whenever it suits you."], action: { label: "Pick a new time", url: `${origin}/fit-check` } });
        await r.logAutomation(db, s, "re_offer", c.mother_id);
        bump("re_offer");
      }
      continue;
    }

    // 4. Reminder 30 min before, with Baby's up.
    if (c.status === "booked" && !c.reminder_sent_at && start - now.getTime() <= 30 * MIN && start > now.getTime()) {
      await r.queueEmail(db, { motherId: c.mother_id, to: m.email, kind: "reminder", subject: r.callTitle(c.kind), lines: [c.kind === "hello" ? "Your hello call starts soon. Tea ready?" : "Your half hour starts soon. Tea ready?", `Video: ${s.meet_link}`], action: { label: "Baby’s up", url } });
      await db.from("calls").update({ reminder_sent_at: now.toISOString() }).eq("id", c.id);
      await r.logAutomation(db, s, "reminder", c.mother_id);
      bump("reminder");
      continue;
    }

    // 5. Finished calls are marked done; the thank-you goes once the coach adds the small step.
    if (c.status === "booked" && end + 10 * MIN < now.getTime()) {
      await db.from("calls").update({ status: "done" }).eq("id", c.id);
      bump("done");
    }
    if (c.status === "done" && c.small_step && !c.thanks_sent_at) {
      await r.queueEmail(db, { motherId: c.mother_id, to: m.email, kind: "thanks", subject: r.callTitle(c.kind), lines: ["Thank you for your half hour. Your one small step this week is below.", "", c.small_step], action: { label: "See my calls", url } });
      await db.from("calls").update({ thanks_sent_at: now.toISOString() }).eq("id", c.id);
      bump("thanks");
    }
  }
  return done;
}

export async function runDigest(now = new Date()) {
  const db = await r.admin();
  const s = await r.loadSettings(db);
  const { count: calls } = await db.from("calls").select("id", { count: "exact", head: true }).eq("status", "booked").gte("starts_at", now.toISOString()).lte("starts_at", new Date(now.getTime() + 24 * 60 * MIN).toISOString());
  const { count: needs } = await db.from("needs_you").select("id", { count: "exact", head: true }).is("resolved_at", null);
  await r.queueEmail(db, { motherId: null, to: s.coach_email, kind: "digest", subject: "Your day with Room for Mama", lines: [`Calls today: ${calls ?? 0}.`, `Needs you: ${needs ?? 0}.`] });
  await r.logAutomation(db, s, "digest", null);
  return { calls: calls ?? 0, needs: needs ?? 0 };
}
