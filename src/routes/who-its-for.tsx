import { createFileRoute } from "@tanstack/react-router";
import { ButtonMain, Drawing } from "../components/rfm/brand";
import { CardPageHeader, WebsitePage } from "../components/rfm/WebsiteChrome";

const desc = "Mothers of babies and toddlers, 0 to 3, anywhere.";

export const Route = createFileRoute("/who-its-for")({
  head: () => ({
    meta: [
      { title: "Who it’s for | Room for Mama" },
      { name: "description", content: desc },
      { property: "og:title", content: "Who it’s for | Room for Mama" },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WhoItsFor,
});

function WhoItsFor() {
  return (
    <WebsitePage>
      <main>
        <CardPageHeader vt="card-who" title="Who it’s for"><Drawing name="illo-her-half-hour" className="home-steam !border-0" /></CardPageHeader>
        <section className="section-reveal mx-auto grid max-w-[1120px] gap-10 px-5 py-16 md:grid-cols-2">
          <div>
            <p className="text-[19px] leading-8">Mothers of babies and toddlers up to 3 who want a calmer day.</p>
            <p className="mt-4 text-ink-muted">It’s not baby sleep or feeding advice, and it’s not medical care.</p>
            <div className="mt-8 max-w-[360px]"><ButtonMain to="/fit-check">Book a free hello call</ButtonMain></div>
          </div>
          <div className="border-l-4 border-peach pl-6"><p className="t-caption text-ink-muted">Meet the coach</p><h2 className="t-title mt-2">I’m a mother of a baby too. One nap ahead, not an expert.</h2><p className="mt-4">I help you find a little room in your own day.</p></div>
        </section>
      </main>
    </WebsitePage>
  );
}
