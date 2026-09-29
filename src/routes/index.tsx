import { createFileRoute } from "@tanstack/react-router";
import { BabysUpPreview } from "../components/rfm/BabysUpPreview";
import { ButtonMain, Card, Drawing, Icon, type IconName } from "../components/rfm/brand";
import { HomeHero } from "../components/rfm/HomeHero";
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

const STEPS: [IconName, string, string][] = [
  ["icon-mug-done", "Hello call", "20 minutes, free, to see if this feels right."],
  ["icon-mug-next", "Make Room", "Four half hours, one a week, at one steady time."],
  ["icon-mug-waiting", "Baby’s up", "If the baby wakes, pick another time. Moving is always free."],
];

function Home() {
  return (
    <WebsitePage home>
      <main>
        <HomeHero />

        <section className="section-reveal mx-auto grid max-w-[1120px] gap-5 px-5 py-16 md:grid-cols-2 md:py-24">
          <Card className="p-4"><Drawing name="illo-tea-cold" className="!border-0" /><p className="t-heading mt-4 px-2 pb-2">You made tea at seven. It’s still on the counter.</p></Card>
          <Card className="p-4"><Drawing name="illo-tea-warm" className="!border-0" /><p className="t-heading mt-4 px-2 pb-2">Half an hour a week, the tea stays warm.</p></Card>
        </section>

        <section className="band-night">
          <div className="section-reveal mx-auto grid max-w-[1120px] items-center gap-10 px-5 py-16 md:grid-cols-[minmax(0,1fr)_auto] md:py-24">
            <div className="max-w-[520px]">
              <h2 className="t-title md:text-[40px] md:leading-[44px]">Awake at 3 a.m.? Book then.</h2>
              <p className="mt-4 text-[19px] leading-8 text-ink-muted">You’ll have a time in a minute.</p>
              <div className="mt-7 max-w-[320px]"><ButtonMain to="/fit-check">Book a free hello call</ButtonMain></div>
            </div>
            <BabysUpPreview />
          </div>
        </section>

        <section className="section-reveal mx-auto max-w-[1120px] px-5 py-16 md:py-24">
          <h2 className="t-title md:text-[40px] md:leading-[44px]">How it works</h2>
          <ol className="relative mt-10 grid gap-10 md:grid-cols-3">
            <span aria-hidden className="absolute top-6 right-[16%] left-[16%] hidden border-t-2 border-dashed border-line-strong md:block" />
            {STEPS.map(([icon, title, copy]) => (
              <li key={title} className="relative md:text-center">
                <span className="relative inline-grid h-12 w-12 place-items-center rounded-full bg-page"><Icon name={icon} size={44} /></span>
                <h3 className="t-heading mt-4">{title}</h3>
                <p className="mt-2 text-ink-muted">{copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="section-reveal border-t border-line bg-paper">
          <div className="mx-auto max-w-[760px] px-5 py-16 md:py-24">
            <p className="t-caption text-ink-muted">Meet the coach</p>
            <h2 className="t-title mt-2 md:text-[40px] md:leading-[44px]">I’m a mother of a baby too. One nap ahead, not an expert.</h2>
          </div>
        </section>
      </main>
    </WebsitePage>
  );
}
