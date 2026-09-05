# reopt Data SDK agent rules

The Data SDK is a suite. Read the installed READMEs before changing code:

- `@reopt-ai/data-sdk-client/README.md` — browser, React and Next client components
- `@reopt-ai/data-sdk-server/README.md` — request scope, bootstrap, proxy and Node
- `@reopt-ai/data-sdk-devtool/README.md` — optional recording transport and panel
- `@reopt-ai/data-cli/README.md` — the `reopt-data` bin: source maps, event catalogue as code, `tools --json` / `mcp` for agents

`@reopt-ai/data-sdk` on npm is a deprecated meta-package. Never install or import it; the suite above is the supported surface.

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

## Error tracking rules

- Exception capture (`capture.exceptions`), breadcrumbs (`capture.exceptionSteps`) and public source maps are opt-in and change what leaves the browser. Enable them only on the user's explicit go-ahead.
- Keep the per-type exception rate limit on in production. It is what stops one rejection loop from filling the quota and burying every other issue.
- Report a handled error with `captureException(error, { level, fingerprint, properties })` once per failure path; never inside a loop or a retry. The server fingerprints and groups — do not compute or send a group id yourself; `fingerprint` is a suggestion.
- Never throw from `beforeCapture` or `captureException`, and never put credentials, tokens or personal data into exception properties, breadcrumb `data`, or `$exception_steps` messages.
- Set `release` (or inject `__REOPT_RELEASE__` at build) from the build, not from a hand-typed string; regressions are detected by comparing releases.
- Source maps upload with `reopt-data sourcemap inject` then `reopt-data sourcemap upload` from `@reopt-ai/data-cli` (a dev dependency, Node 22+). `@reopt-ai/data-sdk-server` ships no bin from 0.5.0; the old `inject-chunk-ids` / `upload-sourcemaps` spellings still resolve on the new CLI but a partial failure now exits `6`, not `1`. Maps are keyed by each chunk's public URL (read from `//# sourceMappingURL`), never by the map file's own name. `REOPT_DATA_ORG_KEY` (legacy `REOPT_DATA_API_KEY`) is an organization key: CI/server only, never in `NEXT_PUBLIC_*` or the browser. Use `--delete-after-upload` when the served build must not keep the maps.

## Event catalogue rules

- `reopt-data.events.json` plus `reopt-data.events.lock.json` are the declared truth once the project adopts them: commit both, `event diff` before `event push --apply --yes`, and run `event verify` in CI (exit `8` = drift). Never `--force` a push from automation; a 409 means a console edit happened — `event pull` first.
- Mark `conversion: true` only on real business outcomes and keep `rollupProperties` to low-cardinality keys; both are graded changes that rebuild metrics.
- When the project generates `event types`, type the `track()` wrapper with `ReoptEventName` / `ReoptEventProperties` instead of hand-written string unions.
