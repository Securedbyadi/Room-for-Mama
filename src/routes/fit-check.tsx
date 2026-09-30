import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BackButton, ButtonOutline, Drawing, Icon, Page, StepArrows } from "../components/rfm/brand";
import { SafetyNote } from "../components/rfm/SafetyNote";
import { FIT_QUESTIONS, fitOutcome, type FitChoice } from "../lib/fit-check";

export const Route = createFileRoute("/fit-check")({
  head: () => ({
    meta: [
      { title: "A quick fit check | Room for Mama" },
      { name: "description", content: "Four quick questions before you choose a hello call." },
      { property: "og:title", content: "A quick fit check | Room for Mama" },
      { property: "og:description", content: "Four quick questions before you choose a hello call." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FitCheck,
});

function FitCheck() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [notFit, setNotFit] = useState<FitChoice | null>(null);
  const [answers, setAnswers] = useState<(FitChoice | undefined)[]>([]);
  const question = FIT_QUESTIONS[step];
  const stepIllustrations = [
    <Drawing key="baby" name="illo-baby-up" className="form-illustration" bare />,
    <Drawing key="day" name="illo-her-half-hour" className="form-illustration home-steam" bare />,
    <div key="language" className="language-icon-card grid aspect-square place-items-center"><Icon name="icon-hello-call" size={96} /></div>,
    <Drawing key="video" name="illo-the-chair" className="form-illustration" bare />,
  ];

  const continueFrom = (choice: FitChoice) => {
    const outcome = fitOutcome(step, choice);
    if (outcome.kind === "not-fit") {
      setNotFit(outcome.choice);
      return;
    }
    if (outcome.kind === "book") {
      void navigate({ to: "/book" });
      return;
    }
    setStep(outcome.step);
  };

  const choose = (choice: FitChoice) => {
    const next = [...answers];
    next[step] = choice;
    setAnswers(next);
  };

  if (notFit) {
    return (
      <Page illustration={<Drawing name="illo-tea-cold" className="final-illustration" bare />}>
        <BackButton onClick={() => setNotFit(null)} label="Back to the question" />
        <div>
          <p className="t-caption mb-2 text-ink-muted">Not the right fit just now</p>
          <h1 className="t-title">Thank you for checking.</h1>
          <p className="mt-4">{notFit.reason}</p>
          <p className="mt-3 text-ink-muted">{notFit.pointer}</p>
        </div>
        <div className="mt-auto flex flex-col gap-4 pt-4">
          <ButtonOutline onClick={() => { setNotFit(null); setStep(0); setAnswers([]); }}>Start again</ButtonOutline>
          <SafetyNote />
        </div>
      </Page>
    );
  }

  if (!question) return null;

  return (
    <Page illustration={stepIllustrations[step]}>
      <StepArrows
        onBack={() => step > 0 ? setStep(step - 1) : void navigate({ to: "/" })}
        onForward={() => {
          const choice = answers[step];
          if (choice) continueFrom(choice);
        }}
        forwardDisabled={!answers[step]}
        backLabel={step > 0 ? "Previous question" : "Back to home"}
        forwardLabel={step === FIT_QUESTIONS.length - 1 ? "Continue to booking" : "Next question"}
      />
      <div>
        <p className="t-caption text-ink-muted">{step + 1} of {FIT_QUESTIONS.length}</p>
        <div className="mt-3 grid grid-cols-4 gap-2" aria-hidden>
          {FIT_QUESTIONS.map((item, index) => <span key={item.id} className={`h-2 rounded-full ${index <= step ? "bg-sage" : "bg-sunk"}`} />)}
        </div>
      </div>
      {step === 0 && <p className="mt-4 text-ink-muted">Four quick questions first, so your hello call is time well spent.</p>}
      <h1 className="t-title">{question.question}</h1>
      <div className="mt-auto flex flex-col gap-3 pt-8">
        {question.choices.map((choice) => {
          const on = answers[step] === choice;
          return (
            <ButtonOutline key={choice.label} aria-pressed={on} onClick={() => choose(choice)} className={`min-h-16 justify-between text-left ${on ? "!border-[#34402A] !bg-butter !text-[#34402A] shadow-[4px_4px_0_var(--peach)]" : ""}`}>
              <span>{choice.label}</span>
              {on && <Icon name="icon-done" size={24} className="!text-[#34402A]" />}
            </ButtonOutline>
          );
        })}
        <SafetyNote />
      </div>
    </Page>
  );
}