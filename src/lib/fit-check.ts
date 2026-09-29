export type FitQuestionId = "age" | "support" | "language" | "time";

export interface FitChoice {
  label: string;
  fits: boolean;
  reason?: string | undefined;
  pointer?: string | undefined;
}

export interface FitQuestion {
  id: FitQuestionId;
  question: string;
  choices: [FitChoice, FitChoice];
}

export const FIT_QUESTIONS: FitQuestion[] = [
  {
    id: "age",
    question: "Is your little one between newborn and 3 years old?",
    choices: [
      { label: "Yes", fits: true },
      {
        label: "No",
        fits: false,
        reason: "I work with mothers of babies and toddlers up to 3.",
        pointer: "A local family support service may be a better place to start.",
      },
    ],
  },
  {
    id: "support",
    question: "What would you like help with?",
    choices: [
      { label: "My own day and routine", fits: true },
      {
        label: "My baby’s sleep or feeding",
        fits: false,
        reason: "I coach your own day and routine, not your baby’s sleep or feeding.",
        pointer: "Your baby’s doctor is the right person to ask.",
      },
    ],
  },
  {
    id: "language",
    question: "Are you happy to talk in English or Urdu?",
    choices: [
      { label: "Yes", fits: true },
      {
        label: "No",
        fits: false,
        reason: "Calls are in English or Urdu.",
        pointer: "A coach who speaks your preferred language may feel easier.",
      },
    ],
  },
  {
    id: "time",
    question: "Can you keep half an hour a week, on video?",
    choices: [
      { label: "Yes", fits: true },
      {
        label: "No",
        fits: false,
        reason: "Make Room needs half an hour a week, on video.",
        pointer: "You’re welcome to come back when that feels possible.",
      },
    ],
  },
];