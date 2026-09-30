/*
 * The coach dashboard (docs/coach-dashboard.md), running on demo rows.
 * Nothing here touches the real calendar or email.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ButtonMain, ButtonOutline, Chip, Drawing, Icon, Logo, type IconName } from "../rfm/brand";
import { ThemeRound } from "../rfm/ThemeControl";
import { MakeRoomPlan } from "../rfm/MakeRoomPlan";
import { helplinesFor } from "../../lib/helplines";
import { NOT_A_FIT_NOTE, PLACEHOLDERS } from "../../lib/demo-data";
import { buildIcs, newFeedToken } from "../../lib/ics";
import { fmtTime, localParts, zonedToUtc } from "../../lib/time-engine";

const KHI = "Asia/Karachi";
const at = (d: number, h: number, m: number) => zonedToUtc(KHI, 2026, 10, d, h, m);
const NOW = at(14, 14, 5);
/* Her time, only when it differs from Lahore time, so no time shows twice. */
const sameTime = (d: Date, zone: string) => fmtTime(d, zone) === fmtTime(d, KHI);
const herTime = (d: Date, m: { zone: string; city: string }, sep = " · ") => (sameTime(d, m.zone) ? "" : `${sep}${fmtTime(d, m.zone)}, ${m.city}`);
const MIN = 60_000;

type Kind = "hello" | "make-room";
type Status = "Hello call booked" | "Make Room" | "Waitlist" | "Finished" | "Paused" | "Payment waiting";
interface Mom {
  id: string; name: string; email: string; phone?: string; city: string; zone: string;
  status: Status; gave: string; notes: string[]; moves: { mother: number; coach: number };
}
interface Call {
  id: string; momId: string; kind: Kind; n?: number; start: Date; end: Date;
  held?: boolean; moved?: boolean; state: "booked" | "done" | "missed";
}
interface Need { id: string; kind: "payment" | "third-move" | "missed" | "day-off"; momId: string; callId?: string; title: string; reason: string }
interface Pay { ref: string; momId: string; amount: string; method: string; status: "Waiting" | "Confirmed" | "Not received yet"; heldUntil: string }

const MOMS: Mom[] = [
  { id: "hina", name: "Hina", email: "hina@example.com", city: "Lahore", zone: KHI, status: "Make Room", gave: "Weekday afternoons, around 3 pm · Lahore", notes: [], moves: { mother: 0, coach: 0 } },
  { id: "ayesha", name: "Ayesha", email: "ayesha@example.com", phone: "+971 50 000 0000", city: "Dubai", zone: "Asia/Dubai", status: "Hello call booked", gave: "Wednesdays, early afternoon · Dubai", notes: [], moves: { mother: 1, coach: 0 } },
  { id: "sara", name: "Sara", email: "sara@example.com", city: "Manchester", zone: "Europe/London", status: "Hello call booked", gave: "Weekdays, late morning · Manchester", notes: [], moves: { mother: 0, coach: 0 } },
  { id: "emily", name: "Emily", email: "emily@example.com", city: "Toronto", zone: "America/Toronto", status: "Payment waiting", gave: "Weekday mornings, around noon · Toronto", notes: [], moves: { mother: 0, coach: 0 } },
  { id: "fatima", name: "Fatima", email: "fatima@example.com", city: "Riyadh", zone: "Asia/Riyadh", status: "Hello call booked", gave: "Thursdays, after lunch · Riyadh", notes: [], moves: { mother: 2, coach: 0 } },
  { id: "zara", name: "Zara", email: "zara@example.com", city: "Karachi", zone: KHI, status: "Make Room", gave: "Evenings after 9 pm · Karachi", notes: [], moves: { mother: 0, coach: 0 } },
  { id: "noor", name: "Noor", email: "noor@example.com", city: "Karachi", zone: KHI, status: "Finished", gave: "Monday afternoons · Karachi", notes: [], moves: { mother: 0, coach: 0 } },
  { id: "maryam", name: "Maryam", email: "maryam@example.com", city: "London", zone: "Europe/London", status: "Make Room", gave: "Weekday evenings, after bath time · London", notes: [], moves: { mother: 1, coach: 0 } },
  { id: "aiman", name: "Aiman", email: "aiman@example.com", city: "Toronto", zone: "America/Toronto", status: "Paused", gave: "Weekday lunchtimes · Toronto", notes: [], moves: { mother: 0, coach: 0 } },
];

const mk = (id: string, momId: string, kind: Kind, d: number, h: number, m: number, extra: Partial<Call> = {}): Call => {
  const start = at(d, h, m);
  return { id, momId, kind, start, end: new Date(start.getTime() + (kind === "hello" ? 20 : 30) * MIN), state: "booked", ...extra };
};
const CALLS: Call[] = [
  mk("c10", "noor", "hello", 12, 14, 0, { state: "done", moved: true }),
  mk("c1", "ayesha", "hello", 13, 16, 0, { state: "done" }),
  mk("c5", "zara", "make-room", 13, 21, 0, { n: 1, state: "missed" }),
  // Wednesday 14 October, as in the brief: Hina 14:30, Sara 15:30, Maryam 21:00 (moved).
  mk("c2", "hina", "make-room", 14, 14, 30, { n: 2 }),
  mk("c7", "sara", "hello", 14, 15, 30),
  mk("c3", "maryam", "make-room", 14, 21, 0, { n: 2, moved: true }),
  mk("c4", "fatima", "hello", 15, 16, 0, { moved: true }),
  mk("c6", "emily", "make-room", 16, 21, 30, { n: 1, held: true }),
  mk("c9", "hina", "make-room", 21, 14, 30, { n: 3 }),
  mk("c11", "emily", "make-room", 23, 21, 30, { n: 2, held: true }),
];
const NEEDS: Need[] = [
  { id: "n1", kind: "payment", momId: "emily", title: "A payment to check", reason: "Emily tapped I’ve paid. RM1047, US$80, Wise. Held until Friday 16 October, 2:30 pm." },
  { id: "n2", kind: "third-move", momId: "fatima", callId: "c4", title: "A third move", reason: "Fatima has moved this call twice. A third move needs you." },
  { id: "n3", kind: "missed", momId: "zara", callId: "c5", title: "A missed call", reason: "Zara didn’t join on Tuesday at 9:00 pm. It’s her first missed Make Room call, so it will be put back." },
];
const PAYS: Pay[] = [
  { ref: "RM1047", momId: "emily", amount: "US$80", method: "Wise", status: "Waiting", heldUntil: "Fri 16 Oct, 2:30 pm" },
  { ref: "RM1031", momId: "hina", amount: "PKR 8,000", method: "Raast", status: "Confirmed", heldUntil: "" },
  { ref: "RM1039", momId: "maryam", amount: "US$80", method: "Wise", status: "Confirmed", heldUntil: "" },
];

