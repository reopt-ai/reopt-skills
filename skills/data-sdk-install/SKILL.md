---
name: data-sdk-install
description: |
  Install or upgrade the public reopt Data SDK client/server suite in a consumer project, including opt-in error tracking (exception capture, breadcrumbs, releases, source maps via the `@reopt-ai/data-cli` `reopt-data` bin). Next.js App Router first, with React, vanilla browser, and Node routing. Triggers on "data-sdk install", "reopt analytics setup", "reopt data tracking", "data SDK upgrade", "reopt error tracking setup", "upload source maps to reopt", "reopt-data cli", "데이터 SDK 설치", "리옵트 분석 연동", "에러 트래킹 연동", "소스맵 업로드".
target: "@reopt-ai/data-sdk-client"
targetMinVersion: "0.2.0"
---

# reopt Data SDK Install

> Read the installed package READMEs before writing integration code. The supported suite is `@reopt-ai/data-sdk-client` + `@reopt-ai/data-sdk-server`; `@reopt-ai/data-sdk-devtool` is optional; `@reopt-ai/data-cli` (bin `reopt-data`, Node 22+) is the build/CI tool for source maps and the event catalogue. `@reopt-ai/data-sdk` on npm is a **deprecated** meta-package — never install or import it.

## When to apply

Use for first installs, upgrades, and turning on error tracking in an app that already tracks. Default to a complete Next.js App Router integration; route React, vanilla, and Node-only requests to the matching README.

## Step 1 — Inspect before changing

1. Detect package manager, framework and versions, existing SDK imports, env names, `proxy.ts` / `middleware.ts`, provider/layout, server tracking, consent owner, tenant model, and whether a build step already emits source maps.
2. Read the installed versions from package manifests. Supported floor: client/server `0.2.0`, optional devtool `0.2.0`, contract `0.7.0`; verified against client `0.4.0`, server `0.5.0`, contract `0.10.0`, data-cli `0.1.0`. Keep client and server on the same release when both are installed. A `0.1.x` client still ingests, but it lacks the structured `$exception_list`, `captureException` options, breadcrumbs and `release` — upgrade before wiring error tracking. **Server `0.5.0` dropped its `reopt-data` bin**: a `postbuild` that calls `inject-chunk-ids` / `upload-sourcemaps` from the server package breaks on upgrade until `@reopt-ai/data-cli` is added as a dev dependency.

## Step 2 — Pin agent rules

No Data SDK package ships an agent-rules file as of the versions above. Use this skill's `agent-rules.md` fallback and place it in `AGENTS.md` (or `CLAUDE.md` only when AGENTS is absent) between:

```
<!-- BEGIN:reopt/data-sdk-agent-rules -->
…fallback content…
<!-- END:reopt/data-sdk-agent-rules -->
```

Replace only content inside existing markers.

## Step 3 — Consumer setup

1. **Registry** — packages are public npm. Remove only a project-level `@reopt-ai:registry=https://npm.pkg.github.com` override; preserve unrelated config and ask before user/global npm changes.
2. **Packages** — install client for browser/React; server for Next server code or Node; devtool as a dev dependency only when requested; `@reopt-ai/data-cli` as a dev dependency only when source maps or the catalogue-as-code workflow are wanted (it needs Node 22+ — check `engines` before adding it to a Node 20 CI image). Install optional peers only for surfaces in use.
3. **Credentials** — connect an existing project. Do not create an Organization, Project, or API client. A browser receives only its public write key. Keep `clientId` + `clientSecret` in server-only code and gitignored env files.
4. **Next.js default** — create one module-scope `createReopt()` factory, pass `getBootstrap()` into the client provider, mount `ReoptPageView` / optional `ReoptWebVitals`, and use `baseUrl: "/ingest"` in the browser with an absolute Data origin on the server.
5. **Proxy** — compose `reoptProxy` after host/auth routing for responses rendered by this app. Preserve existing headers/cookies and ensure `/ingest/:path*` reaches the proxy even with a whitelist matcher.
6. **Tenant shape** — static env values are fine for one project. For multi-tenant hosts, resolve write key and credentials per request on the server and pass only the resolved public key across the client boundary.
7. **Fail-open** — missing analytics config may yield a disabled client, but application security and input validation remain fail-closed. Missing credentials block live verification, not app startup.

## Step 4 — Error tracking (opt-in; ask before enabling on a customer site)

Everything below is off by default. Turn on only what the user asked for, in this order:

