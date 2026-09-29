import { describe, it, expect } from "vitest";
import { findSlots, planWeekly, zonedToUtc as z, localParts, fitsWindows, babysUpOptions, COACH_DEFAULT } from "./time-engine";

const K = "Asia/Karachi", L = "Europe/London", T = "America/Toronto", D = "Asia/Dubai";
const hm = (t: number, zone: string) => { const p = localParts(t, zone); return `${p.m}/${p.d} ${String(p.h).padStart(2, "0")}:${String(p.min).padStart(2, "0")}`; };
const call = (start: number, dur = 30) => ({ start, end: start + dur * 60000 });

describe("hello call offers", () => {
  it("Sara in Manchester", () => {
    const got = findSlots({
      now: z(2026, 10, 12, 3, 0, L), durMin: 20, noticeMin: 360,
      mother: { zone: L, days: [2, 3, 4, 5], windows: [{ from: 660, to: 720 }] },
      busy: [call(z(2026, 10, 14, 14, 30, K))],
    });
    expect(got.map((t) => hm(t, L))).toEqual(["10/13 11:00", "10/14 11:30", "10/15 11:00"]);
  });
});

describe("Make Room", () => {
  it("Sara keeps 11:00 London across the UK change", () => {
    const p = planWeekly(z(2026, 10, 20, 11, 0, L), L);
    expect(p.map((c) => hm(c.start, L))).toEqual(["10/20 11:00", "10/27 11:00", "11/3 11:00", "11/10 11:00"]);
    expect(hm(p[0].start, K)).toBe("10/20 15:00");
    expect(hm(p[1].start, K)).toBe("10/27 16:00");
  });
  it("Toronto keeps the coach's 22:00 after 1 Nov", () => {
    const p = planWeekly(z(2026, 10, 27, 13, 0, T), T);
    expect(p.map((c) => hm(c.start, T))).toEqual(["10/27 13:00", "11/3 12:00", "11/10 12:00", "11/17 12:00"]);
    expect(p.every((c) => hm(c.start, K).endsWith("22:00"))).toBe(true);
    expect(p.slice(1).every((c) => c.keptCoachTime)).toBe(true);
  });
  it("a call may end exactly at 23:00", () => {
    expect(fitsWindows(z(2026, 11, 3, 12, 30, T), 30, K, COACH_DEFAULT.days, COACH_DEFAULT.windows)).toBe(true);
  });
});

describe("Baby's up", () => {
  const mine = call(z(2026, 10, 13, 20, 30, D));
  const busy = [mine, call(z(2026, 10, 13, 22, 30, K)), call(z(2026, 10, 14, 14, 30, K)), call(z(2026, 10, 15, 21, 0, K)), call(z(2026, 10, 14, 15, 30, K), 20)];
  const mother = { zone: D, days: [1, 2, 3, 4, 5], windows: [{ from: 1200, to: 1320 }] };
  it("Maryam in Dubai", () => {
    const r = babysUpOptions({ now: z(2026, 10, 13, 20, 0, D), call: mine, durMin: 30, mother, busy, movesBySide: 0 });
    expect(r.kind).toBe("options");
    if (r.kind === "options") expect(r.times.map((t) => hm(t, D))).toEqual(["10/14 20:00", "10/15 21:00", "10/16 20:00"]);
  });
  it("third move goes to Needs you", () => {
    expect(babysUpOptions({ now: 0, call: mine, durMin: 30, mother, busy, movesBySide: 2 }).kind).toBe("needs-you");
  });
});
