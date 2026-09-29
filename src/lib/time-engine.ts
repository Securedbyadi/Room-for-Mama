/*
 * Room for Mama time engine — pure TypeScript, no I/O.
 * All time-zone and window logic lives here and nowhere else.
 */

export interface CoachWindow {
  /** 0 = Sunday … 6 = Saturday, in the coach's zone */
  days: number[];
  /** "HH:MM" coach-local */
  start: string;
  end: string;
}

export interface CoachRules {
  zone: string;
  windows: CoachWindow[];
  maxPerDay: number;
  bufferMin: number;
}

export const COACH_DEFAULT: CoachRules = {
  zone: "Asia/Karachi",
  windows: [
    { days: [1, 2, 3, 4, 5], start: "14:00", end: "17:00" },
    { days: [1, 2, 3, 4, 5], start: "21:00", end: "23:00" },
  ],
  maxPerDay: 3,
  bufferMin: 10,
};

export interface BusyInterval {
  start: Date;
  end: Date;
}

export interface Slot {
  start: Date;
  end: Date;
}

const DAY = 24 * 60 * 60 * 1000;
const MIN = 60 * 1000;

const WEEKDAYS: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export interface LocalParts {
  y: number;
  mo: number;
  d: number;
  h: number;
  mi: number;
  weekday: number;
}

/** Local wall-clock parts of `date` in `zone`. */
export function localParts(zone: string, date: Date): LocalParts {
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  });
  const out: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) out[p.type] = p.value;
  return {
    y: Number(out["year"]),
    mo: Number(out["month"]),
    d: Number(out["day"]),
    h: Number(out["hour"]) % 24,
    mi: Number(out["minute"]),
    weekday: WEEKDAYS[out["weekday"] ?? ""] ?? 0,
  };
}

/** The UTC instant for a wall-clock time in `zone`. */
export function zonedToUtc(
  zone: string,
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
): Date {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const parts = localParts(zone, new Date(guess));
  const asUtc = Date.UTC(parts.y, parts.mo - 1, parts.d, parts.h, parts.mi);
  return new Date(guess - (asUtc - guess));
}

/** UTC offset of `zone` at `date`, in minutes. */
export function offsetMin(zone: string, date: Date): number {
  const p = localParts(zone, date);
  const asUtc = Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi);
  return Math.round((asUtc - date.getTime()) / MIN);
}

function parseHM(hm: string): [number, number] {
  const [h, m] = hm.split(":").map(Number);
  return [h ?? 0, m ?? 0];
}

/** Does a call of `durationMin` starting at `start` fit inside a coach window? */
export function fitsWindows(
  rules: CoachRules,
  start: Date,
  durationMin: number,
): boolean {
  const p = localParts(rules.zone, start);
  const end = new Date(start.getTime() + durationMin * MIN);
  const pe = localParts(rules.zone, end);
  for (const w of rules.windows) {
    if (!w.days.includes(p.weekday)) continue;
    const [sh, sm] = parseHM(w.start);
    const [eh, em] = parseHM(w.end);
    const wStart = zonedToUtc(rules.zone, p.y, p.mo, p.d, sh, sm);
    // A call ending exactly at the window end fits.
    const wEnd = zonedToUtc(rules.zone, pe.y, pe.mo, pe.d, eh, em);
    if (start >= wStart && end <= wEnd) return true;
  }
  return false;
}

/** Is [start, end) free of busy intervals, with the coach's buffer on both sides? */
export function isFree(
  start: Date,
  end: Date,
  busy: BusyInterval[],
  bufferMin: number,
): boolean {
  const s = start.getTime() - bufferMin * MIN;
  const e = end.getTime() + bufferMin * MIN;
  return !busy.some((b) => b.start.getTime() < e && b.end.getTime() > s);
}

function callsOnCoachDay(rules: CoachRules, busy: BusyInterval[], day: Date): number {
  const p = localParts(rules.zone, day);
  return busy.filter((b) => {
    const bp = localParts(rules.zone, b.start);
    return bp.y === p.y && bp.mo === p.mo && bp.d === p.d;
  }).length;
}

