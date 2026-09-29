import { createFileRoute } from "@tanstack/react-router";
import { ButtonMain, Page } from "../components/rfm/brand";

export const Route = createFileRoute("/manage/")({
  head: () => ({
    meta: [
      { title: "Manage my calls | Room for Mama" },
      { name: "description", content: "Your calls are behind the link in your Room for Mama email." },
      { property: "og:title", content: "Manage my calls | Room for Mama" },
      { property: "og:description", content: "Your calls are behind the link in your Room for Mama email." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <Page>
      <h1 className="t-title">Manage my calls</h1>
      <p>Your calls are behind the link in your “You’re in” email. Open it to move, pay or cancel. No password needed.</p>
      <ButtonMain to="/fit-check">Book a free hello call</ButtonMain>
    </Page>
  ),
});
