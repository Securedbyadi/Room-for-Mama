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

- Tests: `bun run test` (vitest) uses its own vitest.config.ts, separate from the app build config, so the app plugins stay out of tests.
- The public home page uses a wide website shell; booking and coach routes keep the narrow app shell so their established flows remain stable.
- Theme preference is device-local only, defaults to Auto, and is applied on the root element before paint to avoid a colour flash.
- Mother actions go through createServerFn in src/lib/mother.functions.ts and check a manage token (hashed on mothers, raw token only in service-only mother_links for email links); visitors never read tables.
- Coach actions live in src/lib/coach.functions.ts behind requireSupabaseAuth plus has_role('coach'); the first signed-in account claims the coach role, nobody after. Why: no hardcoded coach email.
- The real coach app is /coach (under _authenticated); the sample one is /demo/coach and uses demo rows only.
- Automations run in src/lib/automations.server.ts via /api/public/hooks/tick (pg_cron every 5 min) and /digest (02:00 UTC), authorised by the service-only cron_keys row. Emails go to email_outbox until an email domain exists.
- Double-booking is refused by the calls exclusion constraint on [starts_at, blocked_until); blocked_until = ends_at + buffer, set by trigger.
