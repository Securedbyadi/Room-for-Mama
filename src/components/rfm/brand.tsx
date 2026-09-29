/*
 * Room for Mama shared pieces. Brand SVGs are used exactly as shipped:
 * logos and drawings as files, icons inlined so their ink follows
 * currentColor. Never redrawn, recoloured or retyped.
 */
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

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

/** Drawings always sit on a light #FBF6EE card, even at night. */
export function Drawing({
  name,
  className = "",
}: {
  name: DrawingName;
  className?: string;
}) {
  const raw = svgFor(drawingModules, "drawings", name);
  if (!raw) return null;
  return (
    <div
      className={`rfm-drawing rfm-${name} overflow-hidden ${className}`}
      style={{ background: "#FBF6EE", borderRadius: 22, border: "1px solid var(--line)" }}
    >
      <div
        className="flex items-center justify-center p-4 [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: raw }}
      />
    </div>
  );
}

export function Logo({ height = 28 }: { height?: number }) {
  return (
    <Link to="/" aria-label="Room for Mama — home" className="inline-flex">
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
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-[17px] font-semibold transition-opacity disabled:opacity-50";

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
}: {
  label: string;
  sub?: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl px-5 text-left ${
        selected ? "offset-peach slot-selected" : "border border-line bg-paper"
      }`}
    >
      <span className="t-time text-[17px]">{label}</span>
      {sub ? <span className="t-caption text-ink-muted">{sub}</span> : null}
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
      className={`rounded-[22px] p-5 ${
        offset ? `offset-${offset}` : "border border-line bg-paper"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- page frame ---------- */

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="anim-fade mx-auto flex min-h-screen w-full max-w-[480px] flex-col px-5 pt-5 pb-10">
      <header className="mb-8 flex items-center justify-between">
        <Logo />
      </header>
      <main className="flex flex-1 flex-col gap-6">{children}</main>
    </div>
  );
}
