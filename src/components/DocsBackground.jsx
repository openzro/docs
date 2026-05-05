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
          // Tuned by trial against a real monitor. Below ~15% on
          // light mode the grid drops below the human-perception
          // floor (RGB delta ~3 from white) — visually invisible.
          // Above ~30% it competes with body text. The values
          // here were operator-validated.
          'absolute inset-0 h-full w-full ' +
          // Light: faint violet-on-white grid. /15 stroke gives
          // ~5 RGB delta from white — perceptible at the edge of
          // peripheral vision without competing for attention
          // with body text.
          'fill-violet-200/8 stroke-violet-200/15 ' +
          // Dark: low alpha on --oz-ink. Slightly higher floor
          // than light because dark-mode contrast needs more lift
          // to register without becoming aggressive.
          'dark:fill-violet-400/2.5 dark:stroke-violet-400/5'
        }
      />
    </div>
  )
}
