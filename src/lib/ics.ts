/** A tiny iCalendar (.ics) writer for the coach's private calendar feed. */
export interface IcsCall {
  uid: string;
  start: Date;
  end: Date;
  title: string;
  url?: string;
}

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function buildIcs(calls: IcsCall[], now: Date = new Date()): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Room for Mama//Coach feed//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:Room for Mama",
  ];
  for (const c of calls) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${c.uid}@roomformama.com`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART:${stamp(c.start)}`,
      `DTEND:${stamp(c.end)}`,
      `SUMMARY:${esc(c.title)}`,
      ...(c.url ? [`URL:${c.url}`, `LOCATION:${esc(c.url)}`] : []),
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

/** A random, replaceable feed token (32+ characters). Call from handlers only. */
export function newFeedToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
