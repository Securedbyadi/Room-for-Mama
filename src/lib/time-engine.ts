// Pure time-zone and window engine. No I/O. All instants are UTC ms.

export type Window = { from: number; to: number }; // minutes of the local day
export type Busy = { start: number; end: number };

export type CoachRules = {
  zone: string;
  days: number[]; // 1 = Mon … 7 = Sun
  windows: Window[];
  maxPerDay: number;
  bufferMin: number;
};

export type MotherPrefs = { zone: string; days: number[]; windows: Window[] };

export const COACH_DEFAULT: CoachRules = {
  zone: "Asia/Karachi",
  days: [1, 2, 3, 4, 5],
  windows: [
    { from: 14 * 60, to: 17 * 60 },
    { from: 21 * 60, to: 23 * 60 },
  ],
  maxPerDay: 3,
  bufferMin: 10,
};

const MIN = 60_000;
const DAY = 24 * 60 * MIN;

type Parts = { y: number; m: number; d: number; h: number; min: number; wd: number };
const dtfCache = new Map<string, Intl.DateTimeFormat>();
function dtf(zone: string) {
  let f = dtfCache.get(zone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-GB", {
      timeZone: zone, hourCycle: "h23", year: "numeric", month: "numeric",
      day: "numeric", hour: "numeric", minute: "numeric", weekday: "short",
    });
    dtfCache.set(zone, f);
  }
  return f;
}
const WD: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

export function localParts(t: number, zone: string): Parts {
  const o: Record<string, string> = {};
  for (const p of dtf(zone).formatToParts(new Date(t))) o[p.type] = p.value;
  return { y: +o["year"], m: +o["month"], d: +o["day"], h: +o["hour"], min: +o["minute"], wd: WD[o["weekday"]!]! };
}

/** Local wall time in a zone to a UTC instant. */
export function zonedToUtc(y: number, m: number, d: number, h: number, min: number, zone: string): number {
  const guess = Date.UTC(y, m - 1, d, h, min);
  let t = guess;
  for (let i = 0; i < 3; i++) {
    const p = localParts(t, zone);
    const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min);
    t += guess - asUtc;
  }
  return t;
}

const minutesOfDay = (p: Parts) => p.h * 60 + p.min;

/** True when [start, start+dur] sits inside one window on an allowed day, in that zone. */
export function fitsWindows(start: number, durMin: number, zone: string, days: number[], windows: Window[]) {
  const p = localParts(start, zone);
  const e = localParts(start + durMin * MIN, zone);
  if (!days.includes(p.wd)) return false;
  const s = minutesOfDay(p);
  let en = minutesOfDay(e);
  if (e.d !== p.d) en = en === 0 ? 24 * 60 : Infinity;
  return windows.some((w) => s >= w.from && en <= w.to);
}

function coachDayKey(t: number, zone: string) {
  const p = localParts(t, zone);
  return `${p.y}-${p.m}-${p.d}`;
}

export function isFree(start: number, durMin: number, busy: Busy[], coach: CoachRules) {
  const end = start + durMin * MIN;
  const buf = coach.bufferMin * MIN;
  if (busy.some((b) => start < b.end + buf && end + buf > b.start)) return false;
  const key = coachDayKey(start, coach.zone);
  return busy.filter((b) => coachDayKey(b.start, coach.zone) === key).length < coach.maxPerDay;
}

export type FindOptions = {
  now: number;
  durMin: number;
  noticeMin: number;
  mother: MotherPrefs;
  busy: Busy[];
  coach?: CoachRules;
  count?: number;
  weeksAhead?: number;
};

