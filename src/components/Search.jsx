// Pagefind-backed search modal.
//
// At build time `npm run pagefind:index` (chained into build:cf and dev)
// produces `public/pagefind/` (or `out/pagefind/` after static export)
// containing the generated index plus the runtime UI bundle. At
// runtime this component lazy-loads `/pagefind/pagefind-ui.js` the
// first time the user opens search, then mounts the
// PagefindUI widget into a Headless UI Dialog so we keep the same
// modal chrome we always had.
//
// Why Pagefind instead of Algolia: docs.openzro.io is a static
// public site with ~230 pages. Algolia DocSearch is great but adds
// an external dependency and was misconfigured (literal placeholder
// env vars hitting a fake host). Pagefind ships zero-infra search
// that fits the "self-host only" posture of the project.

import { Dialog, Transition } from '@headlessui/react'
import { useRouter } from 'next/router'
import { Fragment, useCallback, useEffect, useState } from 'react'

const PAGEFIND_BASE_URL = '/pagefind/'

// Cache the import promise so multiple modal opens don't re-fetch.
let pagefindUiPromise

function loadPagefindUI() {
  if (pagefindUiPromise) return pagefindUiPromise
  pagefindUiPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('PagefindUI is browser-only'))
      return
    }
    if (window.PagefindUI) {
      resolve(window.PagefindUI)
      return
    }
    const script = document.createElement('script')
    script.src = `${PAGEFIND_BASE_URL}pagefind-ui.js`
    script.async = true
    script.onload = () => {
      if (window.PagefindUI) {
        resolve(window.PagefindUI)
      } else {
        reject(new Error('PagefindUI script loaded but global is missing'))
      }
    }
    script.onerror = () => {
      reject(new Error(`Failed to load ${script.src}`))
    }
    document.head.appendChild(script)

    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = `${PAGEFIND_BASE_URL}pagefind-ui.css`
    document.head.appendChild(css)
  })
  return pagefindUiPromise
}

function SearchModal({ isOpen, onClose }) {
  const router = useRouter()
  const [error, setError] = useState(null)

  // Use a callback ref so we know exactly when the container DOM node
  // mounts/unmounts. This avoids the race condition where useEffect
  // fires before the Headless UI Dialog has rendered its panel and
  // the ref is still null. Pagefind UI is created once per mount and
  // torn down when the panel unmounts — no need to manage isOpen
  // ourselves; Headless UI does that via Transition.Root.
  const containerCallback = useCallback(
    (node) => {
      if (!node) return // unmount handled by Dialog
      let widget
      loadPagefindUI()
        .then((PagefindUI) => {
          if (!node.isConnected) return
          widget = new PagefindUI({
            element: node,
            baseUrl: '/',
            showImages: false,
            showSubResults: true,
            resetStyles: false,
          })

          // Intercept result clicks so Next.js handles routing
          // client-side instead of a full page reload.
          node.addEventListener('click', (e) => {
            const target = e.target.closest('a[href]')
            if (!target) return
            const href = target.getAttribute('href')
            if (!href || href.startsWith('http') || href.startsWith('#'))
              return
            e.preventDefault()
            onClose()
            router.push(href)
          })

          // Auto-focus the search input — matches the previous
          // Algolia modal UX where Cmd-K opened straight to typing.
          requestAnimationFrame(() => {
            node.querySelector('.pagefind-ui__search-input')?.focus()
          })
        })
        .catch((err) => {
          console.error('Pagefind load failed:', err)
          setError(err.message)
        })
    },
    [onClose, router],
  )

  return (
    <Transition.Root show={isOpen} as={Fragment} afterLeave={() => setError(null)}>
      <Dialog onClose={onClose} className="fixed inset-0 z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm dark:bg-zinc-950/60"
            aria-hidden="true"
          />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-20 md:py-32">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-2xl transform-gpu rounded-xl bg-white shadow-xl ring-1 ring-zinc-900/7.5 dark:bg-zinc-900 dark:ring-zinc-700/40">
              <div ref={containerCallback} className="p-2" />
              {error && (
                <div className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  Search is unavailable: {error}
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export function Search() {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  // Cmd-K / Ctrl-K opens search, matching the previous Algolia binding.
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((current) => !current)
      } else if (e.key === '/' && !isOpen) {
        const tag = e.target.tagName?.toLowerCase()
        if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable)
          return
        e.preventDefault()
        setIsOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-zinc-900/2.5 lg:w-72 lg:flex-none lg:rounded-lg lg:py-2.5 lg:pl-4 lg:pr-3 lg:text-sm lg:ring-1 lg:ring-zinc-900/10 lg:hover:ring-zinc-900/20 dark:lg:bg-white/5 dark:lg:ring-inset dark:lg:ring-white/10 dark:lg:hover:bg-white/10"
      >
        <SearchIcon className="h-5 w-5 stroke-current" />
        <span className="sr-only lg:not-sr-only lg:ml-2 lg:text-zinc-500 lg:dark:text-zinc-400">
          Find something...
        </span>
        <kbd className="ml-auto hidden font-medium text-zinc-400 lg:block dark:text-zinc-500">
          <kbd className="font-sans">⌘</kbd>
          <kbd className="font-sans">K</kbd>
        </kbd>
      </button>
      <SearchModal isOpen={isOpen} onClose={close} />
    </>
  )
}

function SearchIcon(props) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12.01 12a4.25 4.25 0 1 0-6.02-6 4.25 4.25 0 0 0 6.02 6Zm0 0 3.24 3.25" />
    </svg>
  )
}

// MobileSearch is the icon-only entry point used in the header on
// narrow viewports where there's no room for the labeled `Search`
// pill. Same modal, same Cmd-K binding — just a different trigger.
export function MobileSearch() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open search"
        className="flex h-6 w-6 items-center justify-center rounded-md transition hover:bg-zinc-900/5 lg:hidden dark:hover:bg-white/5"
      >
        <SearchIcon className="h-5 w-5 stroke-zinc-900 dark:stroke-white" />
      </button>
      <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