type Tab = "today" | "calendar" | "mothers" | "rules" | "given-back";
const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: "today", label: "Today", icon: "icon-half-hour" },
  { id: "calendar", label: "Calendar", icon: "icon-time" },
  { id: "mothers", label: "Mothers", icon: "icon-hello-call" },
  { id: "rules", label: "Rules", icon: "icon-notes" },
  { id: "given-back", label: "Given back", icon: "icon-time-given-back" },
];

const lahoreDay = (d: Date) => { const p = localParts(KHI, d); return `${p.y}-${p.mo}-${p.d}`; };
const dayLabel = (d: Date, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: KHI, ...opts }).format(d);
const callLabel = (c: Call) => (c.kind === "hello" ? "Hello call" : `Make Room ${c.n ?? 1} of 4`);

function Panel({ children, className = "", offset = false }: { children: ReactNode; className?: string; offset?: boolean }) {
  return <div className={`rounded-[22px] p-5 ${offset ? "offset-butter" : "border border-line bg-paper"} ${className}`}>{children}</div>;
}
function Done({ children }: { children: ReactNode }) {
  return <p className="t-compact anim-fade rounded-2xl bg-sage-soft p-3 font-semibold text-ink">{children}</p>;
}
function Saved({ onSave }: { onSave: () => void }) {
  const [s, setS] = useState(false);
  return (
    <button type="button" onClick={() => { onSave(); setS(true); setTimeout(() => setS(false), 2000); }}
      className="rfm-button min-h-10 rounded-full border border-line-strong px-4 text-[15px] font-semibold">
      {s ? "Saved" : "Save"}
    </button>
  );
}

/* Small, light coach action: thin stroke, faded fill, no heavy block. */
function CoachBtn({ children, onClick, primary = false, className = "" }: { children: ReactNode; onClick?: () => void; primary?: boolean; className?: string }) {
  return (
    <button type="button" onClick={onClick}
      className={`rfm-button inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-4 text-[15px] font-semibold ${primary ? "border-ink/70 bg-butter-soft text-ink" : "border-line bg-paper text-ink"} ${className}`}>
      {children}
    </button>
  );
}

export function CoachDashboard() {
  const [tab, setTab] = useState<Tab>("today");
  const [moreOpen, setMoreOpen] = useState(false);
  const [moms, setMoms] = useState(MOMS);
  const [calls, setCalls] = useState(CALLS);
  const [needs, setNeeds] = useState(NEEDS);
  const [pays, setPays] = useState(PAYS);
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const [openCall, setOpenCall] = useState<string | null>(null);
  const [openMom, setOpenMom] = useState<string | null>(null);
  const [daysOff, setDaysOff] = useState<string[]>([]);
  const [feedToken, setFeedToken] = useState("");
  const [log, setLog] = useState<[string, string, number][]>([
    ["07:00", "Sent you today’s digest", 10],
    ["07:02", "Sent Hina her reminder", 5],
    ["07:02", "Sent Emily her reminder", 5],
    ["09:15", "Fatima moved her call herself", 10],
    ["11:40", "Released an unpaid hold", 5],
  ]);
  const [ran, setRan] = useState(false);
  useEffect(() => setFeedToken(newFeedToken()), []);

  const mom = (id: string) => moms.find((m) => m.id === id)!;
  const openNeeds = needs.filter((n) => !resolved[n.id]);
  const resolve = (id: string, msg: string) => setResolved((r) => ({ ...r, [id]: msg }));
  const callSheet = calls.find((c) => c.id === openCall);

  const ctx: Ctx = { moms, setMoms, calls, setCalls, needs, openNeeds, resolved, resolve, pays, setPays, mom, setOpenCall, setOpenMom, setTab, daysOff, setDaysOff, setNeeds, feedToken, setFeedToken, log, setLog, ran, setRan };

  const go = (t: Tab) => { setTab(t); setOpenMom(null); setMoreOpen(false); if (typeof window !== "undefined") window.scrollTo({ top: 0 }); };

  return (
    <div className="min-h-screen bg-page text-ink lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col gap-8 border-r border-line bg-paper p-6 lg:flex">
        <Logo />
        <nav className="flex flex-col gap-1" aria-label="Coach sections">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => go(t.id)} aria-current={tab === t.id ? "page" : undefined}
              className={`coach-tab flex min-h-12 items-center gap-3 rounded-2xl px-3 text-left font-semibold ${tab === t.id ? "bg-sunk" : ""}`}>
              <Icon name={t.icon} size={24} /> <span className="flex-1">{t.label}</span>
              {t.id === "today" && openNeeds.length > 0 && <Badge n={openNeeds.length} />}
            </button>
          ))}
        </nav>
        <div className="mt-auto"><ThemeRound className="relative" /></div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-page/95 px-5 py-3 backdrop-blur lg:hidden">
          <Logo height={24} />
          <ThemeRound className="relative !h-12 !w-12" />
        </header>
        <main className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 pt-6 pb-32 lg:px-10 lg:pt-10">
          <div key={tab + (openMom ?? "")} className="anim-fade flex flex-col gap-6">
            {tab === "today" && <TodayView c={ctx} />}
            {tab === "calendar" && <CalendarView c={ctx} />}
            {tab === "mothers" && (openMom ? <MotherPage c={ctx} id={openMom} /> : <MothersView c={ctx} />)}
            {tab === "rules" && <RulesView c={ctx} />}
            {tab === "given-back" && <GivenBackView c={ctx} />}
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Coach sections">
        {(["today", "calendar", "mothers"] as const).map((id) => {
          const t = TABS.find((x) => x.id === id)!;
          return (
            <button key={id} type="button" onClick={() => go(id)} className={`t-caption relative flex min-h-16 flex-col items-center justify-center gap-1 ${tab === id ? "" : "text-ink-muted"}`}>
              <Icon name={t.icon} size={24} />{t.label}
              {id === "today" && openNeeds.length > 0 && <span className="absolute top-2 right-[28%]"><Badge n={openNeeds.length} /></span>}
            </button>
          );
        })}
        <button type="button" onClick={() => setMoreOpen(true)} className={`t-caption flex min-h-16 flex-col items-center justify-center gap-1 ${tab === "rules" || tab === "given-back" ? "" : "text-ink-muted"}`}>
          <Icon name="icon-notes" size={24} />More
        </button>
      </nav>

      {moreOpen && (
        <Sheet onClose={() => setMoreOpen(false)} title="More">
          <ButtonOutline onClick={() => go("rules")}><Icon name="icon-notes" size={22} /> Rules</ButtonOutline>
          <ButtonOutline onClick={() => go("given-back")}><Icon name="icon-time-given-back" size={22} /> Given back</ButtonOutline>
        </Sheet>
      )}
      {callSheet && <CallSheet c={ctx} call={callSheet} onClose={() => setOpenCall(null)} />}
    </div>
  );
}

