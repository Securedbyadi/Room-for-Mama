import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ButtonMain, ButtonOutline, Drawing, Page, Slot } from "../components/rfm/brand";
import { SafetyNote } from "../components/rfm/SafetyNote";
import { DEMO_BUSY, DEMO_MESSAGE, DEMO_NO_MATCH, DEMO_NOW, DEMO_WAITLIST } from "../lib/demo-data";
import { parseMoment, type ParsedMoment } from "../lib/moment-parse";
import { findSlots, fmtLong, zoneLabel, type Slot as SlotT } from "../lib/time-engine";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a free hello call — Room for Mama" },
      {
        name: "description",
        content: "Tell me when you usually get a quiet moment, and pick a time that suits you.",
      },
      { property: "og:title", content: "Book a free hello call — Room for Mama" },
      {
        property: "og:description",
        content: "Tell me when you usually get a quiet moment, and pick a time that suits you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Book,
});

type Step = "moment" | "times" | "details";

function Book() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("moment");
  const [moment, setMoment] = useState("");
  const [parsed, setParsed] = useState<ReturnType<typeof parseMoment> | null>(null);
  const [selected, setSelected] = useState<SlotT | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const slots = useMemo(() => {
    if (!parsed) return [];
    return findSlots({
      from: DEMO_NOW,
      motherZone: parsed.zone,
      durationMin: 20,
      noticeH: 6,
      notBeforeLocal: parsed.notBeforeLocal,
      notAfterLocal: parsed.notAfterLocal,
      busy: DEMO_BUSY,
    });
  }, [parsed]);

  const showTimes = (text: string) => {
    setParsed(parseMoment(text, Intl.DateTimeFormat().resolvedOptions().timeZone));
    setStep("times");
  };

  return (
    <Page>
      {step === "moment" && (
        <>
          <div>
            <h1 className="t-title">When do you usually get a quiet moment?</h1>
            <p className="t-caption mt-3 text-ink-muted">
              Write it your way, in any language. Only days, times and your city are kept.
            </p>
          </div>
          <textarea
            value={moment}
            onChange={(e) => setMoment(e.target.value)}
            rows={4}
            autoFocus
            className="w-full rounded-2xl border border-input bg-paper p-4 text-[17px] text-ink placeholder:text-ink-muted"
          />
          <div className="mt-auto flex flex-col gap-3 pt-4">
            <ButtonMain disabled={!moment.trim()} onClick={() => showTimes(moment)}>
              Find my times
            </ButtonMain>
            <ButtonOutline onClick={() => { setMoment(DEMO_MESSAGE); showTimes(DEMO_MESSAGE); }}>
              Try it as a mama in Manchester
            </ButtonOutline>
            <button
              type="button"
              className="t-caption min-h-12 underline underline-offset-2"
              onClick={() => { setMoment(DEMO_NO_MATCH); showTimes(DEMO_NO_MATCH); }}
            >
              Try it
            </button>
            <SafetyNote zone={parsed?.zone} />
          </div>
        </>
      )}

      {step === "times" && parsed && (
        <>
          <div>
            {slots.length > 0 && <h1 className="t-title">Three times that fit</h1>}
            <p className="mt-2 text-ink-muted">
              Times in {zoneLabel(parsed.zone)}.{" "}
              <button
                type="button"
                className="font-semibold underline underline-offset-2"
                onClick={() => setStep("moment")}
              >
                Change
              </button>
            </p>
          </div>
          {slots.length === 0 ? (
            <Waitlist parsed={parsed} />
          ) : (
            <div className="flex flex-col gap-3">
              {slots.map((s) => (
                <Slot
                  key={s.start.toISOString()}
                  label={fmtLong(s.start, parsed.zone)}
                  sub="20 min, free"
                  selected={selected?.start.getTime() === s.start.getTime()}
                  onClick={() => setSelected(s)}
                />
              ))}
            </div>
          )}
          {slots.length > 0 && (
            <div className="mt-auto pt-4">
              <ButtonMain disabled={!selected} onClick={() => setStep("details")}>
                Continue
              </ButtonMain>
            </div>
          )}
        </>
      )}

      {step === "details" && selected && parsed && (
        <>
          <div>
            <p className="rounded-2xl bg-butter-soft p-4 t-time">
              {fmtLong(selected.start, parsed.zone)}, your time
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First name"
              className="min-h-12 w-full rounded-2xl border border-input bg-paper px-4 text-[17px] text-ink placeholder:text-ink-muted"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="min-h-12 w-full rounded-2xl border border-input bg-paper px-4 text-[17px] text-ink placeholder:text-ink-muted"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
              type="tel"
              className="min-h-12 w-full rounded-2xl border border-input bg-paper px-4 text-[17px] text-ink placeholder:text-ink-muted"
            />
          </div>
          <div className="mt-auto flex flex-col gap-4 pt-4">
            <ButtonMain
              disabled={!name.trim() || !email.includes("@")}
              onClick={() =>
                navigate({
                  to: "/booked",
                  search: {
                    slot: selected.start.toISOString(),
                    name: name.trim(),
                    zone: parsed.zone,
                  },
                })
              }
            >
              Book
            </ButtonMain>
            <SafetyNote zone={parsed.zone} />
          </div>
        </>
      )}
    </Page>
  );
}

const inputCls =
  "min-h-12 w-full rounded-2xl border border-input bg-paper px-4 text-[17px] text-ink placeholder:text-ink-muted";

function Waitlist({ parsed }: { parsed: ParsedMoment }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  if (joined) {
    return (
      <p className="anim-fade rounded-2xl bg-sage-soft p-4">
        You’re on the list. I’ll email you when a time opens.
      </p>
    );
  }
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        // Demo rows only; only days, times and city are kept, never her words.
        DEMO_WAITLIST.push({
          firstName: name.trim(),
          email: email.trim(),
          zone: parsed.zone,
          notBeforeLocal: parsed.notBeforeLocal,
          notAfterLocal: parsed.notAfterLocal,
          joinedAt: DEMO_NOW,
        });
        setJoined(true);
      }}
    >
      <Drawing name="illo-tea-cold" />
      <p className="rounded-2xl bg-butter-soft p-4">
        No times match yet. Join the waitlist and I’ll email you when one opens.
      </p>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" aria-label="First name" className={inputCls} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" type="email" className={inputCls} />
      <ButtonMain type="submit" disabled={!name.trim() || !email.includes("@")}>
        Join the waitlist
      </ButtonMain>
    </form>
  );
}
