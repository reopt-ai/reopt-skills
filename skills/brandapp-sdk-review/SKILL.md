---
name: brandapp-sdk-review
description: Review consumer project code for @reopt-ai/brandapp-sdk usage anti-patterns and suggest improvements. Triggers on "brandapp-sdk review", "SDK review", "improve SDK usage", "EAV optimization", "brandapp-sdk audit".
target: "@reopt-ai/brandapp-sdk"
targetMinVersion: "2.0.0"
---

# Brandapp SDK Review

> This is NOT the SDK you know. Read `node_modules/@reopt-ai/brandapp-sdk/dist/docs/` before judging any usage. Anti-pattern remedies live there; this skill is grep keys + categories only.

## When to apply

A consumer project already uses `@reopt-ai/brandapp-sdk` and wants an audit. Triggers: "review", "audit", "improve SDK usage", "EAV optimization".

## Step 1 — Pin agent rules into AGENTS.md / CLAUDE.md

Source: `node_modules/@reopt-ai/brandapp-sdk/dist/agent-rules.md`. Fallback: `agent-rules.md` shipped with this skill. Wrap content between:

```
<!-- BEGIN:reopt/brandapp-sdk-agent-rules -->
…content from source…
<!-- END:reopt/brandapp-sdk-agent-rules -->
```

Markers are shared with `brandapp-sdk-install` — same module, one block. If the block already exists from install, leave it alone (replace only when stale).

## Step 2 — Version gate

```bash
grep '"@reopt-ai/brandapp-sdk"' package.json
```

- `< 2.0.0` — env-var rename ships in 2.0 without aliases. Recommend `.env` migration + bump **first**; many patterns below assume 2.0 API surface.
- `< 1.6.0` — 4xx error classes / `FetchOptions.signal,timeout` / webhook `toleranceMs` missing. Recommend 1.6+ before applying fixes.
- `< 1.9.0` — narrowed EAV error classes missing (Error Pattern 3 / 4 only relevant on 1.9+).
- `< 1.10.0` — host split missing; flag any hardcoded `www.reopt.ai`.
- `< 1.11.0` — schema drift detection missing (Schema Pattern 5).
- `< 1.12.0` — service token absent (Config Pattern 4).

## Step 3 — Detect anti-patterns by category

For each match, name the pattern, point at the file/line, then route the consumer to the relevant `dist/docs/` section. **Do not paste before/after code into the review report — read the doc and quote the canonical fix.**

### SDK init / lifecycle → `dist/docs/quickstart.md`, `dist/docs/eav.md`
| Pattern | Grep signal |
|---|---|
| P1 Hand-rolled singleton (`new Proxy<>`) | `new Proxy({} as` + `createReoptEavClient` |
| P2 List-then-find on the client | `.find((` / `.filter((` chained on `listAllRecords` / `records.list` |
| P3 Manual upsert (find + create/update) | `if (existing)` + `records.create` + `records.update` in same fn |
| P4 Manual pagination loop | `while` + `page` + `totalPages` + `records.list` |
| P5 Hand-rolled enum normalization | `new Set<` + `.has(.* as` |
| P6 Locally redefined `asString` / `asNumber` / `asBoolean` / `asDate` / `asJson` | function names match |
| P7 Per-item `records.delete` loop | `Promise.all(` + `.map(` + `records.delete` |
| P8 Per-item `records.update` loop | `Promise.all(` + `.map(` + `records.update` |
| P9 `.length` on `listAllRecords` for counting | `.length` on a `listAllRecords` result |

### Auth wiring → `dist/docs/auth.md`
| Pattern | Grep signal |
|---|---|
| Auth1 No error boundary on `useSession` | `authClient.useSession()` without try/catch or ErrorBoundary nearby |
| Auth2 No `middleware.ts` route protection | `middleware.ts` absent; auth checked inside page components |
| Auth3 Module-level mutable auth state | `let session` / `let user` at module scope |
| Auth4 `signOut` without error handling | `authClient.signOut(` not awaited or unguarded |
| Auth5 `signInWithReopt` swallows errors | `signIn.oauth2(` returns `void` or catches without surfacing |
| Auth6 No session cache strategy | repeated `getSession()` calls per request |
| Auth7 Re-implementing cross-subdomain session verification | manual cookie parsing for `*.reopt.ai`; use `verifySession` / `getSessionFromCookies` |

