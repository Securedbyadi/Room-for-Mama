import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, Drawing } from "../components/rfm/brand";
import { CardPageHeader, WebsitePage } from "../components/rfm/WebsiteChrome";

const desc = "Hello call free. Make Room US$120, or US$80 for the first 10 mothers.";

export const Route = createFileRoute("/prices")({
  head: () => ({
    meta: [
      { title: "Prices and FAQ | Room for Mama" },
      { name: "description", content: desc },
      { property: "og:title", content: "Prices and FAQ | Room for Mama" },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Prices,
});

const FAQ = [
  ["What happens in a hello call?", "We meet for 20 minutes and see whether Make Room feels right."],
  ["What is Make Room?", "Four half hours, one a week, focused on your own day and routine."],
  ["What if the baby wakes?", "Tap Baby’s up and pick another time. Moving is always free."],
  ["Is this baby sleep or feeding advice?", "No. I coach your own day. Your baby’s doctor is the right person to ask about sleep, feeding or health."],
  ["Where do calls happen?", "On video. Times are shown in your time zone."],
] as const;

function Prices() {
  const [pkr, setPkr] = useState(false);
  useEffect(() => {
    try { setPkr(Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Karachi"); } catch { /* US$ */ }
  }, []);
  return (
    <WebsitePage>
      <main>
        <CardPageHeader vt="card-prices" title="Prices and FAQ"><Drawing name="illo-tea-warm" className="!border-0" /></CardPageHeader>
        <section className="section-reveal mx-auto max-w-[1120px] px-5 py-16">
          <div className="grid gap-5 md:grid-cols-2">
            <Card className="p-6"><p className="t-caption text-ink-muted">Hello call</p><p className="t-title mt-3">Free</p><p className="mt-2 text-ink-muted">20 minutes.</p></Card>
            <Card className="p-6"><p className="t-caption text-ink-muted">Make Room</p><p className="t-title mt-3">{pkr ? "PKR 12,000" : "US$120"}</p><p className="mt-2 text-ink-muted">Founding price {pkr ? "PKR 8,000" : "US$80"} for the first 10 mothers.</p></Card>
          </div>
        </section>
        <section id="faq" className="section-reveal border-t border-line bg-paper">
          <div className="mx-auto max-w-[760px] px-5 py-16"><h2 className="t-title">FAQ</h2><div className="mt-8 divide-y divide-line">{FAQ.map(([q, a]) => <details key={q} className="py-5"><summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-4 font-semibold"><span>{q}</span><span aria-hidden className="text-2xl">+</span></summary><p className="mt-3 pr-10 text-ink-muted">{a}</p></details>)}</div></div>
        </section>
      </main>
    </WebsitePage>
  );
}
