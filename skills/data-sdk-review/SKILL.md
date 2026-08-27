---
name: data-sdk-review
description: |
  Review a consumer project's reopt Data SDK integration for package versions, credential boundaries, Next.js proxy/bootstrap, identity, consent, delivery, and devtool risks. Triggers on "data-sdk review", "reopt analytics audit", "SDK tracking review", "데이터 SDK 리뷰", "분석 연동 점검".
target: "@reopt-ai/data-sdk-client"
targetMinVersion: "0.1.6"
---

# reopt Data SDK Review

Read-only by default. Inspect and report; do not edit code, dependencies, env files, or agent markers unless the user explicitly asks for fixes.

## Step 1 — Ground the review

1. Detect installed versions and every import of `@reopt-ai/data-sdk*` / `@reopt-ai/data-contract`.
2. Read the installed client/server/devtool READMEs before judging behavior. Supported floor: client/server `0.1.6`, optional devtool `0.1.0`, contract `0.6.3`.
3. Read the existing `<!-- BEGIN:reopt/data-sdk-agent-rules -->` block when present; otherwise use this skill's byte-identical `agent-rules.md` fallback as review guidance. A missing block is informational in a read-only review.

## Step 2 — Review categories

- **Packages** — versions below the supported floor, client/server version skew, invalid entrypoint for the runtime.
- **Secrets** — `clientSecret` in `NEXT_PUBLIC_*`, client components, RSC props, logs, fixtures, source control, or browser-visible devtools.
- **Lifecycle** — `createReopt()` inside a request/component, duplicate clients, fire-and-forget Node work, missing `flush()` / `close()`.
- **Next boundary** — server package in client code, functions crossing RSC props, `getBootstrap()` under `use cache` / request cache, bootstrap invented instead of `null`.
- **Proxy** — `/ingest` omitted from matcher, wrong prefix/origin, open custom rewrite, reopt before redirect/tenant routing, dropped existing response headers/cookies.
- **Page capture** — `ReoptPageView` plus manual pageview, unbounded dynamic paths, missing web-vitals/path context where intended.
- **Identity** — hand-built cookie names, write-key mismatch, trusted browser profile/session id, logout without `reset()`, delayed conversions losing `deviceId`.
- **Consent** — external manager uses `persist: false` without synchronizing the proxy cookie, opt-out retains identity, server events ignore the request decision.
- **Fail-open** — analytics errors break checkout/render/auth, while application validation or authorization incorrectly fails open.
- **Devtool/testing** — forced production devtool, raw batches exposed publicly, tests mock ingest before checking the SDK-built payload, no accepted-batch or roundtrip evidence.

## Canonical sources

| Finding area | Read |
|---|---|
| Browser, React, Next client config/capture/consent | installed `@reopt-ai/data-sdk-client/README.md` |
| Request scope, bootstrap, proxy, identity, instrumentation, Node | installed `@reopt-ai/data-sdk-server/README.md` |
| Recorder, panel, exposure and production behavior | installed `@reopt-ai/data-sdk-devtool/README.md` |
| Assembled reference app (multi-tenant + proxy + consent + devtool together) | `reopt-ai/reopt-data-sdk-example` README |

## Report contract

Order findings by severity. For every finding provide:

1. severity and short pattern name;
2. exact file and line;
3. concrete evidence from the code;
4. user/runtime/security impact;
5. canonical installed README section and a scoped remediation.

Separate confirmed defects from suggestions and unverified live behavior. End with checks run, checks skipped, and residual risks. If no findings exist, say so explicitly and still report coverage gaps.

## Safety

- Never print env values, credential headers, stored identity cookies, or captured personal data.
- Do not create or rotate Data resources during a review.
- Do not recommend production devtool exposure as an observability solution.
- Do not commit or push without explicit authorization.
