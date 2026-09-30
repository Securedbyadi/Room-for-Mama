import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { SafetyNote } from "./SafetyNote";
import { ButtonMain, Logo } from "./brand";
import { ThemeRound } from "./ThemeControl";

const LINKS = [
  ["What I offer", "/what-i-offer"],
  ["Who it’s for", "/who-its-for"],
  ["Prices and FAQ", "/prices"],
] as const;

/** The one header, on every page: logo, three links, the main button; the round toggle sits in it on phones. */
export function WebsiteHeader({ home = false }: { home?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <header className={`z-30 ${home ? "relative" : "sticky top-0 border-b border-line bg-page/95 backdrop-blur"}`}>
        <div className="mx-auto grid min-h-20 max-w-[1200px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5">
          <Logo height={32} className={home ? "logo-rise" : ""} />
          <div className="hidden items-center gap-8 lg:flex">
            <nav className="flex items-center gap-7" aria-label="Main navigation">
              {LINKS.map(([label, to]) => <Link key={label} to={to} viewTransition className="micro-link t-caption whitespace-nowrap text-ink-muted">{label}</Link>)}
            </nav>
            <Link to="/fit-check" className="rfm-button t-control inline-flex min-h-12 items-center rounded-full border-2 border-ink px-5 whitespace-nowrap">Book a free hello call</Link>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeRound className="relative !h-12 !w-12" />
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="grid min-h-12 min-w-12 place-items-center rounded-full border-2 border-line-strong text-2xl"
            >
              <span aria-hidden>☰</span>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" role="presentation" onClick={() => setMenuOpen(false)}>
          <div className="anim-sheet absolute inset-x-0 bottom-0 max-h-[90svh] overflow-y-auto rounded-t-[28px] bg-paper px-5 pt-5 pb-8" role="dialog" aria-label="Menu" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <h2 className="t-title">Menu</h2>
              <button type="button" onClick={() => setMenuOpen(false)} className="min-h-12 min-w-12 rounded-full border-2 border-line-strong text-2xl" aria-label="Close menu">×</button>
            </div>
            <nav className="flex flex-col border-y border-line" aria-label="Phone navigation">
              {LINKS.map(([label, to]) => <Link key={label} to={to} onClick={() => setMenuOpen(false)} className="flex min-h-14 items-center border-b border-line font-semibold last:border-b-0">{label}</Link>)}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

/** Round toggle, fixed bottom-right on desktop. */
export function DesktopToggle() {
  return <div className="fixed right-6 bottom-6 z-30 hidden lg:block"><ThemeRound className="relative" /></div>;
}


export function WebsiteFooter() {
  const [zone, setZone] = useState<string>();
  useEffect(() => {
    try { setZone(Intl.DateTimeFormat().resolvedOptions().timeZone); } catch { /* show anywhere-else line */ }
  }, []);
  const link = "micro-link flex min-h-10 items-center";
  return (
    <footer className="band-ink">
      <div className="mx-auto max-w-[1200px] px-5 py-12">
        <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div><Logo height={30} /><p className="mt-3 text-ink-muted">A little room for you.</p></div>
          <nav aria-label="Explore">
            <p className="eyebrow mb-2">Explore</p>
            <Link to="/what-i-offer" className={link}>What I offer</Link>
            <Link to="/who-its-for" className={link}>Who it’s for</Link>
            <Link to="/prices" className={link}>Prices and FAQ</Link>
            <Link to="/privacy" className={link}>Privacy</Link>
          </nav>
          <nav aria-label="Your calls">
            <p className="eyebrow mb-2">Your calls</p>
            <Link to="/fit-check" className={link}>Book a free hello call</Link>
            <Link to="/manage" className={link}>Manage my calls</Link>
            <Link to="/demo/coach" className={link}>See the coach’s side</Link>
            <Link to="/judges" className={link}>For judges</Link>
          </nav>
        </div>
        <div className="mt-10"><SafetyNote zone={zone} /></div>
        <p className="t-caption mt-8 text-ink-muted">© 2026 Room for Mama · Lahore, Pakistan</p>
      </div>
    </footer>
  );
}

/** Phone sticky button. On home it waits until the hero button (#hero-book) has scrolled away. */
function StickyBook({ home }: { home: boolean }) {
  const [show, setShow] = useState(!home);
  useEffect(() => {
    if (!home) return;
    const el = document.getElementById("hero-book");
    if (!el) { setShow(true); return; }
    const io = new IntersectionObserver(([e]) => setShow(!e!.isIntersecting && e!.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [home]);
  if (!show) return null;
  return <div className="anim-fade fixed inset-x-0 bottom-0 z-20 border-t border-line bg-page/95 p-3 backdrop-blur lg:hidden"><div className="mx-auto max-w-[480px]"><ButtonMain to="/fit-check">Book a free hello call</ButtonMain></div></div>;
}

export function WebsitePage({ children, home = false }: { children: ReactNode; home?: boolean }) {
  return (
    <div className="min-h-screen bg-page pb-24 lg:pb-0">
      <WebsiteHeader home={home} />
      {children}
      <WebsiteFooter />
      <DesktopToggle />
      <StickyBook home={home} />
    </div>
  );
}

/** Header of a card's own page. Shares its view-transition name with the home card it grows from. */
export function CardPageHeader({ vt, title, children }: { vt: string; title: string; children: ReactNode }) {
  return (
    <div className="anim-fade mx-auto max-w-[1200px] px-5 pt-8">
      <Link to="/" viewTransition className="micro-link inline-flex min-h-12 items-center font-semibold underline underline-offset-4">Back to the cards</Link>
      <div className="card-expanded-page mt-4 grid gap-8 p-6 md:grid-cols-[minmax(0,1fr)_400px] md:items-center md:p-10" style={{ viewTransitionName: vt }}>
        <h1 className="page-reveal-title page-title">{title}</h1>
        {children}
      </div>
    </div>
  );
}
