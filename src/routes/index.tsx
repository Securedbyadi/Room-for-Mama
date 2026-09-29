import { createFileRoute, Link } from "@tanstack/react-router";
import { Drawing, Icon, Page } from "@/components/rfm/brand";
import { SafetyNote } from "@/components/rfm/SafetyNote";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Room for Mama · A little room for you" },
      { name: "description", content: "Gentle routine coaching for mothers of babies and toddlers. Half an hour a week, with a mother who’s living it too." },
      { property: "og:title", content: "Room for Mama · A little room for you" },
      { property: "og:description", content: "Gentle routine coaching for mothers of babies and toddlers. Book a free hello call." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <Page tag="Hello call · free">
      <Drawing name="her-half-hour" alt="A mother holding a warm cup of tea" height={290} className="h-[290px]" />
      <h1 className="t-display mt-8">A little room <em className="font-semibold">for you.</em></h1>
      <p className="mt-4">Gentle routine coaching for mothers of babies and toddlers. Half an hour a week, with a mother who’s living it too.</p>
      <Link to="/book" className="focus-ring mt-6 flex h-14 w-full items-center justify-center rounded-full bg-primary text-[17px] font-semibold text-primary-foreground">
        Book a free hello call
      </Link>
      <div className="mt-6 flex items-center justify-between">
        <a href="#how" className="focus-ring underline underline-offset-4">How it works</a>
        <span className="flex h-12 items-center gap-2 rounded-full bg-sunk px-4 text-[15px] font-semibold"><Icon name="half-hour" size={22} />20 minutes, free</span>
      </div>
      <div id="how" className="mt-6 flex gap-4 border-t border-line pt-6">
        <Icon name="babys-up" size={44} />
        <div><h2 className="t-heading">Babies don’t read calendars.</h2><p className="text-ink-muted">Move any call in two taps. No need to explain.</p></div>
      </div>
      <SafetyNote />
    </Page>
  );
}
