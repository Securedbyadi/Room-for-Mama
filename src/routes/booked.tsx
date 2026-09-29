import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { BabysUpSheet, BookedCard, Button, Drawing, Icon, Page, Slot } from "@/components/rfm/brand";
import { SafetyNote } from "@/components/rfm/SafetyNote";
import { fmtLong, fmtTime, fmtSlot } from "@/lib/time-engine";

export const Route = createFileRoute("/booked")({
  validateSearch: z.object({ t: z.number(), z: z.string(), c: z.string() }),
  head: () => ({
    meta: [
      { title: "You’re in · Room for Mama" },
      { name: "description", content: "Your hello call is booked." },
      { property: "og:title", content: "You’re in · Room for Mama" },
      { property: "og:description", content: "Your hello call is booked." },
    ],
  }),
  component: Booked,
});

function ics(t: number) {
  const f = (x: number) => new Date(x).toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(
    `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Room for Mama//EN\r\nBEGIN:VEVENT\r\nUID:${t}@roomformama.com\r\nDTSTAMP:${f(Date.now())}\r\nDTSTART:${f(t)}\r\nDTEND:${f(t + 20 * 60000)}\r\nSUMMARY:Hello call with Room for Mama\r\nEND:VEVENT\r\nEND:VCALENDAR`)}`;
}

function Booked() {
  const { t, z: zone, c } = Route.useSearch();
  const [open, setOpen] = useState(false);
  const alt = [t + 86400000, t + 2 * 86400000];
  const [pick, setPick] = useState(0);
  return (
    <Page right={<a href="#" className="focus-ring underline underline-offset-4">My calls</a>}>
      <Drawing name="tea-warm" alt="A warm cup of tea" height={300} className="h-[340px] items-center" />
      <div className="mt-8">
        <BookedCard when={`${fmtLong(t, zone)}, ${fmtTime(t, zone)}`} meta={`your time, ${c} · 20 minutes · video call`}>
          <p>If the baby wakes, tap <strong>Baby’s up</strong> and pick another time. No need to explain.</p>
        </BookedCard>
      </div>
      <a href={ics(t)} download="hello-call.ics" className="focus-ring mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-full border border-line-strong font-semibold">
        <Icon name="book" size={24} />Add to my calendar
      </a>
      <div className="mt-6 flex items-center justify-between">
        <span className="t-caption text-ink-muted !text-[15px]">The video link is in your email.</span>
        <button onClick={() => setOpen(true)} className="focus-ring underline underline-offset-4">Baby’s up</button>
      </div>
      <SafetyNote zone={zone} />
      <BabysUpSheet open={open} onClose={() => setOpen(false)}>
        <h3 className="t-heading !text-[28px]">Pick a new time</h3>
        <div role="radiogroup" className="mt-4 space-y-4">
          {alt.map((a, i) => { const s = fmtSlot(a, zone); return <Slot key={a} day={s.day} time={s.time} place={c} selected={pick === i} onSelect={() => setPick(i)} />; })}
        </div>
        <Button className="mt-6" onClick={() => setOpen(false)}>Move my call</Button>
        <p className="mt-3 text-center text-ink-muted">Moving is always free.</p>
      </BabysUpSheet>
    </Page>
  );
}
