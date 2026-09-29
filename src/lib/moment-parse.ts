// Stopgap reader for the quiet-moment message. Replaced by Lovable AI extraction
// once the backend is on; same output shape: only days, times and a zone.
import type { MotherPrefs } from "./time-engine";

const CITIES: [RegExp, string, string][] = [
  [/manchester|london|uk\b|england/i, "Europe/London", "Manchester"],
  [/lahore|karachi|islamabad|pakistan/i, "Asia/Karachi", "Lahore"],
  [/dubai|abu dhabi|uae/i, "Asia/Dubai", "Dubai"],
  [/toronto|canada/i, "America/Toronto", "Toronto"],
  [/riyadh|jeddah|saudi/i, "Asia/Riyadh", "Riyadh"],
  [/new york|boston/i, "America/New_York", "New York"],
];
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function parseMoment(text: string, fallbackZone: string): MotherPrefs & { city: string } {
  const t = text.toLowerCase();
  const c = CITIES.find(([re]) => re.test(t));
  const zone = c?.[1] ?? fallbackZone;
  const city = c?.[2] ?? zone.split("/").pop()!.replace(/_/g, " ");
  let days = [1, 2, 3, 4, 5, 6, 7];
  if (/weekday|week day/.test(t)) days = [1, 2, 3, 4, 5];
  const named = DAYS.map((d, i) => (new RegExp(`\\b${d}`).test(t) ? i + 1 : 0)).filter(Boolean);
  const negated = DAYS.map((d, i) => (new RegExp(`(not|except|no)\\s+${d}`).test(t) ? i + 1 : 0)).filter(Boolean);
  if (named.length && !negated.length) days = named;
  days = days.filter((d) => !negated.includes(d));
  let from = 9 * 60, to = 21 * 60;
  const around = t.match(/around\s+(\d{1,2})(?::(\d\d))?\s*(am|pm)?/);
  if (/morning/.test(t)) { from = 8 * 60; to = 12 * 60; }
  if (/afternoon/.test(t)) { from = 12 * 60; to = 17 * 60; }
  if (/evening|night/.test(t)) { from = 18 * 60; to = 23 * 60; }
  if (around) {
    let h = +around[1]!;
    if (around[3] === "pm" && h < 12) h += 12;
    if (!around[3] && /evening|night|afternoon/.test(t) && h < 12) h += 12;
    from = h * 60 + (+(around[2] ?? 0)); to = from + 60;
  }
  return { zone, city, days, windows: [{ from, to }] };
}
