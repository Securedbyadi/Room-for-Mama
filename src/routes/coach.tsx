import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ButtonOutline, Card, Icon, Page } from "../components/rfm/brand";
import { SafetyNote } from "../components/rfm/SafetyNote";
import { DEMO_CALLS, NOT_A_FIT_NOTE, type DemoCall } from "../lib/demo-data";
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

function Coach() {
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
    <Page>
      <div>
        <h1 className="t-title">Today</h1>
        <p className="mt-1 text-ink-muted">Your calls, your time — hers alongside.</p>
      </div>

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
        Demo data only — no real mothers, no real calendar. Next:{" "}
        {fmtLong(DEMO_CALLS[0].start, COACH_ZONE)}.
      </p>

      <div className="mt-auto pt-4">
        <SafetyNote zone={COACH_ZONE} />
      </div>
    </Page>
  );
}
