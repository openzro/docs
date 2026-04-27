import Script from 'next/script'

/**
 * Matomo tag manager wrapper. Off by default in this fork — the
 * upstream hard-coded their container URL, which sent every visitor
 * of a self-host docs deployment to NetBird's analytics. To enable
 * for an openZro-operated deployment, set
 * NEXT_PUBLIC_MATOMO_CONTAINER_URL at build time. The component
 * renders nothing when the env var is unset.
 */
export function MatomoTagManager({ consentGiven }) {
  const containerURL = process.env.NEXT_PUBLIC_MATOMO_CONTAINER_URL
  if (!containerURL) {
    return null
  }
  return (
    <Script id="matomo-tag-manager" strategy="afterInteractive">
      {`var _paq = window._paq = window._paq || [];
_paq.push(['requireCookieConsent']);
${consentGiven ? "_paq.push(['setCookieConsentGiven']);" : ''}
var _mtm = window._mtm = window._mtm || [];
_mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
(function() {
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.async=true; g.src='${containerURL}'; s.parentNode.insertBefore(g,s);
})();`}
    </Script>
  )
}
