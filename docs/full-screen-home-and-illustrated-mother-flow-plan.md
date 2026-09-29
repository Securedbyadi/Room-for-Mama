# Full-screen home and illustrated mother flow

## Goal
Match the supplied Room for Mama references while keeping every route, all booking behaviour, and the established copy and safety rules.

## Home
- Replace the long home page with one full-width, full-height hero only.
- Keep the real Room for Mama logo, drawings, icons, day/night colours, grain, 1200 px grid, fixed desktop toggle, phone top-bar toggle, and sticky phone booking button.
- Match the reference composition: headline and supporting actions on the left; butter circle, three precisely sized and rotated cards, and founding-price sticker on the right; three reassurance icons below the action.
- On phones, place the words first and use the swipeable card deck with the next card peeking through.
- Keep the supplied desktop and phone type scales and exact brand files from `public/brand`.

## Card-to-page interaction
- Preserve the three destinations: What I offer, Who it’s for, and Prices and FAQ.
- Make the selected home card visually expand into the destination page using a shared view transition.
- Make each destination begin as the expanded card face, then reveal its page content naturally; Back reverses the relationship.
- Keep a graceful fade where view transitions are unavailable and remove movement for reduced-motion users.

## Mother forms and outcomes
- Keep fit-check, booking, waitlist, You’re in, Make Room, manage, and Baby’s up behaviour unchanged.
- On wider screens, use a two-part presentation: an animated brand illustration on the left and the active question/form on the right.
- On phones, stack the illustration above the form while preserving the current app-style controls and sticky primary action.
- Give each fit-check step and booking splash state a fitting real illustration/icon; give successful and final messages their own animated illustration.
- Keep SafetyNote and country helplines present wherever currently required.

## Motion
- Add restrained micro-interactions to buttons, links, headings, cards, icons, and illustrations: short fades, small rises, gentle icon details, press feedback, and focus/hover responses.
- Keep card dealing, hover lift, card-to-page growth, steam, toggle crossfade, form step transitions, and final-message motion coherent.
- Avoid bounce, flashing, large automatic movement, or layout shift. Disable all non-essential motion under reduced motion; steam remains the only repeating illustration movement otherwise.

## Validation
- Check day and night at desktop and phone sizes against the supplied references.
- Verify card navigation and reverse navigation, all four fit questions, not-a-fit outcomes, booking entry, waitlist, You’re in, Baby’s up, and Make Room.
- Run the existing automated tests and confirm the preview has no build or runtime errors.

## Approved build corrections
- Keep the entire pictured home page below the full-viewport hero: tea comparison, offers and prices, 3 a.m., How it works, coach introduction, four questions, butter call-to-action band, and footer.
- Every public page ends with the footer, SafetyNote, and relevant country helplines.
- Use only the five supplied drawings and 23 supplied icons. Never redraw or split them into animated parts.
- Fit check assignments: baby 0–3 uses `illo-baby-up`; her own day uses `illo-her-half-hour`; English or Urdu uses `icon-hello-call` at 96 px; weekly video uses `illo-the-chair`; not-a-fit uses `illo-tea-cold`.
- Quiet moment and times use `illo-her-half-hour`; waitlist uses `illo-tea-cold`; You’re in uses `illo-tea-warm`; Make Room uses `illo-the-chair`; Baby’s up uses `illo-baby-up`.
- Form drawings fade up 12 px once. Only `#steam` in `illo-her-half-hour` loops.
- Desktop forms use a light drawing card on sunk at left and a one-column form of at most 480 px at right. Phone drawings are 160 px high above the question.
- Micro-interactions only: buttons press to 98% in 120 ms, links shift underlines, ordinary cards lift 4 px, home cards lift 24 px, and focus rings remain. No animated headings or moving icon parts.
- Every approved plan and implementation change remains in the connected GitHub history through Lovable’s automatic sync; plan context is also stored under `docs/`.
