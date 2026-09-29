/*
 * Room for Mama shared pieces. Brand SVGs are used exactly as shipped:
 * logos and drawings as files, icons inlined so their ink follows
 * currentColor. Never redrawn, recoloured or retyped.
 */
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { DesktopToggle, WebsiteFooter, WebsiteHeader } from "./WebsiteChrome";
import { ThemeRound } from "./ThemeControl";

const iconModules = import.meta.glob("../../assets/brand/icons/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const drawingModules = import.meta.glob("../../assets/brand/drawings/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function svgFor(
  modules: Record<string, string>,
  dir: string,
  name: string,
): string | undefined {
  return modules[`../../assets/brand/${dir}/${name}.svg`];
}

export type IconName =
  | "icon-babys-up"
  | "icon-book"
  | "icon-day"
  | "icon-done"
  | "icon-email"
  | "icon-half-hour"
  | "icon-hello-call"
  | "icon-helplines"
  | "icon-keep-my-spot"
  | "icon-make-room"
  | "icon-move"
  | "icon-mug-done"
  | "icon-mug-next"
  | "icon-mug-waiting"
  | "icon-night"
  | "icon-notes"
  | "icon-payment"
  | "icon-privacy"
  | "icon-reminder"
  | "icon-time-given-back"
  | "icon-time-zone"
  | "icon-time"
  | "icon-video-call";

export function Icon({
  name,
  size = 24,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const raw = svgFor(iconModules, "icons", name);
  if (!raw) return null;
  return (
    <span
      className={`rfm-icon rfm-${name} inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size, color: "var(--ink)" }}
      aria-hidden
      dangerouslySetInnerHTML={{
        __html: raw.replace(
          "<svg",
          `<svg width="${size}" height="${size}" style="width:${size}px;height:${size}px"`,
        ),
      }}
    />
  );
}

export type DrawingName =
  | "illo-her-half-hour"
  | "illo-tea-warm"
  | "illo-baby-up"
  | "illo-the-chair"
  | "illo-tea-cold";

/** Animated drawings that actually exist in public/brand/animated (checked at build time). */
const ANIMATED = new Set(
  Object.keys(import.meta.glob("/public/brand/animated/*.svg", { query: "?url", import: "default" })).map((p) =>
    p.replace(/^.*\//, "").replace(/\.svg$/, ""),
  ),
);

/** Drawings always sit on a light #FBF6EE card, even at night. */
export function Drawing({
  name,
  className = "",
  bare = false,
}: {
  name: DrawingName;
  className?: string;
  bare?: boolean;
}) {
  return (
    <div
      className={`rfm-drawing rfm-${name} overflow-hidden ${className}`}
      style={bare ? undefined : { background: "#FBF6EE", borderRadius: 22, border: "1px solid var(--line)" }}
    >
      <div className="flex items-center justify-center p-4">
        {ANIMATED.has(name) ? (
          <picture>
            <source media="(prefers-reduced-motion: reduce)" srcSet={`/brand/drawings/${name}.svg`} />
            <img src={`/brand/animated/${name}.svg`} alt="" className="h-auto w-full" />
          </picture>
        ) : (
          <img src={`/brand/drawings/${name}.svg`} alt="" className="h-auto w-full" />
        )}
      </div>
    </div>
  );
}

export function Logo({ height = 28, className = "" }: { height?: number; className?: string }) {
  return (
    <Link to="/" aria-label="Room for Mama, home" className={`inline-flex ${className}`}>
      <span className="rfm-logo-wrap">
        <img className="rfm-logo-day" src="/brand/logo/rfm-logo-horizontal.svg" alt="Room for Mama" height={height} style={{ height }} />
        <img className="rfm-logo-night" src="/brand/logo/rfm-logo-horizontal-night.svg" alt="Room for Mama" height={height} style={{ height }} />
      </span>
    </Link>
  );
}

/* ---------- buttons ---------- */

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  to?: string;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
};

const baseBtn =
  "rfm-button inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-[17px] font-semibold disabled:opacity-50";

export function ButtonMain(props: ButtonProps) {
  const cls = `${baseBtn} bg-primary text-primary-foreground ${props.className ?? ""}`;
  if (props.to) {
    return (
      <Link to={props.to} className={cls}>
        {props.children}
      </Link>
    );
  }
  return (
    <button type={props.type ?? "button"} onClick={props.onClick} disabled={props.disabled} className={cls}>
      {props.children}
    </button>
  );
}

export function ButtonOutline(props: ButtonProps) {
  const cls = `${baseBtn} border-2 border-line-strong bg-transparent text-ink ${props.className ?? ""}`;
  if (props.to) {
    return (
      <Link to={props.to} className={cls}>
        {props.children}
      </Link>
    );
  }
  return (
    <button type={props.type ?? "button"} onClick={props.onClick} disabled={props.disabled} className={cls}>
      {props.children}
    </button>
  );
}

export function BackButton({ onClick, label = "Go back" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rfm-button inline-flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-line-strong bg-transparent text-ink"
    >
      <ArrowLeft aria-hidden size={22} strokeWidth={2} />
    </button>
  );
}

export function ForwardButton({
  onClick,
  disabled = false,
  label = "Continue",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="rfm-button inline-flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-line-strong bg-transparent text-ink disabled:cursor-not-allowed disabled:opacity-35"
    >
      <ArrowRight aria-hidden size={22} strokeWidth={2} />
    </button>
  );
}

export function StepArrows({
  onBack,
  onForward,
  forwardDisabled = false,
  backLabel,
  forwardLabel,
}: {
  onBack: () => void;
  onForward: () => void;
  forwardDisabled?: boolean;
  backLabel?: string;
  forwardLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <BackButton onClick={onBack} label={backLabel ?? "Go back"} />
      <ForwardButton onClick={onForward} disabled={forwardDisabled} label={forwardLabel ?? "Continue"} />
    </div>
  );
}

export function Chip({
  children,
  onClick,
  active,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-12 rounded-full px-4 text-[15px] font-semibold ${
        active ? "bg-butter text-[#34402A]" : "bg-sunk text-ink"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------- slots and cards ---------- */

export function Slot({
  label,
  sub,
  selected,
  onClick,
  marker = false,
}: {
  label: string;
  sub?: string;
  selected?: boolean;
  onClick?: () => void;
  marker?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl px-5 text-left ${
        selected ? "offset-peach slot-selected" : "border border-line bg-paper"
      }`}
    >
      <span className="min-w-0">
        <span className="t-time block text-[17px]">{label}</span>
        {sub ? <span className="t-caption block text-ink-muted">{sub}</span> : null}
      </span>
      {marker ? <Icon name={selected ? "icon-done" : "icon-time"} size={28} /> : null}
    </button>
  );
}

export function Card({
  children,
  className = "",
  offset,
}: {
  children: ReactNode;
  className?: string;
  offset?: "peach" | "butter";
}) {
  return (
    <div
      className={`micro-card rounded-[22px] p-5 ${
        offset ? `offset-${offset}` : "border border-line bg-paper"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- page frame ---------- */

export function Page({
  children,
  headerAction,
  className = "",
  illustration,
  chrome = true,
}: {
  children: ReactNode;
  headerAction?: ReactNode;
  className?: string;
  illustration?: ReactNode;
  /** Website header and footer. Off only in the coach app. */
  chrome?: boolean;
}) {
  const top = chrome ? (
    headerAction ? <div className="mb-4 flex justify-end">{headerAction}</div> : null
  ) : (
    <header className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <Logo />
      <div className="flex shrink-0 items-center gap-3">
        {headerAction}
        <ThemeRound className="relative !h-12 !w-12" />
      </div>
    </header>
  );
  const body = illustration ? (
    <div className={`anim-fade mx-auto w-full max-w-[1200px] px-5 pt-5 pb-10 ${className}`}>
      {top}
      <div className="rfm-split-page grid min-h-[calc(100svh-160px)] items-center gap-7 lg:grid-cols-12 lg:gap-10">
        <aside className="rfm-splash rounded-[24px] bg-sunk p-5 lg:col-span-6 lg:p-10" aria-hidden>
          {illustration}
        </aside>
        <main className="flex min-w-0 flex-col gap-6 lg:col-span-5 lg:col-start-8 lg:min-h-[640px] lg:justify-center">
          {children}
        </main>
      </div>
    </div>
  ) : (
    <div className={`anim-fade mx-auto flex w-full max-w-[480px] flex-col px-5 pt-5 pb-10 ${chrome ? "min-h-[60svh]" : "min-h-screen"} ${className}`}>
      {top}
      <main className="flex flex-1 flex-col gap-6">{children}</main>
    </div>
  );
  if (!chrome) return body;
  return (
    <div className="min-h-screen bg-page">
      <WebsiteHeader />
      {body}
      <WebsiteFooter />
      <DesktopToggle />
    </div>
  );
}
