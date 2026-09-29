import { describe, expect, it } from "vitest";
import { FIT_QUESTIONS } from "./fit-check";

describe("the four-tap fit check", () => {
  it("has one fitting answer on every screen", () => {
    expect(FIT_QUESTIONS).toHaveLength(4);
    expect(FIT_QUESTIONS.map((question) => question.choices.filter((choice) => choice.fits).length)).toEqual([1, 1, 1, 1]);
  });

  it("gives a reason and pointer for every non-fitting answer", () => {
    const nonFitting = FIT_QUESTIONS.flatMap((question) => question.choices.filter((choice) => !choice.fits));
    expect(nonFitting).toHaveLength(4);
    for (const choice of nonFitting) {
      expect(choice.reason).toBeTruthy();
      expect(choice.pointer).toBeTruthy();
    }
  });

  it("points baby sleep or feeding questions to the baby’s doctor", () => {
    const support = FIT_QUESTIONS.find((question) => question.id === "support");
    expect(support?.choices[1].pointer).toBe("Your baby’s doctor is the right person to ask.");
  });

  it("contains no stored answer keys or form fields", () => {
    const serialised = JSON.stringify(FIT_QUESTIONS);
    expect(serialised).not.toContain("email");
    expect(serialised).not.toContain("name\"");
  });
});