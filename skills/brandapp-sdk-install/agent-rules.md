# This is NOT the SDK you know

`@reopt-ai/brandapp-sdk` ships frequent breaking changes that may differ from your training data. It ships docs at top-level `docs/` (not `dist/docs/`) — read the relevant guide in `node_modules/@reopt-ai/brandapp-sdk/docs/` before writing or reviewing any code. Heed deprecation notices.

## Doc map

`api-reference.md` is the combined surface (SDK init, Auth, EAV, webhooks, service token, React hooks, AI); the rest are topic files.

| Task | Read |
|---|---|
| SDK init (`createLazySDK`, `lib/sdk.ts`), Better Auth + OAuth (`lib/auth.ts`), EAV (`defineEntity`, `linkedTo`, drift hash, `findOne`, `upsert`, `listAll`, `bulkUpdate`, `bulkDelete`, `deleteWhere`, `count`, `backfill`, `asEnum` / coerce helpers), webhooks (`createWebhookHandler`, replay protection), service token (`Authorization: Bearer`, 1.12+), React hooks (`useUpsertRecord`, `useBulkCreateRecords`, infinite list), AI (`sdk.ai.models()` / `sdk.ai.stream`, `useAiStream`, `useAiAgents`) | `docs/api-reference.md` |
| Env vars + 3-tier namespace, host split | `docs/environment.md` |
| Error classes (`AuthError`, `ForbiddenError`, `AuthUserRecordExistsError`, `LimitExceededError`, `CreditLimitError` 402, `ModelAccessError` 403, `ModelNotFoundError` 404, `ContentFilterError` 422, `QUERY_TOO_LARGE`; guards `isReoptSDKError` / `isCreditLimitError` / `isModelAccessError`) | `docs/errors.md` |
| Marketing-site / CMS helpers (`toMetadata`, `toSitemapItems`, `toRssFeed`, `verifySession`, `optimizeUrl`) | `docs/cms.md` |
| File management | `docs/files.md` |
| Dev server (offline development) | `docs/dev-server.md` |
| Migration / breaking changes | `docs/migration.md` |
| Testing | `docs/testing.md` |

## Hard rules

- **Env namespace (2.0+):** `BRANDAPP_*` = your credentials. `REOPT_*` = platform hosts (rarely set). `BRANDAPP_SDK_*` = behavior toggles. `NEXT_PUBLIC_BRANDAPP_*` = browser-safe subset. No `REOPT_CLIENT_*` / `REOPT_BRANDAPP_ID` / `REOPT_WEBHOOK_SECRET` / `REOPT_SDK_*` / `NEXT_PUBLIC_REOPT_*` / `NEXT_PUBLIC_EAV_HASH` aliases — 2.0 dropped them.
- `BRANDAPP_ID` = brandappId (app), not brandId (brand). MCP `reopt_brandapp_list` looks it up.
- `BETTER_AUTH_URL` must match the browser-facing origin exactly.
- Never hardcode `GITHUB_TOKEN` in `.npmrc` — inject via shell / CI secret.
- Never put `NODE_TLS_REJECT_UNAUTHORIZED=0` in `.env` — script-scope only. Never in production.
- `createReoptAdapter` / `createReoptOAuth` / `createReoptBetterAuth` throw in browser runtimes. Server-only (`import "server-only"`).
- `cms` is read-only from 1.8+ — `posts.create/update/delete` and `tags.create` are gone. Content authoring lives in Reopt Studio.
- 1.10+ split hosts: main API `brand.reopt.ai`, auth `id.reopt.ai`. Don't hardcode `www.reopt.ai`.
- `isReoptSDKError()` over `instanceof ReoptSDKError` — bundle-safe across SDK copies.
- 1.12+ service token and `clientId`/`clientSecret` cannot mix on the same client. Pick one auth mode per SDK instance.
- **Mutations aren't retried by default (2.2+):** POST/PATCH skip retry on 5xx / network / timeout (dup-write / dup-credit guard); 429 always retries; opt in with `config.retryNonIdempotent`. An `Idempotency-Key` is sent for server-side dedup.
- AI streaming `config.timeout` is an **idle** (between-chunk) gap, not wall-clock (2.2+). Streaming 402 surfaces as `CreditLimitError`; AI SDK provider errors are `APICallError` (2.3+).
- Large EAV `backfill` batches via `bulkUpdate` (2.2+) — tune `BackfillOptions.batchSize`; don't hand-roll per-record update loops.
