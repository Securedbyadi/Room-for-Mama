/*
 * Helplines by country, seeded here. They move to an owner-editable
 * table when the coach app lands. The SafetyNote goes on every booking
 * screen, every email and the footer.
 */

export const SAFETY_NOTE =
  "Room for Mama is friendly support, not medical care. If you feel low most days, please talk to your doctor or a helpline. If you have thoughts of harming yourself or your baby, call a helpline or your local emergency number now.";

export interface Helpline {
  name: string;
  number: string;
  hours: string;
}

const BY_COUNTRY: Record<string, Helpline[]> = {
  PK: [
    { name: "Umang", number: "0311 7786264", hours: "24 h" },
    { name: "Emergency", number: "1122", hours: "" },
  ],
  GB: [
    { name: "Samaritans", number: "116 123", hours: "24 h" },
    { name: "PANDAS WhatsApp", number: "07903 508334", hours: "weekdays 9–5" },
    { name: "Emergency", number: "999", hours: "" },
  ],
  AE: [
    { name: "National Mental Support Line", number: "800 4673", hours: "8 am–8 pm" },
    { name: "Emergency", number: "999", hours: "" },
    { name: "Ambulance", number: "998", hours: "" },
  ],
  SA: [
    {
      name: "National Center for Mental Health Promotion",
      number: "920033360",
      hours: "8 am–8 pm",
    },
    { name: "Emergency", number: "911", hours: "" },
  ],
  US: [
    {
      name: "National Maternal Mental Health Hotline",
      number: "1-833-852-6262",
      hours: "24 h, call/text",
    },
    { name: "988", number: "988", hours: "" },
    { name: "Emergency", number: "911", hours: "" },
  ],
  CA: [
    { name: "988", number: "988", hours: "24 h, call/text" },
    { name: "Emergency", number: "911", hours: "" },
  ],
};

const ZONE_COUNTRY: Record<string, string> = {
  "Asia/Karachi": "PK",
  "Europe/London": "GB",
  "Asia/Dubai": "AE",
  "Asia/Riyadh": "SA",
  "America/New_York": "US",
  "America/Toronto": "CA",
};

export function helplinesFor(zone: string): Helpline[] {
  const country = ZONE_COUNTRY[zone];
  return country ? BY_COUNTRY[country] : [];
}

export const ANYWHERE_ELSE =
  "Call your local emergency number, or find a free helpline at findahelpline.com.";
