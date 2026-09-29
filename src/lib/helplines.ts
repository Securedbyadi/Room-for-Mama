// Seed copy. Moves to an owner-editable table with the coach app.
const LINES: Record<string, string> = {
  PK: "In Pakistan: Umang 0311 7786264 (24 h) · Emergency 1122",
  GB: "In the UK: Samaritans 116 123 (24 h) · PANDAS on WhatsApp 07903 508334 (weekdays 9–5) · Emergency 999",
  AE: "In the UAE: National Mental Support Line 800 4673 (8 am–8 pm) · Emergency 999, ambulance 998",
  SA: "In Saudi Arabia: National Center for Mental Health Promotion 920033360 (8 am–8 pm) · Emergency 911",
  US: "In the US: National Maternal Mental Health Hotline 1-833-852-6262 (24 h, call or text) · 988 · Emergency 911",
  CA: "In Canada: 988 (24 h, call or text) · Emergency 911",
};
const ELSE = "Call your local emergency number, or find a free helpline at findahelpline.com.";

export function countryForZone(zone?: string): string | null {
  if (!zone) return null;
  if (zone === "Asia/Karachi") return "PK";
  if (zone === "Europe/London") return "GB";
  if (zone === "Asia/Dubai") return "AE";
  if (zone === "Asia/Riyadh") return "SA";
  if (/^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina)/.test(zone)) return "CA";
  if (/^(America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit)|Pacific\/Honolulu)/.test(zone)) return "US";
  return null;
}
export const helplineFor = (zone?: string) => LINES[countryForZone(zone) ?? ""] ?? ELSE;
