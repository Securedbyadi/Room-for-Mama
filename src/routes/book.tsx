import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ButtonMain, ButtonOutline, Page, Slot } from "../components/rfm/brand";
import { SafetyNote } from "../components/rfm/SafetyNote";
import { DEMO_BUSY, DEMO_MESSAGE, DEMO_NOW } from "../lib/demo-data";
import { parseMoment } from "../lib/moment-parse";
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
            placeholder="Weekday mornings, after the school run…"
          />
          <div className="mt-auto flex flex-col gap-3 pt-4">
            <ButtonMain disabled={!moment.trim()} onClick={() => showTimes(moment)}>
              Find my times
            </ButtonMain>
            <ButtonOutline onClick={() => { setMoment(DEMO_MESSAGE); showTimes(DEMO_MESSAGE); }}>
              Try it as a mama in Manchester
            </ButtonOutline>
            <SafetyNote zone={parsed?.zone} />
          </div>
        </>
      )}

      {step === "times" && parsed && (
        <>
          <div>
            <h1 className="t-title">Three times that could work</h1>
            <p className="mt-2 text-ink-muted">
              All shown in your time ({zoneLabel(parsed.zone)}).{" "}
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
            <p className="rounded-2xl bg-butter-soft p-4">
              No times match yet. Join the waitlist and I’ll email you when one opens.
            </p>
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
          <div className="mt-auto pt-4">
            <ButtonMain disabled={!selected} onClick={() => setStep("details")}>
              Continue
            </ButtonMain>
          </div>
        </>
      )}

      {step === "details" && selected && parsed && (
        <>
          <div>
            <h1 className="t-title">Nearly there</h1>
            <p className="mt-2 rounded-2xl bg-butter-soft p-4 t-time">
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
