import { createFileRoute } from "@tanstack/react-router";
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

function Home() {
  return (
    <WebsitePage home>
      <main><HomeHero /></main>
    </WebsitePage>
  );
}
