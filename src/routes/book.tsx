import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { bookHello, findTimes, joinWaitlist, readMoment } from "../lib/mother.functions";
import { ButtonMain, ButtonOutline, Drawing, Page, Slot, StepArrows } from "../components/rfm/brand";
import { SafetyNote } from "../components/rfm/SafetyNote";
import { DEMO_BUSY, DEMO_MESSAGE, DEMO_NO_MATCH, DEMO_NOW, DEMO_WAITLIST } from "../lib/demo-data";
import { parseMoment, type ParsedMoment } from "../lib/moment-parse";
import { findSlots, fmtLong, zoneLabel, type Slot as SlotT } from "../lib/time-engine";

export const Route = createFileRoute("/book")({
  validateSearch: (search: Record<string, unknown>): { demo?: "manchester" | undefined } =>
    search["demo"] === "manchester" ? { demo: "manchester" } : {},
  head: () => ({
    meta: [
      { title: "Book a free hello call | Room for Mama" },
      {
        name: "description",
        content: "Tell me when you usually get a quiet moment, and pick a time that suits you.",
      },
      { property: "og:title", content: "Book a free hello call | Room for Mama" },
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

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

function Book() {
  const navigate = useNavigate();
  const { demo } = Route.useSearch();
  const demoParsed = demo === "manchester" ? parseMoment(DEMO_MESSAGE, "Europe/London") : null;
  const [step, setStep] = useState<Step>(demo ? "times" : "moment");
  const [moment, setMoment] = useState(demo ? DEMO_MESSAGE : "");
  const [parsed, setParsed] = useState<ReturnType<typeof parseMoment> | null>(demoParsed);
  const [selected, setSelected] = useState<SlotT | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const read = useServerFn(readMoment);
  const find = useServerFn(findTimes);
  const book = useServerFn(bookHello);
  const [realSlots, setRealSlots] = useState<SlotT[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const isDemo = !!demo || moment === DEMO_MESSAGE || moment === DEMO_NO_MATCH;

  useEffect(() => {
    if (isDemo || !parsed) return;
    setRealSlots(null);
    void find({ data: { zone: parsed.zone, notBeforeLocal: parsed.notBeforeLocal, notAfterLocal: parsed.notAfterLocal, days: parsed.days } })
      .then((r) => setRealSlots(r.map((x) => ({ start: new Date(x.start), end: new Date(x.end) }))))
      .catch(() => setRealSlots([]));
  }, [parsed, isDemo, find]);

  const demoSlots = useMemo(() => {
    if (!parsed || !isDemo) return [];
    return findSlots({
      from: DEMO_NOW,
      motherZone: parsed.zone,
      durationMin: 20,
      noticeH: 6,
      notBeforeLocal: parsed.notBeforeLocal,
      notAfterLocal: parsed.notAfterLocal,
      busy: DEMO_BUSY,
    });
  }, [parsed, isDemo]);
  const slots = isDemo ? demoSlots : (realSlots ?? []);
  const illustrationName = step === "times" && parsed && realSlots !== null && slots.length === 0
    ? "illo-tea-cold"
    : step === "details"
      ? "illo-the-chair"
      : "illo-her-half-hour";

  const goBack = () => {
    setErr(null);
    if (step === "details") {
      setStep("times");
      return;
    }
    if (step === "times") {
      setStep("moment");
      return;
    }
    void navigate({ to: "/fit-check" });
  };

  const canGoForward = step === "moment"
    ? Boolean(moment.trim()) && !busy
    : step === "times"
      ? Boolean(selected)
      : Boolean(selected && parsed && name.trim() && isEmail(email)) && !busy;

  const goForward = () => {
    if (!canGoForward) return;
    if (step === "moment") {
      void showTimes(moment);
      return;
    }
    if (step === "times") {
      setStep("details");
      return;
    }
    void doBook();
  };

  const showTimes = async (text: string) => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (text === DEMO_MESSAGE || text === DEMO_NO_MATCH) {
      setParsed(parseMoment(text, tz));
    } else {
      setBusy(true);
      try {
        const r = await read({ data: { text, fallbackZone: tz } });
        setParsed({ zone: r.zone, city: r.city, days: r.days, notBeforeLocal: r.notBeforeLocal, notAfterLocal: r.notAfterLocal });
      } catch {
        setParsed(parseMoment(text, tz));
      }
      setBusy(false);
    }
    setStep("times");
  };

  const doBook = async () => {
    if (!selected || !parsed) return;
    if (isDemo) {
      void navigate({ to: "/booked", search: { slot: selected.start.toISOString(), name: name.trim(), zone: parsed.zone } });
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const r = await book({ data: { start: selected.start.toISOString(), firstName: name.trim(), email: email.trim(), phone: phone.trim() || undefined, zone: parsed.zone, city: parsed.city ?? null, days: parsed.days, notBeforeLocal: parsed.notBeforeLocal, notAfterLocal: parsed.notAfterLocal } });
      if (r.ok && r.token) void navigate({ to: "/manage/$token", params: { token: r.token }, search: { just: "booked" } });
      else if (r.ok) setErr("Thank you — you’re in. Check your email for your link and calendar invite.");
      else setErr(r.reason === "taken" ? "That time just went. Pick another." : "Lots of bookings just now. Try again in an hour.");
    } catch {
      setErr("Something went quiet on my side. Try again in a moment.");
    }
    setBusy(false);
  };

  return (
    <Page illustration={<Drawing key={`${step}-${illustrationName}`} name={illustrationName} className={`form-illustration ${illustrationName === "illo-her-half-hour" ? "home-steam" : ""}`} bare />}>
      <StepArrows
        onBack={goBack}
        onForward={goForward}
        forwardDisabled={!canGoForward}
        backLabel={step === "moment" ? "Back to the fit check" : "Previous step"}
        forwardLabel={step === "details" ? "Book this call" : "Continue"}
      />
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
            className="w-full rounded-2xl border border-input bg-paper p-4 text-ink placeholder:text-ink-muted"
          />
          <div className="mt-auto flex flex-col gap-3 pt-4">
            <ButtonMain disabled={!moment.trim() || busy} onClick={() => void showTimes(moment)}>
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
          {!isDemo && realSlots === null ? (
            <p className="text-ink-muted">Finding times.</p>
          ) : slots.length === 0 ? (
            <Waitlist parsed={parsed} demo={isDemo} />
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
              className="min-h-12 w-full rounded-2xl border border-input bg-paper px-4 text-ink placeholder:text-ink-muted"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="min-h-12 w-full rounded-2xl border border-input bg-paper px-4 text-ink placeholder:text-ink-muted"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
              type="tel"
              className="min-h-12 w-full rounded-2xl border border-input bg-paper px-4 text-ink placeholder:text-ink-muted"
            />
          </div>
          <div className="mt-auto flex flex-col gap-4 pt-4">
            {err && <p className="rounded-2xl bg-butter-soft p-4">{err}</p>}
            <ButtonMain disabled={!name.trim() || !isEmail(email) || busy} onClick={() => void doBook()}>
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
  "min-h-12 w-full rounded-2xl border border-input bg-paper px-4 text-ink placeholder:text-ink-muted";

function Waitlist({ parsed, demo }: { parsed: ParsedMoment; demo: boolean }) {
  const join = useServerFn(joinWaitlist);
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
        if (!demo) {
          void join({ data: { firstName: name.trim(), email: email.trim(), zone: parsed.zone, city: parsed.city ?? null, days: parsed.days, notBeforeLocal: parsed.notBeforeLocal, notAfterLocal: parsed.notAfterLocal } }).then(() => setJoined(true));
          return;
        }
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
      <p className="rounded-2xl bg-butter-soft p-4">
        No times match yet. Join the waitlist and I’ll email you when one opens.
      </p>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" aria-label="First name" className={inputCls} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" type="email" className={inputCls} />
      <ButtonMain type="submit" disabled={!name.trim() || !isEmail(email)}>
        Join the waitlist
      </ButtonMain>
    </form>
  );
}
