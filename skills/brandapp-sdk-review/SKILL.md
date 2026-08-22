---
name: brandapp-sdk-review
description: Review consumer project code for @reopt-ai/brandapp-sdk anti-patterns across Auth, EAV, Plans, Files, and webhooks. Triggers on "brandapp-sdk review", "SDK review", "improve SDK usage", "EAV optimization", "brandapp-sdk audit", "checkout review", "Files API review", "subscription webhook audit".
target: "@reopt-ai/brandapp-sdk"
targetMinVersion: "4.0.0"
---

# Brandapp SDK Review

> This is NOT the SDK you know. Read `node_modules/@reopt-ai/brandapp-sdk/docs/` before judging any usage (the package ships docs at top-level `docs/`, not `dist/docs/`). Anti-pattern remedies live there; this skill is grep keys + categories only. **Two surfaces are not in `docs/`:** Better Auth wiring lives in the package `README.md`, and 3.1–4.0 breaking detail lives in `CHANGELOG.md` (`migration.md` stops at `2.x → 3.0.0`).

## Step 1 — Pin agent rules into AGENTS.md / CLAUDE.md

Source: the module's own agent-rules file once it ships one (`@reopt-ai/brandapp-sdk` does not, as of 4.0.0). Fallback: `agent-rules.md` bundled with this skill. Wrap the source between `<!-- BEGIN:reopt/brandapp-sdk-agent-rules -->` and `<!-- END:reopt/brandapp-sdk-agent-rules -->`.

Markers are shared with `brandapp-sdk-install` — same module, one block. If the block already exists from install, leave it alone (replace only when stale).

## Step 2 — Version gate

Inspect the installed version with `grep '"@reopt-ai/brandapp-sdk"' package.json`.

Also read the installed `better-auth` version — 4.0 and 1.7 move together.

- `>= 4.0.0` — **Better Auth 1.7 wiring is mandatory.** `better-auth < 1.7.1` in `package.json` is a broken install. Run Auth5/Auth8; the 1.6 client plugin, `signIn.oauth2`, and the `/api/auth/oauth2/callback/reopt` path no longer exist.
- `< 4.0.0` — the app is on the 1.6 flow. Before recommending the bump, check that any **self-registered** redirect URI has `${BETTER_AUTH_URL}/api/auth/callback/reopt` added in the studio (exact match) — upgrading first breaks sign-in. Then Auth8 lists the call-site rewrites.
- `< 3.6.0` — no EAV record-list `select` projection (wide list views must fetch all values; recommend 3.6 before applying Perf2); `< 3.5.0` also has no Files folders, rename/move, `readContent`, `usage`, or matching React hooks (recommend 3.5 for file-manager work).
- `< 3.4.0` — no subscription lifecycle webhooks, live Paddle hosted checkout/unified live cancellation result, or two-way feedback; `< 3.1.0` has no `plans` hosted checkout at all (`createCheckout` / `getCheckout` / `cancel`). For any subscription / checkout UI recommend 3.4+ and run Err5/W3.
- `< 3.2.0` — no OIDC Single Logout. Flag hand-rolled token verification / end-session redirects; recommend 3.2+ (3.3 adds reliable request IDs + retryable 503 infrastructure failures).
- `< 3.0.0` — **webhook contract differs from the live platform sender**: 2.x `verifySignature(body, sig, secret)` + `record.*` event handlers silently 401-reject / never fire in prod. Browser `clientSecret` was allowed (now throws `CONFIG_BROWSER_SECRET`). `ReoptAdapterConfig` / `ReoptEavConfig` / `ReoptAdapterError` aliases still exist (removed in 3.0). Bump to 3.0 and run the W / Cfg patterns below.
- `< 2.3.0` — AI errors are not unified, model metadata is incomplete, and `< 2.2.0` also retries mutations by default, treats AI timeout as wall-clock, backfills per record, and lacks `QUERY_TOO_LARGE`. `< 2.0.0` predates the env-var rename (no aliases) and incrementally lacks the service token, schema drift, host split, narrowed EAV errors, and 4xx classes — migrate `.env` + bump **first**; every pattern below assumes 2.0+.

## Step 3 — Detect anti-patterns by category

For each match, name the pattern, point at the file/line, then route the consumer to the relevant `docs/` section (paths relative to `node_modules/@reopt-ai/brandapp-sdk/docs/`; `api-reference.md` is the combined surface). **Do not paste before/after code into the review report — read the doc and quote the canonical fix.**

