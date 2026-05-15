---
name: brandapp-sdk-install
description: Install @reopt-ai/brandapp-sdk in a consumer project. Sets up auth, OAuth client, EAV, API routes, and env config. Triggers on "brandapp-sdk install", "brandapp-sdk init", "brandapp sdk setup", "brandapp sdk bootstrap", "apply SDK", "brandapp integration".
target: "@reopt-ai/brandapp-sdk"
targetMinVersion: "2.0.0"
---

# Brandapp SDK Install

> This is NOT the SDK you know. Read `node_modules/@reopt-ai/brandapp-sdk/dist/docs/` before writing code. Heed deprecation notices — 2.0 renamed every env var without aliases.

## When to apply

A consumer project adopting `@reopt-ai/brandapp-sdk` for the first time. Triggers: "install", "init", "setup", "bootstrap", "apply SDK", "brandapp integration" against `@reopt-ai/brandapp-sdk`.

## Step 1 — Pin agent rules into AGENTS.md / CLAUDE.md

Source of truth for the rules block: `node_modules/@reopt-ai/brandapp-sdk/dist/agent-rules.md`. Fallback when the module hasn't published it yet (pre-2.0 publish or transition period): `agent-rules.md` shipped with this skill.

Append to the consumer's `AGENTS.md` (fall back to `CLAUDE.md` if `AGENTS.md` is absent — never both). Wrap the content between:

```
<!-- BEGIN:reopt/brandapp-sdk-agent-rules -->
…content from source above…
<!-- END:reopt/brandapp-sdk-agent-rules -->
```

**Idempotent:** if the markers already exist, replace only the content between them. **Never touch text outside the markers** — the consumer's own rules live there.

## Step 2 — Consumer-side setup (this skill owns; docs cannot)

These are properties of the consumer project, not the module. They will not appear in `dist/docs/`.

1. **Registry auth** — project-root `.npmrc`:

   ```
   @reopt-ai:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```

   `GITHUB_TOKEN` is a PAT with `read:packages`. Inject via shell or CI secret. **Never hardcode.**

2. **Env namespace (2.0+)** — 3 tiers, no aliases for renamed vars:

   | Prefix | Owner | Purpose |
   |---|---|---|
   | `BRANDAPP_*` | Consumer | Credentials (`BRANDAPP_CLIENT_ID/SECRET`, `BRANDAPP_ID`, `BRANDAPP_WEBHOOK_SECRET`) |
   | `REOPT_*` | Platform | Host overrides only (`REOPT_BASE_URL`, `REOPT_ID_BASE_URL`) |
   | `BRANDAPP_SDK_*` | Consumer | Behavior toggles (`BRANDAPP_SDK_DEBUG`, `BRANDAPP_SDK_LOG_FORMAT`) |
   | `NEXT_PUBLIC_BRANDAPP_*` | Browser | Public subset (e.g. `NEXT_PUBLIC_BRANDAPP_EAV_HASH`) |

   Pre-2.0 `REOPT_CLIENT_*` / `REOPT_BRANDAPP_ID` / `REOPT_WEBHOOK_SECRET` / `REOPT_SDK_*` are gone. Migrate `.env` before bumping.

3. **Peer deps** — `better-auth` is required when using Auth. Optional: `@ai-sdk/provider`, `@tanstack/react-query`.

4. **Optional dev-mode bootstrap** — `npx @reopt-ai/cli brandapp init` scaffolds the offline dev server (see `reopt-brandapp` skill). It does **not** create `.npmrc`, `.env.local`, `lib/sdk.ts`, `lib/auth.ts`, auth route handler, or webhook route — those remain this skill's responsibility.

## Step 3 — Route to module docs

For everything else (code generation, API surface, version-specific behavior, error handling), route to module docs. Do **not** duplicate API surface here — read the file. Module docs are pinned to the installed version; this skill is not.

| Task signal | Read |
|---|---|
| `createReoptSDK` / `createLazySDK`, `lib/sdk.ts` | `dist/docs/quickstart.md` |
| Better Auth wiring, `lib/auth.ts`, OAuth flow | `dist/docs/auth.md` |
| `defineEntity` / `defineSchema`, EAV schema, `linkedTo`, drift hash | `dist/docs/eav.md` |
| `createWebhookHandler`, `toleranceMs`, event types | `dist/docs/webhooks.md` |
| Marketing site (`toMetadata`, `toSitemapItems`, `verifySession`, `optimizeUrl`) | `dist/docs/cms-external.md` |
| Error classes (`AuthError`, `ForbiddenError`, `AuthUserRecordExistsError`, `LimitExceededError`) | `dist/docs/errors.md` |
| Service token (1.12+), `Authorization: Bearer` | `dist/docs/service-token.md` |
| Dev server (`createDevServer`, `instrumentation.ts`) | `dist/docs/dev-server.md` |

## Safety

- Never hardcode `GITHUB_TOKEN` in `.npmrc`.
- Never put `NODE_TLS_REJECT_UNAUTHORIZED=0` in `.env` — script-scope only.
- `BRANDAPP_ID` is the **brandappId** (app), not the brandId (brand).
- `BETTER_AUTH_URL` must match the browser-facing origin exactly.
- `createReoptAdapter` / `createReoptOAuth` / `createReoptBetterAuth` throw in browser runtimes — keep behind `import "server-only"`.

## Verify

1. `npx tsc --noEmit` passes.
2. (Auth) `curl -I http://localhost:3000/api/auth/ok` → 200.
3. (Any module) `await sdk.eav.entities.list()` succeeds from a server component. 401 → credentials. 404 → `BRANDAPP_ID`.
4. (Optional) mirror `apps/brandapp-playground/app/health/` for a 12-probe deploy check.
