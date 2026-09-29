import { Link, createFileRoute } from "@tanstack/react-router";
import { ButtonMain, Card, Drawing, Icon } from "../components/rfm/brand";
import { WebsitePage } from "../components/rfm/WebsiteChrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Room for Mama — a little room for you" },
      {
        name: "description",
        content:
          "Gentle routine coaching for mothers of babies and toddlers. Half an hour a week, with a mother who’s living it too.",
      },
      { property: "og:title", content: "Room for Mama — a little room for you" },
      {
        property: "og:description",
        content:
          "Gentle routine coaching for mothers of babies and toddlers. Half an hour a week, with a mother who’s living it too.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  const offers = [
    { icon: "icon-hello-call" as const, title: "A free hello call", copy: "20 minutes to meet and see if this feels right." },
    { icon: "icon-make-room" as const, title: "Make Room", copy: "Four half hours, one a week, for a calmer day of your own." },
  ];
  const steps = [
    ["1", "A quick fit check", "Four tap questions. Your answers aren’t stored."],
    ["2", "Pick your hello call", "Choose one of the earliest times that fits your quiet moment."],
    ["3", "Make a little room", "If Make Room fits, keep one half hour a week for four weeks."],
  ] as const;

  return (
    <WebsitePage>
      <main>
        <section className="section-reveal mx-auto grid min-h-[calc(100svh-80px)] max-w-[1120px] items-center gap-8 px-5 py-10 md:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)] md:py-14 lg:min-h-[680px]">
          <div className="max-w-[620px]">
            <h1 className="t-display md:text-[64px] md:leading-[68px]">A little room <span className="t-italic">for you.</span></h1>
            <p className="mt-5 max-w-[580px] text-[19px] leading-8 text-ink-muted">Gentle routine coaching for mothers of babies and toddlers. Half an hour a week, with a mother who’s living it too.</p>
            <div className="mt-7 flex max-w-[440px] flex-col gap-3 sm:flex-row sm:max-w-none">
              <ButtonMain to="/fit-check" className="sm:w-auto">Book a free hello call</ButtonMain>
              <Link to="/book" search={{ demo: "manchester" }} className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-line-strong px-6 text-[17px] font-semibold">Try it as a mama in Manchester</Link>
            </div>
          </div>
          <Drawing name="illo-her-half-hour" className="home-steam w-full" />
        </section>

        <section id="what-i-offer" className="section-reveal border-y border-line bg-paper">
          <div className="mx-auto max-w-[1120px] px-5 py-16 md:py-24">
            <h2 className="t-title md:text-[40px] md:leading-[44px]">What I offer</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {offers.map((offer) => <Card key={offer.title} className="flex min-h-[210px] flex-col justify-between gap-6 p-6"><Icon name={offer.icon} size={42} /><div><h3 className="t-heading">{offer.title}</h3><p className="mt-2 text-ink-muted">{offer.copy}</p></div></Card>)}
            </div>
          </div>
        </section>

        <section id="who-its-for" className="section-reveal mx-auto grid max-w-[1120px] gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div><h2 className="t-title md:text-[40px] md:leading-[44px]">Who it’s for</h2><p className="mt-5 text-[19px] leading-8">Mothers of babies and toddlers up to 3 who want a calmer day.</p><p className="mt-4 text-ink-muted">It’s not baby sleep or feeding advice, and it’s not medical care.</p></div>
          <div id="meet-the-coach" className="border-l-4 border-peach pl-6"><p className="t-caption text-ink-muted">Meet the coach</p><h2 className="t-title mt-2">I’m a mother of a baby too, one nap ahead, not an expert.</h2><p className="mt-4">I help you find a little room in your own day.</p></div>
        </section>

        <section className="section-reveal bg-sunk">
          <div className="mx-auto max-w-[1120px] px-5 py-16 md:py-24"><h2 className="t-title md:text-[40px] md:leading-[44px]">How it works</h2><div className="mt-8 grid gap-8 md:grid-cols-3">{steps.map(([number, title, copy]) => <div key={number} className="border-t-2 border-line-strong pt-5"><span className="t-heading">{number}</span><h3 className="t-heading mt-5">{title}</h3><p className="mt-2 text-ink-muted">{copy}</p></div>)}</div></div>
        </section>

        <section id="prices" className="section-reveal mx-auto max-w-[1120px] px-5 py-16 md:py-24">
          <h2 className="t-title md:text-[40px] md:leading-[44px]">Prices</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2"><Card className="p-6"><p className="t-caption text-ink-muted">Hello call</p><p className="t-title mt-3">Free</p><p className="mt-2 text-ink-muted">20 minutes.</p></Card><Card offset="peach" className="p-6"><p className="t-caption">Make Room</p><p className="t-title mt-3">US$120 or PKR 12,000</p><p className="mt-2">Founding price US$80.</p></Card></div>
        </section>

        <section id="faq" className="section-reveal border-t border-line bg-paper">
          <div className="mx-auto max-w-[760px] px-5 py-16 md:py-24"><h2 className="t-title md:text-[40px] md:leading-[44px]">FAQ</h2><div className="mt-8 divide-y divide-line">{[
            ["What happens in a hello call?", "We meet for 20 minutes and see whether Make Room feels right."],
            ["What is Make Room?", "Four half hours, one a week, focused on your own day and routine."],
            ["What if the baby wakes?", "Tap Baby’s up and pick another time. Moving is always free."],
            ["Is this baby sleep or feeding advice?", "No. I coach your own day. Your baby’s doctor is the right person to ask about sleep, feeding or health."],
            ["Where do calls happen?", "On video. Times are shown in your time zone."],
          ].map(([question, answer]) => <details key={question} className="group py-5"><summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-4 font-semibold"><span>{question}</span><span aria-hidden className="text-2xl">+</span></summary><p className="mt-3 pr-10 text-ink-muted">{answer}</p></details>)}</div></div>
        </section>
      </main>
    </WebsitePage>
  );
}
