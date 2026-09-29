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
