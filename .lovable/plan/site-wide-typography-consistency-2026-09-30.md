# Site-wide typography consistency

## Goal
Keep the approved Fraunces and Figtree character while making headings, body text, captions, labels, buttons, times, and compact data consistent across the public site, booking flow, and coach views.

## Changes
- Audit every content screen in day and night mode at phone, tablet, and desktop widths.
- Keep Fraunces exclusively for the established display, title, and heading roles; keep Figtree for body copy, controls, labels, captions, and times.
- Replace repeated one-off font sizes, weights, line heights, and letter spacing with a small shared type scale in the global styles.
- Preserve intentional exceptions where space requires compact text, especially the calendar grid and mobile controls.
- Remove unintended letter spacing and normalize uppercase labels to the approved caption treatment.
- Check heading order and ensure buttons, fields, navigation, prices, cards, and status text use the same hierarchy everywhere.
- Record the final typography rules in the project documentation.

## Verification
- Visually compare key public, booking, confirmation, management, and coach screens at 360 px and 1280 px widths.
- Confirm both themes use the loaded Fraunces variable font and Figtree weights without fallback inconsistencies.
- Run the existing tests and confirm the preview builds cleanly.
