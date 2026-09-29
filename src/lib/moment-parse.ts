/*
 * Stopgap reader for the quiet-moment answer, used until Lovable AI
 * extraction arrives with Cloud. Only days, times and city are kept —
 * never her words.
 */

const CITY_ZONES: [RegExp, string][] = [
  [/manchester|london|leeds|bristol|uk|england/i, "Europe/London"],
  [/lahore|karachi|islamabad|pakistan/i, "Asia/Karachi"],
  [/dubai|abu dhabi|sharjah|uae/i, "Asia/Dubai"],
  [/riyadh|jeddah|saudi/i, "Asia/Riyadh"],
  [/toronto|vancouver|montreal|canada/i, "America/Toronto"],
  [/new york|boston|chicago|us\b|usa|america/i, "America/New_York"],
];

export interface ParsedMoment {
  zone: string;
  notBeforeLocal?: string | undefined;
  notAfterLocal?: string | undefined;
}

export function parseMoment(text: string, fallbackZone: string): ParsedMoment {
  const zone = CITY_ZONES.find(([re]) => re.test(text))?.[1] ?? fallbackZone;
  let notBeforeLocal: string | undefined;
  let notAfterLocal: string | undefined;
  if (/late morning|half eleven|11:?30/i.test(text)) {
    notBeforeLocal = "11:30";
    notAfterLocal = "12:00";
  } else if (/morning/i.test(text)) {
    notBeforeLocal = "09:00";
    notAfterLocal = "12:00";
  } else if (/evening|night|after (dinner|bedtime)/i.test(text)) {
    notBeforeLocal = "19:00";
  } else if (/afternoon/i.test(text)) {
    notBeforeLocal = "12:00";
    notAfterLocal = "17:00";
  }
  return { zone, notBeforeLocal, notAfterLocal };
}
