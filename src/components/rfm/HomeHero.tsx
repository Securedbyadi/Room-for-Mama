import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ButtonMain, Drawing, Icon, type DrawingName, type IconName } from "./brand";

type Deal = {
  to: "/what-i-offer" | "/who-its-for" | "/prices";
  vt: string;
  title: string;
  drawing: DrawingName;
  line: string;
};

function usePkr(): boolean {
  const [pkr, setPkr] = useState(false);
  useEffect(() => {
    try {
      setPkr(Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Karachi");
    } catch {
      /* stays US$ */
    }
  }, []);
  return pkr;
}

export function useDeals(): Deal[] {
  const pkr = usePkr();
  return [
    { to: "/what-i-offer", vt: "card-offer", title: "What I offer", drawing: "illo-the-chair", line: "A free hello call, then Make Room: four half hours, one a week." },
    { to: "/who-its-for", vt: "card-who", title: "Who it’s for", drawing: "illo-her-half-hour", line: "Mothers of babies and toddlers, 0 to 3, anywhere." },
    {
      to: "/prices",
      vt: "card-prices",
      title: "Prices and FAQ",
      drawing: "illo-tea-warm",
      line: pkr
        ? "Hello call free. Make Room PKR 12,000, or PKR 8,000 for the first 10 mothers."
        : "Hello call free. Make Room US$120, or US$80 for the first 10 mothers.",
    },
  ];
}

function CardFace({ deal, alwaysLine }: { deal: Deal; alwaysLine?: boolean }) {
  return (
    <>
      <Drawing name={deal.drawing} className={`${deal.drawing === "illo-her-half-hour" ? "home-steam" : ""} h-[255px] !border-0 [&>div]:h-full [&>div]:p-2`} />
      <h2 className="home-card-title mt-3 px-1">{deal.title}</h2>
      <div className={alwaysLine ? "px-1" : "fan-more px-1"}>
        <p className="mt-1 text-[15px] leading-[22px]">{deal.line}</p>
        <span className="mt-2 inline-block text-[15px] font-semibold underline underline-offset-4">Open</span>
      </div>
    </>
  );
}

function Fan({ deals }: { deals: Deal[] }) {
  return (
    <div className="fan relative mx-auto h-[520px] w-full max-w-[640px]">
      <div aria-hidden className="hero-sun absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <div aria-hidden className="founding-sticker absolute top-0 right-0 z-20 grid h-[124px] w-[124px] rotate-12 place-items-center rounded-full border-2 border-ink bg-peach text-center text-[#34402A]">
        <span className="t-caption leading-4">First 10<br /><strong className="font-display text-[25px] leading-6">US$80</strong><br />founding price</span>
      </div>
      {deals.map((d, i) => (
        <Link
          key={d.to}
          to={d.to}
          viewTransition
          className={`fan-card fan-${i} absolute top-14 left-1/2 block h-[400px] w-[280px] -ml-[140px] p-3`}
          style={{ viewTransitionName: d.vt }}
        >
          <CardFace deal={d} />
        </Link>
      ))}
    </div>
  );
}

function Deck({ deals }: { deals: Deal[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const onScroll = () => {
    const el = ref.current;
    if (!el || !el.firstElementChild) return;
    const w = (el.firstElementChild as HTMLElement).offsetWidth + 16;
    setActive(Math.round(el.scrollLeft / w));
  };
  return (
    <div className="deck">
      <div ref={ref} onScroll={onScroll} className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-5 px-5 pt-2 pb-3 [scrollbar-width:none]">
        {deals.map((d) => (
          <Link key={d.to} to={d.to} viewTransition className="rfm-deal-card block w-[80%] shrink-0 snap-start p-3" style={{ viewTransitionName: d.vt }}>
            <CardFace deal={d} alwaysLine />
          </Link>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-2" aria-hidden>
        {deals.map((d, i) => (
          <span key={d.to} className={`h-2 w-2 rounded-full ${i === active ? "bg-ink" : "bg-line-strong/50"}`} />
        ))}
      </div>
    </div>
  );
}

export function HomeHero() {
  const deals = useDeals();
  const notes: [IconName, string][] = [
    ["icon-half-hour", "20 minutes, free"],
    ["icon-time-zone", "Any time zone"],
    ["icon-video-call", "On video, from Lahore"],
  ];
  return (
    <section className="hero-grain relative overflow-hidden lg:min-h-[calc(100svh-80px)]">
      <div className="relative mx-auto grid max-w-[1200px] gap-8 px-5 pt-2 pb-28 lg:min-h-[calc(100svh-80px)] lg:grid-cols-12 lg:items-center lg:gap-5 lg:pb-8">
        <div className="lg:order-2 lg:col-span-7 lg:col-start-6">
          <div className="hidden lg:block"><Fan deals={deals} /></div>
        </div>
        <div className="max-w-[570px] lg:order-1 lg:col-span-5">
          <h1 className="hero-title">A little room <span className="t-italic block">for you.</span></h1>
          <p className="hero-lead mt-5 text-ink-muted">Gentle routine coaching for mothers of babies and toddlers. Half an hour a week, with a mother who’s living it too.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonMain to="/fit-check" className="sm:w-auto sm:shrink-0 sm:whitespace-nowrap">Book a free hello call</ButtonMain>
            <Link to="/book" search={{ demo: "manchester" }} className="micro-link inline-flex min-h-12 items-center font-semibold underline underline-offset-4">Try it as a mama in Manchester</Link>
          </div>
          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
            {notes.map(([icon, label]) => <li key={label} className="micro-icon flex items-center gap-2 text-[13px] font-semibold text-ink-muted"><Icon name={icon} size={22} />{label}</li>)}
          </ul>
        </div>
        <div className="lg:hidden"><Deck deals={deals} /></div>
      </div>
    </section>
  );
}
