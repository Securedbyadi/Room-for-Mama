/*
 * Demo data for the six screens. Demo rows only — never the real
 * calendar or email, and no real people.
 */
import { zonedToUtc, type BusyInterval } from "./time-engine";

export const KHI = "Asia/Karachi";

/** Demo "now": Monday 12 October 2026, 09:30 in Manchester. */
export const DEMO_NOW = new Date("2026-10-12T08:30:00Z");

export interface DemoMother {
  id: string;
  name: string;
  city: string;
  zone: string;
  kind: "hello" | "make-room";
}

export const DEMO_MOTHERS: DemoMother[] = [
  { id: "hina", name: "Hina", city: "Lahore", zone: "Asia/Karachi", kind: "make-room" },
  { id: "ayesha", name: "Ayesha", city: "Dubai", zone: "Asia/Dubai", kind: "hello" },
  { id: "sara", name: "Sara", city: "Manchester", zone: "Europe/London", kind: "hello" },
  { id: "emily", name: "Emily", city: "Toronto", zone: "America/Toronto", kind: "make-room" },
];

export interface DemoCall {
  mother: DemoMother;
  start: Date;
  end: Date;
  kind: "hello" | "make-room";
  moves: number;
}

/** The coach's demo calendar for the week of Mon 12 Oct 2026. */
export const DEMO_CALLS: DemoCall[] = [
  {
    mother: DEMO_MOTHERS[0]!,
    start: zonedToUtc(KHI, 2026, 10, 14, 14, 30),
    end: zonedToUtc(KHI, 2026, 10, 14, 15, 0),
    kind: "make-room",
    moves: 0,
  },
  {
    mother: DEMO_MOTHERS[1]!,
    start: zonedToUtc(KHI, 2026, 10, 13, 21, 0),
    end: zonedToUtc(KHI, 2026, 10, 13, 21, 20),
    kind: "hello",
    moves: 1,
  },
  {
    mother: DEMO_MOTHERS[3]!,
    start: zonedToUtc(KHI, 2026, 10, 15, 21, 30),
    end: zonedToUtc(KHI, 2026, 10, 15, 22, 0),
    kind: "make-room",
    moves: 2,
  },
];

export const DEMO_BUSY: BusyInterval[] = DEMO_CALLS.map((c) => ({
  start: c.start,
  end: c.end,
}));

/** Sara's sample message for "Try it as a mama in Manchester". */
export const DEMO_MESSAGE =
  "Usually late morning, once the school run is done and the baby naps — weekdays around half eleven. I'm in Manchester.";

/** Placeholders the coach replaces in Rules later. */
export const PLACEHOLDERS = {
  meetLink: "https://meet.google.com/xxx-xxxx-xxx",
  payment: {
    bank: "Bank details go here (set in Rules)",
    raast: "Raast ID goes here",
    jazzcash: "JazzCash number goes here",
    wise: "Wise link goes here",
  },
  coachEmail: "hello@roomformama.com",
};

export const NOT_A_FIT_NOTE =
  "Thank you for the hello call. I don't think Make Room is the right fit for you just now, and I'd rather say so kindly than take your time or money. If you ever want another chat, I'm here.";

/** A quiet moment no open time fits (Sunday nights), to show the waitlist. */
export const DEMO_NO_MATCH = "Only Sunday nights around 2 am, when everyone’s asleep. I’m in Lahore.";

export interface DemoWaitlistRow {
  firstName: string;
  email: string;
  zone: string;
  notBeforeLocal?: string | undefined;
  notAfterLocal?: string | undefined;
  joinedAt: Date;
}
/** In-memory demo waitlist; moves to Lovable Cloud later. */
export const DEMO_WAITLIST: DemoWaitlistRow[] = [];