export interface FindSlotsOptions {
  rules?: CoachRules | undefined;
  busy?: BusyInterval[] | undefined;
  /** Earliest bookable instant (the engine adds the notice period itself). */
  from: Date;
  motherZone: string;
  durationMin: number;
  noticeH: number;
  maxAheadDays?: number;
  /** How many slots to return (default 3). */
  count?: number;
  /** One slot per day (default true). */
  onePerDay?: boolean;
  /** Mother's preference: not before this wall-clock time in HER zone, "HH:MM". */
  notBeforeLocal?: string | undefined;
  /** Mother's preference: not after this wall-clock time in HER zone, "HH:MM". */
  notAfterLocal?: string | undefined;
}

/**
 * The earliest open times inside both windows, in the mother's zone.
 * Starts on :00 or :30, respects notice, buffer, max-per-day and the
 * 6-weeks-ahead rule.
 */
export function findSlots(opts: FindSlotsOptions): Slot[] {
  const rules = opts.rules ?? COACH_DEFAULT;
  const busy = opts.busy ?? [];
  const count = opts.count ?? 3;
  const onePerDay = opts.onePerDay ?? true;
  const maxAheadDays = opts.maxAheadDays ?? 42;
  const earliest = opts.from.getTime() + opts.noticeH * 60 * MIN;
  const latest = opts.from.getTime() + maxAheadDays * DAY;
  const out: Slot[] = [];
  const seenDays = new Set<string>();

  // Walk coach-local days, then :00/:30 starts inside each window.
  const fromCoach = localParts(rules.zone, new Date(earliest));
  for (let dayOffset = 0; dayOffset <= maxAheadDays + 2; dayOffset++) {
    const dayUtc = Date.UTC(fromCoach.y, fromCoach.mo - 1, fromCoach.d + dayOffset);
    const dp = localParts(rules.zone, new Date(dayUtc + 12 * 60 * MIN));
    for (const w of rules.windows) {
      if (!w.days.includes(dp.weekday)) continue;
      const [sh, sm] = parseHM(w.start);
      const [eh, em] = parseHM(w.end);
      const wStart = zonedToUtc(rules.zone, dp.y, dp.mo, dp.d, sh, sm);
      const wEnd = zonedToUtc(rules.zone, dp.y, dp.mo, dp.d, eh, em);
      for (
        let t = wStart.getTime();
        t + opts.durationMin * MIN <= wEnd.getTime();
        t += 30 * MIN
      ) {
        const start = new Date(t);
        const end = new Date(t + opts.durationMin * MIN);
        if (t < earliest || t > latest) continue;
        if (opts.notBeforeLocal || opts.notAfterLocal) {
          const mp = localParts(opts.motherZone, start);
          const mins = mp.h * 60 + mp.mi;
          if (opts.notBeforeLocal) {
            const [bh, bm] = parseHM(opts.notBeforeLocal);
            if (mins < bh * 60 + bm) continue;
          }
          if (opts.notAfterLocal) {
            const [ah, am] = parseHM(opts.notAfterLocal);
            if (mins > ah * 60 + am) continue;
          }
        }
        if (onePerDay) {
          const key = `${dp.y}-${dp.mo}-${dp.d}`;
          if (seenDays.has(key)) continue;
        }
        if (callsOnCoachDay(rules, busy, start) >= rules.maxPerDay) continue;
        if (!isFree(start, end, busy, rules.bufferMin)) continue;
        out.push({ start, end });
        if (onePerDay) {
          const dp2 = localParts(rules.zone, start);
          seenDays.add(`${dp2.y}-${dp2.mo}-${dp2.d}`);
        }
        if (out.length >= count) return out;
      }
    }
  }
  return out;
}

export interface WeeklyCall {
  start: Date;
  end: Date;
  /** Set when a clock change moved the mother's local time. */
  clockNote?: string | undefined;
}