### SDK init / lifecycle → `docs/api-reference.md`
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

### Auth wiring → package `README.md` (Better Auth wiring) + `docs/api-reference.md` (`sdk.auth`, session helpers)
| Pattern | Grep signal |
|---|---|
| Auth1 No error boundary on `useSession` | `authClient.useSession()` without try/catch or ErrorBoundary nearby |
| Auth2 No `middleware.ts` route protection | `middleware.ts` absent; auth checked inside page components |
| Auth3 Module-level mutable auth state | `let session` / `let user` at module scope |
| Auth4 `signOut` without error handling | `authClient.signOut(` not awaited or unguarded |
| Auth5 Sign-in result unhandled | `signInWithReopt(` / `signIn.social(` awaited into nothing, or caught without surfacing |
| Auth6 No session cache strategy | repeated `getSession()` calls per request |
| Auth7 Re-implementing cross-subdomain session verification | manual cookie parsing for `*.reopt.ai`; use `verifySession` / `getSessionFromCookies` |
| Auth8 **Removed 1.6 auth surface (4.0 breaks these)** | `createReoptOAuthClient`, `genericOAuthClient`, `signIn.oauth2(`, `oauth2.link(`, the literal `/api/auth/oauth2/callback/reopt`, or `better-auth` pinned `<1.7.1` — rewrite to `signInWithReopt` / `linkReoptAccount`, or plain `signIn.social({ provider: "reopt" })` / `linkSocial()` |

### Error handling → `docs/errors.md`
| Pattern | Grep signal |
|---|---|
| Err1 Generic `catch` instead of SDK error classes | `catch (e)` without `isReoptSDKError` / class check |
| Err2 Unhandled API errors (no `handleApiError` wrapper) | route handlers without a centralized error handler |
| Err3 EAV mutation on `linkedTo='brandappAuthUser'` without 1.9 narrowed catches | `records.create` / bulk on linked entity, no `AuthUserRecordExistsError` / `DuplicateAuthUserError` / `AuthUserNotFoundError` branch |
| Err4 Legacy `e.code === 'REQUEST_ERROR'` string check | literal string match — pre-1.9 only |
| Err5 Stale hosted checkout (3.4+) | custom required-terms gate before `createCheckout`, or all live payments treated as unsupported — hosted page collects consent, live Paddle works; only priced live Toss returns 409 |

### Config / security → `docs/environment.md` (env / hosts), `docs/api-reference.md` (service token)
| Pattern | Grep signal |
|---|---|
| Cfg1 Hardcoded URL / stale host (`www.reopt.ai`, legacy `brand.reopt.ai` → `brandapp.reopt.ai`) | `baseUrl:` literal containing `www.reopt.ai` / `brand.reopt.ai` |
| Cfg2 Missing `import "server-only"` | `createReopt*` / `createLazySDK` called in a file without server-only |
| Cfg3 `!` non-null env assertions w/o validation | `process.env.BRANDAPP_*!` without zod / t3-env nearby |
| Cfg4 Redundant `clientSecret` alongside a `token` (token wins, 3.0) | `token:` and `clientSecret:` on the same `ReoptSDKConfig` — drop `clientSecret` |
| Cfg5 `clientSecret` reachable in the browser (3.0 throws `CONFIG_BROWSER_SECRET`) | `NEXT_PUBLIC_BRANDAPP_CLIENT_SECRET`, or `clientSecret:` in a `"use client"` file / `createBrandappProvider` — mint a server token, pass `{ token }` |
| Cfg7 Per-environment `REOPT_ID_BASE_URL` (4.0) | the var set to different hosts across `.env*` / deploy configs — 4.0 namespaces accounts by the discovered `issuer`, so a moved host resolves existing users as new accounts |
| Cfg6 Removed type/error aliases (3.0) | `ReoptAdapterConfig` / `ReoptEavConfig` / `ReoptAdapterError` — rename to `ReoptSDKConfig` / `ReoptSDKError` |
| D1 Custom SDK request logging | bespoke `fetch` wrapper instead of `BRANDAPP_SDK_DEBUG` / `BRANDAPP_SDK_LOG_FORMAT` |

