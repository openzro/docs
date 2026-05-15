"use strict";

// src/vercel-request-context.ts
var SYMBOL_FOR_REQ_CONTEXT = Symbol.for("@vercel/request-context");
function getContext() {
  const fromSymbol = globalThis;
  return fromSymbol[SYMBOL_FOR_REQ_CONTEXT]?.get?.() ?? {};
}

// src/next-request-context.ts
var import_async_hooks = require("async_hooks");
var name = "@next/request-context";
var NEXT_REQUEST_CONTEXT_SYMBOL = Symbol.for(name);
var INTERNAL_STORAGE_FIELD_SYMBOL = Symbol.for("internal.storage");
function getOrCreateContextSingleton() {
  const _globalThis = globalThis;
  if (!_globalThis[NEXT_REQUEST_CONTEXT_SYMBOL]) {
    const storage = new import_async_hooks.AsyncLocalStorage();
    const Context = {
      get: () => storage.getStore(),
      [INTERNAL_STORAGE_FIELD_SYMBOL]: storage
    };
    _globalThis[NEXT_REQUEST_CONTEXT_SYMBOL] = Context;
  }
  return _globalThis[NEXT_REQUEST_CONTEXT_SYMBOL];
}
var NextRequestContext = getOrCreateContextSingleton();
function withNextRequestContext(value, callback) {
  const storage = NextRequestContext[INTERNAL_STORAGE_FIELD_SYMBOL];
  return storage.run(value, callback);
}

// src/edge-function-source/to-plain-headers.ts
function toPlainHeaders(headers) {
  const result = {};
  if (!headers)
    return result;
  headers.forEach((value, key) => {
    result[key] = value;
    if (key.toLowerCase() === "set-cookie") {
      result[key] = splitCookiesString(value);
    }
  });
  return result;
}
function splitCookiesString(cookiesString) {
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  function skipWhitespace() {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos)))
      pos += 1;
    return pos < cookiesString.length;
  }
  function notSpecialChar() {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  }
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.substring(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
    }
  }
  return cookiesStrings;
}

