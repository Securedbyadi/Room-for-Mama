import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BabysUpPreview } from "../components/rfm/BabysUpPreview";
import { ButtonMain, ButtonOutline, Card, Drawing, Icon, type IconName } from "../components/rfm/brand";
import { HomeHero, usePkr } from "../components/rfm/HomeHero";
import { WebsitePage } from "../components/rfm/WebsiteChrome";

const desc = "Gentle routine coaching for mothers of babies and toddlers. Half an hour a week, with a mother who’s living it too.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Room for Mama | a little room for you" },
      { name: "description", content: desc },
      { property: "og:title", content: "Room for Mama | a little room for you" },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  const [openFaq, setOpenFaq] = useState(0);
  const pkr = usePkr();
  const offers = [
    { icon: "icon-hello-call" as IconName, chip: "Start here", title: "Hello call", copy: "20 minutes to meet and see if this feels right.", price: "Free", under: "Nothing to pay, nothing to prepare.", ticks: ["20 minutes on video", "In your time zone", "Move it free if the baby wakes"], to: "/fit-check" as const, button: "Book a free hello call", main: true },
    { icon: "icon-make-room" as IconName, chip: "Founding price", title: "Make Room", copy: "Four half hours, one a week, at one steady time.", price: pkr ? "PKR 12,000" : "US$120", under: pkr ? "PKR 8,000 for the first 10 mothers. Elsewhere, US$120 or US$80." : "US$80 for the first 10 mothers. In Pakistan, PKR 12,000 or PKR 8,000.", ticks: ["Four half hours, one a week", "One steady time, in your time", "Baby’s up moves are free"], to: "/make-room" as const, button: "How Make Room works", main: false },
  ];
  const steps: [IconName, string, string][] = [
    ["icon-hello-call", "Hello call", "20 minutes, free, to see if this feels right."],
    ["icon-make-room", "Make Room", "Four half hours, one a week, at one steady time."],
    ["icon-babys-up", "Baby’s up", "If the baby wakes, pick another time. Moving is always free."],
  ];
  const faqs = [
    ["Is Room for Mama medical care?", "No. It’s friendly support for your own day, not medical care."],
    ["What if the baby wakes during my call?", "Tap Baby’s up and pick another time. Moving is always free."],
    ["Can I book from anywhere?", "Yes. Your times are shown in your time zone."],
    ["How do I pay for Make Room?", "Your times are held for 48 hours while you pay."],
  ];
  return (
    <WebsitePage home>
      <main>
        <HomeHero />

        <section className="grid md:grid-cols-2">
          <article className="home-tea section-reveal bg-sunk px-5 py-16 text-center md:py-20">
            <Drawing name="illo-tea-cold" className="mx-auto w-full max-w-[290px] !border-0" />
            <p className="eyebrow mt-6">Before</p>
            <h2 className="t-title mx-auto mt-2 max-w-[390px]">You made tea at seven.<br />It’s still on the counter.</h2>
          </article>
          <article className="home-tea section-reveal bg-butter-soft px-5 py-16 text-center md:py-20">
            <Drawing name="illo-tea-warm" className="mx-auto w-full max-w-[290px] !border-0" />
            <p className="eyebrow mt-6">After</p>
            <h2 className="t-title mx-auto mt-2 max-w-[390px]">Half an hour a week, the<br />tea stays warm.</h2>
          </article>
        </section>

        <section className="section-reveal mx-auto max-w-[1200px] px-5 py-16 md:py-24">
          <p className="eyebrow">What I offer</p>
          <h2 className="section-title mt-3">A hello call, then Make Room.</h2>
          <p className="hero-lead mt-4 max-w-[650px] text-ink-muted">Start with a free 20-minute hello call. If it feels right, Make Room gives you four half hours, one a week.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {offers.map((o) => (
              <Card key={o.title} className="micro-card flex min-h-[330px] flex-col !bg-paper !text-ink p-7">
                <div className="flex items-center justify-between gap-3"><Icon name={o.icon} size={44} /><span className="t-caption rounded-full bg-sunk px-3 py-1">{o.chip}</span></div>
                <h3 className="t-title mt-8 text-ink">{o.title}</h3>
                <p className="mt-2 text-ink-muted">{o.copy}</p>
                <p className="t-display mt-5 text-ink">{o.price}</p>
                <p className="t-caption mt-1 text-ink-muted">{o.under}</p>
                <ul className="mt-5 flex flex-col gap-2">{o.ticks.map((t) => <li key={t} className="flex items-center gap-2"><Icon name="icon-done" size={22} />{t}</li>)}</ul>
                <div className="mt-auto pt-7">{o.main ? <ButtonMain to={o.to} className="md:w-auto">{o.button}</ButtonMain> : <ButtonOutline to={o.to} className="md:w-auto">{o.button}</ButtonOutline>}</div>
              </Card>
            ))}
          </div>
        </section>

        <section className="home-night-band">
          <div className="section-reveal mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-16 xl:grid-cols-2 xl:py-24">
            <div className="min-w-0"><p className="eyebrow">Book at 3 a.m.</p><h2 className="three-am-title mt-3"><span className="inline-block whitespace-nowrap">Awake at 3 a.m.?</span><br /><span className="inline-block whitespace-nowrap">Book then.</span></h2><p className="hero-lead mt-5 max-w-[520px] text-ink-muted">You’ll have a time in a minute.</p><div className="mt-8 max-w-[300px]"><ButtonMain to="/fit-check">Book a free hello call</ButtonMain></div></div>
            <BabysUpPreview />
          </div>
        </section>

        <section className="section-reveal mx-auto max-w-[1200px] px-5 py-16 text-center md:py-24">
          <p className="eyebrow">How it works</p><h2 className="section-title mt-3">Three steps, all in your time.</h2>
          <ol className="relative mt-12 grid gap-10 md:grid-cols-3"><span aria-hidden className="absolute top-7 right-[16%] left-[16%] hidden border-t-2 border-dashed border-line-strong md:block" />{steps.map(([icon,title,copy], index)=><li key={title} className="relative"><span className="inline-grid h-14 w-14 place-items-center rounded-full bg-butter"><Icon name={icon} size={38} /></span><p className="eyebrow mt-5">Step {index+1}</p><h3 className="t-heading mt-1">{title}</h3><p className="mx-auto mt-2 max-w-[260px] text-ink-muted">{copy}</p></li>)}</ol>
        </section>

        <section className="bg-sage-soft"><div className="section-reveal mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24"><Drawing name="illo-her-half-hour" className="home-steam !border-0" /><div><p className="eyebrow">Meet the coach</p><h2 className="section-title mt-3">“I’m a mother of a baby too. One nap ahead, not an expert.”</h2><p className="mt-5 text-ink-muted">I help you find a little room in your own day.</p><p className="mt-5">Sundas, Lahore</p></div></div></section>

        <section className="section-reveal mx-auto grid max-w-[1200px] gap-10 px-5 py-16 md:grid-cols-[360px_minmax(0,1fr)] md:py-24"><div><p className="eyebrow">Questions</p><h2 className="section-title mt-3">Questions mothers ask</h2></div><div className="divide-y divide-line border-t border-line">{faqs.map(([q,a],i)=><div key={q} className="py-5"><button type="button" onClick={()=>setOpenFaq(openFaq===i?-1:i)} aria-expanded={openFaq===i} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 text-left font-semibold"><span>{q}</span><span className="text-2xl" aria-hidden>{openFaq===i?"−":"+"}</span></button>{openFaq===i&&<p className="anim-fade mt-3 max-w-[620px] text-ink-muted">{a}</p>}</div>)}</div></section>

        <section className="bg-butter px-5 py-16 text-center md:py-20"><h2 className="section-title text-[#34402A]">Make a little room <span className="t-italic">for you</span><br />this week.</h2><p className="mt-3 text-[#34402A]">A free 20-minute hello call, in your time zone.</p><div className="mx-auto mt-7 max-w-[300px]"><ButtonMain to="/fit-check" className="!bg-[#34402A] !text-[#F6EEE3]">Book a free hello call</ButtonMain></div></section>
      </main>
    </WebsitePage>
  );
}
