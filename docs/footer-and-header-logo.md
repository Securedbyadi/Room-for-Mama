# Footer panel and scroll-revealing header logo

## Logos
The supplied set replaces the brand files in `public/brand/logo`, used as shipped:
- `primary_logo-1.svg` → `rfm-logo-horizontal.svg` (day), `primary_logo-6.svg` → `-night`
- `secondary_stacked-1/6.svg` → `rfm-logo-stacked(.night).svg`
- `white_wordmark-1/6.svg` → `rfm-wordmark(.night).svg`
- `logomark-1.svg` → `rfm-mark.svg`, `rfm-mark-badge.svg`, `public/favicon.svg`

Phones keep the stacked lockup on the home page; 1024 px and up use the horizontal one.

## Header
`HeaderLogo` in `brand.tsx` cross-fades the mark and the full lockup in one grid cell, so the
header does not jump. `WebsiteHeader` is sticky on every page and adds its hairline and blur
once `window.scrollY > 24`, which is also when the full lockup fades in (320 ms, off under
reduced motion).

## Footer
Rounded sunk panel (48 px top corners, 32 px on phones) on the page colour, with a clipped
560 px butter circle behind the top-left corner and a 56 px peach dot top right. Two columns
(1.2fr / 0.8fr, 40 px gap) collapse to one on phones. Left: an offset-print card (paper, 2 px
ink border, 22 px radius, 6 px peach shadow, −1.2°) with the tea-warm drawing at 150 px, the
"A little room for you." heading, the hello-call line and ButtonMain. Right: Explore and Your
calls columns, 40 px rows with hairline rules. Below: SafetyNote on a paper card, then the
small horizontal logo and the copyright line. Night mode follows the site tokens; the
`band-ink` class is gone.
