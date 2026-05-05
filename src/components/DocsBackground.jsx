import { GridPattern } from '@/components/GridPattern'

/**
 * Global page background — the openZro grid motif painted at very
 * low opacity behind every docs page. Fixed position so it stays
 * put on scroll. Light mode renders the grid lines on a clean
 * `bg-page` (white); dark mode uses `bg-page` resolved to
 * `--oz-ink` plus a touch of brand-violet on the highlighted
 * squares.
 *
 * The pattern itself is the same one the HeroPattern uses on the
 * landing page — keeping the visual language consistent across
 * docs and openzro.io.
 */
export function DocsBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-page"
    >
      <GridPattern
        width={72}
        height={56}
        x={-12}
        y={4}
        // No `squares` prop on purpose: GridPattern wraps them in
        // a nested <svg> that resets the fill cascade, so Tailwind
        // `fill-*` on the outer SVG doesn't reach the rects —
        // they end up rendering as solid black against the page
        // bg, which looks horrible. The plain hairline grid (the
        // pattern's stroke) is the right brand identity anyway.
        className={
          'absolute inset-0 h-full w-full ' +
          // Light: hairline violet on white. /15 puts the line at
          // ~5 RGB delta from white — visible at the edge of
          // peripheral vision, invisible under body text.
          'stroke-violet-200/15 ' +
          // Dark: lower alpha on --oz-ink. The deep-violet bg
          // means even /5 registers cleanly.
          'dark:stroke-violet-400/5'
        }
      />
    </div>
  )
}
