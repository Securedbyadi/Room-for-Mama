# Animated drawings and step navigation

- Use the matching files in `public/brand/animated` everywhere a drawing appears, loaded as images without redrawing or restyling them.
- Keep the existing drawing sizes, cards and page layouts. Use the static matching file from `public/brand/drawings` when reduced motion is enabled.
- Remove the old page-level steam animation because motion now belongs inside the supplied animated files.
- Keep the horizontal logo unchanged. Use `public/brand/animated/rfm-mark.svg` only when the mark appears by itself.
- Survey and booking steps have back and forward arrow controls. Forward remains disabled until the current answer or required fields are complete.
- Returning to an earlier step preserves the mother’s answers and entered details.