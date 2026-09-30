import { createFileRoute } from "@tanstack/react-router";
import { CoachDashboard } from "../components/coach/CoachDashboard";

export const Route = createFileRoute("/demo/coach")({
  head: () => ({
    meta: [
      { title: "Coach dashboard | Room for Mama" },
      { name: "description", content: "The coach’s side of Room for Mama." },
      { property: "og:title", content: "Coach dashboard | Room for Mama" },
      { property: "og:description", content: "The coach’s side of Room for Mama." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CoachDashboard,
});
