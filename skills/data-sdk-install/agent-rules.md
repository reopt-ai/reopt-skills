# reopt Data SDK agent rules

The Data SDK is a suite. Read the installed READMEs before changing code:

- `@reopt-ai/data-sdk-client/README.md` — browser, React and Next client components
- `@reopt-ai/data-sdk-server/README.md` — request scope, bootstrap, proxy and Node
- `@reopt-ai/data-sdk-devtool/README.md` — optional recording transport and panel

## Hard rules

- Install `@reopt-ai/*` from public npm. Never add a GitHub Packages token or scope; remove only the exact legacy project-level override.
- Browser/client components may receive a write key. `clientId` and `clientSecret` are server-only and must never cross an RSC boundary, enter a client bundle, or appear in logs.
- Use `@reopt-ai/data-sdk-client` for browser/React/Next client components and `@reopt-ai/data-sdk-server` for Server Components, Route Handlers, Server Actions, proxy, instrumentation and Node.
- Create the request-scoped server factory once at module scope. Let its request cache and resolved-credential engine cache work; do not construct it per request.
- The browser and server must use the same write key because identity and consent cookie names derive from it. Never assemble those cookie names manually.
- With first-party ingest, browser `baseUrl` is `/ingest`; `reoptProxy` removes that prefix and forwards only to the configured Data origin's `/api/*` routes. Ensure the matcher includes `/ingest/:path*`.
- Compose `reoptProxy` after host/auth routing and only for a response rendered by this app. Pass an existing `NextResponse` as the second argument so its headers and cookies survive.
- Do not cache `getBootstrap()` or request cookies/headers. Under Cache Components, read request data outside cached functions and pass plain serializable values down.
- Avoid duplicate pageviews: Next uses `ReoptPageView`; manual page views replace it for that route/flow rather than running beside it.
- Consent withdrawal removes analytics identity. When an external banner owns consent with `persist: false`, synchronize both the SDK decision and the consent cookie the proxy reads.
- On logout call `reset()` so the next user on a shared device is not attributed to the previous profile.
- Serverless/short-lived Node work must use delivery/flush semantics; long-lived workers must `close()` on shutdown. Analytics failure stays fail-open and must not fail the host request.
- The devtool is off in production by default. Never force-enable it on a customer page; recorded batches contain credential headers and payload data.
