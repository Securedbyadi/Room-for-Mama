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
