import { Icon } from "./brand";
import { fmtLong, type WeeklyCall } from "../../lib/time-engine";

export function MakeRoomPlan({ plan, zone }: { plan: WeeklyCall[]; zone: string }) {
  return (
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
              <p className="t-time">{fmtLong(call.start, zone)}</p>
              <p className="t-caption text-ink-muted">Call {i + 1} of {plan.length}</p>
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
  );
}
