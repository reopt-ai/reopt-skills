# This is NOT the SDK you know

`@reopt-ai/brandapp-sdk` ships frequent breaking changes that may differ from your training data. Read the relevant guide in `node_modules/@reopt-ai/brandapp-sdk/dist/docs/` before writing or reviewing any code. Heed deprecation notices.

## Doc map

| Task | Read |
|---|---|
| Quickstart, `createLazySDK`, `lib/sdk.ts` | `dist/docs/quickstart.md` |
| Better Auth wiring, OAuth, `lib/auth.ts` | `dist/docs/auth.md` |
| EAV (`defineEntity`, `linkedTo`, drift hash, `findOne`, `upsert`, `listAll`, `bulkUpdate`, `bulkDelete`, `deleteWhere`, `count`, `asEnum`, `asString`/coerce helpers) | `dist/docs/eav.md` |
| Webhooks (`createWebhookHandler`, replay protection) | `dist/docs/webhooks.md` |
| Marketing-site helpers (`toMetadata`, `toSitemapItems`, `toRssFeed`, `verifySession`, `optimizeUrl`) | `dist/docs/cms-external.md` |
| Error classes (`AuthError`, `ForbiddenError`, `AuthUserRecordExistsError`, `LimitExceededError`, `isReoptSDKError`) | `dist/docs/errors.md` |
| Service token, `Authorization: Bearer` (1.12+) | `dist/docs/service-token.md` |
| Dev server (offline development) | `dist/docs/dev-server.md` |
| React hooks (`useUpsertRecord`, `useBulkCreateRecords`, infinite list) | `dist/docs/react-hooks.md` |

## Hard rules

- **Env namespace (2.0+):** `BRANDAPP_*` = your credentials. `REOPT_*` = platform hosts (rarely set). `BRANDAPP_SDK_*` = behavior toggles. `NEXT_PUBLIC_BRANDAPP_*` = browser-safe subset. No `REOPT_CLIENT_*` / `REOPT_BRANDAPP_ID` / `REOPT_WEBHOOK_SECRET` / `REOPT_SDK_*` / `NEXT_PUBLIC_REOPT_*` / `NEXT_PUBLIC_EAV_HASH` aliases — 2.0 dropped them.
- `BRANDAPP_ID` = brandappId (app), not brandId (brand).
- `BETTER_AUTH_URL` must match the browser-facing origin exactly.
- Never hardcode `GITHUB_TOKEN` in `.npmrc` — inject via shell / CI secret.
- Never put `NODE_TLS_REJECT_UNAUTHORIZED=0` in `.env` — script-scope only. Never in production.
- `createReoptAdapter` / `createReoptOAuth` / `createReoptBetterAuth` throw in browser runtimes. Server-only (`import "server-only"`).
- `cms` is read-only from 1.8+ — `posts.create/update/delete` and `tags.create` are gone. Content authoring lives in Reopt Studio.
- 1.10+ split hosts: main API `brand.reopt.ai`, auth `id.reopt.ai`. Don't hardcode `www.reopt.ai`.
- `isReoptSDKError()` over `instanceof ReoptSDKError` — bundle-safe across SDK copies.
- 1.12+ service token and `clientId`/`clientSecret` cannot mix on the same client. Pick one auth mode per SDK instance.
