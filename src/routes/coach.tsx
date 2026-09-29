import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ButtonMain, ButtonOutline, Card, Chip, Icon, Page } from "../components/rfm/brand";
import { SafetyNote } from "../components/rfm/SafetyNote";
import {
  DEMO_CALLS,
  DEMO_MOTHERS,
  NOT_A_FIT_NOTE,
  PLACEHOLDERS,
  type DemoCall,
} from "../lib/demo-data";
import { fmtLong, fmtTime, zoneLabel } from "../lib/time-engine";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "Today — Room for Mama" },
      { name: "description", content: "Your calls today, in your time." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Coach,
});

const COACH_ZONE = "Asia/Karachi";

function CallCard({ call }: { call: DemoCall }) {
  const [babysUpSent, setBabysUpSent] = useState(false);
  const [decision, setDecision] = useState<"offer" | "not-a-fit" | null>(null);
  const [step, setStep] = useState("");

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="t-heading">{call.mother.name}</p>
          <p className="t-caption text-ink-muted">
            {call.kind === "hello" ? "Hello call" : "Make Room"} · {call.mother.city}
          </p>
        </div>
        <Icon name={call.kind === "hello" ? "icon-hello-call" : "icon-half-hour"} size={28} />
      </div>
      <p className="t-time">
        {fmtTime(call.start, COACH_ZONE)} your time · {fmtTime(call.start, call.mother.zone)}{" "}
        {zoneLabel(call.mother.zone)}
      </p>

      {!babysUpSent ? (
        <ButtonOutline onClick={() => setBabysUpSent(true)}>
          <Icon name="icon-babys-up" size={22} /> Baby’s up — send 3 new times
        </ButtonOutline>
      ) : (
        <p className="rounded-xl bg-sage-soft p-3 text-[15px] font-semibold">
          Sent {call.mother.name} three new times. Nothing else to do.
        </p>
      )}

      {call.kind === "hello" && decision === null && (
        <div className="flex gap-2">
          <ButtonOutline onClick={() => setDecision("offer")}>Offer Make Room</ButtonOutline>
          <ButtonOutline onClick={() => setDecision("not-a-fit")}>Not a fit</ButtonOutline>
        </div>
      )}
      {decision === "offer" && (
        <p className="rounded-xl bg-butter-soft p-3 text-[15px] font-semibold">
          Make Room offer sent to {call.mother.name}.
        </p>
      )}
      {decision === "not-a-fit" && (
        <p className="rounded-xl bg-sunk p-3 text-[15px]">
          <span className="font-semibold">Your note to {call.mother.name}:</span> {NOT_A_FIT_NOTE}
        </p>
      )}

      <input
        value={step}
        onChange={(e) => setStep(e.target.value)}
        placeholder="Her one small step this week…"
        className="min-h-12 w-full rounded-2xl border border-input bg-paper px-4 text-[15px] text-ink placeholder:text-ink-muted"
      />
    </Card>
  );
}

type Tab = "today" | "mothers" | "rules" | "given-back";

const TABS: { id: Tab; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "mothers", label: "Mothers" },
  { id: "rules", label: "Rules" },
  { id: "given-back", label: "Given back" },
];

