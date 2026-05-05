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
        squares={[
          [3, 2],
          [6, 1],
          [9, 4],
          [12, 2],
          [4, 7],
          [10, 6],
          [14, 5],
          [7, 9],
        ]}
        className={
          // GridPattern wraps highlighted squares in a nested
          // <svg>, and a normal `fill-violet-X/Y` on the outer
          // SVG doesn't reach them through the nested boundary
          // (the rects fall back to default `fill: black`).
          // Workaround: target them explicitly via the arbitrary
          // descendant selector `[&>svg_rect]` so the rule lands
          // on the squares' rects (the first rect with the
          // pattern fill is a direct child of the outer SVG, not
          // of the inner SVG, so it isn't matched).
          'absolute inset-0 h-full w-full ' +
          // Light: hairline grid + faint violet squares.
          'stroke-violet-200/15 [&>svg_rect]:fill-violet-200/15 ' +
          // Dark: even subtler. /2.5 stroke + /5 fill against
          // --oz-ink registers without competing with body text;
          // higher alphas tested as "still aparente" on the deep
          // violet-black bg.
          'dark:stroke-violet-400/2.5 dark:[&>svg_rect]:fill-violet-400/2.5'
        }
      />
    </div>
  )
}
