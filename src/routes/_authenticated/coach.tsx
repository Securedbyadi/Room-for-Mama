import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ButtonMain, ButtonOutline, Card, Chip, Icon, Page } from "../../components/rfm/brand";
import {
  addNote,
  afterHello,
  coachBabysUp,
  coachData,
  resolveNeed,
  runNow,
  saveHelpline,
  saveRules,
  setSmallStep,
  shareHelplines,
  whoAmI,
} from "../../lib/coach.functions";
import { fmtLong, fmtTime, zoneLabel } from "../../lib/time-engine";

export const Route = createFileRoute("/_authenticated/coach")({
  head: () => ({
    meta: [
      { title: "Coach | Room for Mama" },
      { name: "description", content: "Today’s calls, mothers, rules and time given back." },
      { property: "og:title", content: "Coach | Room for Mama" },
      { property: "og:description", content: "Today’s calls, mothers, rules and time given back." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CoachApp,
});

type Data = Awaited<ReturnType<typeof coachData>>;
type Tab = "today" | "mothers" | "rules" | "given-back";
const TABS: { id: Tab; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "mothers", label: "Mothers" },
  { id: "rules", label: "Rules" },
  { id: "given-back", label: "Given back" },
];

function CoachApp() {
  const who = useServerFn(whoAmI);
  const load = useServerFn(coachData);
  const navigate = useNavigate();
  const role = useQuery({ queryKey: ["coach-role"], queryFn: () => who() });
  const q = useQuery({ queryKey: ["coach"], queryFn: () => load(), enabled: role.data?.coach === true });
  const [tab, setTab] = useState<Tab>("today");

  const signOut = async () => {
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  };

  if (role.data && !role.data.coach) {
    return (
      <Page>
        <h1 className="t-title">This app is for the coach.</h1>
        <ButtonOutline onClick={signOut}>Sign out</ButtonOutline>
      </Page>
    );
  }
  if (!q.data) return <Page><p className="text-ink-muted">One moment.</p></Page>;
  const d = q.data;

  return (
    <Page headerAction={<span className="t-caption uppercase tracking-[0.12em] text-ink-muted">Coach</span>} className="pb-28">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <h1 className="t-title">{TABS.find((t) => t.id === tab)?.label}</h1>
        <button type="button" className="t-caption min-h-12 underline" onClick={signOut}>Sign out</button>
      </div>
      <nav className="hidden flex-wrap gap-2 md:flex">
        {TABS.map((t) => (
          <Chip key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</Chip>
        ))}
      </nav>
      {tab === "today" && <TodayTab d={d} />}
      {tab === "mothers" && <MothersTab d={d} />}
      {tab === "rules" && <RulesTab d={d} />}
      {tab === "given-back" && <GivenBackTab d={d} />}
      <CoachBottomNav tab={tab} setTab={setTab} />
    </Page>
  );
}

function CoachBottomNav({ tab, setTab }: { tab: Tab; setTab: (tab: Tab) => void }) {
  const icons = { today: "icon-day", mothers: "icon-email", rules: "icon-notes", "given-back": "icon-time-given-back" } as const;
  return <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto grid max-w-[480px] grid-cols-4 border-t border-line bg-page px-2 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 md:hidden" aria-label="Coach sections">{TABS.map((t) => <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`flex min-h-14 flex-col items-center justify-center text-[13px] font-semibold ${tab === t.id ? "text-ink" : "text-ink-muted"}`}><Icon name={icons[t.id]} size={26} /><span>{t.label}</span></button>)}</nav>;
}

function useRefresh() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["coach"] });
}

type CallT = Data["calls"][number];
const motherOf = (c: { mothers: unknown }) => c.mothers as { first_name: string; zone: string; status: string } | null;

