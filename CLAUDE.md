# Room for Mama

Entry for the Contra × Lovable challenge. Due Fri 2 Oct 2026, 11:59 AM PKT.
This repo is synced with a Lovable project (TanStack Start, TypeScript, shadcn/ui, Tailwind). Pushing to `main` updates Lovable and costs no Lovable credits.

## Read first
- `docs/knowledge.md`: the product rules, the words (copy is final) and the look. It is also the Lovable project Knowledge.
- `docs/plan-prompt.md`: the build phases and the time-zone test cases, with their expected results.
- `docs/lovable-plan.md`: Lovable's own plan for this build. Follow it, but in the build order below.
- `docs/screens/*.png`: the visual target (390 x 844 at 2x).
- `public/brand/`: logos, the five drawings and 23 icons. Use them as they are; never redraw, recolour or retype them. Inline the icons so their ink follows `currentColor`.

## Build order (demo first, so it works on Friday)
1. Tokens (day and night), Fraunces (SOFT 100, WONK 1) and Figtree, the offset print, and the shared components: Logo, Icon, Drawing, Button, Slot, MomentField, BookedCard, BabysUpSheet, MakeRoomTimeline, NeedsYouCard, TimeGivenBack, SafetyNote.
2. The time-zone and window engine as pure TypeScript, with the plan's tests as unit tests (vitest). All must pass.
3. The mother's flow on demo data: home, the quiet-moment question, 3 times, name and email, You're in, Make Room, Baby's up.
4. The coach app on demo data: Today, Needs you, Mothers, Rules, Time given back.
5. Only then: saving bookings and sending emails with Lovable Cloud.

Never commit real payment details, the Meet link or the coach's email: this repo is public. They go in the Rules settings in the database.

The copy on the screens and in the Knowledge is used word for word. The safety note goes on every booking screen.
