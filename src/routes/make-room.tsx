import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ButtonMain, Card, Drawing, Page } from "../components/rfm/brand";
import { MakeRoomPlan } from "../components/rfm/MakeRoomPlan";
import { SafetyNote } from "../components/rfm/SafetyNote";
import { PLACEHOLDERS } from "../lib/demo-data";
import { planWeekly, zonedToUtc } from "../lib/time-engine";

// Demo mothers: Sara in Manchester (default), Emily in Toronto (?mama=toronto).
const DEMO_PLANS = {
  manchester: { zone: "Europe/London", first: [2026, 10, 14, 11, 30] },
  toronto: { zone: "America/Toronto", first: [2026, 10, 21, 13, 0] },
} as const;

export const Route = createFileRoute("/make-room")({
  validateSearch: (s: Record<string, unknown>): { mama?: "toronto" | undefined } =>
    s["mama"] === "toronto" ? { mama: "toronto" } : {},
  head: () => ({
    meta: [
      { title: "Make Room — Room for Mama" },
      { name: "description", content: "Four half hours, one a week." },
      { property: "og:title", content: "Make Room — Room for Mama" },
      { property: "og:description", content: "Four half hours, one a week." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MakeRoom,
});

type Stage = "offer" | "held" | "confirmed";

function MakeRoom() {
  const { mama } = Route.useSearch();
  const demo = DEMO_PLANS[mama ?? "manchester"];
  const ZONE = demo.zone;
  const [stage, setStage] = useState<Stage>("offer");
  const [reference, setReference] = useState("");
  const [y, mo, d, h, mi] = demo.first;

  const plan = planWeekly({
    firstStart: zonedToUtc(ZONE, y, mo, d, h, mi),
    weeks: 4,
    durationMin: 30,
    motherZone: ZONE,
  });

  return (
    <Page>
      <div>
        <h1 className="t-title">Make Room</h1>
        <p className="mt-2 text-ink-muted">Four half hours, one a week.</p>
      </div>

      <Drawing name="illo-the-chair" />

      <MakeRoomPlan plan={plan} zone={ZONE} />

      <p className="rounded-2xl bg-sunk p-4 t-time">
        {ZONE === "Asia/Karachi" ? "PKR 8,000" : "US$80"}
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