/**
 * Plan `weeks` weekly calls at the same mother-local time as `firstStart`.
 * Clock-change rule: keep the mother's local time if it still fits both
 * windows; otherwise keep the coach's time and note the new mother time.
 */
export function planWeekly(opts: {
  firstStart: Date;
  weeks: number;
  durationMin: number;
  motherZone: string;
  rules?: CoachRules;
  busy?: BusyInterval[];
}): WeeklyCall[] {
  const rules = opts.rules ?? COACH_DEFAULT;
  const busy = opts.busy ?? [];
  const out: WeeklyCall[] = [];
  const motherFirst = localParts(opts.motherZone, opts.firstStart);
  const coachFirst = localParts(rules.zone, opts.firstStart);
  const firstOffset = offsetMin(opts.motherZone, opts.firstStart);

  for (let wk = 0; wk < opts.weeks; wk++) {
    const base = opts.firstStart.getTime() + wk * 7 * DAY;
    // Candidate A: same mother-local wall time.
    const mp = localParts(opts.motherZone, new Date(base));
    let start = zonedToUtc(opts.motherZone, mp.y, mp.mo, mp.d, motherFirst.h, motherFirst.mi);
    const end = new Date(start.getTime() + opts.durationMin * MIN);
    let clockNote: string | undefined;

    const offsetChanged = offsetMin(opts.motherZone, start) !== firstOffset;
    if (!fitsWindows(rules, start, opts.durationMin)) {
      // Keep the coach's time instead.
      const cp = localParts(rules.zone, new Date(base));
      start = zonedToUtc(rules.zone, cp.y, cp.mo, cp.d, coachFirst.h, coachFirst.mi);
      clockNote = `Clocks change: this call moves to ${fmtTime(start, opts.motherZone)}, your time.`;
    } else if (offsetChanged && wk > 0) {
      clockNote = `Clocks change before this call — still ${fmtTime(start, opts.motherZone)}, your time.`;
    }
    void busy;
    out.push({ start, end: new Date(start.getTime() + opts.durationMin * MIN), clockNote });
    void end;
  }
  return out;
}

/** Up to 3 Baby's up alternatives: same rules, 1 h notice. */
export function babysUpOptions(opts: {
  call: Slot;
  now: Date;
  motherZone: string;
  durationMin: number;
  rules?: CoachRules;
  busy?: BusyInterval[];
}): Slot[] {
  // The old time stays busy: Baby's up never re-offers the slot she is leaving.
  return findSlots({
    rules: opts.rules,
    busy: opts.busy,
    from: opts.now,
    motherZone: opts.motherZone,
    durationMin: opts.durationMin,
    noticeH: 1,
    count: 3,
  });
}

export type MoveResult =
  | { kind: "moved"; slot: Slot }
  | { kind: "needs-coach" }
  | { kind: "too-late" };

/**
 * Move a call. Free, twice per call, until 10 min after the start.
 * The third move goes to Needs you.
 */
export function moveCall(opts: {
  call: Slot;
  movesSoFar: number;
  now: Date;
  newSlot: Slot;
}): MoveResult {
  if (opts.now.getTime() > opts.call.start.getTime() + 10 * MIN) {
    return { kind: "too-late" };
  }
  if (opts.movesSoFar >= 2) return { kind: "needs-coach" };
  return { kind: "moved", slot: opts.newSlot };
}

/* ---------- formatting ---------- */

export function fmtTime(date: Date, zone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .toLowerCase();
}

export function fmtLong(date: Date, zone: string): string {
  const day = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  return `${day}, ${fmtTime(date, zone)}`;
}

export function fmtSlot(date: Date, zone: string): string {
  return `${fmtLong(date, zone)} (${zoneLabel(zone)})`;
}

export function zoneLabel(zone: string): string {
  const city = zone.split("/").pop()?.replace(/_/g, " ") ?? zone;
  return city;
}