### Error handling → `dist/docs/errors.md`
| Pattern | Grep signal |
|---|---|
| Err1 Generic `catch` instead of SDK error classes | `catch (e)` without `isReoptSDKError` / class check |
| Err2 Unhandled API errors (no `handleApiError` wrapper) | route handlers without a centralized error handler |
| Err3 EAV mutation on `linkedTo='brandappAuthUser'` without 1.9 narrowed catches | `records.create` on linked entity, no `AuthUserRecordExistsError` branch |
| Err4 Legacy `e.code === 'REQUEST_ERROR'` string check | literal string match — pre-1.9 only |

### Config / security → `dist/docs/quickstart.md` (env), `dist/docs/service-token.md`
| Pattern | Grep signal |
|---|---|
| Cfg1 Hardcoded URL / stale `www.reopt.ai` | `baseUrl:` literal containing `www.reopt.ai` |
| Cfg2 Missing `import "server-only"` | `createReopt*` / `createLazySDK` called in a file without server-only |
| Cfg3 `!` non-null env assertions w/o validation | `process.env.BRANDAPP_*!` without zod / t3-env nearby |
| Cfg4 Service token mixed with Basic Auth (1.12+) | `token:` and `clientSecret:` set on the same `ReoptSDKConfig` |

### Schema / types → `dist/docs/eav.md`
| Pattern | Grep signal |
|---|---|
| Sch1 Type-safe entity client unused | `sdk.eav.entity(` w/o `schema` passed at SDK init |
| Sch2 Hand-rolled schema resolution cache | manual Map of entityName → entityId |
| Sch3 Hardcoded `attributeId` literals | UUID-shaped strings in attribute lookups |
| Sch4 `defineEntity` missing `linkedTo` for 1:1 user metadata | per-user entity without `linkedTo: 'brandappAuthUser'` |
| Sch5 Schema drift unchecked (1.11+) | no `computeEavSchemaHash` in build / no `verifyEavSchema` probe |

### Performance → `dist/docs/quickstart.md`
| Pattern | Grep signal |
|---|---|
| Perf1 Duplicate SDK clients per file | multiple `createLazySDK(` / `createReoptSDK(` in `lib/` |
| Perf2 Over-fetching attributes | `records.list` without `attributes:` projection on wide entities |

### React → `dist/docs/react-hooks.md`
| Pattern | Grep signal |
|---|---|
| R1 Manual `useEffect` + `useState` for EAV fetching | replace with `useRecords` / `useRecord` |
| R2 Manual invalidation after mutation | replace with `useUpsertRecord` etc. (auto-invalidate) |
| R3 Manual infinite-scroll | replace with `useInfiniteRecords` |

### Webhook → `dist/docs/webhooks.md`
| Pattern | Grep signal |
|---|---|
| W1 Hand-rolled HMAC verification | manual `crypto.createHmac` against the webhook secret — use `createWebhookHandler` |

### Debug → `dist/docs/troubleshooting.md`
| Pattern | Grep signal |
|---|---|
| D1 Custom SDK request logging | bespoke `fetch` wrapper instead of `BRANDAPP_SDK_DEBUG` / `BRANDAPP_SDK_LOG_FORMAT` |

### CMS / external site (1.8+) → `dist/docs/cms-external.md`
| Pattern | Grep signal |
|---|---|
| CMS1 Calling removed write surface | `cms.posts.create` / `.update` / `.delete` / `cms.tags.create` — gone in 1.8 |
| CMS2 Hand-rolled blog metadata | manual `<head>` tags — use `toMetadata(post)` |
| CMS3 Hand-rolled sitemap / RSS | manual XML — use `toSitemapItems` / `toRssFeed` |

## Step 4 — Report

For each finding emit:

```
[<pattern-id>] <pattern-name>
  file:line
  why: <one line — pulled from dist/docs/...md>
  fix: <one line + link to dist/docs/<file>.md#anchor>
```

Group by category; lead with version-gate failures (Step 2). Do not paste full before/after code in the report — keep it scannable.

## Step 5 — Offer auto-fix

Patterns P5/P6/P7/P8/P9/Sch3/R1/R2/W1/CMS2/CMS3 are mechanical rewrites — offer to apply directly. P1/P3/Auth*/Err3/Cfg*/Sch1/Sch4/Sch5 require human judgment — propose, don't apply.

## Safety

- Never apply fixes that change `.env` keys without explicit user approval (2.0 rename is wholesale).
- Never edit `package.json` version pins without confirming the rest of the matrix passes Step 2.
- Read `dist/docs/` for the canonical fix; do not invent code that the docs do not endorse.
