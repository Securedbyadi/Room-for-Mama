import { describe, expect, it } from "vitest";
import { buildIcs, newFeedToken } from "./ics";

describe("calendar feed", () => {
  it("writes a valid calendar with one event per call", () => {
    const ics = buildIcs(
      [
        {
          uid: "a1",
          start: new Date("2026-10-14T10:00:00Z"),
          end: new Date("2026-10-14T10:30:00Z"),
          title: "Half hour with Room for Mama",
          url: "https://meet.google.com/xxx-xxxx-xxx",
        },
      ],
      new Date("2026-10-14T00:00:00Z"),
    );
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.trim().endsWith("END:VCALENDAR")).toBe(true);
    expect(ics).toContain("DTSTART:20261014T100000Z");
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  });
  it("makes long random tokens", () => {
    const a = newFeedToken();
    expect(a.length).toBeGreaterThanOrEqual(32);
    expect(a).not.toBe(newFeedToken());
  });
});