function TodayTab({ d }: { d: Data }) {
  const refresh = useRefresh();
  const resolve = useServerFn(resolveNeed);
  const coachZone = d.settings?.coach_zone ?? "Asia/Karachi";
  const upcoming = d.calls.filter((c) => c.status === "booked" || c.status === "held");
  const past = d.calls.filter((c) => c.status === "done");
  const label: Record<string, string> = { payment_check: "Payment to check", third_move: "A third move", missed_call: "A missed call" };

  return (
    <div className="flex flex-col gap-6">
      {d.needs.length > 0 && (
        <Card offset="peach" className="flex flex-col gap-3">
          <h2 className="t-heading">Needs you</h2>
          {d.needs.map((n) => {
            const m = n.mothers as { first_name: string } | null;
            const p = n.plans as { reference: string; paid_reference: string | null; amount: number; currency: string } | null;
            return (
              <div key={n.id} className="flex flex-col gap-3">
                <p>
                  <span className="font-semibold">{label[n.kind]}</span>, {m?.first_name}
                  {p ? ` · ${p.reference} · her ref ${p.paid_reference ?? "—"}` : ""}
                </p>
                <ButtonMain onClick={async () => { await resolve({ data: { id: n.id } }); void refresh(); }}>
                  {n.kind === "payment_check" ? "Confirm payment" : n.kind === "third_move" ? "Allow move" : "Done"}
                </ButtonMain>
              </div>
            );
          })}
        </Card>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="t-heading">Coming up</h2>
        {upcoming.length === 0 && <p className="text-ink-muted">No calls yet.</p>}
        {upcoming.map((c) => <CallCard key={c.id} c={c} coachZone={coachZone} />)}
      </section>

      {past.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="t-heading">After the call</h2>
          {past.map((c) => <AfterCard key={c.id} c={c} coachZone={coachZone} />)}
        </section>
      )}
    </div>
  );
}

function CallCard({ c, coachZone }: { c: CallT; coachZone: string }) {
  const m = motherOf(c);
  const up = useServerFn(coachBabysUp);
  const [sent, setSent] = useState(false);
  const start = new Date(c.starts_at);
  return (
    <Card className="flex flex-col gap-2">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><p className="t-heading">{fmtTime(start, coachZone)} · {m?.first_name}</p><Icon name="icon-video-call" size={28} /></div>
      <p>
        {c.kind === "hello" ? "Hello call" : `Make Room ${c.week ?? ""} of 4`}
        {c.status === "held" ? ", held" : ""} · {fmtTime(start, m?.zone ?? coachZone)} {zoneLabel(m?.zone ?? coachZone)}
      </p>
      {c.status === "booked" && (
        sent ? (
          <p className="t-caption text-ink-muted">Three new times sent.</p>
        ) : (
          <ButtonOutline className="!w-auto" onClick={async () => { await up({ data: { callId: c.id } }); setSent(true); }}>
            <Icon name="icon-babys-up" size={22} /> Baby’s up
          </ButtonOutline>
        )
      )}
    </Card>
  );
}

function AfterCard({ c, coachZone }: { c: CallT; coachZone: string }) {
  const m = motherOf(c);
  const refresh = useRefresh();
  const after = useServerFn(afterHello);
  const step = useServerFn(setSmallStep);
  const [text, setText] = useState(c.small_step ?? "");
  return (
    <Card className="flex flex-col gap-3">
      <p>
        <span className="font-semibold">{m?.first_name}</span> · {fmtLong(new Date(c.starts_at), coachZone)}
      </p>
      {c.kind === "hello" && m?.status === "hello" && (
        <div className="flex flex-col gap-2">
          <ButtonMain onClick={async () => { await after({ data: { motherId: c.mother_id, outcome: "offer" } }); void refresh(); }}>Offer Make Room</ButtonMain>
          <ButtonOutline onClick={async () => { await after({ data: { motherId: c.mother_id, outcome: "not_a_fit" } }); void refresh(); }}>Not a fit</ButtonOutline>
        </div>
      )}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="One small step"
        placeholder="One small step"
        className="min-h-12 w-full rounded-2xl border border-input bg-paper px-4 text-[17px] text-ink placeholder:text-ink-muted"
      />
      <div className="flex gap-2">
        <ButtonOutline disabled={!text.trim() || text === c.small_step} onClick={async () => { await step({ data: { callId: c.id, step: text } }); void refresh(); }}>Save step</ButtonOutline>
        <ButtonOutline onClick={async () => { await after({ data: { motherId: c.mother_id, outcome: "missed", callId: c.id } }); void refresh(); }}>Missed</ButtonOutline>
      </div>
    </Card>
  );
}

function MothersTab({ d }: { d: Data }) {
  const refresh = useRefresh();
  const note = useServerFn(addNote);
  const share = useServerFn(shareHelplines);
  const [open, setOpen] = useState<string | null>(null);
  const [text, setText] = useState("");
  if (d.mothers.length === 0) return <p className="text-ink-muted">No mothers yet.</p>;
  return (
    <div className="flex flex-col gap-3">
      {d.mothers.map((m) => {
        const plan = d.plans.find((p) => p.mother_id === m.id);
        const notes = d.notes.filter((n) => n.mother_id === m.id);
        return (
          <Card key={m.id} className="flex flex-col gap-2">
            <button type="button" className="flex min-h-12 items-center justify-between text-left" onClick={() => setOpen(open === m.id ? null : m.id)}>
              <span className="font-semibold">{m.first_name}</span>
              <span className="t-caption text-ink-muted">{m.city ?? zoneLabel(m.zone)} · {m.status.replace("_", " ")}</span>
            </button>
            {open === m.id && (
              <div className="flex flex-col gap-3">
                {plan && <p className="t-caption">Make Room {plan.reference}: {plan.status.replace("_", " ")}, {plan.currency} {plan.amount}</p>}
                {notes.map((n) => <p key={n.id} className="rounded-xl bg-sunk p-3 text-[15px]">{n.body}</p>)}
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} aria-label="Private note" placeholder="Private note" className="w-full rounded-2xl border border-input bg-paper p-3 text-[17px] text-ink" />
                <ButtonOutline disabled={!text.trim()} onClick={async () => { await note({ data: { motherId: m.id, body: text } }); setText(""); void refresh(); }}>Save note</ButtonOutline>
                <ButtonOutline onClick={async () => { await share({ data: { motherId: m.id } }); }}>Share helplines</ButtonOutline>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

type RulesForm = {
  windows: { days: number[]; start: string; end: string }[];
  max_per_day: number; buffer_min: number; notice_new_h: number; notice_move_h: number; weeks_ahead: number;
  meet_link: string; coach_email: string;
  payment: { bank: string; raast: string; jazzcash: string; wise: string };
  prices: { pkr: number; usd: number; founding_pkr: number; founding_usd: number; founding_spots: number };
  not_a_fit_note: string; minutes: Record<string, number>;
};

const inputCls = "min-h-12 w-full rounded-2xl border border-input bg-paper px-4 text-[17px] text-ink";

function RulesTab({ d }: { d: Data }) {
  const refresh = useRefresh();
  const save = useServerFn(saveRules);
  const saveLine = useServerFn(saveHelpline);
  const s = d.settings as unknown as RulesForm;
  const [form, setForm] = useState(() => JSON.parse(JSON.stringify(s)) as typeof s);
  const [msg, setMsg] = useState<string | null>(null);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm({ ...form, [k]: v });
  const num = (v: string) => Number.parseInt(v, 10) || 0;

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <h2 className="t-heading">Windows (Lahore time)</h2>
        {form.windows.map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <input className={inputCls} aria-label="Start" value={w.start} onChange={(e) => { const ws = [...form.windows]; ws[i] = { ...w, start: e.target.value }; set("windows", ws); }} />
            <span>to</span>
            <input className={inputCls} aria-label="End" value={w.end} onChange={(e) => { const ws = [...form.windows]; ws[i] = { ...w, end: e.target.value }; set("windows", ws); }} />
          </div>
        ))}
        <p className="t-caption text-ink-muted">Monday to Friday.</p>
        <label className="flex items-center justify-between gap-3">Calls a day <input className={`${inputCls} !w-24`} value={form.max_per_day} onChange={(e) => set("max_per_day", num(e.target.value))} /></label>
        <label className="flex items-center justify-between gap-3">Minutes between calls <input className={`${inputCls} !w-24`} value={form.buffer_min} onChange={(e) => set("buffer_min", num(e.target.value))} /></label>
        <label className="flex items-center justify-between gap-3">Hours’ notice, new calls <input className={`${inputCls} !w-24`} value={form.notice_new_h} onChange={(e) => set("notice_new_h", num(e.target.value))} /></label>
        <label className="flex items-center justify-between gap-3">Hours’ notice, moves <input className={`${inputCls} !w-24`} value={form.notice_move_h} onChange={(e) => set("notice_move_h", num(e.target.value))} /></label>
        <label className="flex items-center justify-between gap-3">Weeks ahead <input className={`${inputCls} !w-24`} value={form.weeks_ahead} onChange={(e) => set("weeks_ahead", num(e.target.value))} /></label>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="t-heading">Video, email and payment</h2>
        <input className={inputCls} aria-label="Google Meet link" value={form.meet_link} onChange={(e) => set("meet_link", e.target.value)} />
        <input className={inputCls} aria-label="My email" value={form.coach_email} onChange={(e) => set("coach_email", e.target.value)} />
        {(["bank", "raast", "jazzcash", "wise"] as const).map((k) => (
          <input key={k} className={inputCls} aria-label={k} value={form.payment[k]} onChange={(e) => set("payment", { ...form.payment, [k]: e.target.value })} />
        ))}
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="t-heading">Prices</h2>
        {(["pkr", "usd", "founding_pkr", "founding_usd", "founding_spots"] as const).map((k) => (
          <label key={k} className="flex items-center justify-between gap-3">{k.replace("_", " ").toUpperCase()} <input className={`${inputCls} !w-32`} value={form.prices[k]} onChange={(e) => set("prices", { ...form.prices, [k]: num(e.target.value) })} /></label>
        ))}
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="t-heading">Not a fit note</h2>
        <textarea rows={5} className="w-full rounded-2xl border border-input bg-paper p-3 text-[17px] text-ink" value={form.not_a_fit_note} onChange={(e) => set("not_a_fit_note", e.target.value)} />
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="t-heading">Minutes saved (estimated)</h2>
        {Object.entries(form.minutes).map(([k, v]) => (
          <label key={k} className="flex items-center justify-between gap-3">{k.replace("_", " ")} <input className={`${inputCls} !w-24`} value={v} onChange={(e) => set("minutes", { ...form.minutes, [k]: num(e.target.value) })} /></label>
        ))}
      </Card>

      {msg && <p className="rounded-2xl bg-sage-soft p-4">{msg}</p>}
      <ButtonMain onClick={async () => { try { const { windows, max_per_day, buffer_min, notice_new_h, notice_move_h, weeks_ahead, meet_link, coach_email, payment, prices, not_a_fit_note, minutes } = form; await save({ data: { windows, max_per_day, buffer_min, notice_new_h, notice_move_h, weeks_ahead, meet_link, coach_email, payment, prices, not_a_fit_note, minutes } }); setMsg("Saved."); void refresh(); } catch { setMsg("That didn’t save. Check the Meet link and email."); } }}>Save rules</ButtonMain>

      <Card className="flex flex-col gap-3">
        <h2 className="t-heading">Helplines</h2>
        {d.helplines.map((h) => (
          <HelplineRow key={h.id} h={h} onSave={async (row) => { await saveLine({ data: row }); void refresh(); }} />
        ))}
      </Card>
    </div>
  );
}

function HelplineRow({ h, onSave }: { h: Data["helplines"][number]; onSave: (row: { id: string; country: string; zones: string[]; name: string; number: string; hours: string | null; sort: number; remove?: boolean }) => Promise<void> }) {
  const [name, setName] = useState(h.name);
  const [number, setNumber] = useState(h.number);
  const [hours, setHours] = useState(h.hours ?? "");
  const row = { id: h.id, country: h.country, zones: h.zones, name, number, hours: hours || null, sort: h.sort };
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-3">
      <p className="t-caption text-ink-muted">{h.country}</p>
      <input className={inputCls} aria-label="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="flex gap-2">
        <input className={inputCls} aria-label="Number" value={number} onChange={(e) => setNumber(e.target.value)} />
        <input className={inputCls} aria-label="Hours" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Hours" />
      </div>
      <div className="flex gap-2">
        <ButtonOutline onClick={() => onSave(row)}>Save</ButtonOutline>
        <ButtonOutline onClick={() => onSave({ ...row, remove: true })}>Remove</ButtonOutline>
      </div>
    </div>
  );
}

function GivenBackTab({ d }: { d: Data }) {
  const refresh = useRefresh();
  const run = useServerFn(runNow);
  const [ran, setRan] = useState<string | null>(null);
  const now = Date.now();
  const sum = (ms: number) => d.log.filter((l) => now - new Date(l.created_at).getTime() < ms).reduce((a, l) => a + l.minutes_saved, 0);
  const all = d.log.reduce((a, l) => a + l.minutes_saved, 0);
  const fmt = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        {[["This week", sum(7 * 864e5)], ["This month", sum(30 * 864e5)], ["All time", all]].map(([l, v]) => (
          <Card key={l as string} className="flex flex-col gap-1">
            <p className="t-caption text-ink-muted">{l}</p>
            <p className="t-heading">{fmt(v as number)}</p>
          </Card>
        ))}
      </div>
      <p className="t-caption text-ink-muted">All estimated.</p>
      <ButtonMain onClick={async () => { const r = await run(); setRan(Object.keys(r).length ? "Done." : "Nothing to do just now."); void refresh(); }}>Run today’s automations now</ButtonMain>
      {ran && <p className="rounded-2xl bg-sage-soft p-4">{ran}</p>}
      <section className="flex flex-col gap-2">
        {d.log.slice(0, 30).map((l) => (
          <p key={l.id} className="flex justify-between text-[15px]">
            <span>{l.type.replace("_", " ")}{(l.mothers as { first_name: string } | null)?.first_name ? `, ${(l.mothers as { first_name: string }).first_name}` : ""}</span>
            <span className="text-ink-muted">{l.minutes_saved} min</span>
          </p>
        ))}
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="t-heading">Email preview</h2>
        {d.outbox.length === 0 && <p className="text-ink-muted">No emails yet.</p>}
        {d.outbox.map((e) => (
          <Card key={e.id} className="flex flex-col gap-1">
            <p className="t-caption text-ink-muted">To {e.to_email} · {e.subject}</p>
            <p className="whitespace-pre-line text-[15px]">{e.body}</p>
            {e.action_label && <p className="font-semibold">[{e.action_label}]</p>}
          </Card>
        ))}
      </section>
    </div>
  );
}