// src/middleware-launcher.ts
process.chdir(__dirname);
var region = process.env.VERCEL_REGION || process.env.NOW_REGION;
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = region === "dev1" ? "development" : "production";
}
if (process.env.NODE_ENV !== "production" && region !== "dev1") {
  console.warn(
    `Warning: NODE_ENV was incorrectly set to "${process.env.NODE_ENV}", this value is being overridden to "production"`
  );
  process.env.NODE_ENV = "production";
}
const conf = {"env":{},"typescript":{"ignoreBuildErrors":false},"typedRoutes":false,"distDir":".next","cleanDistDir":true,"assetPrefix":"","cacheMaxMemorySize":52428800,"configOrigin":"next.config.mjs","useFileSystemPublicRoutes":true,"generateEtags":true,"pageExtensions":["js","jsx","ts","tsx","mdx"],"poweredByHeader":true,"compress":false,"images":{"deviceSizes":[640,750,828,1080,1200,1920,2048,3840],"imageSizes":[32,48,64,96,128,256,384],"path":"/_next/image","loader":"default","loaderFile":"","domains":[],"disableStaticImages":false,"minimumCacheTTL":14400,"formats":["image/webp"],"maximumRedirects":3,"maximumResponseBody":50000000,"dangerouslyAllowLocalIP":false,"dangerouslyAllowSVG":false,"contentSecurityPolicy":"script-src 'none'; frame-src 'none'; sandbox;","contentDispositionType":"attachment","localPatterns":[{"pathname":"**","search":""}],"remotePatterns":[],"qualities":[75],"unoptimized":false,"customCacheHandler":false},"devIndicators":{"position":"bottom-left"},"onDemandEntries":{"maxInactiveAge":60000,"pagesBufferLength":5},"basePath":"","sassOptions":{},"trailingSlash":false,"i18n":null,"productionBrowserSourceMaps":false,"excludeDefaultMomentLocales":true,"reactProductionProfiling":false,"reactStrictMode":true,"reactMaxHeadersLength":6000,"httpAgentOptions":{"keepAlive":true},"logging":{"serverFunctions":true,"browserToTerminal":"warn"},"compiler":{},"expireTime":31536000,"staticPageGenerationTimeout":60,"modularizeImports":{"@mui/icons-material":{"transform":"@mui/icons-material/{{member}}"},"lodash":{"transform":"lodash/{{member}}"}},"outputFileTracingRoot":"/home/kleber/Dados/openzro/docs","cacheComponents":false,"cacheLife":{"default":{"stale":300,"revalidate":900,"expire":4294967294},"seconds":{"stale":30,"revalidate":1,"expire":60},"minutes":{"stale":300,"revalidate":60,"expire":3600},"hours":{"stale":300,"revalidate":3600,"expire":86400},"days":{"stale":300,"revalidate":86400,"expire":604800},"weeks":{"stale":300,"revalidate":604800,"expire":2592000},"max":{"stale":300,"revalidate":2592000,"expire":31536000}},"cacheHandlers":{},"experimental":{"appNewScrollHandler":false,"useSkewCookie":false,"cssChunking":true,"multiZoneDraftMode":false,"appNavFailHandling":false,"prerenderEarlyExit":true,"serverMinification":true,"linkNoTouchStart":false,"caseSensitiveRoutes":false,"cachedNavigations":false,"partialFallbacks":false,"dynamicOnHover":false,"varyParams":false,"prefetchInlining":false,"preloadEntriesOnStart":true,"clientRouterFilter":true,"clientRouterFilterRedirects":false,"fetchCacheKeyPrefix":"","proxyPrefetch":"flexible","optimisticClientCache":true,"manualClientBasePath":false,"cpus":31,"memoryBasedWorkersCount":false,"imgOptConcurrency":null,"imgOptTimeoutInSeconds":7,"imgOptMaxInputPixels":268402689,"imgOptSequentialRead":null,"imgOptSkipMetadata":null,"isrFlushToDisk":true,"workerThreads":false,"optimizeCss":false,"nextScriptWorkers":false,"scrollRestoration":false,"externalDir":false,"disableOptimizedLoading":false,"gzipSize":true,"craCompat":false,"esmExternals":true,"fullySpecified":false,"swcTraceProfiling":false,"forceSwcTransforms":false,"largePageDataBytes":128000,"typedEnv":false,"parallelServerCompiles":false,"parallelServerBuildTraces":false,"ppr":false,"authInterrupts":false,"webpackMemoryOptimizations":false,"optimizeServerReact":true,"strictRouteTypes":false,"viewTransition":false,"removeUncaughtErrorAndRejectionListeners":false,"validateRSCRequestHeaders":false,"staleTimes":{"dynamic":0,"static":300},"reactDebugChannel":true,"serverComponentsHmrCache":true,"staticGenerationMaxConcurrency":8,"staticGenerationMinPagesPerWorker":25,"transitionIndicator":false,"gestureTransition":false,"inlineCss":false,"useCache":false,"globalNotFound":false,"browserDebugInfoInTerminal":"warn","lockDistDir":true,"proxyClientMaxBodySize":10485760,"hideLogsAfterAbort":false,"mcpServer":true,"turbopackFileSystemCacheForDev":true,"turbopackFileSystemCacheForBuild":false,"turbopackInferModuleSideEffects":true,"turbopackPluginRuntimeStrategy":"childProcesses","trustHostHeader":true,"optimizePackageImports":["lucide-react","date-fns","lodash-es","ramda","antd","react-bootstrap","ahooks","@ant-design/icons","@headlessui/react","@headlessui-float/react","@heroicons/react/20/solid","@heroicons/react/24/solid","@heroicons/react/24/outline","@visx/visx","@tremor/react","rxjs","@mui/material","@mui/icons-material","recharts","react-use","effect","@effect/schema","@effect/platform","@effect/platform-node","@effect/platform-browser","@effect/platform-bun","@effect/sql","@effect/sql-mssql","@effect/sql-mysql2","@effect/sql-pg","@effect/sql-sqlite-node","@effect/sql-sqlite-bun","@effect/sql-sqlite-wasm","@effect/sql-sqlite-react-native","@effect/rpc","@effect/rpc-http","@effect/typeclass","@effect/experimental","@effect/opentelemetry","@material-ui/core","@material-ui/icons","@tabler/icons-react","mui-core","react-icons/ai","react-icons/bi","react-icons/bs","react-icons/cg","react-icons/ci","react-icons/di","react-icons/fa","react-icons/fa6","react-icons/fc","react-icons/fi","react-icons/gi","react-icons/go","react-icons/gr","react-icons/hi","react-icons/hi2","react-icons/im","react-icons/io","react-icons/io5","react-icons/lia","react-icons/lib","react-icons/lu","react-icons/md","react-icons/pi","react-icons/ri","react-icons/rx","react-icons/si","react-icons/sl","react-icons/tb","react-icons/tfi","react-icons/ti","react-icons/vsc","react-icons/wi"],"isExperimentalCompile":false},"htmlLimitedBots":"[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight","bundlePagesRouterDependencies":false,"configFileName":"next.config.mjs","turbopack":{"root":"/home/kleber/Dados/openzro/docs"},"distDirRoot":".next","_originalRewrites":{"beforeFiles":[],"afterFiles":[{"source":"/","destination":"/introduction"},{"source":"/api","destination":"/ipa/introduction"},{"source":"/api/:path*","destination":"/ipa/:path*"}],"fallback":[]},"_originalRedirects":[{"source":"/slack-url","destination":"https://join.slack.com/t/netbirdio/shared_invite/zt-3rxbnuiyt-vXZxZ6UCjJ8aQLNLXMBJxQ","permanent":false},{"source":"/how-to/networks-concept","destination":"/manage/networks","permanent":true},{"source":"/docs/getting-started/installation","destination":"/get-started/install","permanent":true},{"source":"/docs/overview/personal-access-tokens","destination":"/manage/public-api","permanent":true},{"source":"/docs/overview/acls","destination":"/manage/access-control/manage-network-access","permanent":true},{"source":"/docs/how-to-guides/nameservers","destination":"/manage/dns/internal-dns-servers","permanent":true},{"source":"/how-to/manage-dns-in-your-network","destination":"/manage/dns","permanent":true},{"source":"/docs/how-to-guides/network-routes","destination":"/manage/network-routes","permanent":true},{"source":"/docs/overview/setup-keys","destination":"/manage/peers/register-machines-using-setup-keys","permanent":true},{"source":"/docs/how-to-guides/activity-monitoring","destination":"/manage/activity/traffic-events-logging","permanent":true},{"source":"/docs/how-to-guides/periodic-authentication","destination":"/manage/settings/enforce-periodic-user-authentication","permanent":true},{"source":"/docs/overview/setup-keys","destination":"/manage/peers/register-machines-using-setup-keys","permanent":true},{"source":"/docs","destination":"/","permanent":true},{"source":"/docs/:path*","destination":"/:path*","permanent":true},{"source":"/ipa/:path*","destination":"/api/:path*","permanent":true},{"source":"/selfhosted/self-hosted-vs-cloud-netbird","destination":"/about-netbird/self-hosted-vs-cloud","permanent":true},{"source":"/how-to/manage-network-access","destination":"/manage/access-control/manage-network-access","permanent":true},{"source":"/how-to/manage-posture-checks","destination":"/manage/access-control/posture-checks","permanent":true},{"source":"/how-to/disabling-network-route-when-connecting-from-the-office","destination":"/manage/access-control/posture-checks/connecting-from-the-office","permanent":true},{"source":"/how-to/endpoint-detection-and-response","destination":"/manage/access-control/endpoint-detection-and-response","permanent":true},{"source":"/how-to/crowdstrike-edr","destination":"/manage/access-control/endpoint-detection-and-response/crowdstrike-edr","permanent":true},{"source":"/how-to/sentinelone-edr","destination":"/manage/access-control/endpoint-detection-and-response/sentinelone-edr","permanent":true},{"source":"/how-to/huntress-edr","destination":"/manage/access-control/endpoint-detection-and-response/huntress-edr","permanent":true},{"source":"/how-to/intune-mdm","destination":"/manage/access-control/endpoint-detection-and-response/intune-mdm","permanent":true},{"source":"/how-to/getting-started","destination":"/get-started","permanent":true},{"source":"/how-to/installation","destination":"/get-started/install","permanent":true},{"source":"/how-to/installation/linux","destination":"/get-started/install/linux","permanent":true},{"source":"/how-to/installation/windows","destination":"/get-started/install/windows","permanent":true},{"source":"/how-to/installation/macos","destination":"/get-started/install/macos","permanent":true},{"source":"/how-to/installation/docker","destination":"/get-started/install/docker","permanent":true},{"source":"/how-to/installation/synology","destination":"/get-started/install/synology","permanent":true},{"source":"/how-to/installation/mobile","destination":"/get-started/install","permanent":true},{"source":"/how-to/installation/pfsense","destination":"/get-started/install/pfsense","permanent":true},{"source":"/how-to/installation/opnsense","destination":"/get-started/install/opnsense","permanent":true},{"source":"/how-to/cli","destination":"/get-started/cli","permanent":true},{"source":"/how-to/add-machines-to-your-network","destination":"/manage/peers/add-machines-to-your-network","permanent":true},{"source":"/how-to/approve-peers","destination":"/manage/peers/approve-peers","permanent":true},{"source":"/how-to/register-machines-using-setup-keys","destination":"/manage/peers/register-machines-using-setup-keys","permanent":true},{"source":"/how-to/browser-client","destination":"/manage/peers/browser-client","permanent":true},{"source":"/how-to/ssh","destination":"/manage/peers/ssh","permanent":true},{"source":"/how-to/lazy-connection","destination":"/manage/peers/lazy-connection","permanent":true},{"source":"/how-to/secure-remote-webserver-access","destination":"/manage/peers/access-infrastructure/secure-remote-webserver-access","permanent":true},{"source":"/how-to/setup-keys-add-servers-to-network","destination":"/manage/peers/access-infrastructure/setup-keys-add-servers-to-network","permanent":true},{"source":"/how-to/access-internal-resources-from-autoscaled-environments","destination":"/manage/peers/access-infrastructure/access-internal-resources-from-autoscaled-environments","permanent":true},{"source":"/how-to/peer-approval-for-remote-worker-access","destination":"/manage/peers/access-infrastructure/peer-approval-for-remote-worker-access","permanent":true},{"source":"/how-to/db-workload-migration","destination":"/manage/peers/site-to-site/db-workload-migration","permanent":true},{"source":"/how-to/examples","destination":"/use-cases/cloud/aws-ecs-terraform","permanent":true},{"source":"/how-to/netbird-on-faas","destination":"/use-cases/cloud/netbird-on-faas","permanent":true},{"source":"/how-to/routing-peers-and-kubernetes","destination":"/use-cases/cloud/routing-peers-and-kubernetes","permanent":true},{"source":"/how-to/client-on-mikrotik-router","destination":"/use-cases/homelab/client-on-mikrotik-router","permanent":true},{"source":"/how-to/distributed-multi-cloud-ai-argocd-microk8s-vllm","destination":"/use-cases/cloud/distributed-multi-cloud-ai","permanent":true},{"source":"/how-to/networks","destination":"/manage/networks","permanent":true},{"source":"/how-to/routing-traffic-to-multiple-resources","destination":"/manage/networks/routing-traffic-to-multiple-resources","permanent":true},{"source":"/how-to/accessing-restricted-domain-resources","destination":"/manage/networks/accessing-restricted-domain-resources","permanent":true},{"source":"/how-to/accessing-entire-domains-within-networks","destination":"/manage/networks/accessing-entire-domains-within-networks","permanent":true},{"source":"/how-to/access-home-network","destination":"/manage/networks/homelab/access-home-network","permanent":true},{"source":"/how-to/routing-traffic-to-private-networks","destination":"/manage/network-routes","permanent":true},{"source":"/how-to/configuring-default-routes-for-internet-traffic","destination":"/manage/network-routes/configuring-default-routes-for-internet-traffic","permanent":true},{"source":"/how-to/configuring-routes-with-access-control","destination":"/manage/network-routes/configuring-routes-with-access-control","permanent":true},{"source":"/how-to/resolve-overlapping-routes","destination":"/manage/network-routes/resolve-overlapping-routes","permanent":true},{"source":"/how-to/control-center","destination":"/manage/control-center","permanent":true},{"source":"/how-to/audit-events-logging","destination":"/manage/activity","permanent":true},{"source":"/how-to/traffic-events-logging","destination":"/manage/activity/traffic-events-logging","permanent":true},{"source":"/how-to/activity-event-streaming","destination":"/manage/activity/event-streaming","permanent":true},{"source":"/how-to/stream-activity-to-datadog","destination":"/manage/activity/event-streaming/datadog","permanent":true},{"source":"/how-to/stream-activity-to-amazon-s3","destination":"/manage/activity/event-streaming/amazon-s3","permanent":true},{"source":"/how-to/stream-activity-to-amazon-firehose","destination":"/manage/activity/event-streaming/amazon-firehose","permanent":true},{"source":"/how-to/stream-activity-to-sentinelone-data-lake","destination":"/manage/activity/event-streaming/sentinelone-data-lake","permanent":true},{"source":"/how-to/stream-activity-to-generic-http","destination":"/manage/activity/event-streaming/generic-http","permanent":true},{"source":"/how-to/monitor-system-and-network-activity","destination":"/manage/activity/traffic-events-logging","permanent":true},{"source":"/how-to/idp-sync","destination":"/manage/team/idp-sync","permanent":true},{"source":"/how-to/add-users-to-your-network","destination":"/manage/team/add-users-to-your-network","permanent":true},{"source":"/how-to/approve-users","destination":"/manage/team/approve-users","permanent":true},{"source":"/how-to/auto-offboard-users","destination":"/manage/team/auto-offboard-users","permanent":true},{"source":"/how-to/single-sign-on","destination":"/manage/team/single-sign-on","permanent":true},{"source":"/how-to/microsoft-entra-id-sync","destination":"/manage/team/idp-sync/microsoft-entra-id-sync","permanent":true},{"source":"/how-to/okta-sync","destination":"/manage/team/idp-sync/okta-sync","permanent":true},{"source":"/how-to/google-workspace-sync","destination":"/manage/team/idp-sync/google-workspace-sync","permanent":true},{"source":"/how-to/jumpcloud-sync","destination":"/manage/team/idp-sync/jumpcloud-sync","permanent":true},{"source":"/how-to/keycloak-sync","destination":"/manage/team/idp-sync/keycloak-sync","permanent":true},{"source":"/how-to/enforce-periodic-user-authentication","destination":"/manage/settings/enforce-periodic-user-authentication","permanent":true},{"source":"/how-to/multi-factor-authentication","destination":"/manage/settings/multi-factor-authentication","permanent":true},{"source":"/how-to/delete-account","destination":"/manage/settings/delete-account","permanent":true},{"source":"/how-to/plans-and-billing","destination":"/manage/settings/plans-and-billing","permanent":true},{"source":"/how-to/enable-post-quantum-cryptography","destination":"/client/post-quantum-cryptography","permanent":true},{"source":"/manage/integrations/enable-post-quantum-cryptography","destination":"/client/post-quantum-cryptography","permanent":true},{"source":"/client/enable-post-quantum-cryptography","destination":"/client/post-quantum-cryptography","permanent":true},{"source":"/how-to/jamf-pro-netbird-integration","destination":"/manage/integrations/mdm-deployment/jamf-pro-netbird-integration","permanent":true},{"source":"/how-to/kandji-netbird-integration","destination":"/manage/integrations/mdm-deployment/kandji-netbird-integration","permanent":true},{"source":"/how-to/intune-netbird-integration","destination":"/manage/integrations/mdm-deployment/intune-netbird-integration","permanent":true},{"source":"/how-to/kubernetes-operator","destination":"/manage/integrations/kubernetes","permanent":true},{"source":"/how-to/access-netbird-public-api","destination":"/manage/public-api","permanent":true},{"source":"/how-to/msp-portal","destination":"/manage/for-partners/msp-portal","permanent":true},{"source":"/how-to/acronis-netbird-integration","destination":"/manage/for-partners/acronis-integration","permanent":true},{"source":"/client/allow-ssh","destination":"/manage/peers/ssh#enabling-ssh","permanent":true},{"source":"/client/enable-lazy-connections","destination":"/manage/peers/lazy-connection","permanent":true},{"source":"/how-to/profiles","destination":"/client/profiles","permanent":true},{"source":"/how-to/troubleshooting-client","destination":"/help/troubleshooting-client","permanent":true},{"source":"/how-to/report-bug-issues","destination":"/help/report-bug-issues","permanent":true},{"source":"/manage/dns/zones","destination":"/manage/dns/custom-zones","permanent":true},{"source":"/use-cases/setup-site-to-site-access","destination":"/use-cases/site-to-site","permanent":true},{"source":"/manage/peers/site-to-site/db-workload-migration","destination":"/manage/network-routes/use-cases/by-scenario/site-to-site-cloud","permanent":true},{"source":"/manage/network-routes/use-cases/site-to-site-cloud","destination":"/manage/network-routes/use-cases/by-scenario/site-to-site-cloud","permanent":true},{"source":"/manage/networks/homelab/access-home-network","destination":"/manage/networks/use-cases/by-scenario/access-home-devices","permanent":true},{"source":"/manage/networks/routing-traffic-to-multiple-resources","destination":"/manage/networks/use-cases/by-resource-type/routing-traffic-to-multiple-resources","permanent":true},{"source":"/manage/networks/accessing-restricted-domain-resources","destination":"/manage/networks/use-cases/by-resource-type/accessing-restricted-domain-resources","permanent":true},{"source":"/manage/networks/accessing-entire-domains-within-networks","destination":"/manage/networks/use-cases/by-resource-type/accessing-entire-domains-within-networks","permanent":true},{"source":"/manage/network-routes/routing-traffic-to-private-networks","destination":"/manage/network-routes","permanent":true},{"source":"/manage/network-routes/use-cases/routing-traffic-to-private-networks","destination":"/manage/network-routes","permanent":true},{"source":"/manage/network-routes/configuring-default-routes-for-internet-traffic","destination":"/manage/network-routes/use-cases/by-scenario/exit-nodes","permanent":true},{"source":"/manage/network-routes/configuring-routes-with-access-control","destination":"/manage/network-routes/use-cases/by-configuration/access-control","permanent":true},{"source":"/manage/network-routes/resolve-overlapping-routes","destination":"/manage/network-routes/use-cases/by-configuration/overlapping-routes","permanent":true},{"source":"/manage/site-to-site","destination":"/use-cases/site-to-site","permanent":true},{"source":"/manage/site-to-site/connect-home-networks","destination":"/use-cases/site-to-site","permanent":true},{"source":"/manage/site-to-site/connect-office-networks","destination":"/use-cases/site-to-site","permanent":true},{"source":"/manage/site-to-site/connect-cloud-environments","destination":"/use-cases/site-to-site","permanent":true},{"source":"/manage/site-to-site/advanced-configuration","destination":"/manage/network-routes/use-cases/by-configuration/advanced-configuration","permanent":true},{"source":"/use-cases/examples","destination":"/use-cases/cloud/aws-ecs-terraform","permanent":true},{"source":"/use-cases/netbird-on-faas","destination":"/use-cases/cloud/netbird-on-faas","permanent":true},{"source":"/use-cases/routing-peers-and-kubernetes","destination":"/use-cases/cloud/routing-peers-and-kubernetes","permanent":true},{"source":"/use-cases/implement-zero-trust","destination":"/use-cases/security/implement-zero-trust","permanent":true},{"source":"/use-cases/client-on-mikrotik-router","destination":"/use-cases/homelab/client-on-mikrotik-router","permanent":true},{"source":"/use-cases/distributed-multi-cloud-ai-argocd-microk8s-vllm","destination":"/use-cases/cloud/distributed-multi-cloud-ai","permanent":true},{"source":"/selfhosted/reverse-proxy","destination":"/selfhosted/external-reverse-proxy","permanent":true},{"source":"/scaling-your-self-hosted-deployment","destination":"/selfhosted/maintenance/scaling/scaling-your-self-hosted-deployment","permanent":true}]};
globalThis.AsyncLocalStorage = require("async_hooks").AsyncLocalStorage;
var middlewareModule = require("./.next/server/middleware.js");
var serve = async (request) => {
  const context = getContext();
  return await withNextRequestContext(
    { waitUntil: context.waitUntil },
    async () => {
      let middlewareHandler = await middlewareModule;
      middlewareHandler = middlewareHandler.default || middlewareHandler;
      const result = await middlewareHandler({
        request: {
          url: request.url,
          method: request.method,
          headers: toPlainHeaders(request.headers),
          nextConfig: conf,
          page: "/middleware",
          body: request.method !== "GET" && request.method !== "HEAD" ? request.body : void 0,
          waitUntil: context.waitUntil
        }
      });
      if (result.waitUntil && context.waitUntil) {
        context.waitUntil(result.waitUntil);
      }
      return result.response;
    }
  );
};
module.exports = serve;
