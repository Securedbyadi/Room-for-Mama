import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const icons = import.meta.glob("/public/brand/icons/*.svg", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const drawings = import.meta.glob("/public/brand/drawings/*.svg", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

export type IconName =
  | "babys-up" | "book" | "day" | "done" | "email" | "half-hour" | "hello-call" | "helplines"
  | "keep-my-spot" | "make-room" | "move" | "mug-done" | "mug-next" | "mug-waiting" | "night"
  | "notes" | "payment" | "privacy" | "reminder" | "time-given-back" | "time-zone" | "time" | "video-call";

export function Icon({ name, size = 24, className }: { name: IconName; size?: number; className?: string }) {
  const svg = icons[`/public/brand/icons/icon-${name}.svg`] ?? "";
  return (
    <span aria-hidden className={cn("inline-flex shrink-0 [&>svg]:h-full [&>svg]:w-full", className)} style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }} />
  );
}

export type DrawingName = "her-half-hour" | "tea-warm" | "baby-up" | "the-chair" | "tea-cold";
export function Drawing({ name, className, alt, height = 240 }: { name: DrawingName; className?: string; alt: string; height?: number }) {
  const svg = drawings[`/public/brand/drawings/illo-${name}.svg`] ?? "";
  return (
    <div role="img" aria-label={alt} className={cn("flex items-end justify-center overflow-hidden rounded-[22px] bg-[#FBF6EE] steam", className)}>
      <div className="[&>svg]:h-full [&>svg]:w-auto" style={{ height }} dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <picture className={className}>
      <source srcSet="/brand/logo/rfm-logo-horizontal-night.svg" media="(prefers-color-scheme: dark)" />
      <img src="/brand/logo/rfm-logo-horizontal.svg" alt="Room for Mama" className="h-11 w-auto" />
    </picture>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "main" | "outline" | "chip" | "butter" };
export function Button({ variant = "main", className, ...p }: BtnProps) {
  return (
    <button {...p} className={cn(
      "focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full text-[17px] font-semibold transition-opacity disabled:opacity-50",
      variant === "main" && "h-14 w-full bg-primary text-primary-foreground",
      variant === "outline" && "h-13 w-full border border-line-strong bg-transparent text-ink",
      variant === "chip" && "h-12 bg-sunk px-5 text-ink",
      variant === "butter" && "h-12 bg-butter px-5 text-on-colour",
      className)} />
  );
}

export function Slot({ day, time, place, selected, onSelect }: { day: string; time: string; place: string; selected?: boolean; onSelect?: () => void }) {
  return (
    <button type="button" role="radio" aria-checked={!!selected} onClick={onSelect}
      className={cn("focus-ring flex min-h-16 w-full items-center justify-between rounded-[16px] px-6 py-3 text-left transition-colors",
        selected ? "offset bg-butter text-on-colour" : "border border-line-strong bg-paper text-ink")}>
      <span>
        <span className="t-time block text-[19px] leading-6">{day} · {time}</span>
        <span className={cn("block text-[15px]", selected ? "text-on-colour/80" : "text-ink-muted")}>your time, {place}</span>
      </span>
      <Icon name={selected ? "done" : "book"} size={32} />
    </button>
  );
}

export function MomentField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor="moment" className="sr-only">When do you usually get a quiet moment?</label>
      <textarea id="moment" rows={3} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="Most mornings when the baby naps…"
        className="focus-ring w-full resize-none rounded-[16px] border border-line-strong bg-paper px-6 py-4 text-ink placeholder:text-ink-muted" />
      <p className="t-caption mt-2 text-ink-muted">Write it your way, in any language. Only days, times and your city are kept.</p>
    </div>
  );
}

export function BookedCard({ when, meta, children }: { when: string; meta: string; children?: ReactNode }) {
  return (
    <div className="offset fade-in rounded-[22px] bg-paper p-6">
      <div className="flex items-center gap-4"><Icon name="done" size={36} /><h1 className="t-title !text-[40px] !leading-[44px]">You’re in.</h1></div>
      <p className="t-time mt-3 text-[21px]">{when}</p>
      <p className="t-caption text-ink-muted">{meta}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export type MugState = "done" | "next" | "waiting";
export function MakeRoomTimeline({ rows }: { rows: { day: string; time: string; state: MugState }[] }) {
  return (
    <ul className="rounded-[22px] bg-paper px-6">
      {rows.map((r, i) => (
        <li key={i} className="flex min-h-16 items-center gap-4 border-b border-line py-3 last:border-0">
          <Icon name={`mug-${r.state}`} size={32} />
          <span className="flex-1 text-[19px]">{r.day}</span>
          <span className="t-time text-[19px]">{r.time}</span>
        </li>
      ))}
    </ul>
  );
}

export function BabysUpSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Close" onClick={onClose} className="fade-in absolute inset-0 bg-[#1F2619]/60" />
      <div role="dialog" aria-modal className="rise-in relative w-full max-w-[480px] rounded-t-[28px] bg-paper px-5 pb-8 pt-3 shadow-[0_-8px_30px_rgba(31,38,25,0.25)]">
        <div className="mx-auto mb-5 h-1.5 w-11 rounded-full bg-line-strong/60" />
        <div className="mb-6 flex items-center gap-5">
          <Drawing name="baby-up" alt="" height={110} className="h-[110px] w-[110px] shrink-0 items-center rounded-full" />
          <div><h2 className="t-title">No problem.</h2><p className="text-ink-muted">Babies don’t read calendars.</p></div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function NeedsYouCard({ icon, title, detail, action, onAction }: { icon: IconName; title: string; detail: string; action: string; onAction: () => void }) {
  return (
    <div className="coach offset rounded-[22px] bg-paper p-6">
      <div className="flex gap-4"><Icon name={icon} size={40} /><div><p className="font-semibold">{title}</p><p className="text-ink-muted">{detail}</p></div></div>
      <Button className="mt-5" onClick={onAction}>{action}</Button>
    </div>
  );
}

export function TimeGivenBack({ label, minutes }: { label: string; minutes: number }) {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return (
    <div className="flex items-center gap-6 rounded-[22px] bg-sage-soft p-6">
      <Icon name="time-given-back" size={48} />
      <div><p>{label}</p><p><span className="t-title">{h ? `${h} h ` : ""}{m} min</span> <span className="text-ink-muted">estimated</span></p></div>
    </div>
  );
}

export function Page({ tag, right, children }: { tag?: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-[480px] px-5 pb-10">
      <header className="flex h-20 items-center justify-between">
        <a href="/" className="focus-ring rounded"><Logo /></a>
        {right ?? (tag && <span className="t-caption tracking-[0.12em] text-ink-muted uppercase">{tag}</span>)}
      </header>
      {children}
    </div>
  );
}
