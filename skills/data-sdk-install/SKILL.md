---
name: data-sdk-install
description: |
  Install or upgrade the public reopt Data SDK client/server suite in a consumer project. Next.js App Router first, with React, vanilla browser, and Node routing. Triggers on "data-sdk install", "reopt analytics setup", "reopt data tracking", "data SDK upgrade", "데이터 SDK 설치", "리옵트 분석 연동".
target: "@reopt-ai/data-sdk-client"
targetMinVersion: "0.1.6"
---

# reopt Data SDK Install

> Read the installed package READMEs before writing integration code. The supported suite is `@reopt-ai/data-sdk-client` + `@reopt-ai/data-sdk-server`; `@reopt-ai/data-sdk-devtool` is optional.

## When to apply

Use for first installs and upgrades. Default to a complete Next.js App Router integration; route React, vanilla, and Node-only requests to the matching README.

## Step 1 — Inspect before changing

1. Detect package manager, framework and versions, existing SDK imports, env names, `proxy.ts` / `middleware.ts`, provider/layout, server tracking, consent owner, and tenant model.
2. Read the installed versions from package manifests. Supported floor: client/server `0.1.6`, optional devtool `0.1.0`, contract `0.6.3`. Keep client and server on the same release when both are installed.

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
2. **Packages** — install client for browser/React; server for Next server code or Node; devtool as a dev dependency only when requested. Install optional peers only for surfaces in use.
3. **Credentials** — connect an existing project. Do not create an Organization, Project, or API client. A browser receives only its public write key. Keep `clientId` + `clientSecret` in server-only code and gitignored env files.
4. **Next.js default** — create one module-scope `createReopt()` factory, pass `getBootstrap()` into the client provider, mount `ReoptPageView` / optional `ReoptWebVitals`, and use `baseUrl: "/ingest"` in the browser with an absolute Data origin on the server.
5. **Proxy** — compose `reoptProxy` after host/auth routing for responses rendered by this app. Preserve existing headers/cookies and ensure `/ingest/:path*` reaches the proxy even with a whitelist matcher.
6. **Tenant shape** — static env values are fine for one project. For multi-tenant hosts, resolve write key and credentials per request on the server and pass only the resolved public key across the client boundary.
7. **Fail-open** — missing analytics config may yield a disabled client, but application security and input validation remain fail-closed. Missing credentials block live verification, not app startup.

## Docs routing

Paths are relative to each installed package root.

| Task | Read |
|---|---|
| Vanilla, React, Next provider/hooks, config, capture, consent, path normalization | `@reopt-ai/data-sdk-client/README.md` |
| Request-scoped tracking, bootstrap, proxy composition, multi-tenant resolvers, errors, Node | `@reopt-ai/data-sdk-server/README.md` |
| Recording transport, panel, E2E store, production gating | `@reopt-ai/data-sdk-devtool/README.md` |
| Assembled reference app (multi-tenant + proxy + consent + devtool together) | `reopt-ai/reopt-data-sdk-example` README |

## Safety

- Never expose `clientSecret`, raw credential headers, captured PII, or a devtools batch on a public production page.
- Do not invent cookie names, trust a browser-provided profile/session id, cache request bootstrap data, or create a server factory per request.
- Do not enable the devtool in production unless the user explicitly identifies a controlled demo/staging environment.
- Do not commit or push without explicit user authorization.

## Verify

1. Run the project's format/lint/type/build gates.
2. Confirm `/ingest/api/track` passes through the real proxy and an accepted batch appears without exposing secrets.
3. Verify one navigation pageview, identify/reset across login/logout, consent withdrawal, and one server event when those surfaces are installed.
4. If query credentials and project id are available, correlate one unique event from ingest to Query API; otherwise report that roundtrip as not run.
