import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ButtonMain, ButtonOutline, Card, Drawing, Icon, Page, Slot } from "../components/rfm/brand";
import { SafetyNote } from "../components/rfm/SafetyNote";
import { DEMO_BUSY, DEMO_NOW, PLACEHOLDERS } from "../lib/demo-data";
import { babysUpOptions, fmtLong, moveCall, type Slot as SlotT } from "../lib/time-engine";

type Search = { slot: string; name: string; zone: string };

export const Route = createFileRoute("/booked")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    slot: typeof s["slot"] === "string" ? s["slot"] : new Date().toISOString(),
    name: typeof s["name"] === "string" ? s["name"] : "mama",
    zone: typeof s["zone"] === "string" ? s["zone"] : "Asia/Karachi",
  }),
  head: () => ({
    meta: [
      { title: "You’re in | Room for Mama" },
      { name: "description", content: "Your hello call is booked." },
      { property: "og:title", content: "You’re in | Room for Mama" },
      { property: "og:description", content: "Your hello call is booked." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Booked,
});

function icsUrl(start: Date, name: string): string {
  const stamp = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = new Date(start.getTime() + 20 * 60 * 1000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    "SUMMARY:Hello call with Room for Mama",
    `DESCRIPTION:Video link: ${PLACEHOLDERS.meetLink}`,
    `UID:${start.getTime()}-${name}@roomformama.com`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

function Booked() {
  const { slot, name, zone } = Route.useSearch();
  const [current, setCurrent] = useState<Date>(() => new Date(slot));
  const [moves, setMoves] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [picked, setPicked] = useState<SlotT | null>(null);
  const [needsCoach, setNeedsCoach] = useState(false);

  const options = useMemo(
    () =>
      babysUpOptions({
        call: { start: current, end: new Date(current.getTime() + 20 * 60 * 1000) },
        now: DEMO_NOW,
        motherZone: zone,
        durationMin: 20,
        // The call she is leaving stays taken, so it is never offered back.
        busy: [...DEMO_BUSY, { start: current, end: new Date(current.getTime() + 20 * 60 * 1000) }],
      }),
    [current, zone],
  );

  const move = () => {
    if (!picked) return;
    const result = moveCall({
      call: { start: current, end: new Date(current.getTime() + 20 * 60 * 1000) },
      movesSoFar: moves,
      now: DEMO_NOW,
      newSlot: picked,
    });
    if (result.kind === "moved") {
      setCurrent(picked.start);
      setMoves((m) => m + 1);
      setSheetOpen(false);
      setPicked(null);
    } else if (result.kind === "needs-coach") {
      setNeedsCoach(true);
      setSheetOpen(false);
    }
  };

  return (
    <Page illustration={<Drawing name="illo-tea-warm" bare className="youre-in-rise final-illustration" />} headerAction={<a href="#my-call" className="micro-link font-semibold underline underline-offset-8">My calls</a>}>
      <Card offset="peach" className="flex flex-col gap-3 shadow-[6px_6px_0_var(--peach)]" >
        <div className="flex items-center gap-3"><Icon name="icon-done" size={30} /><h1 className="t-title">You’re in.</h1></div>
        <div id="my-call">
          <p className="t-heading t-time">{fmtLong(current, zone)}</p>
          <p className="t-caption mt-1 text-ink-muted">your time · 20 minutes · video call</p>
        </div>
        <p>
          If the baby wakes, tap <strong>Baby’s up</strong> and pick another time. No need to explain.
        </p>
      </Card>

      {needsCoach && (
        <p className="rounded-2xl bg-butter-soft p-4">
          I’ll be in touch about this move, {name}.
        </p>
      )}

      <div className="mt-auto flex flex-col gap-3 pt-4">
        <a href={icsUrl(current, name)} download="hello-call.ics" className="block">
          <ButtonOutline>Add to my calendar</ButtonOutline>
        </a>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <p className="font-semibold text-ink-muted">The video link is in your email.</p>
          <button type="button" className="min-h-12 font-semibold underline underline-offset-4" onClick={() => { setPicked(options[0] ?? null); setSheetOpen(true); }}>Baby’s up</button>
        </div>
        <SafetyNote zone={zone} />
      </div>

      {sheetOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setSheetOpen(false)}
          role="presentation"
        >
          <div
            className="anim-sheet absolute inset-x-0 bottom-0 mx-auto w-full max-w-[480px] rounded-t-[28px] bg-paper p-5 pb-8 shadow-[0_-8px_24px_rgba(0,0,0,0.18)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Baby’s up"
          >
            <div className="mb-4 flex items-start gap-3">
               <Drawing name="illo-baby-up" className="baby-awake-once aspect-square w-20 shrink-0 rounded-full [&>div]:p-1" />
              <div>
                <h2 className="t-heading">No problem.</h2>
                <p className="text-ink-muted">Babies don’t read calendars.</p>
              </div>
            </div>
            <h3 className="t-heading mb-3">Pick a new time</h3>
            <div className="flex flex-col gap-3">
              {options.map((o) => (
                <Slot
                  key={o.start.toISOString()}
                  label={fmtLong(o.start, zone)}
                  selected={picked?.start.getTime() === o.start.getTime()}
                   marker
                  onClick={() => setPicked(o)}
                />
              ))}
            </div>
            <div className="mt-4">
              <ButtonMain disabled={!picked} onClick={move}>
                Move my call
              </ButtonMain>
              <p className="t-caption mt-3 text-center text-ink-muted">Moving is always free.</p>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
