# Room for Mama website and fit check

## What will change

- Turn the mother-facing home page into a complete website, while keeping the existing booking pages, Make Room flow, coach app, time engine, drawings, icons, and shared parts.
- Keep the home content in one page because the requested top-bar links point to sections on that home page.
- Add a separate four-screen fit check before `/book`, so the existing booking flow remains unchanged.

## Mother-facing website

- Add a wide desktop header with the supplied logo, links to What I offer, Who it’s for, Prices, and FAQ, plus the main booking button.
- Build the home page to 1120 px wide with:
  - the approved hero copy and tea drawing
  - What I offer: free 20-minute hello call and Make Room
  - Who it’s for, including the clear boundaries around baby sleep, feeding, and medical care
  - How it works in three steps
  - Prices: US$120 / PKR 12,000 and founding price US$80
  - a concise FAQ based only on the approved brief
  - the SafetyNote and location-appropriate helpline fallback in the footer
- Use the existing colours, typography, supplied artwork, and offset-print treatment without changing the booking or coach visual language.

## Phone experience

- Reflow the same home content into one column.
- Replace desktop navigation with a compact menu shown as a bottom sheet.
- Keep a sticky “Book a free hello call” button at the bottom, with safe spacing so it does not cover content.
- Leave the existing booking pages in their current narrow phone layout.

## Four-tap fit check

- Add a new mother-facing route opened by every public booking button.
- Show one question per screen with two large tap choices and visible progress.
- Keep answers only in the current screen state; do not store or send them.
- Matching answers continue directly to the existing `/book` flow.
- Any non-matching answer opens a kind not-the-right-fit page with:
  - one short reason specific to that answer
  - the doctor pointer for baby sleep or feeding
  - the SafetyNote and helpline fallback
- Keep the questions strictly to age, support type, language, and weekly video availability.

## Verification

- Add tests for all fitting and non-fitting answer paths, including that nothing is persisted.
- Check desktop and phone layouts, the menu bottom sheet, sticky booking button, fit check, and handoff into `/book`.
- Confirm every new content route has its own title, description, social title, social description, `og:type`, and Twitter card metadata.
- Run the existing time-engine and screen tests and confirm the preview builds cleanly.

## Technical details

- Add focused shared website/header/footer and fit-check parts rather than widening the existing 480 px booking `Page` wrapper.
- Use typed TanStack links for routes and hash links only for the requested sections within the home page.
- Use the existing responsive tokens and supplied brand assets; no database or account changes are needed because fit answers are intentionally not stored.