### Schema / types → `docs/api-reference.md`
| Pattern | Grep signal |
|---|---|
| Sch1 Type-safe entity client unused | `sdk.eav.entity(` w/o `schema` passed at SDK init |
| Sch2 Hand-rolled schema resolution cache | manual Map of entityName → entityId |
| Sch3 Hardcoded `attributeId` literals | UUID-shaped strings in attribute lookups |
| Sch4 `defineEntity` missing `linkedTo` for 1:1 user metadata | per-user entity without `linkedTo: 'brandappAuthUser'` |
| Sch5 Schema drift unchecked (1.11+) | no `computeEavSchemaHash` in build / no `verifyEavSchema` probe |

### Performance → `docs/api-reference.md`
| Pattern | Grep signal |
|---|---|
| Perf1 Duplicate SDK clients per file | multiple `createLazySDK(` / `createReoptSDK(` in `lib/` |
| Perf2 Over-fetching attributes (3.6+) | `records.list` / `listAll` without `select:` on a wide entity when the view reads a known subset |

### React → `docs/api-reference.md`
| Pattern | Grep signal |
|---|---|
| R1 Manual `useEffect` + `useState` for EAV fetching | replace with `useRecords` / `useRecord` |
| R2 Manual invalidation after mutation | replace with `useUpsertRecord` etc. (auto-invalidate) |
| R3 Manual infinite-scroll | replace with `useInfiniteRecords` |

### Files (3.5+) → `docs/files.md`
| Pattern | Grep signal |
|---|---|
| F1 Parallel file-manager client | custom `/files` / `/folders` REST wrappers while `sdk.files` is absent — use the SDK's file/folder CRUD |
| F2 Unsafe preview or domain-error handling | `fetch(file.url).text()` instead of `readContent`, or upload/delete/folder mutations without `STORAGE_LIMIT` / `FILE_IN_USE` / `FOLDER_NOT_EMPTY` branches |

### Webhook → `docs/api-reference.md`
| Pattern | Grep signal |
|---|---|
| W1 Hand-rolled HMAC verification | manual `crypto.createHmac` against the webhook secret — use `createWebhookHandler` |
| W2 Stale 2.x webhook contract (3.0 breaking) | `record.created`/`record.updated`/`entity.`/`subscription.changed`/`customer.created` in `handlers:`, or `verifySignature(` called with 3 args — move to `contactCreated`/`contactUpdated`/`contactDeleted`/`workflowRun*` + timestamp-first `verifySignature(timestamp, body, sig, secret)` |
| W3 Unsafe subscription entitlement sync (3.4+) | subscription lifecycle handler missing `data.brandappId` filter, or `subscriptionCanceled` revokes immediately instead of honoring `accessUntil` |

### CMS / external site (1.8+) → `docs/cms.md`
| Pattern | Grep signal |
|---|---|
| CMS1 Calling removed write surface | `cms.posts.create` / `.update` / `.delete` / `cms.tags.create` — gone in 1.8 |
| CMS2 Hand-rolled blog metadata | manual `<head>` tags — use `toMetadata(post)` |
| CMS3 Hand-rolled sitemap / RSS | manual XML — use `toSitemapItems` / `toRssFeed` |

## Step 4 — Report

For each finding emit `[pattern-id] pattern-name`, `file:line`, one-line `why` from the routed doc, and one-line `fix` with its doc anchor. Group by category; lead with version-gate failures. Do not paste full before/after code.

## Step 5 — Offer auto-fix

Patterns P5/P6/P7/P8/P9/Sch3/R1/R2/W1/W2/Cfg6/CMS2/CMS3 are mechanical rewrites — offer to apply directly. P1/P3/Auth*/Err3/Err5/Cfg1–Cfg5/Sch1/Sch4/Sch5/F1/F2/W3 require human judgment — propose, don't apply.

## Safety

- Never apply fixes that change `.env` keys without explicit user approval (2.0 rename is wholesale); never edit `package.json` version pins without confirming the rest of the matrix passes Step 2.
- Read `docs/` for canonical fixes — with two exceptions. Better Auth wiring (Auth5/Auth8) is documented **only** in the package `README.md` + `CHANGELOG.md` `[4.0.0]`; quoting `api-reference.md`'s Auth section there is wrong (it is the user-token API). And `migration.md` has no section past `2.x → 3.0.0`.
- Exception 2: the 3.6 checkout examples in `api-reference.md` / `errors.md` retain the older `RequiredTermsError` gate; follow the declaration JSDoc resolved from the installed `@reopt-ai/brandapp-sdk/plans` export (hosted order-review collects consent) for current servers.