1. **Browser capture** — `capture: { exceptions: true }` sends `$exception` for uncaught errors and unhandled rejections; the parsers load as their own chunk. Keep the default per-type rate limit (`capture.exceptionRateLimit`, a token bucket of 10 / one back every 10s; it nests under `capture`, not at the config root) unless the user names a reason; never set it to `false` in production.
2. **Handled errors** — `captureException(error, { level?, fingerprint?, properties? })` inside existing `catch` blocks that matter (checkout, auth, data loading). Do not wrap every call site; the server groups by stack, so one report per failure path is enough.
3. **Server errors** — Next: `createOnRequestError()` in `instrumentation.ts`; add a `beforeCapture` hook when request context may carry PII. The plain Node client (`createReoptNode`) has no exception helper as of 0.2.0 — do not hand-build one; report it as a gap.
4. **Breadcrumbs** — `capture.exceptionSteps: true` records a `navigation` step per page view; the host adds `client.addExceptionStep({ category, message, data })` at meaningful actions (`category` is the closed union `fetch | navigation | click | console | custom`; ≤20 steps, 200-char message, 1 KB `data`). It is an **instance method** (reach the client via `getInstance()` / `getClient()` in vanilla code or `useReoptClient()` / `useReopt()` in React) — there is no root `addExceptionStep` export, so an import of that name fails `tsc`. Off by default because navigation history on every error is a privacy decision the host makes.
5. **Release** — `init({ release })` or inject `__REOPT_RELEASE__` at build (commit sha / build id); on the server it is `createReopt({ release })` — `createOnRequestError` takes no `release` key (its options are `writeKey` / `baseUrl` / `clientId` / `clientSecret` / `resolve` / `disabled` / `beforeCapture`). This is what lets the dashboard mark regressions. Wire it before source maps.
6. **Source maps** — production stacks are minified until maps are uploaded. The uploader is `@reopt-ai/data-cli` (`reopt-data`), **not** the server package (its bin was removed in server 0.5.0). Add a `postbuild`: `reopt-data sourcemap inject --dir <static dir>` then `reopt-data sourcemap upload --dir <static dir> --url-prefix <public asset URL> --project-id <id> --release <id>`; the organization key comes from `REOPT_DATA_ORG_KEY` (legacy `REOPT_DATA_API_KEY` / `--api-key` still accepted) — CI/server only. One deployment serving many projects uploads once per host app with `--path-prefix` + `--host-app` + `--organization-id` instead of `--url-prefix` + `--project-id`. The uploader keys maps by each chunk's `//# sourceMappingURL`; do not upload maps by their own filenames. Enabling browser source maps publishes them — confirm with the user first, and add `--delete-after-upload` when the maps must not stay in the served build. `--dry-run` needs no key: ship it in the committed script when the repo builds without credentials. A partial upload exits `6` (the old bin used `1`) — CI gates must treat both as failure.
7. **Repository link** — optional: set the project's repository URL + default branch in Data project settings so frames deep-link to source.

Tell the user: events sent before the upgrade are grouped only after a one-time backfill run by the Data project owner (`POST /api/cron/backfill-exceptions`), and maps resolve frames for events arriving after the upload.

## Docs routing

Paths are relative to each installed package root.

| Task | Read |
|---|---|
| Vanilla, React, Next provider/hooks, config, capture, consent, path normalization | `@reopt-ai/data-sdk-client/README.md` |
| Exceptions: `$exception_list`, throttling, breadcrumbs, `captureException` options | `@reopt-ai/data-sdk-client/README.md` → "`$exception_list` — the structured form" |
| `release` / `__REOPT_RELEASE__` build injection | `@reopt-ai/data-sdk-client/README.md` → "Release tracking" |
| Request-scoped tracking, bootstrap, proxy composition, multi-tenant resolvers, `onRequestError`, Node | `@reopt-ai/data-sdk-server/README.md` |
| Source map CLI (`reopt-data sourcemap inject` / `upload`, credentials, exit codes, `--dry-run`; `sourcemap list` / `delete` are documented upstream but **absent from the published 0.1.0** — check `reopt-data sourcemap --help`) | installed `@reopt-ai/data-cli/README.md` → "Source maps in CI" (canonical); `@reopt-ai/data-sdk-server/README.md` § 4-1 for the Next.js shape |
| Repository defaults for the CLI (`reopt-data config link` writes a committed `reopt-data.config.mjs` with project id, events file, sourcemap dir / prefixes — ids only, never keys) | `reopt-data config link --help` |
| Event catalogue as code (`reopt-data event init` / `pull` / `diff` / `push` / `verify` / `types`) and `reopt-data tools --json` / `reopt-data mcp` for agents | installed `@reopt-ai/data-cli/README.md` → "Event catalogue as code", "For agents"; hand the workflow to `data-sdk-integration` |
| Recording transport, panel, E2E store, production gating | `@reopt-ai/data-sdk-devtool/README.md` |
| Assembled reference app (multi-tenant + proxy + consent + devtool + `/debug/errors` lab) | `reopt-ai/reopt-data-sdk-example` README — its `postbuild` may still show the pre-0.5.0 server bin; the data-cli README wins |

## Safety

- Never expose `clientSecret`, `REOPT_DATA_ORG_KEY` / `REOPT_DATA_API_KEY`, raw credential headers, captured PII, or a devtools batch on a public production page.
- Do not invent cookie names, trust a browser-provided profile/session id, cache request bootstrap data, or create a server factory per request.
- Do not enable the devtool in production unless the user explicitly identifies a controlled demo/staging environment.
- Do not enable exception capture, breadcrumbs, or public source maps on a customer site without the user's explicit go-ahead; both change what leaves the browser.
- Do not commit or push without explicit user authorization.

## Verify

1. Run the project's format/lint/type/build gates.
2. Confirm `/ingest/api/track` passes through the real proxy and an accepted batch appears without exposing secrets.
3. Verify one navigation pageview, identify/reset across login/logout, consent withdrawal, and one server event when those surfaces are installed.
4. With error tracking on: throw one test error in a non-production environment and confirm an issue appears under the project's **Errors** page with `$exception_list` (and steps / release when enabled); after a maps upload, confirm a frame shows the original file:line. Remove the test data afterwards.
5. If query credentials and project id are available, correlate one unique event from ingest to Query API; otherwise report that roundtrip as not run.
