# Keep the split form layout, with a light polish pass

## Decision
The fit-check and booking forms keep the current layout: the drawing on the left on desktop, the one-column form (max 480 px) on the right. No centring change.

## What changes (polish only)
1. **Drawing size:** cap the left-side drawing at about 240 px tall on desktop (currently ~270 px) so the form gets a touch more breathing room. Keep the butter glow hugging the drawing. Tablets and phones are unchanged.
2. **Vertical balance:** the drawing sits vertically centred in its half so it doesn't pull attention to the top on tall steps.

## What stays the same
- All steps keep their assigned drawings (illo-baby-up, illo-her-half-hour, icon-hello-call, illo-the-chair, illo-tea-cold).
- No white background behind drawings, back/forward arrows, sticky phone button, motion list, copy, routes and booking behaviour all unchanged.

## Verification
- Playwright checks at 1280 px and 725 px: drawing size, form centred in its column, no overflow; day and night.
- `bun run test` and typecheck stay clean.

## Housekeeping
- Record the decision in docs (the user asked every plan context be kept) and push to GitHub.
