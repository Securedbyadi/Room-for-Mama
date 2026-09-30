<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Tests use `bun run test` with the separate vitest config so app plugins stay out.
- Home uses a compact hero; mother flows split on desktop and stack on phones to match references.
- Approved plans are copied into docs; connected GitHub auto-sync records every change.
- Theme is device-local, defaults to Day (light), and applies before paint to prevent flashing.
- Mother actions use server functions and checked manage tokens; visitors never read tables.
- Coach functions require auth, the coach role, and the verified email adilmushtaq088@gmail.com.
- Real coach app is `/coach`; `/demo/coach` uses only in-memory sample rows.
- Automations use public tick/digest routes, service-only cron keys, and email_outbox pending a domain.
- A calls exclusion constraint on `[starts_at, blocked_until)` prevents double-booking.
- Drawings use animated public SVG images with static reduced-motion fallbacks; the header logo stays horizontal.
- Shared coach UI lives in `CoachDashboard.tsx`; the public sample supplies in-memory rows.
- Calendar feeds use the pure ICS writer and random 48-hex tokens.
- Demo rows use `is_demo=true`; a nightly purge removes them before they can persist.
- Typography uses shared global classes: Fraunces for headings and Figtree elsewhere; compact sizes are limited to dense UI.