/** Earliest open starts, one per mother-local day, inside both windows. */
export function findSlots(o: FindOptions): number[] {
  const coach = o.coach ?? COACH_DEFAULT;
  const count = o.count ?? 3;
  const earliest = o.now + o.noticeMin * MIN;
  const limit = o.now + (o.weeksAhead ?? 6) * 7 * DAY;
  const out: number[] = [];
  const p0 = localParts(o.now, o.mother.zone);
  for (let i = 0; i <= (o.weeksAhead ?? 6) * 7 && out.length < count; i++) {
    const dayUtc = Date.UTC(p0.y, p0.m - 1, p0.d + i);
    const dd = new Date(dayUtc);
    const [y, m, d] = [dd.getUTCFullYear(), dd.getUTCMonth() + 1, dd.getUTCDate()];
    for (const w of o.mother.windows) {
      let found: number | null = null;
      for (let t = Math.ceil(w.from / 30) * 30; t + o.durMin <= w.to; t += 30) {
        const start = zonedToUtc(y, m, d, Math.floor(t / 60), t % 60, o.mother.zone);
        if (start < earliest || start > limit) continue;
        if (!fitsWindows(start, o.durMin, o.mother.zone, o.mother.days, o.mother.windows)) continue;
        if (!fitsWindows(start, o.durMin, coach.zone, coach.days, coach.windows)) continue;
        if (!isFree(start, o.durMin, o.busy, coach)) continue;
        found = start;
        break;
      }
      if (found !== null) { out.push(found); break; }
    }
  }
  return out;
}

export type PlanCall = { start: number; keptCoachTime: boolean };

/**
 * Four weekly calls. Keep the mother's local time when it fits the coach's
 * windows; otherwise keep the coach's local time from the first call.
 */
export function planWeekly(firstStart: number, motherZone: string, n = 4, durMin = 30, coach: CoachRules = COACH_DEFAULT): PlanCall[] {
  const mp = localParts(firstStart, motherZone);
  const cp = localParts(firstStart, coach.zone);
  const out: PlanCall[] = [{ start: firstStart, keptCoachTime: false }];
  for (let i = 1; i < n; i++) {
    const md = new Date(Date.UTC(mp.y, mp.m - 1, mp.d + 7 * i));
    const mine = zonedToUtc(md.getUTCFullYear(), md.getUTCMonth() + 1, md.getUTCDate(), mp.h, mp.min, motherZone);
    if (fitsWindows(mine, durMin, coach.zone, coach.days, coach.windows)) {
      out.push({ start: mine, keptCoachTime: false });
    } else {
      const cd = new Date(Date.UTC(cp.y, cp.m - 1, cp.d + 7 * i));
      out.push({ start: zonedToUtc(cd.getUTCFullYear(), cd.getUTCMonth() + 1, cd.getUTCDate(), cp.h, cp.min, coach.zone), keptCoachTime: true });
    }
  }
  return out;
}

/** Instants between two times where the zone's UTC offset changes (to the day). */
export function clockChangesBetween(a: number, b: number, zone: string): number[] {
  const off = (t: number) => {
    const p = localParts(t, zone);
    return Date.UTC(p.y, p.m - 1, p.d, p.h, p.min) - Math.floor(t / MIN) * MIN;
  };
  const out: number[] = [];
  for (let t = a; t < b; t += DAY) if (off(t) !== off(Math.min(t + DAY, b))) out.push(t + DAY);
  return out;
}

export type MoveResult = { kind: "options"; times: number[] } | { kind: "needs-you" };

export function babysUpOptions(o: {
  now: number; call: Busy & { id?: string }; durMin: number; mother: MotherPrefs;
  busy: Busy[]; movesBySide: number; coach?: CoachRules;
}): MoveResult {
  if (o.movesBySide >= 2) return { kind: "needs-you" };
  const busy = o.busy.filter((b) => !(b.start === o.call.start && b.end === o.call.end));
  return { kind: "options", times: findSlots({ now: o.now, durMin: o.durMin, noticeMin: 60, mother: o.mother, busy, ...(o.coach ? { coach: o.coach } : {}) }) };
}

// Formatting helpers (mother's zone, labelled).
export function fmtSlot(t: number, zone: string) {
  const day = new Intl.DateTimeFormat("en-GB", { timeZone: zone, weekday: "short", day: "numeric", month: "short" }).format(t);
  return { day, time: fmtTime(t, zone) };
}
export function fmtTime(t: number, zone: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", minute: "2-digit", hour12: true })
    .format(t).replace("AM", "am").replace("PM", "pm");
}
export function fmtLong(t: number, zone: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: zone, weekday: "long", day: "numeric", month: "long" }).format(t);
}
