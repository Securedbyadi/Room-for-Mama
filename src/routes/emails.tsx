import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Chip, Page } from "../components/rfm/brand";
import { SafetyNote } from "../components/rfm/SafetyNote";
import { NOT_A_FIT_NOTE, PLACEHOLDERS } from "../lib/demo-data";

export const Route = createFileRoute("/emails")({
  head: () => ({
    meta: [
      { title: "Email previews | Room for Mama" },
      { name: "description", content: "The branded email template, one action each." },
      { property: "og:title", content: "Email previews | Room for Mama" },
      { property: "og:description", content: "The branded email template, one action each." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Emails,
});

interface EmailDef {
  id: string;
  label: string;
  subject: string;
  body: string[];
  action?: string;
}

const WHEN = "Wednesday 14 October, 11:30 am";

const EMAILS: EmailDef[] = [
  {
    id: "confirmation",
    label: "You’re in",
    subject: "Hello call with Room for Mama",
    body: [
      `You’re in. ${WHEN}, your time.`,
      `Video link: ${PLACEHOLDERS.meetLink}`,
      "If the baby wakes, tap Baby’s up and pick another time. No need to explain.",
    ],
    action: "Add to my calendar",
  },
  {
    id: "keep-my-spot",
    label: "Keep my spot",
    subject: "Tomorrow at 11:30 am, your time. Still good for you?",
    body: ["Tomorrow at 11:30 am, your time. Still good for you?"],
    action: "Keep my spot",
  },
  {
    id: "reminder",
    label: "Reminder",
    subject: "Hello call with Room for Mama",
    body: ["Your hello call starts soon. Tea ready?"],
    action: "Join the call",
  },
  {
    id: "thank-you",
    label: "Thank you",
    subject: "Thank you for your half hour",
    body: [
      "Thank you for your half hour. Your one small step this week is below.",
      "“Ten minutes with a cup of tea before the school run, every day this week.”",
    ],
  },
  {
    id: "offer",
    label: "Make Room offer",
    subject: "Half hour with Room for Mama",
    body: [
      "It was lovely to meet you. I think Make Room would suit you — four half hours, one a week, at a time that’s already yours.",
    ],
    action: "See your four times",
  },
  {
    id: "not-a-fit",
    label: "Not a fit",
    subject: "Thank you for the hello call",
    body: [NOT_A_FIT_NOTE],
  },
];

function Emails() {
  const [active, setActive] = useState(EMAILS[0]?.id ?? "");
  const email = EMAILS.find((e) => e.id === active) ?? EMAILS[0]!;

  return (
    <Page>
      <div>
        <h1 className="t-title">Emails</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {EMAILS.map((e) => (
          <Chip key={e.id} active={e.id === active} onClick={() => setActive(e.id)}>
            {e.label}
          </Chip>
        ))}
      </div>

      <Card className="flex flex-col gap-4">
        <div>
          <p className="t-caption text-ink-muted">From hello@roomformama.com</p>
          <p className="t-heading mt-1">{email.subject}</p>
        </div>
        {email.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {email.action && (
          <span className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 text-[17px] font-semibold text-primary-foreground">
            {email.action}
          </span>
        )}
        <SafetyNote zone="Asia/Karachi" />
      </Card>
    </Page>
  );
}
