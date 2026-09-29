import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button, Icon, MomentField, Page, Slot } from "@/components/rfm/brand";
import { SafetyNote } from "@/components/rfm/SafetyNote";
import { findSlots, fmtSlot, zonedToUtc } from "@/lib/time-engine";
import { parseMoment } from "@/lib/moment-parse";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a hello call · Room for Mama" },
      { name: "description", content: "Tell me when you usually get a quiet moment and pick one of three times." },
      { property: "og:title", content: "Book a hello call · Room for Mama" },
      { property: "og:description", content: "Twenty minutes, free, at a time that fits your day." },
    ],
  }),
  component: Book,
});

const DEMO_TEXT = "Most mornings when the baby naps, around 11. Not Mondays. I’m in Manchester.";
// Demo calendar: Hina's half hour, Wed 14 Oct 14:30 Lahore.
const DEMO_BUSY = [{ start: zonedToUtc(2026, 10, 14, 14, 30, "Asia/Karachi"), end: zonedToUtc(2026, 10, 14, 15, 0, "Asia/Karachi") }];
const DEMO_NOW = zonedToUtc(2026, 10, 12, 3, 0, "Europe/London");

function Book() {
  const nav = useNavigate();
  const [text, setText] = useState("");
  const [demo, setDemo] = useState(false);
  const [asked, setAsked] = useState(false);
  const [pick, setPick] = useState(0);
  const [step, setStep] = useState<"times" | "details">("times");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [detected, setDetected] = useState("Europe/London");
  useEffect(() => setDetected(Intl.DateTimeFormat().resolvedOptions().timeZone), []);

  const prefs = useMemo(() => parseMoment(text, detected), [text, detected]);
  const times = useMemo(() => (asked ? findSlots({
    now: demo ? DEMO_NOW : Date.now(), durMin: 20, noticeMin: 360, mother: prefs, busy: demo ? DEMO_BUSY : [],
  }) : []), [asked, prefs, demo]);
  useEffect(() => setPick(times.length > 1 ? 1 : 0), [times.length]);

  const chosen = times[pick];
  const label = chosen ? fmtSlot(chosen, prefs.zone) : null;

  return (
    <Page tag="Hello call">
      <h1 className="t-title !text-[40px] !leading-[46px] mt-2">When do you usually get a quiet moment?</h1>
      <div className="mt-6"><MomentField value={text} onChange={(v) => { setText(v); setAsked(false); setDemo(false); }} /></div>
      {!asked && (
        <div className="mt-6 space-y-3">
          <Button disabled={!text.trim()} onClick={() => setAsked(true)}>Show me times</Button>
          <button className="focus-ring t-caption w-full py-3 text-ink-muted underline underline-offset-4"
            onClick={() => { setText(DEMO_TEXT); setDemo(true); setAsked(true); }}>Try it as a mama in Manchester</button>
        </div>
      )}

      {asked && step === "times" && (
        <section className="fade-in mt-8">
          {times.length ? (
            <>
              <h2 className="t-heading !text-[28px]">Three times that fit</h2>
              <div role="radiogroup" className="mt-4 space-y-4">
                {times.map((t, i) => { const s = fmtSlot(t, prefs.zone); return <Slot key={t} day={s.day} time={s.time} place={prefs.city} selected={i === pick} onSelect={() => setPick(i)} />; })}
              </div>
              <p className="mt-4 flex items-center gap-3 text-ink-muted"><Icon name="time-zone" size={24} />Times in {prefs.city} time. <button className="focus-ring underline underline-offset-4 text-ink" onClick={() => setAsked(false)}>Change</button></p>
              <Button className="mt-6" onClick={() => setStep("details")}>Book {label?.day}, {label?.time}</Button>
            </>
          ) : (
            <div className="text-center">
              <p className="t-heading">No times match yet.</p>
              <p className="mt-2 text-ink-muted">Join the waitlist and I’ll email you when one opens.</p>
            </div>
          )}
        </section>
      )}

      {asked && step === "details" && chosen && (
        <form className="fade-in mt-8 space-y-4" onSubmit={(e) => {
          e.preventDefault();
          nav({ to: "/booked", search: { t: chosen, z: prefs.zone, c: prefs.city } });
        }}>
          <h2 className="t-heading">{label?.day}, {label?.time}, your time</h2>
          <Field label="First name" value={name} onChange={setName} required />
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Phone (optional)" type="tel" value={phone} onChange={setPhone} />
          <Button type="submit">Book</Button>
          <button type="button" className="focus-ring w-full py-3 text-ink-muted underline underline-offset-4" onClick={() => setStep("times")}>Pick another time</button>
        </form>
      )}
      <SafetyNote zone={asked ? prefs.zone : detected} />
    </Page>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="t-caption text-ink-muted">{label}</span>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)}
        className="focus-ring mt-1 h-14 w-full rounded-[16px] border border-line-strong bg-paper px-5 text-ink" />
    </label>
  );
}