interface Ctx {
  moms: Mom[]; setMoms: (f: (m: Mom[]) => Mom[]) => void;
  calls: Call[]; setCalls: (f: (c: Call[]) => Call[]) => void;
  needs: Need[]; setNeeds: (f: (n: Need[]) => Need[]) => void; openNeeds: Need[];
  resolved: Record<string, string>; resolve: (id: string, msg: string) => void;
  pays: Pay[]; setPays: (f: (p: Pay[]) => Pay[]) => void;
  mom: (id: string) => Mom; setOpenCall: (id: string | null) => void; setOpenMom: (id: string | null) => void; setTab: (t: Tab) => void;
  daysOff: string[]; setDaysOff: (f: (d: string[]) => string[]) => void;
  feedToken: string; setFeedToken: (t: string) => void;
  log: [string, string, number][]; setLog: (f: (l: [string, string, number][]) => [string, string, number][]) => void;
  ran: boolean; setRan: (b: boolean) => void;
}

function Badge({ n }: { n: number }) {
  return <span className="t-caption inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-butter px-1.5 text-[#34402A]">{n}</span>;
}

function Sheet({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" onClick={onClose} className="anim-fade absolute inset-0 bg-[#1F2619]/40" />
      <div className="coach-sheet absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col gap-4 overflow-y-auto rounded-t-[28px] bg-paper p-6 shadow-[0_-8px_32px_rgba(31,38,25,0.18)] lg:inset-y-0 lg:right-0 lg:left-auto lg:max-h-none lg:w-[440px] lg:rounded-t-none lg:rounded-l-[28px]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="t-heading">{title}</h2>
          <button type="button" onClick={onClose} className="min-h-12 rounded-full px-4 font-semibold underline">Close</button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/* ---------- Today ---------- */

function TodayView({ c }: { c: Ctx }) {
  const today = c.calls.filter((x) => lahoreDay(x.start) === lahoreDay(NOW)).sort((a, b) => +a.start - +b.start);
  const next = today.find((x) => x.state === "booked" && x.start > NOW);
  const [bup, setBup] = useState(false);
  const afterHello = [...c.calls].filter((x) => x.kind === "hello" && x.state === "done" && x.start < NOW).sort((a, b) => +b.start - +a.start)[0];
  const [decided, setDecided] = useState<"offer" | "no" | null>(null);
  const [step, setStep] = useState("");
  const [stepSaved, setStepSaved] = useState(false);
  const inMin = next ? Math.round((+next.start - +NOW) / MIN) : 0;

  return (
    <>
      <div>
        <p className="eyebrow">{dayLabel(NOW, { weekday: "long", day: "numeric", month: "long" })}, Lahore</p>
        <h1 className="t-display mt-2">Good afternoon. {today.length} calls today.</h1>
      </div>

      {next && (() => { const m = c.mom(next.momId); return (
        <div className="offset-butter rounded-[22px] bg-butter p-6 text-[#34402A]">
          <p className="eyebrow">Next call · in {inMin} min</p>
          <p className="t-title mt-2">{m.name}</p>
          <p className="font-semibold">{callLabel(next)}</p>
          <p className="t-time mt-2">{fmtTime(next.start, KHI)} Lahore{herTime(next.start, m)}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={PLACEHOLDERS.meetLink} target="_blank" rel="noreferrer" className="rfm-button inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#34402A] px-4 text-[15px] font-semibold text-[#F6EEE3]">
              <Icon name="icon-video-call" size={20} /> Join
            </a>
            {!bup ? (
              <button type="button" onClick={() => setBup(true)} className="rfm-button inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#34402A]/60 px-4 text-[15px] font-semibold">
                <Icon name="icon-babys-up" size={20} /> Baby’s up
              </button>
            ) : <p className="anim-fade self-center font-semibold">Sent {m.name} three new times.</p>}
          </div>
        </div>
      ); })()}

      <section className="flex flex-col gap-3">
        <h2 className="t-heading">Needs you</h2>
        {c.needs.map((n) => <NeedCard key={n.id} c={c} n={n} />)}
        {c.openNeeds.length === 0 && <Done>Nothing needs you. Put the kettle on.</Done>}
      </section>

      {afterHello && (
        <Panel className="flex flex-col gap-3">
          <h2 className="t-heading">How was your hello call with {c.mom(afterHello.momId).name}?</h2>
          {decided === null ? (
            <div className="flex flex-wrap gap-2">
              <CoachBtn primary onClick={() => setDecided("offer")}>Offer Make Room</CoachBtn>
              <CoachBtn onClick={() => setDecided("no")}>Not a fit</CoachBtn>
            </div>
          ) : decided === "offer" ? <Done>Make Room offer sent to {c.mom(afterHello.momId).name}.</Done>
            : <p className="t-compact rounded-2xl bg-sunk p-3"><span className="font-semibold">Sent your note:</span> {NOT_A_FIT_NOTE}</p>}
          <label className="t-caption text-ink-muted" htmlFor="small-step">Small step (optional, goes in her thank-you email)</label>
          <div className="flex gap-2">
            <input id="small-step" value={step} onChange={(e) => { setStep(e.target.value); setStepSaved(false); }} placeholder="One small step…" className="min-h-10 w-full rounded-2xl border border-line bg-paper px-4" />
            <button type="button" disabled={!step.trim()} onClick={() => setStepSaved(true)} className="rfm-button min-h-10 shrink-0 rounded-full border border-line-strong px-4 text-[15px] font-semibold disabled:opacity-50">{stepSaved ? "Saved" : "Save"}</button>
          </div>
        </Panel>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="t-heading">The day</h2>
        <Panel className="!p-0">
          {today.map((x) => { const m = c.mom(x.momId); const isNext = x.id === next?.id; return (
            <button key={x.id} type="button" onClick={() => c.setOpenCall(x.id)} className="flex min-h-16 w-full items-center gap-4 border-b border-line px-5 py-3 text-left last:border-b-0">
              <Icon name={x.state === "done" ? "icon-done" : isNext ? "icon-mug-next" : "icon-mug-waiting"} size={28} />
              <span className="t-time w-20 shrink-0">{fmtTime(x.start, KHI)}</span>
              <span className="min-w-0 flex-1"><span className="block font-semibold">{m.name} · {callLabel(x)}</span><span className="t-caption text-ink-muted">{sameTime(x.start, m.zone) ? m.city : `${fmtTime(x.start, m.zone)}, ${m.city}`}</span></span>
              <span className="t-caption text-ink-muted">{x.state === "done" ? "Done" : isNext ? "Next" : "Later"}</span>
            </button>
          ); })}
        </Panel>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {([["Calls booked", "7"], ["Moved by mothers", "3"], ["Time given back", "2 h 15 min, estimated"]] as const).map(([k, v]) => (
          <Panel key={k}><p className="t-caption text-ink-muted">{k} this week</p><p className="t-heading mt-1">{v}</p></Panel>
        ))}
      </section>
    </>
  );
}

function NeedCard({ c, n }: { c: Ctx; n: Need }) {
  const done = c.resolved[n.id];
  if (done) return <Done>{done}</Done>;
  const m = c.mom(n.momId);
  const acts: [string, string][] =
    n.kind === "payment" ? [["Confirm", `Payment confirmed. ${m.name}’s four calls are booked.`], ["Not received yet", `I told ${m.name} it hasn’t arrived yet. Her times stay held.`]]
    : n.kind === "third-move" ? [["Offer new times", `Sent ${m.name} three new times.`], ["Cancel kindly", `Cancelled kindly. ${m.name} has a note from you.`]]
    : n.kind === "missed" ? [["Mark missed", `Marked missed. Her first missed Make Room call is put back.`], ["Offer a new time", `Sent ${m.name} three new times.`]]
    : [["Offer new times", `Sent ${m.name} three new times away from your day off.`]];
  return (
    <div className="rounded-[22px] border border-line bg-paper p-5">
      <p className="t-heading">{n.title}</p>
      <p className="mt-1 text-ink-muted">{n.reason}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {acts.map(([label, msg], i) => {
          const run = () => {
            c.resolve(n.id, msg);
            if (n.kind === "payment") {
              c.setPays((p) => p.map((x) => (x.momId === n.momId && x.status === "Waiting" ? { ...x, status: i === 0 ? "Confirmed" : "Not received yet" } : x)));
              if (i === 0) { c.setCalls((cs) => cs.map((x) => (x.momId === n.momId ? { ...x, held: false } : x))); c.setMoms((ms) => ms.map((x) => (x.id === n.momId ? { ...x, status: "Make Room" } : x))); }
            }
          };
          return <CoachBtn key={label} primary={i === 0} onClick={run}>{label}</CoachBtn>;
        })}
      </div>
    </div>
  );
}

/* ---------- Calendar ---------- */

const H0 = 13, H1 = 24, ROW = 52;
const WEEK_STARTS = [5, 12, 19, 26];

function CalendarView({ c }: { c: Ctx }) {
  const [mode, setMode] = useState<"week" | "month">("week");
  const [week, setWeek] = useState(12);
  const [offPick, setOffPick] = useState(false);
  const [phoneStart, setPhoneStart] = useState(2);
  const next = c.calls.filter((x) => x.state === "booked" && x.start > NOW).sort((a, b) => +a.start - +b.start)[0];

  const days = useMemo(() => {
    const base = [0, 1, 2, 3, 4].map((i) => week + i);
    const wk = c.calls.filter((x) => { const p = localParts(KHI, x.start); return p.mo === 10 && p.d >= week && p.d < week + 7; });
    const weekend = [5, 6].map((i) => week + i).filter((d) => wk.some((x) => localParts(KHI, x.start).d === d));
    return [...base, ...weekend];
  }, [week, c.calls]);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="t-display">Calendar</h1>
        <div className="flex gap-2">
          <Chip active={mode === "week"} onClick={() => setMode("week")}>Week</Chip>
          <Chip active={mode === "month"} onClick={() => setMode("month")}>Month</Chip>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <ButtonOutline className="!w-auto" onClick={() => setOffPick(true)}><Icon name="icon-day" size={22} /> Take time off</ButtonOutline>
        <FeedLink c={c} compact />
      </div>

      {mode === "week" ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <button type="button" disabled={week === WEEK_STARTS[0]} onClick={() => setWeek((w) => w - 7)} className="min-h-12 rounded-full px-4 font-semibold underline disabled:opacity-40">Previous week</button>
            <p className="font-semibold">Week of {week} October · Lahore time</p>
            <button type="button" disabled={week === WEEK_STARTS[WEEK_STARTS.length - 1]} onClick={() => setWeek((w) => w + 7)} className="min-h-12 rounded-full px-4 font-semibold underline disabled:opacity-40">Next week</button>
          </div>
          <div className="hidden lg:block"><WeekGrid c={c} days={days} next={next} /></div>
          <div className="lg:hidden">
            <div className="mb-3 flex justify-between">
              <button type="button" disabled={phoneStart === 0} onClick={() => setPhoneStart((s) => Math.max(0, s - 1))} className="min-h-12 px-3 font-semibold underline disabled:opacity-40">Earlier</button>
              <button type="button" disabled={phoneStart + 3 >= days.length} onClick={() => setPhoneStart((s) => s + 1)} className="min-h-12 px-3 font-semibold underline disabled:opacity-40">Later</button>
            </div>
            <WeekGrid c={c} days={days.slice(Math.min(phoneStart, days.length - 3), Math.min(phoneStart, days.length - 3) + 3)} next={next} />
          </div>
        </>
      ) : <MonthGrid c={c} />}

      {offPick && <TimeOffSheet c={c} onClose={() => setOffPick(false)} />}
    </>
  );
}

function WeekGrid({ c, days, next }: { c: Ctx; days: number[]; next: Call | undefined }) {
  const hours = Array.from({ length: H1 - H0 }, (_, i) => H0 + i);
  const inWindow = (h: number) => (h >= 14 && h < 17) || (h >= 21 && h < 23);
  const nowP = localParts(KHI, NOW);
  const dayCalls = (d: number) => c.calls.filter((x) => { const p = localParts(KHI, x.start); return p.mo === 10 && p.d === d; });
  const anyCalls = days.some((d) => dayCalls(d).length > 0);

  if (!anyCalls) return (
    <Panel className="flex flex-col items-center gap-3 text-center">
      <Drawing name="illo-tea-cold" className="w-[220px]" />
      <p className="t-heading">No calls. A little room for you.</p>
    </Panel>
  );

  return (
    <div className="overflow-hidden rounded-[22px] border border-line">
      <div className="grid" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0,1fr))` }}>
        <div className="bg-paper" />
        {days.map((d) => {
          const off = c.daysOff.includes(`2026-10-${d}`);
          return <div key={d} className="t-caption border-l border-line bg-paper p-2 text-center">{dayLabel(at(d, 12, 0), { weekday: "short", day: "numeric" })}{off ? " · off" : ""}</div>;
        })}
        <div className="relative">
          {hours.map((h) => <div key={h} className="t-micro bg-paper pr-2 text-right text-ink-muted" style={{ height: ROW }}>{h === 24 ? "" : `${h % 12 || 12}${h < 12 ? "am" : "pm"}`}</div>)}
        </div>
        {days.map((d) => {
          const off = c.daysOff.includes(`2026-10-${d}`);
          const isToday = nowP.d === d;
          return (
            <div key={d} className="relative border-l border-line">
              {hours.map((h) => <div key={h} className={`${inWindow(h) && !off ? "bg-paper" : "bg-sunk"} border-t border-line/60`} style={{ height: ROW }} />)}
              {isToday && <div className="absolute inset-x-0 z-10 flex items-center" style={{ top: ((nowP.h - H0) + nowP.mi / 60) * ROW }}><span className="-ml-1 h-2.5 w-2.5 rounded-full bg-butter ring-2 ring-[#34402A]" /><span className="h-0.5 flex-1 bg-ink" /></div>}
              {dayCalls(d).map((x) => {
                const p = localParts(KHI, x.start); const m = c.mom(x.momId); const isNext = x.id === next?.id;
                const top = ((p.h - H0) + p.mi / 60) * ROW;
                const h = Math.max(((+x.end - +x.start) / MIN / 60) * ROW, 44);
                const tone = isNext ? "offset-butter bg-butter" : x.held ? "border-2 border-dashed border-[#8E8A74] bg-[#FAE8B4]" : x.kind === "hello" ? "bg-[#DDE5D2]" : "bg-[#FAE8B4]";
                return (
                  <button key={x.id} type="button" onClick={() => c.setOpenCall(x.id)} style={{ top, height: h }}
                    className={`coach-slot t-micro absolute inset-x-1 z-[5] overflow-hidden rounded-xl px-2 py-1 text-left text-[#34402A] ${tone} ${x.state === "done" ? "opacity-70" : ""}`}>
                    <span className="flex items-center gap-1 font-bold">{m.name}{x.moved && <Icon name="icon-move" size={14} />}{x.held && <span className="font-semibold">· Held</span>}{x.state === "done" && <Icon name="icon-done" size={14} />}</span>
                    <span className="block truncate">{callLabel(x)}{herTime(x.start, m)}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthGrid({ c }: { c: Ctx }) {
  const [day, setDay] = useState<number | null>(localParts(KHI, NOW).d);
  const first = at(1, 12, 0);
  const lead = (localParts(KHI, first).weekday + 6) % 7;
  const cells = [...Array.from({ length: lead }, () => 0), ...Array.from({ length: 31 }, (_, i) => i + 1)];
  const onDay = (d: number) => c.calls.filter((x) => { const p = localParts(KHI, x.start); return p.mo === 10 && p.d === d; });
  const list = day ? onDay(day) : [];
  return (
    <>
      <p className="font-semibold">October 2026 · Lahore time</p>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <p key={d} className="t-caption text-ink-muted">{d}</p>)}
        {cells.map((d, i) => d === 0 ? <div key={`x${i}`} /> : (
          <button key={d} type="button" onClick={() => setDay(d)} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl ${day === d ? "bg-butter text-[#34402A]" : c.daysOff.includes(`2026-10-${d}`) ? "bg-sunk" : "border border-line bg-paper"}`}>
            <span className="font-semibold">{d}</span>
            {onDay(d).length > 0 && <span className="t-micro flex items-center gap-0.5 font-bold">{onDay(d).slice(0, 3).map((x) => <span key={x.id} className="h-1.5 w-1.5 rounded-full bg-current" />)} {onDay(d).length}</span>}
          </button>
        ))}
      </div>
      {day && (
        <Panel className="flex flex-col gap-2">
          <p className="t-heading">{dayLabel(at(day, 12, 0), { weekday: "long", day: "numeric", month: "long" })}</p>
          {list.length === 0 ? (
            <div className="flex items-center gap-4"><Drawing name="illo-tea-cold" className="w-[120px] shrink-0" /><p>No calls. A little room for you.</p></div>
          ) : list.map((x) => (
            <button key={x.id} type="button" onClick={() => c.setOpenCall(x.id)} className="flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-sunk px-4 text-left">
              <span className="font-semibold">{c.mom(x.momId).name} · {callLabel(x)}</span><span className="t-time">{fmtTime(x.start, KHI)}</span>
            </button>
          ))}
        </Panel>
      )}
    </>
  );
}

function TimeOffSheet({ c, onClose }: { c: Ctx; onClose: () => void }) {
  const [pick, setPick] = useState<string[]>(c.daysOff);
  const days = [14, 15, 16, 19, 20, 21, 22, 23, 26, 27];
  const apply = () => {
    const added = pick.filter((d) => !c.daysOff.includes(d));
    c.setDaysOff(() => pick);
    const clash = c.calls.filter((x) => { const p = localParts(KHI, x.start); return x.state === "booked" && added.includes(`2026-10-${p.d}`); });
    c.setNeeds((ns) => [
      ...clash.filter((x) => !ns.some((n) => n.callId === x.id && n.kind === "day-off")).map((x): Need => ({
        id: `off-${x.id}`, kind: "day-off", momId: x.momId, callId: x.id, title: "A call on a day you took off",
        reason: `${c.mom(x.momId).name}’s ${callLabel(x).toLowerCase()} on ${dayLabel(x.start, { weekday: "long", day: "numeric", month: "long" })} at ${fmtTime(x.start, KHI)}.`,
      })),
      ...ns,
    ]);
    onClose();
    if (clash.length) c.setTab("today");
  };
  return (
    <Sheet onClose={onClose} title="Take time off">
      <p className="text-ink-muted">Pick the days. No new times are offered on them, and calls already booked go to Needs you.</p>
      <div className="grid grid-cols-2 gap-2">
        {days.map((d) => { const k = `2026-10-${d}`; const on = pick.includes(k); return (
          <Chip key={d} active={on} onClick={() => setPick((p) => (on ? p.filter((x) => x !== k) : [...p, k]))}>{dayLabel(at(d, 12, 0))}</Chip>
        ); })}
      </div>
      <ButtonMain onClick={apply}>Save days off</ButtonMain>
    </Sheet>
  );
}

function FeedLink({ c, compact = false }: { c: Ctx; compact?: boolean }) {
  const [renewed, setRenewed] = useState(false);
  const download = () => {
    const ics = buildIcs(c.calls.filter((x) => x.state === "booked").map((x) => ({
      uid: x.id, start: x.start, end: x.end, url: PLACEHOLDERS.meetLink,
      title: x.kind === "hello" ? "Hello call with Room for Mama" : "Half hour with Room for Mama",
    })));
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a"); a.href = url; a.download = "room-for-mama.ics"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  if (compact) return <ButtonOutline className="!w-auto" onClick={download}><Icon name="icon-time" size={22} /> Add to my calendar</ButtonOutline>;
  return (
    <div className="flex flex-col gap-3">
      <p className="t-caption break-all rounded-2xl bg-sunk p-3 font-body">https://roomformama.com/api/public/feed/{c.feedToken || "…"}.ics</p>
      <div className="flex flex-wrap gap-3">
        <ButtonOutline className="!w-auto" onClick={download}>Download .ics</ButtonOutline>
        <ButtonOutline className="!w-auto" onClick={() => { c.setFeedToken(newFeedToken()); setRenewed(true); }}>Make a new link</ButtonOutline>
      </div>
      {renewed && <Done>New link made. The old one no longer works.</Done>}
    </div>
  );
}

function CallSheet({ c, call, onClose }: { c: Ctx; call: Call; onClose: () => void }) {
  const m = c.mom(call.momId);
  const [bup, setBup] = useState(false);
  const [shared, setShared] = useState(false);
  const pay = c.pays.find((p) => p.momId === m.id);
  const plan = c.calls.filter((x) => x.momId === m.id && x.kind === "make-room").sort((a, b) => +a.start - +b.start);
  return (
    <Sheet onClose={onClose} title={`${m.name} · ${callLabel(call)}`}>
      <p className="t-time">{dayLabel(call.start, { weekday: "long", day: "numeric", month: "long" })}, {fmtTime(call.start, KHI)} Lahore{herTime(call.start, m)}</p>
      <div className="grid gap-3">
        <a href={PLACEHOLDERS.meetLink} target="_blank" rel="noreferrer" className="rfm-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground"><Icon name="icon-video-call" size={22} /> Join</a>
        {!bup ? <ButtonOutline onClick={() => setBup(true)}><Icon name="icon-babys-up" size={22} /> Baby’s up</ButtonOutline> : <Done>Sent {m.name} three new times.</Done>}
      </div>
      <div className="rounded-2xl bg-sunk p-4">
        <p className="t-caption text-ink-muted">Payment</p>
        <p className="font-semibold">{call.kind === "hello" ? "Hello call, free" : pay ? `${pay.ref} · ${pay.amount} · ${pay.method} · ${pay.status}` : "Nothing yet"}</p>
      </div>
      {plan.length > 0 && <MakeRoomPlan plan={plan.map((x) => ({ start: x.start, end: x.end }))} zone={m.zone} />}
      <Notes c={c} m={m} />
      {!shared ? <ButtonOutline onClick={() => setShared(true)}><Icon name="icon-helplines" size={22} /> Share helplines</ButtonOutline> : <Done>Emailed {m.name} her country’s helplines.</Done>}
      <button type="button" onClick={() => { onClose(); c.setTab("mothers"); c.setOpenMom(m.id); }} className="min-h-12 font-semibold underline">Open {m.name}’s page</button>
    </Sheet>
  );
}

function Notes({ c, m }: { c: Ctx; m: Mom }) {
  const [t, setT] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <p className="t-caption text-ink-muted">Private notes (only you see these)</p>
      {m.notes.map((n, i) => <p key={i} className="t-compact rounded-2xl bg-sunk p-3">{n}</p>)}
      <div className="flex gap-2">
        <input value={t} onChange={(e) => setT(e.target.value)} placeholder="A note for you…" className="min-h-12 w-full rounded-2xl border border-line bg-paper px-4" />
        <button type="button" disabled={!t.trim()} onClick={() => { c.setMoms((ms) => ms.map((x) => (x.id === m.id ? { ...x, notes: [...x.notes, t.trim()] } : x))); setT(""); }} className="rfm-button min-h-12 shrink-0 rounded-full border-2 border-line-strong px-5 font-semibold disabled:opacity-50">Add</button>
      </div>
    </div>
  );
}

/* ---------- Mothers ---------- */

const FILTERS: ("All" | Status)[] = ["All", "Hello call booked", "Make Room", "Waitlist", "Finished", "Paused", "Payment waiting"];

function MothersView({ c }: { c: Ctx }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState<(typeof FILTERS)[number]>("All");
  const list = c.moms.filter((m) => (f === "All" || m.status === f) && `${m.name} ${m.city}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <h1 className="t-display">Mothers</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or city" aria-label="Search mothers" className="min-h-12 w-full max-w-[480px] rounded-2xl border border-line bg-paper px-4" />
      <div className="flex flex-wrap gap-2">{FILTERS.map((x) => <Chip key={x} active={f === x} onClick={() => setF(x)}>{x}</Chip>)}</div>
      <Panel className="!p-0">
        {list.length === 0 && <p className="p-5 text-ink-muted">No mothers here yet.</p>}
        {list.map((m) => {
          const nx = c.calls.filter((x) => x.momId === m.id && x.state === "booked" && x.start > NOW).sort((a, b) => +a.start - +b.start)[0];
          return (
            <button key={m.id} type="button" onClick={() => c.setOpenMom(m.id)} className="micro-card flex min-h-16 w-full flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-5 py-3 text-left last:border-b-0">
              <span className="min-w-[140px] flex-1"><span className="block font-semibold">{m.name}</span><span className="t-caption text-ink-muted">{m.city} · {m.zone}</span></span>
              <span className="t-caption rounded-full bg-sunk px-3 py-1">{m.status}</span>
              <span className="t-caption w-full text-ink-muted sm:w-48">{nx ? `Next: ${dayLabel(nx.start)}, ${fmtTime(nx.start, KHI)}` : "No call booked"}</span>
            </button>
          );
        })}
      </Panel>
    </>
  );
}

function MotherPage({ c, id }: { c: Ctx; id: string }) {
  const m = c.mom(id);
  const [shared, setShared] = useState(false);
  const [act, setAct] = useState<string | null>(null);
  const mine = c.calls.filter((x) => x.momId === id).sort((a, b) => +a.start - +b.start);
  const up = mine.filter((x) => x.state === "booked" && x.start > NOW);
  const past = mine.filter((x) => !up.includes(x));
  const plan = mine.filter((x) => x.kind === "make-room");
  const pays = c.pays.filter((p) => p.momId === id);
  const lines = helplinesFor(m.zone);
  return (
    <>
      <button type="button" onClick={() => c.setOpenMom(null)} className="w-fit min-h-12 font-semibold underline">All mothers</button>
      <div><h1 className="t-display">{m.name}</h1><p className="text-ink-muted">{m.city} · {m.zone} · {m.status}</p></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="flex flex-col gap-2">
          <p className="t-caption text-ink-muted">Contact</p>
          <p className="font-semibold">{m.email}</p>{m.phone && <p>{m.phone}</p>}
          <p className="t-caption mt-2 text-ink-muted">When she’s free (days, times and city only)</p>
          <p>{m.gave}</p>
          <p className="t-caption mt-2 text-ink-muted">Moves used</p>
          <p>{m.name}: {m.moves.mother} · You: {m.moves.coach}</p>
        </Panel>
        <Panel className="flex flex-col gap-2">
          <p className="t-caption text-ink-muted">Upcoming calls</p>
          {up.length === 0 ? <p>None booked.</p> : up.map((x) => <button key={x.id} type="button" onClick={() => c.setOpenCall(x.id)} className="text-left"><span className="font-semibold">{callLabel(x)}</span> · {dayLabel(x.start)}, {fmtTime(x.start, KHI)} Lahore{sameTime(x.start, m.zone) ? "" : ` · ${fmtTime(x.start, m.zone)} hers`}</button>)}
          <p className="t-caption mt-2 text-ink-muted">Past calls</p>
          {past.length === 0 ? <p>None yet.</p> : past.map((x) => <p key={x.id}>{callLabel(x)} · {dayLabel(x.start)} · {x.state === "missed" ? "Missed" : "Done"}</p>)}
        </Panel>
      </div>
      {plan.length > 0 && <div><p className="t-heading mb-3">Make Room</p><MakeRoomPlan plan={plan.map((x) => ({ start: x.start, end: x.end }))} zone={m.zone} /></div>}
      <Panel className="flex flex-col gap-2">
        <p className="t-heading">Payments</p>
        {pays.length === 0 ? <p className="text-ink-muted">No payments.</p> : pays.map((p) => <p key={p.ref} className="t-time">{p.ref} · {p.amount} · {p.method} · {p.status}</p>)}
      </Panel>
      <Panel><Notes c={c} m={m} /></Panel>
      <Panel className="flex flex-col gap-3">
        {!shared ? <ButtonOutline onClick={() => setShared(true)}><Icon name="icon-helplines" size={22} /> Share helplines</ButtonOutline>
          : <Done>Emailed {m.name}: {lines.map((l) => l.name).join(", ") || "findahelpline.com"}.</Done>}
        {act ? <Done>{act}</Done> : (
          <div className="grid gap-3 sm:grid-cols-3">
            <ButtonOutline onClick={() => { setAct(`Paused. ${m.name}’s calls wait up to 8 weeks.`); c.setMoms((ms) => ms.map((x) => (x.id === id ? { ...x, status: "Paused" } : x))); }}>Pause</ButtonOutline>
            <ButtonOutline onClick={() => setAct(past.some((x) => x.kind === "make-room" && x.state === "done") ? "Cancelled. The rest can pause instead of a refund." : "Cancelled with a full refund.")}>Cancel</ButtonOutline>
            <ButtonOutline onClick={() => { setAct(`${m.name}’s data is deleted.`); }}>Delete her data</ButtonOutline>
          </div>
        )}
      </Panel>
    </>
  );
}

/* ---------- Rules ---------- */

function RulesView({ c }: { c: Ctx }) {
  const [v, setV] = useState<Record<string, string>>({
    "Working days": "Monday to Friday",
    "Windows (Lahore)": "14:00–17:00 and 21:00–23:00",
    "Calls a day": "3",
    "Buffer between calls (min)": "10",
    "Notice for new calls (hours)": "6",
    "Notice for moves (hours)": "1",
    "Weeks ahead": "6",
    "Hello call length (min)": "20",
    "Make Room call length (min)": "30",
    "Make Room in Pakistan": "PKR 12,000",
    "Make Room elsewhere": "US$120",
    "Founding price": "PKR 8,000 / US$80",
    "Founding places left": "7 of 10",
    "Bank": PLACEHOLDERS.payment.bank,
    "Raast": PLACEHOLDERS.payment.raast,
    "JazzCash": PLACEHOLDERS.payment.jazzcash,
    "Wise": PLACEHOLDERS.payment.wise,
    "Your Meet link": PLACEHOLDERS.meetLink,
    "Keep my spot: sent (hours before)": "24",
    "Keep my spot: releases (hours before)": "3",
    "Moves per side, per call": "2",
    "Longest pause (weeks)": "8",
    "Digest time (Lahore)": "07:00",
    "Minutes saved: reminder": "5",
    "Minutes saved: a move she makes herself": "10",
    "Minutes saved: a booking": "20",
    "Not a fit note": NOT_A_FIT_NOTE,
  });
  return (
    <>
      <h1 className="t-display">Rules</h1>
      <p className="text-ink-muted">These run the whole app. Change one here and every screen follows.</p>
      <div className="grid gap-3 lg:grid-cols-2">
        {Object.entries(v).map(([k, val]) => (
          <Panel key={k} className={`flex flex-col gap-2 ${k === "Not a fit note" ? "lg:col-span-2" : ""}`}>
            <label className="t-caption text-ink-muted" htmlFor={`r-${k}`}>{k}</label>
            <div className="flex gap-2">
              {k === "Not a fit note" ? (
                <textarea id={`r-${k}`} value={val} onChange={(e) => setV({ ...v, [k]: e.target.value })} rows={3} className="w-full rounded-2xl border border-line bg-paper p-3" />
              ) : (
                <input id={`r-${k}`} value={val} onChange={(e) => setV({ ...v, [k]: e.target.value })} className="min-h-12 w-full rounded-2xl border border-line bg-paper px-4" />
              )}
              <Saved onSave={() => undefined} />
            </div>
          </Panel>
        ))}
        <Panel className="flex flex-col gap-2">
          <p className="t-caption text-ink-muted">Days off</p>
          <p>{c.daysOff.length ? c.daysOff.map((d) => dayLabel(at(Number(d.split("-")[2]), 12, 0))).join(", ") : "None"}</p>
          <p className="t-caption text-ink-muted">Change them from the Calendar.</p>
        </Panel>
        <Panel className="flex flex-col gap-2">
          <p className="t-caption text-ink-muted">Calendar feed link (keep it private)</p>
          <FeedLink c={c} />
        </Panel>
      </div>
      <Panel className="flex flex-col gap-2">
        <p className="t-heading">Helplines</p>
        {[["Pakistan", "Asia/Karachi"], ["UK", "Europe/London"], ["UAE", "Asia/Dubai"], ["Saudi Arabia", "Asia/Riyadh"], ["US", "America/New_York"], ["Canada", "America/Toronto"]].map(([country, zone]) => (
          <div key={country} className="flex flex-col gap-1 border-b border-line py-2 last:border-b-0 sm:flex-row sm:gap-4">
            <p className="w-32 shrink-0 font-semibold">{country}</p>
            <p className="t-compact">{helplinesFor(zone!).map((l) => `${l.name} ${l.number}${l.hours ? ` (${l.hours})` : ""}`).join(" · ")}</p>
          </div>
        ))}
      </Panel>
    </>
  );
}

/* ---------- Given back ---------- */

function GivenBackView({ c }: { c: Ctx }) {
  const bars = [95, 120, 110, 135];
  const week = c.log.reduce((s, [, , m]) => s + m, 0) + 100;
  const fmt = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);
  return (
    <>
      <h1 className="t-display">Given back</h1>
      <p className="text-ink-muted">Time the app gave back to you. Every number is estimated.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {([["This week", week], ["This month", 460 + (week - 135)], ["All time", 1840 + (week - 135)]] as const).map(([k, m]) => (
          <Panel key={k}><p className="t-caption text-ink-muted">{k}, estimated</p><p className="t-title mt-1">{fmt(m)}</p></Panel>
        ))}
      </div>
      <Panel>
        <p className="t-heading mb-4">By week</p>
        <div className="flex h-44 items-end gap-4">
          {[...bars, week].map((b, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className={`coach-bar w-full rounded-t-xl ${i === bars.length ? "bg-butter" : "bg-sage"}`} style={{ height: `${(b / 160) * 100}%` }} />
              <span className="t-caption text-ink-muted">{["21 Sep", "28 Sep", "5 Oct", "12 Oct", "This week"][i]}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel className="flex flex-col gap-2">
        <p className="t-heading">What ran by itself</p>
        {[...c.log].reverse().map(([t, what, m], i) => (
          <p key={i} className="t-compact flex justify-between gap-3 border-b border-line py-2 last:border-b-0"><span><span className="t-time mr-3">{t}</span>{what}</span><span className="text-ink-muted">{m} min</span></p>
        ))}
      </Panel>
      {!c.ran ? (
        <ButtonMain className="sm:!w-auto" onClick={() => { c.setRan(true); c.setLog((l) => [...l, ["14:05", "Sent Sara her Keep my spot link", 10], ["14:05", "Sent Hina her 30-minute reminder", 5]]); }}>Run today’s automations now</ButtonMain>
      ) : <Done>Done. 1 reminder and 1 Keep my spot sent. 15 minutes given back, estimated.</Done>}
    </>
  );
}
