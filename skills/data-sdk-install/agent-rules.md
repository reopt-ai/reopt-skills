# reopt Data SDK agent rules

The Data SDK is a suite. Read the installed READMEs before changing code:

- `@reopt-ai/data-sdk-client/README.md` — browser, React and Next client components
- `@reopt-ai/data-sdk-server/README.md` — request scope, bootstrap, proxy and Node
- `@reopt-ai/data-sdk-devtool/README.md` — optional recording transport and panel
- `@reopt-ai/data-cli/README.md` — the `reopt-data` bin: source maps and event catalogue as code (the installed `--help` is the truth about which commands exist)

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
- Set `release` (or inject `__REOPT_RELEASE__` at build) from the build, not from a hand-typed string; regressions are detected by comparing releases. On the server `createReopt({ release })` stamps only `track()` events — `createOnRequestError` has no `release` option, so return `{ $release_id }` from its `beforeCapture`.
- Source maps upload with `reopt-data sourcemap inject` then `reopt-data sourcemap upload` from `@reopt-ai/data-cli` (a dev dependency, Node 22+). `@reopt-ai/data-sdk-server` ships no bin from 0.5.0; the old `inject-chunk-ids` / `upload-sourcemaps` spellings still resolve on the new CLI but a partial failure now exits `6`, not `1`. Maps are keyed by each chunk's public URL (read from `//# sourceMappingURL`), never by the map file's own name. `REOPT_DATA_ORG_KEY` (legacy `REOPT_DATA_API_KEY`) is an organization key: CI/server only, never in `NEXT_PUBLIC_*` or the browser. Use `--delete-after-upload` when the served build must not keep the maps.

- **Session replay ships from `data-sdk-client` 0.5.0** and is absent before it (a `sessionReplay` block, `setConsent("replay", …)` or `flushReplay()` fails `tsc` on 0.4.x). Gate on the installed version or the installed types — the shipped README still heads the section "npm release pending". Recording needs the project setting plus **both** `analytics` and `replay` consent from the visitor's own decision. Keep `replay` out of default grants: `consent.defaultConsent` is `true` for every listed category, so listing `"replay"` requires `defaultConsent: false`, and `setAllConsent(true)` flips every known category, so an "accept all" control grants recording. `flushReplay()` is an instance method, not a root export. Built-in masks and block selectors are additive, never overridable; the public-asset manifest holds only reviewed application-owned static files (pixels and font metadata are not masked, so never visitor uploads, avatars or personalized/authenticated resources); never log replay bodies or the `reopt-replay-token` grant; never enable recording on a customer site without an explicit request.
- **The published `@reopt-ai/data-cli` is smaller than its upstream README.** Version `0.1.0` has `config`, `event`, `org`, `project`, `query`, `sourcemap inject | upload`, and `tools [--json]` / `mcp` (the same commands as JSON-Schema tools or a stdio MCP server) — nothing else. `login` / `status` / `logout` / `account show`, `completion`, `segment list | get | preview`, `org usage`, `sourcemap list | delete | list-platform | delete-platform`, and the Project-as-Code group (`pull` / `diff` / `verify` / `push` / `import` / `unlink`, alias `definition *`) are not in it. Run `reopt-data --help` against the installed binary rather than trusting a README on GitHub. `reopt-data mcp` exposes provisioning tools too (`org create`, `rotate-key`, `project delete`); never call them without an explicit request.
- **A 402 / `quota_exceeded` is backpressure, not a shutdown.** The transport keeps the batch and leaves the circuit breaker closed; honor `Retry-After` (up to an hour). An organization out of monthly data points is rejected until the next month, and the rejection line is the purchased quota **plus** any platform grace — the 80% / 100% warnings are not that line. Do not disable the client or discard events on it.
- **AI telemetry (`@reopt-ai/data-sdk-server/ai`, server 0.6.0+)** sends no prompt or response bodies unless `captureContent: true` **and** the project setting allow it. Never enable content capture without an explicit request; set `captureErrorMessages: false` where provider or tool errors can echo prompts or tool input.
- **Apps-in-Toss WebViews use `@reopt-ai/data-adapter-apps-in-toss`**; its `@reopt-ai/data-sdk-client` peer is **required** and follows client minors (0.2.0: `^0.4.0`; 0.2.1 adds `^0.5.0`; 0.2.2 adds `^0.6.0`), so upgrade the adapter with the client. Inject the Toss `send` function instead of importing the Toss SDK, and turn reopt's automatic capture off (`pageview`, `pageleave`, `scrollDepth`, `exceptions`) so the two pipelines do not double-count.
- Segment definitions are contract v2 (`@reopt-ai/data-contract/segment`, published in contract 0.12.0): five attribute scopes, three time windows, eleven criterion kinds, max nesting depth 3, and per-type operator sets. There is deliberately no `create` on any client surface — definitions are authored in the console because they need catalogue validation. A `deviceCount` of `null` means "not calculated yet", which is not zero.

## Event catalogue rules

- `reopt-data.events.json` plus `reopt-data.events.lock.json` are the declared truth once the project adopts them: commit both, `event diff` before `event push --apply --yes`, and run `event verify` in CI (exit `8` = drift). Never `--force` a push from automation; a 409 means a console edit happened — `event pull` first.
- Mark `conversion: true` only on real business outcomes and keep `rollupProperties` to low-cardinality keys; both are graded changes that rebuild metrics.
- When the project generates `event types`, type the `track()` wrapper with `ReoptEventName` / `ReoptEventProperties` instead of hand-written string unions.
