import { useRouter } from 'next/router'

/**
 * openZro brand lockup: the violet disc icon (themed via its own
 * gradients for light + dark) plus the wordmark with a heavier,
 * violet middle Z per the CLAUDE.md brand spec.
 *
 * /ipa/* routes (the API reference) get an `· API` suffix so the
 * surface is distinguishable without maintaining a second logo file.
 */
export function Logo() {
  const router = useRouter()
  const isApi = router.route.startsWith('/ipa')

  return (
    <span className="inline-flex items-center gap-2 select-none">
      <img
        src="/docs-static/img/logo/openzro-icon.svg"
        alt=""
        height={28}
        width={28}
        className="h-7 w-7"
      />
      <span
        className="font-semibold text-zinc-900 dark:text-white tracking-[-0.025em] leading-none text-lg"
        style={{ fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif' }}
      >
        open
        <span className="font-bold text-violet-600 dark:text-violet-400">
          Z
        </span>
        ro
        {isApi && (
          <span className="ml-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            API
          </span>
        )}
      </span>
    </span>
  )
}
