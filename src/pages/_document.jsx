import { Head, Html, Main, NextScript } from 'next/document'
import {GoogleTageManagerBodyScript, GoogleTagManagerHeadScript} from "@/components/GoogleTagManager";

const modeScript = `
  let darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  updateMode()
  darkModeMediaQuery.addEventListener('change', updateModeWithoutTransitions)
  window.addEventListener('storage', updateModeWithoutTransitions)

  function updateMode() {
    let isSystemDarkMode = darkModeMediaQuery.matches
    let isDarkMode = window.localStorage.isDarkMode === 'true' || (!('isDarkMode' in window.localStorage) && isSystemDarkMode)

    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    if (isDarkMode === isSystemDarkMode) {
      delete window.localStorage.isDarkMode
    }
  }

  function disableTransitionsTemporarily() {
    document.documentElement.classList.add('[&_*]:!transition-none')
    window.setTimeout(() => {
      document.documentElement.classList.remove('[&_*]:!transition-none')
    }, 0)
  }

  function updateModeWithoutTransitions() {
    disableTransitionsTemporarily()
    updateMode()
  }
`

export default function Document() {
  return (
    <Html lang="en">
      <Head>
          <GoogleTagManagerHeadScript />
          <script dangerouslySetInnerHTML={{ __html: modeScript }} />
          {/*
            Favicons rendered from public/docs-static/img/openzro-icon.svg:
              - SVG primary for modern browsers (Chrome/Firefox/Edge >=2017)
              - .ico fallback (16x16 + 32x32 + 48x48 + 64x64) for legacy
                user-agents and the Windows tile preview
              - apple-touch-icon for iOS home-screen shortcuts
            Regenerate with:
              rsvg-convert -w 180 -h 180 public/docs-static/img/openzro-icon.svg \
                -o public/docs-static/img/apple-touch-icon.png
              magick /tmp/oz-{16,32,48,64}.png public/docs-static/img/favicon.ico
          */}
          <link rel="icon" type="image/svg+xml" href="/docs-static/img/openzro-icon.svg" />
          <link rel="icon" type="image/x-icon" href="/docs-static/img/favicon.ico" />
          <link rel="apple-touch-icon" href="/docs-static/img/apple-touch-icon.png" />
      </Head>
      <body className="bg-page text-ink antialiased">
        <GoogleTageManagerBodyScript />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
