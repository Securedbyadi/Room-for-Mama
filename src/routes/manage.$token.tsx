import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ButtonMain, ButtonOutline, Card, Drawing, Icon, Page, Slot } from "../components/rfm/brand";
import { MakeRoomPlan } from "../components/rfm/MakeRoomPlan";
import { SafetyNote } from "../components/rfm/SafetyNote";
import {
  babysUpTimes,
  cancelMine,
  deleteMyData,
  getManage,
  holdMakeRoom,
  keepMySpot,
  makeRoomPreview,
  markPaid,
  moveMyCall,
} from "../lib/mother.functions";
import { fmtLong } from "../lib/time-engine";

export const Route = createFileRoute("/manage/$token")({
  validateSearch: (s: Record<string, unknown>): { just?: "booked" | undefined } => (s["just"] === "booked" ? { just: "booked" } : {}),
  head: () => ({
    meta: [
      { title: "Your calls — Room for Mama" },
      { name: "description", content: "See, move or pay for your calls." },
      { property: "og:title", content: "Your calls — Room for Mama" },
      { property: "og:description", content: "See, move or pay for your calls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  ssr: false,
  component: Manage,
});

type CallRow = { id: string; kind: string; week: number | null; starts_at: string; ends_at: string; status: string; moves_used: number; clock_note: string | null; keep_spot_sent_at: string | null; keep_spot_confirmed_at: string | null };

function icsUrl(start: Date, end: Date, title: string, meet: string): string {
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `SUMMARY:${title}`, `DESCRIPTION:Video link: ${meet}`, `UID:${start.getTime()}@roomformama.com`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

function Manage() {
  const { token } = Route.useParams();
  const { just } = Route.useSearch();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const get = useServerFn(getManage);
  const q = useQuery({ queryKey: ["manage", token], queryFn: () => get({ data: { token } }), retry: false });
  const [sheetFor, setSheetFor] = useState<CallRow | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const keep = useServerFn(keepMySpot);
  const cancel = useServerFn(cancelMine);
  const del = useServerFn(deleteMyData);
  const refresh = () => qc.invalidateQueries({ queryKey: ["manage", token] });

  if (q.isLoading) return <Page><p className="text-ink-muted">One moment.</p></Page>;
  if (q.isError || !q.data) {
    return (
      <Page>
        <Drawing name="illo-tea-cold" />
        <h1 className="t-title">This link isn’t working.</h1>
        <p>It may be old, or your details were deleted. You can always book again.</p>
        <ButtonMain to="/">Back to Room for Mama</ButtonMain>
        <SafetyNote />
      </Page>
    );
  }
  const d = q.data;
  const zone = d.mother.zone;
  const now = Date.now();
  const upcoming = (d.calls as CallRow[]).filter((c) => (c.status === "booked" || c.status === "held") && new Date(c.ends_at).getTime() + 10 * 60_000 > now);
  const next = upcoming[0];
  const title = (k: string) => (k === "hello" ? "Hello call with Room for Mama" : "Half hour with Room for Mama");

  return (
    <Page>
      {just === "booked" && next ? (
        <Card offset="peach" className="flex flex-col gap-3">
          <Drawing name="illo-tea-warm" className="youre-in-rise" />
          <h1 className="t-title">You’re in.</h1>
          <p className="t-time text-[17px]">{fmtLong(new Date(next.starts_at), zone)}, your time.</p>
          <p>If the baby wakes, tap Baby’s up and pick another time. No need to explain.</p>
        </Card>
      ) : (
        <h1 className="t-title">Hello, {d.mother.firstName}</h1>
      )}

      {note && <p className="rounded-2xl bg-butter-soft p-4">{note}</p>}

      {upcoming.length > 0 && (
        <div className="flex flex-col gap-3">
          {upcoming.map((c) => (
            <Card key={c.id} className="flex flex-col gap-2">
              <p className="t-caption text-ink-muted">{c.kind === "hello" ? "Hello call" : `Half hour ${c.week ?? ""} of 4`}{c.status === "held" ? ", held" : ""}</p>
              <p className="t-time text-[17px]">{fmtLong(new Date(c.starts_at), zone)}, your time</p>
              {c.clock_note && <p className="rounded-xl bg-butter-soft p-3 text-[13px] font-semibold">{c.clock_note}</p>}
              {c.status === "booked" && (
                <div className="mt-2 flex flex-col gap-2">
                  {c.keep_spot_sent_at && !c.keep_spot_confirmed_at && (
                    <ButtonMain onClick={async () => { await keep({ data: { token, callId: c.id } }); setNote("Your spot is kept."); void refresh(); }}>Keep my spot</ButtonMain>
                  )}
                  <ButtonMain onClick={() => setSheetFor(c)}><Icon name="icon-babys-up" size={22} /> Baby’s up</ButtonMain>
                  <a href={icsUrl(new Date(c.starts_at), new Date(c.ends_at), title(c.kind), d.meetLink)} download="room-for-mama.ics" className="block">
                    <ButtonOutline>Add to my calendar</ButtonOutline>
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {d.mother.status === "offered" && <MakeRoomOffer token={token} onDone={refresh} />}

      {d.plan && d.plan.status === "held" && d.payment && <PayCard token={token} plan={d.plan} payment={d.payment} onDone={refresh} />}
      {d.plan && d.plan.status === "paid_pending" && <p className="rounded-2xl bg-sage-soft p-4">Thank you. I’ll confirm your payment soon.</p>}
      {d.plan && d.plan.status === "confirmed" && <Card offset="peach"><h2 className="t-heading">All four are yours.</h2></Card>}

      <div className="mt-auto flex flex-col gap-3 pt-4">
        {upcoming.length > 0 && (
          <ButtonOutline onClick={async () => { if (!window.confirm("Cancel your calls?")) return; const res = await cancel({ data: { token } }); setNote(res.kind === "refund" ? "Cancelled. I’ll send your full refund." : res.kind === "paused" ? "Paused. The rest can wait for you up to 8 weeks." : "Cancelled."); void refresh(); }}>
            Cancel
          </ButtonOutline>
        )}
        <button type="button" className="t-caption min-h-12 underline underline-offset-2" onClick={async () => { if (!window.confirm("Delete everything I keep about you?")) return; await del({ data: { token } }); void navigate({ to: "/privacy" }); }}>
          Delete my details
        </button>
        <SafetyNote lines={d.helplines} />
      </div>

      {sheetFor && <BabysUpSheet token={token} call={sheetFor} zone={zone} onClose={() => setSheetFor(null)} onMoved={async (msg) => { await refresh(); setSheetFor(null); setNote(msg); }} />}
    </Page>
  );
}

function BabysUpSheet({ token, call, zone, onClose, onMoved }: { token: string; call: CallRow; zone: string; onClose: () => void; onMoved: (m: string) => Promise<void> }) {
  const times = useServerFn(babysUpTimes);
  const move = useServerFn(moveMyCall);
  const q = useQuery({ queryKey: ["babys-up", call.id], queryFn: () => times({ data: { token, callId: call.id } }) });
  const [picked, setPicked] = useState<string | null>(null);
  const chosen = picked ?? q.data?.[0]?.start ?? null;
  return (
    <div className="fixed inset-0 z-40 bg-ink/30" onClick={onClose} role="presentation">
      <div className="anim-sheet absolute inset-x-0 bottom-0 mx-auto w-full max-w-[480px] rounded-t-[28px] bg-paper p-5 pb-8 shadow-[0_-8px_24px_rgba(0,0,0,0.18)]" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Baby’s up">
        <div className="mb-4 flex items-start gap-3">
          <Drawing name="illo-baby-up" className="baby-awake-once w-20 shrink-0" />
          <div>
            <h2 className="t-heading">No problem.</h2>
            <p className="text-ink-muted">Babies don’t read calendars.</p>
          </div>
        </div>
        <h3 className="t-heading mb-3">Pick a new time</h3>
        <div className="flex flex-col gap-3">
          {q.isLoading && <p className="text-ink-muted">Finding times.</p>}
          {q.data?.length === 0 && <p>No open times just now. I’ll be in touch.</p>}
          {q.data?.map((o) => (
            <Slot key={o.start} label={fmtLong(new Date(o.start), zone)} selected={chosen === o.start} onClick={() => setPicked(o.start)} />
          ))}
        </div>
        <div className="mt-4">
          <ButtonMain
            disabled={!chosen}
            onClick={async () => {
              if (!chosen) return;
              const r = await move({ data: { token, callId: call.id, start: chosen } });
              if (r.kind === "moved") await onMoved(`Moved. ${fmtLong(new Date(r.start), zone)}, your time.`);
              else if (r.kind === "needs-coach") onMoved("I’ll be in touch about this move.");
              else if (r.kind === "taken") onMoved("That time just went. Tap Baby’s up to pick another.");
              else onMoved("This call has already started.");
            }}
          >
            Move my call
          </ButtonMain>
          <p className="t-caption mt-3 text-center text-ink-muted">Moving is always free.</p>
        </div>
      </div>
    </div>
  );
}

function MakeRoomOffer({ token, onDone }: { token: string; onDone: () => void }) {
  const preview = useServerFn(makeRoomPreview);
  const hold = useServerFn(holdMakeRoom);
  const q = useQuery({ queryKey: ["make-room", token], queryFn: () => preview({ data: { token } }) });
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!q.data) return null;
  const plan = q.data.calls.map((c) => ({ start: new Date(c.start), end: new Date(c.end), clockNote: c.clockNote ?? undefined }));
  const p = q.data.price;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="t-title">Make Room</h2>
      <p className="text-ink-muted">Four half hours, one a week.</p>
      <Drawing name="illo-the-chair" />
      {plan.length === 4 ? <MakeRoomPlan plan={plan} zone={zone} /> : <p>No weekly time fits just now. I’ll be in touch.</p>}
      {p && <p className="rounded-2xl bg-sunk p-4 t-time">{p.currency === "PKR" ? `PKR ${p.amount.toLocaleString("en")}` : `US$${p.amount}`}</p>}
      {plan.length === 4 && (
        <ButtonMain onClick={async () => { await hold({ data: { token } }); onDone(); }}>Book all four</ButtonMain>
      )}
    </section>
  );
}

function PayCard({ token, plan, payment, onDone }: { token: string; plan: { reference: string; amount: number; currency: string; hold_expires_at: string }; payment: { bank: string; raast: string; jazzcash: string; wise: string }; onDone: () => void }) {
  const paid = useServerFn(markPaid);
  const [ref, setRef] = useState("");
  return (
    <Card className="flex flex-col gap-3">
      <h2 className="t-heading">Your four times are held for 48 hours</h2>
      <p className="t-time">{plan.currency === "PKR" ? `PKR ${plan.amount.toLocaleString("en")}` : `US$${plan.amount}`}, reference {plan.reference}</p>
      <ul className="space-y-1 text-[15px]">
        <li><span className="font-semibold">Bank:</span> {payment.bank}</li>
        <li><span className="font-semibold">Raast:</span> {payment.raast}</li>
        <li><span className="font-semibold">JazzCash:</span> {payment.jazzcash}</li>
        <li><span className="font-semibold">Wise:</span> {payment.wise}</li>
      </ul>
      <input value={ref} onChange={(e) => setRef(e.target.value)} aria-label="Payment reference" placeholder={`Payment reference (${plan.reference})`} className="min-h-12 w-full rounded-2xl border border-input bg-paper px-4 text-[17px] text-ink placeholder:text-ink-muted" />
      <ButtonMain disabled={!ref.trim()} onClick={async () => { await paid({ data: { token, reference: ref.trim() } }); onDone(); }}>I’ve paid</ButtonMain>
    </Card>
  );
}
