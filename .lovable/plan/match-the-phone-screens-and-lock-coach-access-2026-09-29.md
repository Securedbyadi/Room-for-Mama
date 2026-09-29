# Match the phone screens and lock coach access

## What will change

- Keep the existing wide desktop website and its navigation.
- Keep both hero actions on one row at desktop widths while allowing them to stack safely on phones.
- Wrap scroll-linked reveal styling in `@supports (animation-timeline: view())`; unsupported browsers will show every section normally.
- Replace em dashes in every page title and social title with a simple separator.
- Restrict every coach-only server action to the verified account `adilmushtaq088@gmail.com`; remove first-user role claiming and remove public account creation from the coach sign-in page.
- Match the supplied phone references for You’re in, Baby’s up, Make Room, and Coach Today: branded top bars, artwork placement, type hierarchy, cards, actions, spacing, bottom sheet, and coach bottom navigation.
- Apply the same phone presentation to the real manage flow, not only demo pages, while leaving desktop website and booking behavior intact.

## Technical details

- Coach authorization will check the authenticated, verified email on the server before any role or private-data access. Existing coach role rows will be cleared so only the named account can reclaim the coach role.
- Shared phone-only chrome and semantic design tokens will be reused rather than duplicating page markup.
- The desktop breakpoint will preserve the current website shell; phone-specific layouts will activate below it.
- Existing business logic, time engine, real booking actions, and demo isolation will remain unchanged.

## Verification

- Run the existing test suite and check the current build result.
- Test coach access with the allowed email logic and rejection behavior.
- Compare phone screenshots of all four requested views against the supplied references, including night mode for Baby’s up.
- Check the home page at desktop width for unchanged navigation and one-line hero actions.
