import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { SafetyNote } from "./SafetyNote";
import { ButtonMain, Logo } from "./brand";
import { ThemeControl, ThemeRound } from "./ThemeControl";

const LINKS = [
  ["What I offer", "/what-i-offer"],
  ["Who it’s for", "/who-its-for"],
  ["Prices", "/prices"],
  ["FAQ", "/prices"],
] as const;

export function WebsiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-page/95 backdrop-blur">
        <div className="mx-auto grid min-h-20 max-w-[1120px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5">
          <Logo height={32} />
          <div className="hidden items-center gap-4 lg:flex">
            <nav className="flex items-center gap-4" aria-label="Main navigation">
              {LINKS.map(([label, to]) => <Link key={label} to={to} viewTransition className="whitespace-nowrap text-[14px] font-semibold text-ink-muted hover:text-ink">{label}</Link>)}
            </nav>
            <ThemeControl compact />
            <ButtonMain to="/fit-check" className="!w-auto whitespace-nowrap !px-5">Book a free hello call</ButtonMain>
          </div>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="grid min-h-12 min-w-12 place-items-center rounded-full border-2 border-line-strong text-2xl lg:hidden"
          >
            <span aria-hidden>☰</span>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-ink/30 lg:hidden" role="presentation" onClick={() => setMenuOpen(false)}>
          <div className="anim-sheet absolute inset-x-0 bottom-0 max-h-[90svh] overflow-y-auto rounded-t-[28px] bg-paper px-5 pt-5 pb-8" role="dialog" aria-label="Menu" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <h2 className="t-title">Menu</h2>
              <button type="button" onClick={() => setMenuOpen(false)} className="min-h-12 min-w-12 rounded-full border-2 border-line-strong text-2xl" aria-label="Close menu">×</button>
            </div>
            <nav className="mb-6 flex flex-col border-y border-line" aria-label="Phone navigation">
              {LINKS.map(([label, to]) => <Link key={label} to={to} onClick={() => setMenuOpen(false)} className="flex min-h-14 items-center border-b border-line font-semibold last:border-b-0">{label}</Link>)}
            </nav>
            <p className="t-caption mb-2 text-ink-muted">Display</p>
            <ThemeControl />
          </div>
        </div>
      )}
    </>
  );
}

function HomeHeader() {
  return (
    <header className="relative z-30">
      <div className="mx-auto grid min-h-20 max-w-[1120px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5">
        <Logo height={32} className="logo-rise" />
        <Link to="/fit-check" className="hidden min-h-12 items-center rounded-full border-2 border-ink px-5 text-[15px] font-semibold whitespace-nowrap lg:inline-flex">Book a free hello call</Link>
        <ThemeRound className="!h-12 !w-12 lg:hidden" />
      </div>
    </header>
  );
}

export function WebsiteFooter() {
  return (
    <footer className="band-ink">
      <div className="mx-auto grid max-w-[1120px] gap-6 px-5 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-start">
        <div><Logo height={30} /><p className="mt-3 text-ink-muted">A little room for you.</p></div>
        <SafetyNote />
      </div>
    </footer>
  );
}

export function WebsitePage({ children, home = false }: { children: ReactNode; home?: boolean }) {
  return (
    <div className="min-h-screen bg-page pb-24 lg:pb-0">
      {home ? <HomeHeader /> : <WebsiteHeader />}
      {children}
      <WebsiteFooter />
      {home && <ThemeRound className="fixed right-6 bottom-6 z-30 hidden lg:grid" />}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-page/95 p-3 backdrop-blur lg:hidden"><div className="mx-auto max-w-[480px]"><ButtonMain to="/fit-check">Book a free hello call</ButtonMain></div></div>
    </div>
  );
}

/** Header of a card's own page. Shares its view-transition name with the home card it grows from. */
export function CardPageHeader({ vt, title, children }: { vt: string; title: string; children: ReactNode }) {
  return (
    <div className="anim-fade mx-auto max-w-[1120px] px-5 pt-8">
      <Link to="/" viewTransition className="inline-flex min-h-12 items-center font-semibold underline underline-offset-4">Back</Link>
      <div className="rfm-deal-card mt-4 grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_320px] md:items-center" style={{ viewTransitionName: vt }}>
        <h1 className="t-display md:text-[56px] md:leading-[60px]">{title}</h1>
        {children}
      </div>
    </div>
  );
}
