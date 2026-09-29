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

# Project rules

- Time logic lives in pure functions in src/lib/time-engine.ts with Vitest tests; UI and server code call it, never re-implement it. Why: clock-change rules must be proven once.
- Brand SVGs are inlined from public/brand via import.meta.glob raw imports, never redrawn. Why: brand files are final.
- Colours are CSS variables in src/styles.css; night mode follows prefers-color-scheme. Why: one source for day and night.
