# Fit check: intro line on the first question

## What changes
On the first fit-question screen only, show the line above the question:

> Four quick questions first, so your hello call is time well spent.

- Shown under the progress bar, before the question heading; a quiet, muted body line.
- Questions 2–4 stay exactly as they are.
- No other screen, flow or logic changes.

## Verification
- Playwright: open the fit check, confirm the line on question 1 and its absence on question 2; run `bun run test` and `bunx tsgo --noEmit`.
