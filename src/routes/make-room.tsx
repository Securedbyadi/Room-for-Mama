import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ButtonMain, Card, Drawing, Icon, Page } from "../components/rfm/brand";
import { SafetyNote } from "../components/rfm/SafetyNote";
import { PLACEHOLDERS } from "../lib/demo-data";
import { fmtLong, planWeekly, zonedToUtc } from "../lib/time-engine";

const ZONE = "Europe/London";

export const Route = createFileRoute("/make-room")({
  head: () => ({
    meta: [
      { title: "Make Room — Room for Mama" },
      {
        name: "description",
        content: "Four half hours, one a week, at a time that suits you.",
      },
      { property: "og:title", content: "Make Room — Room for Mama" },
      {
        property: "og:description",
        content: "Four half hours, one a week, at a time that suits you.",
      },
    ],
  }),
  component: MakeRoom,
});

type Stage = "offer" | "held" | "confirmed";

function MakeRoom() {
  const [stage, setStage] = useState<Stage>("offer");
  const [reference, setReference] = useState("");

  // Demo: Sara in Manchester, Wednesdays 11:30 her time, from 14 Oct 2026.
  const plan = planWeekly({
    firstStart: zonedToUtc(ZONE, 2026, 10, 14, 11, 30),
    weeks: 4,
    durationMin: 30,
    motherZone: ZONE,
  });

  return (
    <Page>
      <div>
        <h1 className="t-title">Make Room</h1>
        <p className="mt-2 text-ink-muted">
          Four half hours, one a week. Same time each week, in your time.
        </p>
      </div>

      <Drawing name="illo-the-chair" />

      <div className="flex flex-col gap-3">
        {plan.map((call, i) => (
          <div key={call.start.toISOString()} className="flex items-start gap-3">
            <Icon
              name={i === 0 ? "icon-mug-next" : "icon-mug-waiting"}
              size={28}
              className="mt-3"
            />
            <div className="flex-1">
              <div className="rounded-2xl border border-line bg-paper p-4">
                <p className="t-time">{fmtLong(call.start, ZONE)}</p>
                <p className="t-caption text-ink-muted">Call {i + 1} of 4</p>
              </div>
              {call.clockNote && (
                <p className="mt-2 rounded-xl bg-butter-soft p-3 text-[13px] font-semibold">
                  {call.clockNote}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="rounded-2xl bg-sunk p-4">
        £96 for all four — the founding price for the first ten mothers. Your
        times are held for 48 hours once you book.
      </p>

      {stage === "offer" && (
        <div className="mt-auto pt-4">
          <ButtonMain onClick={() => setStage("held")}>Book all four</ButtonMain>
        </div>
      )}

      {stage === "held" && (
        <Card className="flex flex-col gap-3">
          <h2 className="t-heading">Your four times are held for 48 hours</h2>
          <p className="text-ink-muted">
            Pay whichever way is easiest, then tap I’ve paid with your reference.
          </p>
          <ul className="space-y-1 text-[15px]">
            <li><span className="font-semibold">Bank:</span> {PLACEHOLDERS.payment.bank}</li>
            <li><span className="font-semibold">Raast:</span> {PLACEHOLDERS.payment.raast}</li>
            <li><span className="font-semibold">JazzCash:</span> {PLACEHOLDERS.payment.jazzcash}</li>
            <li><span className="font-semibold">Wise:</span> {PLACEHOLDERS.payment.wise}</li>
          </ul>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Payment reference (RM…)"
            className="min-h-12 w-full rounded-2xl border border-input bg-paper px-4 text-[17px] text-ink placeholder:text-ink-muted"
          />
          <ButtonMain disabled={!reference.trim()} onClick={() => setStage("confirmed")}>
            I’ve paid
          </ButtonMain>
        </Card>
      )}

      {stage === "confirmed" && (
        <Card offset="peach">
          <h2 className="t-heading">All four are yours.</h2>
          <p className="mt-2">
            I’ll confirm your payment and your invites will follow. If the baby
            wakes, Baby’s up moves any call, free.
          </p>
        </Card>
      )}

      <div className="mt-auto pt-4">
        <SafetyNote zone={ZONE} />
      </div>
    </Page>
  );
}
