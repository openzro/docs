import * as React from 'react'
import Script from 'next/script'

/**
 * Google Tag Manager wrapper. Off by default in this fork — the
 * upstream hard-coded their container ID, which sent every visitor
 * of a self-host docs deployment to NetBird's GTM. To enable for an
 * openZro-operated deployment, set NEXT_PUBLIC_GTM_ID at build time.
 * Both the head script and the noscript iframe render nothing when
 * the env var is unset.
 */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || ''

export const GoogleTagManagerHeadScript = () => {
  if (!GTM_ID) return null
  return (
    <Script id="gtm-script" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
       })(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  )
}

export const GoogleTageManagerBodyScript = () => {
  if (!GTM_ID) return null
  return (
    <noscript>
      <iframe
        title="Google Tag Manager"
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
