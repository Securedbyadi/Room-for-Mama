import { describe, expect, it } from "vitest";
import {
  COACH_DEFAULT,
  babysUpOptions,
  findSlots,
  fitsWindows,
  fmtLong,
  localParts,
  moveCall,
  planWeekly,
  zonedToUtc,
} from "./time-engine";

const KHI = "Asia/Karachi";
const LONDON = "Europe/London";
const TORONTO = "America/Toronto";

// Demo "now": Monday 12 October 2026, 09:30 in London (08:30 UTC).
const NOW = new Date("2026-10-12T08:30:00Z");

// Hina's booked half hour: Wednesday 14 October, 14:30–15:00 in Lahore.
const HINA = {
  start: zonedToUtc(KHI, 2026, 10, 14, 14, 30),
  end: zonedToUtc(KHI, 2026, 10, 14, 15, 0),
};

describe("Sara in Manchester books a hello call", () => {
  it("offers Tue 13, Wed 14 and Thu 15 Oct at 11:30, her time", () => {
    const slots = findSlots({
      from: NOW,
      motherZone: LONDON,
      durationMin: 20,
      noticeH: 6,
      notBeforeLocal: "11:30",
      notAfterLocal: "12:00",
      busy: [HINA],
    });
    expect(slots).toHaveLength(3);
    const days = slots.map((s) => localParts(LONDON, s.start));
    expect(days.map((p) => [p.d, p.h, p.mi])).toEqual([
      [13, 11, 30],
      [14, 11, 30],
      [15, 11, 30],
    ]);
    // Wednesday's offer sits clear of Hina's call plus the 10-minute buffer.
    expect(fmtLong(slots[1]!.start, LONDON)).toBe("Wednesday 14 October, 11:30 am");
  });
});

describe("Make Room across the UK clock change (25 Oct 2026)", () => {
  it("keeps the mother's 11:30 local time when it still fits", () => {
    const first = zonedToUtc(LONDON, 2026, 10, 14, 11, 30);
    const plan = planWeekly({
      firstStart: first,
      weeks: 4,
      durationMin: 30,
      motherZone: LONDON,
      busy: [HINA],
    });
    expect(plan).toHaveLength(4);
    for (const call of plan) {
      const p = localParts(LONDON, call.start);
      expect([p.h, p.mi]).toEqual([11, 30]);
      expect(fitsWindows(COACH_DEFAULT, call.start, 30)).toBe(true);
    }
    // The call after 25 October carries a clock-change note.
    expect(plan[2]!.clockNote).toMatch(/Clocks change/);
    expect(plan[0]!.clockNote).toBeUndefined();
  });
});

describe("Toronto when the clocks move the call out of the window", () => {
  it("keeps the coach's time and tells her the new time", () => {
    // 1 pm Toronto fits before 1 Nov (22:00 KHI) but not after (23:00 KHI).
    const first = zonedToUtc(TORONTO, 2026, 10, 21, 13, 0);
    const plan = planWeekly({
      firstStart: first,
      weeks: 3,
      durationMin: 30,
      motherZone: TORONTO,
    });
    expect(localParts(TORONTO, plan[0]!.start).h).toBe(13);
    expect(localParts(TORONTO, plan[1]!.start).h).toBe(13);
    // Week 3 (4 Nov, EST): coach's 22:00 kept, mother sees 12:00.
    const p2 = localParts(TORONTO, plan[2]!.start);
    expect([p2.h, p2.mi]).toEqual([12, 0]);
    expect(localParts(KHI, plan[2]!.start).h).toBe(22);
    expect(plan[2]!.clockNote).toMatch(/moves to 12:00 pm, your time/);
  });
});

describe("window edges", () => {
  it("a call ending exactly at 23:00 fits", () => {
    const start = zonedToUtc(KHI, 2026, 10, 13, 22, 30);
    expect(fitsWindows(COACH_DEFAULT, start, 30)).toBe(true);
  });
  it("a call ending at 23:01 does not", () => {
    const start = zonedToUtc(KHI, 2026, 10, 13, 22, 31);
    expect(fitsWindows(COACH_DEFAULT, start, 30)).toBe(false);
  });
});

describe("Maryam taps Baby's up", () => {
  it("offers up to 3 new times with 1 h notice, never the old one", () => {
    const call = {
      start: zonedToUtc(KHI, 2026, 10, 14, 21, 0),
      end: zonedToUtc(KHI, 2026, 10, 14, 21, 30),
    };
    const now = new Date(call.start.getTime() - 90 * 60 * 1000);
    const options = babysUpOptions({
      call,
      now,
      motherZone: KHI,
      durationMin: 30,
      busy: [call, HINA],
    });
    expect(options.length).toBeGreaterThan(0);
    expect(options.length).toBeLessThanOrEqual(3);
    for (const o of options) {
      expect(o.start.getTime()).not.toBe(call.start.getTime());
      expect(o.start.getTime()).toBeGreaterThanOrEqual(now.getTime() + 60 * 60 * 1000);
    }
  });
});

describe("moving a call", () => {
  const call = {
    start: zonedToUtc(KHI, 2026, 10, 14, 21, 0),
    end: zonedToUtc(KHI, 2026, 10, 14, 21, 30),
  };
  const newSlot = {
    start: zonedToUtc(KHI, 2026, 10, 15, 21, 0),
    end: zonedToUtc(KHI, 2026, 10, 15, 21, 30),
  };
  it("first and second moves are free", () => {
    const now = new Date(call.start.getTime() - 60 * 60 * 1000);
    expect(moveCall({ call, movesSoFar: 0, now, newSlot }).kind).toBe("moved");
    expect(moveCall({ call, movesSoFar: 1, now, newSlot }).kind).toBe("moved");
  });
  it("the third move goes to Needs you", () => {
    const now = new Date(call.start.getTime() - 60 * 60 * 1000);
    expect(moveCall({ call, movesSoFar: 2, now, newSlot }).kind).toBe("needs-coach");
  });
  it("no moves later than 10 min after the start", () => {
    const now = new Date(call.start.getTime() + 11 * 60 * 1000);
    expect(moveCall({ call, movesSoFar: 0, now, newSlot }).kind).toBe("too-late");
  });
});
