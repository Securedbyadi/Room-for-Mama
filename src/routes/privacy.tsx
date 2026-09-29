import { createFileRoute } from "@tanstack/react-router";
import { Card, Page } from "../components/rfm/brand";
import { SafetyNote } from "../components/rfm/SafetyNote";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Room for Mama" },
      { name: "description", content: "What Room for Mama keeps, why, and how to delete it." },
      { property: "og:title", content: "Privacy — Room for Mama" },
      { property: "og:description", content: "What Room for Mama keeps, why, and how to delete it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <Page>
      <h1 className="t-title">What I keep</h1>
      <Card className="flex flex-col gap-3">
        <p>Your first name, email and, if you gave it, your phone number. I use them to send your call details and nothing else.</p>
        <p>Your time zone, city, and the days and times you said suit you. Never the words you wrote.</p>
        <p>Your calls, moves and payment references, so we both know where things stand.</p>
        <p>The fit questions before booking are never kept.</p>
      </Card>
      <h2 className="t-heading">How to delete it</h2>
      <p>Open the link in any email from me and tap “Delete my details”. Everything about you goes, straight away.</p>
      <SafetyNote />
    </Page>
  );
}
