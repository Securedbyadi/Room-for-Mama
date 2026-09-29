import { Icon } from "./brand";
import { fmtLong, type WeeklyCall } from "../../lib/time-engine";

export function MakeRoomPlan({ plan, zone }: { plan: WeeklyCall[]; zone: string }) {
  return (
    <div className="rounded-[22px] border border-line bg-paper px-5">
      {plan.map((call, i) => (
        <div key={call.start.toISOString()} className="flex items-center gap-3 border-b border-line py-4 last:border-b-0">
          <Icon
            name={i === 0 ? "icon-mug-next" : "icon-mug-waiting"}
            size={28}
            className={i === 0 ? "mug-next-motion" : ""}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="t-time">{fmtLong(call.start, zone)}</p>
              <p className="t-caption shrink-0 text-ink-muted">{i + 1} of {plan.length}</p>
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
