import { createFileRoute } from "@tanstack/react-router";
import { ButtonMain, Card, Drawing, Icon } from "../components/rfm/brand";
import { CardPageHeader, WebsitePage } from "../components/rfm/WebsiteChrome";

const desc = "A free hello call, then Make Room: four half hours, one a week.";

export const Route = createFileRoute("/what-i-offer")({
  head: () => ({
    meta: [
      { title: "What I offer | Room for Mama" },
      { name: "description", content: desc },
      { property: "og:title", content: "What I offer | Room for Mama" },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WhatIOffer,
});

function WhatIOffer() {
  const offers = [
    { icon: "icon-hello-call" as const, title: "A free hello call", copy: "20 minutes to meet and see if this feels right." },
    { icon: "icon-make-room" as const, title: "Make Room", copy: "Four half hours, one a week, for a calmer day of your own." },
  ];
  return (
    <WebsitePage>
      <main>
        <CardPageHeader vt="card-offer" title="What I offer"><Drawing name="illo-the-chair" className="!border-0" /></CardPageHeader>
        <section className="section-reveal mx-auto max-w-[1120px] px-5 py-16">
          <div className="grid gap-5 md:grid-cols-2">
            {offers.map((o) => <Card key={o.title} className="flex min-h-[210px] flex-col justify-between gap-6 p-6"><Icon name={o.icon} size={42} /><div><h2 className="t-heading">{o.title}</h2><p className="mt-2 text-ink-muted">{o.copy}</p></div></Card>)}
          </div>
          <div className="mt-8 max-w-[360px]"><ButtonMain to="/fit-check">Book a free hello call</ButtonMain></div>
        </section>
      </main>
    </WebsitePage>
  );
}
