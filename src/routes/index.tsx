import { createFileRoute } from "@tanstack/react-router";
import { ButtonMain, Drawing, Page } from "../components/rfm/brand";
import { SafetyNote } from "../components/rfm/SafetyNote";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Room for Mama — a little room for you" },
      {
        name: "description",
        content:
          "Gentle routine coaching for mothers of babies and toddlers. Half an hour a week, with a mother who’s living it too.",
      },
      { property: "og:title", content: "Room for Mama — a little room for you" },
      {
        property: "og:description",
        content:
          "Gentle routine coaching for mothers of babies and toddlers. Half an hour a week, with a mother who’s living it too.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <Page>
      <div className="mt-4">
        <h1 className="t-display">
          A little room <span className="t-italic">for you.</span>
        </h1>
        <p className="mt-4 text-ink-muted">
          Gentle routine coaching for mothers of babies and toddlers. Half an
          hour a week, with a mother who’s living it too.
        </p>
      </div>

      <Drawing name="illo-her-half-hour" />

      <div className="mt-auto flex flex-col gap-4 pt-6">
        <ButtonMain to="/book">Book a free hello call</ButtonMain>
        <SafetyNote />
      </div>
    </Page>
  );
}
