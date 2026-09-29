# Tidy-up: tests, Baby's up, error pages, copy, waitlist

## 1. Main matches the preview
The preview is built on a working branch. Every change I make syncs to your GitHub repo; once this work is done I'll check the repo's main branch has it. If it doesn't, you'll need to merge it yourself in Lovable (Branches, then Merge), because I can't run merges from here.

## 2. Tests for the booking rules
New tests for the time engine:
- New calls need 6 h notice. Nothing is offered sooner.
- Nothing more than 6 weeks ahead.
- One time per day across the 3 offers.
- Baby's up times are at least 1 h away.
- A new time can't overlap another call or its 10 min buffer, before or after.
- At most 3 calls a day: a day that already has 3 offers nothing.
- Toronto's Make Room plan across the clock change comes with the note she'll see, and the Make Room screen shows it (a screen test).

Add a `test` script (`vitest run`) and make sure every test passes.

## 3. You're in: Baby's up times
The screen already gets its times from the time engine. The gap: the call she's moving isn't treated as taken, so the engine could offer her the same time again. I'll pass the current call (and its buffer) in as busy and check for any leftover date math that adds days.

## 4. 404 and error pages in our voice
Replace the template text with warm, short lines in the coach's voice, with curly apostrophes and the brand's fonts, colours and main button, for example:
- 404: "This page isn’t here." / "Let’s get you back." / button "Back to home"
- Error: "Something went quiet on my side." / "Try again in a moment." / button "Try again"
The lines follow the brief's word rules. The SafetyNote goes in the footer.

## 5. Remove copy that isn't in the brief
Go through every screen and email preview. Keep the brief's copy and the text on the attached screens. Remove anything else: extra subtitles, explanatory lines, demo labels beyond "Try it as a mama in Manchester". Keep only what's needed to use the screen: form labels, the rule captions like "20 min, free", and the zone labels.

## 6. A real waitlist form when no times match
Under "No times match yet. Join the waitlist and I’ll email you when one opens." add a first name field, an email field and a "Join the waitlist" button. The days, times and city she wrote are kept with it. Until Lovable Cloud is on, it saves demo rows only. Then it shows a short confirmation: "You’re on the list. I’ll email you when a time opens." A "Try it" link fills in a message that has no matches, so you can see it.

## Technical details
- Tests in src/lib/time-engine.test.ts. Plus a screen test for Make Room's Toronto note using @testing-library/react with jsdom, installed as dev dependencies.
- booked.tsx: `busy: [...DEMO_BUSY, {start: current, end: current+20m}]`. The engine's buffer handling already applies.
- __root.tsx NotFoundComponent/ErrorComponent use Page/ButtonMain/SafetyNote. The error page keeps its reset/reload behaviour.
- Waitlist: a component in book.tsx that keeps rows in memory for the demo. It moves to the Cloud waitlist table in Phase 3.
