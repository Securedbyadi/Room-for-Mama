import { useMemo } from "react";
import { DEMO_BUSY, DEMO_NOW } from "../../lib/demo-data";
import { babysUpOptions, fmtLong } from "../../lib/time-engine";
import { Drawing, Icon } from "./brand";

/** The Baby’s up sheet, drawn inside a small phone frame. Sample times from the time engine; not tappable. */
export function BabysUpPreview() {
  const zone = "Europe/London";
  const options = useMemo(() => {
    const call = DEMO_BUSY[0]!;
    return babysUpOptions({ call, now: DEMO_NOW, motherZone: zone, durationMin: 30, busy: DEMO_BUSY });
  }, []);
  return (
    <div aria-hidden className="mx-auto w-[300px] rounded-[40px] border-2 border-line-strong bg-page p-3">
      <div className="flex h-[520px] flex-col justify-end overflow-hidden rounded-[30px] bg-ink/10">
        <div className="rounded-t-[28px] bg-paper p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.18)]">
          <div className="mb-3 flex items-start gap-3">
            <Drawing name="illo-baby-up" className="aspect-square w-14 shrink-0 rounded-full [&>div]:p-1" />
            <div>
              <p className="t-heading">No problem.</p>
              <p className="text-[14px] text-ink-muted">Babies don’t read calendars.</p>
            </div>
          </div>
          <p className="t-heading mb-2 text-[18px]">Pick a new time</p>
          <div className="flex flex-col gap-2">
            {options.map((o, i) => (
              <div key={o.start.toISOString()} className={`flex min-h-12 items-center justify-between rounded-2xl px-4 ${i === 0 ? "border-2 border-ink bg-butter text-[#34402A] shadow-[4px_4px_0_0_var(--peach)]" : "border border-line bg-paper"}`}>
                <span className="t-time text-[14px]">{fmtLong(o.start, zone)}</span>
                <Icon name={i === 0 ? "icon-done" : "icon-time"} size={22} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex min-h-11 items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-primary-foreground">Move my call</div>
          <p className="t-caption mt-2 text-center text-ink-muted">Moving is always free.</p>
        </div>
      </div>
    </div>
  );
}
