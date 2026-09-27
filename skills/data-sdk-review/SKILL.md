---
name: data-sdk-review
description: |
  Review a consumer project's reopt Data SDK integration for package versions, credential boundaries, Next.js proxy/bootstrap, identity, consent, delivery, error tracking (exception capture, breadcrumbs, releases, source maps) and devtool risks. Triggers on "data-sdk review", "reopt analytics audit", "SDK tracking review", "reopt error tracking review", "데이터 SDK 리뷰", "분석 연동 점검", "에러 트래킹 점검".
target: "@reopt-ai/data-sdk-client"
targetMinVersion: "0.2.0"
---

# reopt Data SDK Review

Read-only by default. Inspect and report; do not edit code, dependencies, env files, or agent markers unless the user explicitly asks for fixes.

## Step 1 — Ground the review

1. Detect installed versions and every import of `@reopt-ai/data-sdk*` / `@reopt-ai/data-contract`, plus any `reopt-data` CLI call in build scripts and which package provides that bin (`@reopt-ai/data-cli`, or the server package's bin that existed only through `0.4.x`).
2. Read the installed client/server/devtool READMEs (and the data-cli README when it is installed) before judging behavior. Supported floor: client/server `0.2.0`, optional devtool `0.2.0`, contract `0.7.0`; verified against client `0.6.1`, server `0.7.0`, contract `0.15.0`, data-cli `0.1.0`. A `0.1.x` client is a finding when the project relies on error tracking: it sends flat `$exception_*` keys only.
3. Read the existing `<!-- BEGIN:reopt/data-sdk-agent-rules -->` block when present; otherwise use this skill's byte-identical `agent-rules.md` fallback as review guidance. A missing block is informational in a read-only review.

## Step 2 — Review categories

- **Packages** — versions below the supported floor, client/server version skew, invalid entrypoint for the runtime, any import of the deprecated `@reopt-ai/data-sdk` meta-package, server `>= 0.5.0` with a build script still calling the server bin (no `@reopt-ai/data-cli` dev dependency), data-cli on a Node `< 22` CI image, `@reopt-ai/data-adapter-apps-in-toss` whose required `@reopt-ai/data-sdk-client` peer range does not cover the installed client (0.2.0 is `^0.4.0` only; 0.2.1 adds `^0.5.0`, 0.2.2 `^0.6.0`) or with reopt auto-capture left on beside Toss Analytics, or a script invoking a `reopt-data` subcommand the published `0.1.0` does not have (`login`, `account`, `segment *`, `org usage`, `sourcemap list|delete|*-platform`, or the Project-as-Code group).
- **Secrets** — `clientSecret` or `REOPT_DATA_API_KEY` in `NEXT_PUBLIC_*`, client components, RSC props, logs, fixtures, source control, or browser-visible devtools.
- **Lifecycle** — `createReopt()` inside a request/component, duplicate clients, fire-and-forget Node work, missing `flush()` / `close()`.
- **Next boundary** — server package in client code, functions crossing RSC props, `getBootstrap()` under `use cache` / request cache, bootstrap invented instead of `null`.
- **Proxy** — `/ingest` omitted from matcher, wrong prefix/origin, open custom rewrite, reopt before redirect/tenant routing, dropped existing response headers/cookies.
- **Page capture** — `ReoptPageView` plus manual pageview, unbounded dynamic paths, missing web-vitals/path context where intended.
- **Identity** — hand-built cookie names, write-key mismatch, trusted browser profile/session id, logout without `reset()`, delayed conversions losing `deviceId`.
- **Consent** — external manager uses `persist: false` without synchronizing the proxy cookie, opt-out retains identity, server events ignore the request decision.
- **Session replay** — on client `< 0.5.0` any `sessionReplay` config, `setConsent("replay", …)` or `flushReplay()` is a **defect** (replay ships from `0.5.0`). On `0.5.0`+: `"replay"` in `consent.categories` without `defaultConsent: false`, an "accept all" path calling `setAllConsent(true)`, recording enabled without a separate visitor decision, `flushReplay` imported from the package root, bypassed masks or block selectors, public-asset manifests holding visitor uploads / avatars / personalized or authenticated files, replay bodies or the `reopt-replay-token` grant in logs, and no consent-revocation or reset test. Judge support by the installed version, not the README heading (it still says "npm release pending").
- **Error tracking** — `capture.exceptionRateLimit: false` in production (or the key placed at the config root, where it is silently ignored); `addExceptionStep` imported from the package root instead of called on the client instance; `captureException` in loops/retries or with credentials, tokens, or PII in properties, breadcrumb `data`, or step messages; a client-computed group id instead of a `fingerprint` suggestion; `beforeCapture` that can throw; `onRequestError` missing where server tracking exists (or its multi-project `resolve` returning credentials without the matching `writeKey`); `release` hand-typed or absent while regressions are expected (on the server, a `release` key passed to `createOnRequestError` does nothing — it needs `beforeCapture` returning `$release_id`); maps uploaded by map filename instead of chunk URL, `--url-prefix` not matching the served asset origin, `sourcemap inject` running after upload, a CI gate that treats only exit `1` (not `6`, partial failure) as failure, or browser source maps published without a decision recorded (no `--delete-after-upload` and no explicit choice).
- **Catalogue** — `reopt-data.events.json` committed without its `reopt-data.events.lock.json`; `event push --apply --force` in CI; `event verify` absent from CI while the file is the declared truth; `conversion: true` on events that are not business outcomes; high-cardinality keys in `rollupProperties`; a `track()` wrapper that ignores the `event types` output while the project generates it.
- **AI telemetry** (server `0.6.0`+ `./ai`) — `captureContent: true` without a recorded decision, or `captureErrorMessages` left on where provider/tool errors echo prompts or tool input.
- **Quota** — code that treats a 402 / `quota_exceeded` as a permanent disable or drops the batch. The transport preserves the batch and does not trip the circuit breaker; honor `Retry-After` (up to an hour). An organization that exhausts its monthly data points is rejected until the next month, and the rejection threshold is the purchased quota **plus** any platform-granted grace, so a warning banner at 80% or 100% is not the same line as the hard stop.
- **Fail-open** — analytics errors break checkout/render/auth, while application validation or authorization incorrectly fails open.
- **Devtool/testing** — forced production devtool, raw batches exposed publicly, tests mock ingest before checking the SDK-built payload, no accepted-batch or roundtrip evidence.

## Canonical sources

| Finding area | Read |
|---|---|
| Browser, React, Next client config/capture/consent | installed `@reopt-ai/data-sdk-client/README.md` |
| Exceptions, throttling, breadcrumbs, `captureException` options, `release` | installed `@reopt-ai/data-sdk-client/README.md` → "`$exception_list`" and "Release tracking" |
| Request scope, bootstrap, proxy, identity, `onRequestError`, Node; AI telemetry (§ 7); replay forwarding | installed `@reopt-ai/data-sdk-server/README.md` |
| Session replay options, consent, masking, public assets | installed `@reopt-ai/data-sdk-client/README.md` → "Session replay" |
| Source map CLI, credentials, exit codes, `postbuild` shape | installed `@reopt-ai/data-cli/README.md` → "Source maps in CI"; `@reopt-ai/data-sdk-server/README.md` § 4-1 |
| Event catalogue as code; what the installed CLI actually has (`reopt-data --help` — the upstream README documents commands absent from published `0.1.0`) | installed `@reopt-ai/data-cli/README.md` → "Event catalogue as code" |
| Recorder, panel, exposure and production behavior | installed `@reopt-ai/data-sdk-devtool/README.md` |
| Assembled reference app (multi-tenant + proxy + consent + devtool + `/debug/errors` lab) | `reopt-ai/reopt-data-sdk-example` README — its `postbuild` may predate the data-cli move |

## Report contract

Order findings by severity. For every finding provide:

1. severity and short pattern name;
2. exact file and line;
3. concrete evidence from the code;
4. user/runtime/security impact;
5. canonical installed README section and a scoped remediation.

Separate confirmed defects from suggestions and unverified live behavior. End with checks run, checks skipped, and residual risks. If no findings exist, say so explicitly and still report coverage gaps.

## Safety

- Never print env values, credential headers, stored identity cookies, captured personal data, or exception payloads verbatim.
- Do not create or rotate Data resources during a review.
- Do not recommend production devtool exposure as an observability solution.
- Do not commit or push without explicit authorization.