function TodayTab() {
  const [done, setDone] = useState<Set<string>>(new Set());

  const needsYou = [
    {
      id: "payment",
      title: "Check Sara’s payment",
      detail: "She tapped I’ve paid with reference RM-1042. Confirm in one tap when it lands.",
      action: "Confirm payment",
    },
    {
      id: "third-move",
      title: "Emily’s third move",
      detail: "She’s moved this call twice already. This one needs you.",
      action: "Pick a time with her",
    },
  ];

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="t-heading">Needs you</h2>
        {needsYou
          .filter((n) => !done.has(n.id))
          .map((n) => (
            <Card key={n.id} offset="butter" className="flex flex-col gap-2">
              <p className="t-heading">{n.title}</p>
              <p>{n.detail}</p>
              <ButtonOutline onClick={() => setDone(new Set(done).add(n.id))}>
                {n.action}
              </ButtonOutline>
            </Card>
          ))}
        {needsYou.every((n) => done.has(n.id)) && (
          <p className="rounded-2xl bg-sage-soft p-4 font-semibold">
            Nothing needs you. Put the kettle on.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="t-heading">This week’s calls</h2>
        {DEMO_CALLS.map((c) => (
          <CallCard key={c.mother.id + c.start.toISOString()} call={c} />
        ))}
      </section>

      <p className="t-caption text-ink-muted">
        Demo data only — no real mothers, no real calendar.
        {DEMO_CALLS[0] ? ` Next: ${fmtLong(DEMO_CALLS[0].start, COACH_ZONE)}.` : ""}
      </p>
    </>
  );
}

function MothersTab() {
  const [shared, setShared] = useState<Set<string>>(new Set());
  return (
    <section className="flex flex-col gap-3">
      {DEMO_MOTHERS.map((m) => {
        const calls = DEMO_CALLS.filter((c) => c.mother.id === m.id);
        return (
          <Card key={m.id} className="flex flex-col gap-2">
            <p className="t-heading">{m.name}</p>
            <p className="t-caption text-ink-muted">
              {m.city} · {zoneLabel(m.zone)} · {calls.length} call{calls.length === 1 ? "" : "s"}{" "}
              this week
            </p>
            {calls[0] && (
              <p className="t-time">
                Next: {fmtLong(calls[0].start, m.zone)}, her time
              </p>
            )}
            {!shared.has(m.id) ? (
              <ButtonOutline onClick={() => setShared(new Set(shared).add(m.id))}>
                Share helplines
              </ButtonOutline>
            ) : (
              <p className="rounded-xl bg-sage-soft p-3 text-[15px] font-semibold">
                Helplines sent to {m.name}.
              </p>
            )}
          </Card>
        );
      })}
    </section>
  );
}

function RulesTab() {
  const rows: [string, string][] = [
    ["Your windows", "Mon–Fri 2:00–5:00 pm and 9:00–11:00 pm, Karachi time"],
    ["Calls a day", "At most 3, with 10 minutes between"],
    ["Hello call", "20 minutes, free"],
    ["Make Room", "4 half hours, one a week · PKR 12,000 / US$120"],
    ["Founding price", "First 10 mothers · PKR 8,000 / US$80"],
    ["Top-up half hour", "PKR 3,500 / US$35"],
    ["Notice", "6 hours for new calls, 1 hour for moves · up to 6 weeks ahead"],
    ["Video link", PLACEHOLDERS.meetLink],
    ["Payment details", `${PLACEHOLDERS.payment.bank} · ${PLACEHOLDERS.payment.raast} · ${PLACEHOLDERS.payment.jazzcash} · ${PLACEHOLDERS.payment.wise}`],
    ["Your email", PLACEHOLDERS.coachEmail],
  ];
  return (
    <section className="flex flex-col gap-3">
      <p className="text-ink-muted">
        These run the whole app. Change them here and every screen follows.
      </p>
      {rows.map(([label, value]) => (
        <Card key={label} className="flex flex-col gap-1">
          <p className="t-caption text-ink-muted">{label}</p>
          <p className="font-semibold">{value}</p>
        </Card>
      ))}
      <Card className="flex flex-col gap-1">
        <p className="t-caption text-ink-muted">Your “Not a fit” note</p>
        <p>{NOT_A_FIT_NOTE}</p>
      </Card>
    </section>
  );
}

function GivenBackTab() {
  const [ran, setRan] = useState(false);
  const feed = [
    ["Sara booked her hello call", 20],
    ["Keep my spot sent to Ayesha", 10],
    ["Make Room offer sent to Hina", 5],
    ["Reminder sent to Emily", 5],
    ["Ayesha moved her call herself", 10],
  ] as const;
  const week = feed.reduce((s, [, m]) => s + m, 0);
  return (
    <section className="flex flex-col gap-3">
      <p className="text-ink-muted">
        Time the app gave back to you. Every number is an estimate.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            ["This week", week],
            ["This month", 185],
            ["All time", 740],
          ] as const
        ).map(([label, mins]) => (
          <Card key={label} className="flex flex-col items-center gap-1 text-center">
            <p className="t-time">{mins} min</p>
            <p className="t-caption text-ink-muted">{label}, estimated</p>
          </Card>
        ))}
      </div>
      <Card className="flex flex-col gap-2">
        <p className="t-heading">Lately</p>
        {feed.map(([what, mins]) => (
          <div key={what} className="flex items-center justify-between gap-3">
            <p className="text-[15px]">{what}</p>
            <Chip>{mins} min</Chip>
          </div>
        ))}
      </Card>
      {!ran ? (
        <ButtonMain onClick={() => setRan(true)}>Run today’s automations now</ButtonMain>
      ) : (
        <p className="rounded-2xl bg-sage-soft p-4 font-semibold">
          Done. 2 reminders and 1 Keep my spot sent, 1 hold released. 25 minutes given back,
          estimated.
        </p>
      )}
    </section>
  );
}

function Coach() {
  const [tab, setTab] = useState<Tab>("today");

  return (
    <Page>
      <div>
        <h1 className="t-title">{TABS.find((t) => t.id === tab)?.label}</h1>
      </div>

      <nav className="flex flex-wrap gap-2" aria-label="Coach sections">
        {TABS.map((t) => (
          <Chip key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </Chip>
        ))}
      </nav>

      {tab === "today" && <TodayTab />}
      {tab === "mothers" && <MothersTab />}
      {tab === "rules" && <RulesTab />}
      {tab === "given-back" && <GivenBackTab />}

      <div className="mt-auto pt-4">
        <SafetyNote zone={COACH_ZONE} />
      </div>
    </Page>
  );
}
