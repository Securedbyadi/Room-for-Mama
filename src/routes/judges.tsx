import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, Page } from "../components/rfm/brand";

export const Route = createFileRoute("/judges")({
  head: () => ({
    meta: [
      { title: "For judges | Room for Mama" },
      { name: "description", content: "A short guide to the Room for Mama demo: the home page, a sample booking, the coach’s side and the email previews." },
      { property: "og:title", content: "For judges | Room for Mama" },
      { property: "og:description", content: "A short guide to the Room for Mama demo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Judges,
});

const row = "micro-link flex min-h-12 flex-col justify-center py-2";

function Judges() {
  return (
    <Page>
      <h1 className="t-title">A quick look around</h1>
      <p>This is a public demo. Bookings are sample only, no real emails are sent, and every demo booking is cleared each night.</p>
      <Card className="flex flex-col divide-y divide-line">
        <Link to="/" className={row}><span className="font-semibold underline">Home page</span><span className="t-caption text-ink-muted">The website a mother lands on.</span></Link>
        <Link to="/book" search={{ demo: "manchester" } as never} className={row}><span className="font-semibold underline">Demo booking</span><span className="t-caption text-ink-muted">Try it as a mama in Manchester. Use a made-up email.</span></Link>
        <Link to="/demo/coach" className={row}><span className="font-semibold underline">The coach’s side</span><span className="t-caption text-ink-muted">No login. Tap anything; it resets when you reload.</span></Link>
        <Link to="/emails" className={row}><span className="font-semibold underline">Email previews</span><span className="t-caption text-ink-muted">Every email the app would send.</span></Link>
        <Link to="/manage" className={row}><span className="font-semibold underline">Manage link</span><span className="t-caption text-ink-muted">After a demo booking, “You’re in” opens her own manage link: move, pay or cancel.</span></Link>
      </Card>
      <p className="t-caption text-ink-muted">The real coach app is locked to the coach’s own account.</p>
    </Page>
  );
}
