# Compatibility Matrix

Each skill declares the minimum `@reopt-ai/*` package version it assumes. "Last
verified" = date the skill was last reconciled against that package version.
Update both columns in the PR that touches a skill.

The **Target** column lists the single primary package (matches the skill's
`target` / `targetMinVersion` frontmatter, which `pnpm validate` cross-checks).
Per-version detail lives in each package's docs; this table stays terse.

> **Verification level (2026-08-22 round):** re-checked both sibling monorepos
> and every target's public npm `latest` tag (with an explicit
> `--@reopt-ai:registry=https://registry.npmjs.org` — the machine's user
> `.npmrc` still scopes `@reopt-ai` to GitHub Packages, which serves much older
> versions and silently reads as "no drift"). One target moved:
> `@reopt-ai/brandapp-sdk` **3.6.0 → 4.0.0**, published 2026-08-21. Every other
> target is unchanged (`cli` 0.5.0, `opt-ui` 1.6.0, `opt-datagrid` 1.5.0,
> `opt-editor` 2.0.0, `opt-chat` 1.1.0, `opt-shell` 1.1.0, design CLI 1.3.0).
> Source-checked against `src/better-auth/*`, **not** re-run through the full
> install → `tsc --noEmit` → smoke procedure.
>
> — **brandapp-sdk 4.0.0 (Better Auth 1.7):** major because 1.7 rebuilt generic
> OAuth on the social-provider path. `createReoptOAuthClient()` and
> `signIn.oauth2({ providerId })` are **removed** (no client plugin exists in
> 1.7) — sign-in is `signInWithReopt(authClient, …)` / `linkReoptAccount()` from
> `@reopt-ai/brandapp-sdk/better-auth/client`, wrapping
> `signIn.social({ provider: "reopt" })` / `linkSocial()`. The callback moved to
> `${baseURL}/api/auth/callback/reopt` (1.6: `/api/auth/oauth2/callback/reopt`);
> Reopt system clients have both registered, a self-registered redirect URI does
> not. The `better-auth` peer is `^1.7.1` and will not work with 1.6. The SDK
> now sends `client_secret_post` (override via
> `createReoptOAuth({ tokenEndpointAuthMethod })`), keeps `signOut()` app-local
> behind `disableProviderLogout` (opt in with `providerLogout`), and delegates
> 1.7's required `consumeOne` / `incrementOne` atomic ops to the Reopt API.
> PKCE is on by default and the discovered `issuer` namespaces accounts, so
> `REOPT_ID_BASE_URL` must stay stable across deploys.
>
> — **Docs-routing correction (pre-existing, found this round).** `docs/`
> contains **no** Better Auth wiring at all: `createReoptBetterAuth` /
> `createReoptOAuth` / `createReoptAdapter` appear only in the package
> `README.md`, while `docs/api-reference.md`'s "Auth Client" section is the
> user-token API (`sdk.auth.linkCurrentUser` etc.) — a different surface. Both
> skills previously routed "Better Auth + OAuth" to `api-reference.md`. They now
> route that surface to `README.md` + `CHANGELOG.md`. Separately,
> `docs/migration.md` still tops out at `2.x → 3.0.0`, so it covers none of
> 3.1–4.0; the skills now say so explicitly rather than pointing agents at a
> file that is silent on every recent breaking change. This is the third
> consecutive release (3.1 plans, 3.6 checkout, 4.0 auth) whose breaking surface
> landed ahead of `docs/`.
>
> **Prior round (2026-08-10):** re-checked both sibling monorepos,
> every target's live public npm `latest` tag, and all eight published tarball
> inventories. There is no target-version, export, docs-layout, Node-engine, or
> fallback change since 2026-08-08; none of the packages ships `agent-rules.md`.
> The only later `brandapp-sdk/package.json` changes are development-only bumps
> (`opt-editor` 1.1.2 → 2.0.0 and `@ai-sdk/provider` 4.0.4 → 4.0.7), and no
> relevant `reopt-design` target-package commit landed after the prior snapshot.
> Full consumer install → `tsc` → runtime smoke was not repeated.
>
> **Prior round (2026-08-08):** re-checked both sibling monorepos
> (`reopt` + `reopt-design`), public npm `latest` metadata, published manifests,
> and `npm pack --dry-run` file inventories for every targeted package. Changed
> since 2026-07-24: `brandapp-sdk` **3.3.0 → 3.6.0**, `opt-ui` **1.5.0 →
> 1.6.0**, `opt-datagrid` **1.4.2 → 1.5.0**, `opt-editor` **1.1.2 → 2.0.0**,
> `opt-chat` **1.0.0 → 1.1.0**, `opt-shell` **1.0.0 → 1.1.0**, and design CLI
> **1.2.0 → 1.3.0**. `@reopt-ai/cli` remains 0.5.0.
> — **brandapp-sdk 3.4–3.6:** subscription lifecycle webhooks + live Paddle
> checkout/unified cancellation, Files folder/rename/move/preview/usage APIs, and
> EAV record-list `select` projection. Current server checkout collects required
> terms on the hosted order-review page; the published 3.6
> `docs/api-reference.md` / `docs/errors.md` still contain an older
> `RequiredTermsError` catch example, so the skills explicitly route current
> checkout behavior to the declaration JSDoc resolved from the installed
> `@reopt-ai/brandapp-sdk/plans` export until those docs catch up.
> — **design 2026-07-29 suite:** opt-editor 2.0 moves runtime Zod schema values
> from `/server` to `/schemas` and requires canonical V2 stored content;
> opt-datagrid 1.5 bounds value-cache growth and adds `/ai-stream`; opt-chat 1.1
> replaces StickToBottom-era props and makes `PromptInput` a native form;
> opt-shell 1.1 applies policy to `<html>` and adds preference/shortcut layers;
> opt-ui 1.6 adds optional `app.css`. opt-cli 1.3 makes `opt block` primary,
> adds project sync, and has **no top-level `opt doctor`** — checks are
> `opt block doctor` or `opt harness doctor`. Source + published package layout
> verified; all six packages declare Node 20+. Full consumer install → `tsc` →
> runtime smoke was not run.
>
> **Prior round (2026-07-24):** re-checked the sibling monorepo
> source (`reopt`) after a two-package bump. Changed vs the 2026-07-16 round:
> `@reopt-ai/cli` **0.3.1 → 0.5.0** and `@reopt-ai/brandapp-sdk` **3.1.0 →
> 3.3.0**.
> — **cli 0.4.0** is a breaking pre-launch hardening pass: the env-var rename
> (`REOPT_CLIENT_*` / `REOPT_ENV` / `REOPT_BRANDAPP_ID` → `BRANDAPP_*`, **no
> aliases**) finally shipped in the CLI (the skills already used the `BRANDAPP_*`
> names, so `targetMinVersion` rises to 0.5.0 to make the skill honest — those
> names do not exist on 0.3.1); data output moved to **stdout** as raw
> server items; `.reopt.config.mjs` is now trust-on-first-use (`REOPT_TRUST_CONFIG=1`);
> `eav sync` gained **safe-mode** — orphan deletes / `isRequired`·`isUnique`
> promotions / select-option removals are blocked (exit `7`) unless `--force`,
> and a mutating sync takes the migrate advisory lock (exit `10`). **cli 0.5.0**
> threads `--timeout`/`--max-retries` into `eav`, surfaces brandapp-sdk ≥3.3.0
> `context.requestId` + fix hints, and hardens `--schema` path / CSV export.
> — **brandapp-sdk 3.2.0** adds OIDC **Single Logout** (`@reopt-ai/brandapp-sdk/logout`:
> `createBackchannelLogoutHandler` / `verifyBackchannelLogoutToken` /
> `buildEndSessionUrl`; new `docs/logout.md`); **3.3.0** is backward-compatible
> logout/security hardening (JWKS refetch throttle, fail-closed fetch timeouts,
> 503-vs-400 split, reliable error `requestId`, `FetchOptions.idempotent`,
> caller-cancel `CANCELLED`, `dev.mintLogoutToken`). Also corrected a stale host
> reference across the SDK skills: the prod main API is **`brandapp.reopt.ai`**
> (the older `brand.reopt.ai` is legacy; auth stays `id.reopt.ai`).
> Source-checked, **not** re-run through the full install → `tsc --noEmit` →
> smoke procedure.
>
> **Prior round (2026-07-16):** re-checked the sibling monorepo
> source (`reopt` + `reopt-design`) after a package bump. Changed vs the
> 2026-07-13 round: `@reopt-ai/brandapp-sdk` **3.0.0 → 3.1.0** (additive —
> `sdk.plans` gains hosted checkout: `createCheckout` / `getCheckout` / `cancel`,
> new `RequiredTermsError` + `LIVE_MODE_UNSUPPORTED` 409; the checkout surface is
> **not documented in `docs/` yet**, so skills route to the
> `@reopt-ai/brandapp-sdk/plans` export types and the guardrails live in the
> shared `agent-rules.md`), `opt-ui` **1.4.1 → 1.5.0** (Drawer slide animations
> tokenized via `OPT_ANIMATE_DRAWER` — runtime behavior unchanged, exports
> identical), and `opt-cli` **1.1.1 → 1.2.0** (adds `opt component` +
> `opt surface diff`; **`@reopt-ai/opt-shell` moved to `peerDependencies`** so
> opt-ui-only consumers may need to install it — tarball 1.1 MB → 108 kB).
> Unchanged: `cli` 0.3.1, `opt-datagrid` 1.4.2, `opt-editor` 1.1.2, `opt-chat`
> 1.0.0, `opt-shell` 1.0.0. Source-checked, **not** re-run through the full
> install → `tsc --noEmit` → smoke procedure.
>
> **Prior round (2026-07-13):** every package targeted by a skill
> was checked against the sibling monorepo source and the public npmjs registry.
> `@reopt-ai/brandapp-sdk` 3.0.0, `@reopt-ai/cli` 0.3.1, `opt-ui` 1.4.1,
> `opt-datagrid` 1.4.2, `opt-editor` 1.1.2, `opt-chat` 1.0.0, `opt-shell` 1.0.0,
> and `opt-cli` 1.1.1 all resolve publicly with no install token. Install skills
> now remove a legacy `@reopt-ai:registry=https://npm.pkg.github.com` project
> override instead of creating one. `opt-chat` / `opt-shell` 1.0.0 are stable
> public releases with no breaking API change from 0.x; `opt-editor` 1.1.2 uses
> optional `ai >= 7` / `zod >= 3` peers for AI integration. Published
> `opt-shell` 1.0.0 exports only `.`, `./core`, and `./meta`; its bundled
> `./audit` references are stale, so authoring audits route to
> `@reopt-ai/opt-cli/audit` / `opt harness`. Source + registry checked,
> **not** re-run through the full install → `tsc --noEmit` → smoke procedure at
> the bottom of this file.
>
> **Prior round (2026-06-26):** `@reopt-ai/brandapp-sdk` **2.3.0 →
> 3.0.0** reconciled by reading the package source in the `reopt` monorepo
> (`packages/brandapp-sdk`) — `CHANGELOG.md`, `docs/migration.md`,
> `src/core/config.ts` (`assertBrowserSafe` / `validateConfig`), the webhook
> contract in `docs/api-reference.md`. 3.0 is a security-review follow-up: the
> webhook verification contract + `verifySignature` signature changed (now
> aligned to the live platform sender), browser `clientSecret` is blocked
> (`CONFIG_BROWSER_SECRET`) with an additive token-only config, and the
> long-`@deprecated` `ReoptAdapterConfig` / `ReoptEavConfig` / `ReoptAdapterError`
> aliases were removed. docs layout is unchanged (still top-level `docs/`), so
> routing paths were not touched — only versions + the shared agent-rules and
> the install/review surface. Source-checked, **not** re-run through the full
> install → `tsc --noEmit` → smoke procedure at the bottom of this file.
>
> **Prior round (2026-06-18):** `opt-*` 1.4.x family confirmed via `npm view`
> (`opt-datagrid` 1.4.2, `opt-editor` 1.0.3, `opt-chat` 0.3.1); unchanged this
> round.

## Current state — 2026-08-22

All targets in the three tables below are public npm packages. A GitHub
Packages token or scoped `.npmrc` entry is neither required nor supported by
the install skills.

### CLI

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `reopt-cli` | `@reopt-ai/cli` | **0.5.0** | 2026-08-10 (src+npm) |

### BrandApp SDK

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `brandapp-sdk-install` | `@reopt-ai/brandapp-sdk` | **4.0.0** | 2026-08-22 (src+npm) |
| `brandapp-sdk-review` | `@reopt-ai/brandapp-sdk` | **4.0.0** | 2026-08-22 (src+npm) |

### Design / UI packages

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `opt-ui-install` | `@reopt-ai/opt-ui` | **1.6.0** | 2026-08-10 (src+npm) |
| `opt-datagrid-install` | `@reopt-ai/opt-datagrid` | **1.5.0** | 2026-08-10 (src+npm) |
| `opt-editor-install` | `@reopt-ai/opt-editor` | **2.0.0** | 2026-08-10 (src+npm) |
| `opt-chat-install` | `@reopt-ai/opt-chat` | **1.1.0** | 2026-08-10 (src+npm) |
| `opt-shell-install` | `@reopt-ai/opt-shell` | **1.1.0** | 2026-08-10 (src+npm) |

> **Doc-layout note (routing-critical — skills point at literal paths):**
> - `@reopt-ai/brandapp-sdk` ships docs at top-level **`docs/`** (NOT
>   `dist/docs/`) — flat files `api-reference.md`, `cms.md`, `dev-server.md`,
>   `environment.md`, `errors.md`, `files.md`, `logout.md`, `migration.md`,
>   `testing.md`.
>   No `index.md`; `api-reference.md` is the combined auth/EAV/webhook/React
>   surface.
> - `@reopt-ai/opt-ui` / `opt-datagrid` / `opt-editor` ship **`dist/docs/`**
>   with a numeric-prefixed tree (`01-…`, `02-api/` or `02-components/`,
>   `03-recipes/`, `0N-migration/`, `0N-troubleshooting.md`) and an `index.md`
>   hub. Route to the directory + `index.md`, not to guessed flat filenames.
> - `@reopt-ai/cli`, `opt-chat`, `opt-palette`, `opt-devtool` ship **no docs
>   dir** — route to `README.md` (and the CLI `--help` for `cli`).
>   `@reopt-ai/opt-shell` ships **`shell-llms.txt`** (agent guide) + `README.md`.
> - **No package ships `dist/agent-rules.md` yet** — every install/review skill
>   still relies on its bundled fallback `agent-rules.md`. Replace the fallback
>   with a pointer to the module's copy once a package starts shipping one.

### Design CLI (used by the UI skills)

`@reopt-ai/opt-cli` (bin `opt`, current **1.3.0**, public npm) is the unified
design CLI. Primary surfaces: `opt block add|update|remove|diff|doctor` (`surface`
is deprecated), `opt component`, `opt project link|pull|status|push`, and
`opt harness check|test|doctor`. There is no top-level `opt doctor` or `opt check`.
The binary runs under Node; opt-shell is an optional, lazy-loaded peer needed by
harness commands, not block/component commands. There is no `opt-ui-cli` or
`opt-editor-cli` package.

### Tracked but no installer skill yet

| Package | Current version | Status |
|---|---|---|
| `@reopt-ai/studio-catalog` | 2.0.0 | public npm (versioned customer-facing product/plan/AI catalog; no installer skill) |
| `@reopt-ai/opt-ui-primitives` | 1.5.0 | public npm (native HTML/browser-API a11y primitives; dependency of opt-ui/opt-chat) |
| `@reopt-ai/opt-palette` | 1.0.0 | public npm (stable OKLCH color engine; required peer of opt-shell) |
| `@reopt-ai/opt-devtool` | 1.0.1 | public npm (stable; renamed from `@reopt-ai/opt-inspect`) |
| `@reopt-ai/opt-charts` | 1.1.0 | public npm (stable Recharts adapters + SVG viz / chart frames + shells) |
| `@reopt-ai/opt-calendar` | 1.0.0 | public npm (stable events + booking/availability, drag/resize, recurrence, timezones) |
| `@reopt-ai/opt-filemanager` | 0.1.0 | public npm (connector-based file manager; first consumer of brandapp-sdk 3.5 Files APIs) |
| `@reopt-ai/opt-doc-kit` | 0.1.0 | internal, **not on npm** (`private: true`) — metadata-driven docs kit, apps/web workspace |
| `@reopt-ai/opt-uxflow` | 0.1.0 | internal, **not on npm** (`private: true`) — UX flow builder |
| `@reopt-ai/opt-ui-skills` | 0.1.0 | internal, **not on npm** (`private: true`) — new; opt-ui agent-skills bundle |
| `@reopt-ai/brandapp-ui` | 0.1.0 | internal, **not on npm** (`private: true`) — new; brandfront UI kit |
| `@reopt-ai/builder-ui` | 0.1.0 | internal, **not on npm** (`private: true`) — new; builder UI kit |
| `@reopt-ai/tool-ui` | 0.1.0 | internal, **not on npm** (`private: true`) — new; tool-surface UI kit |

`@reopt-ai/opt-ui-surface` is no longer a workspace package and has never been
published to npm. Page templates now come from the signed `opt block` registry.

### Landing in the next `@reopt-ai/cli` release (not in 0.5.0)

`packages/cli` gained a large MCP body of work after 0.5.0 shipped. The **remote**
server (`https://mcp.reopt.ai`) is already deployed and its CRM surface is live —
`reopt-cli` documents that today, since a hosted connector is independent of the
installed CLI version. What is **not** yet published, and must not be documented
as installed surface until the release lands:

- `packages/cli/plugin.json` + `mcp.json` — `@reopt-ai/cli` packaged as an
  Agent Plugins 1.0.0 plugin, declaring the remote MCP server only. A repo guard
  fails any plugin declaring both stdio and remote (10 of their tool names
  collide, and stdio's shared tools all fail before `reopt login`).
- `packages/cli/src/remote-tools.ts` — the shared tool registry that now feeds
  `title` / `annotations` to both surfaces. Published `reopt mcp` (0.5.0) still
  advertises its 14 tools with **no annotations**, so approval-gating clients
  treat them all as "ask".

When that release cuts: bump `reopt-cli` `targetMinVersion`, and revisit the
Step 4 wording that currently says the manifest is absent from 0.5.0.

## Drift checklist

Run every time a new `@reopt-ai/*` package ships:

- [ ] Does `npm view <package> version --@reopt-ai:registry=https://registry.npmjs.org`
      resolve the intended public release? The **scoped** flag is required — a
      plain `--registry=` does not override a `@reopt-ai:registry` line in the
      user `.npmrc`, and GitHub Packages serves far older versions, so the check
      reads as "no drift" when a major release has already shipped.
- [ ] Does the package's docs dir (`docs/` **or** `dist/docs/`) cover the new
      API surface? Confirm the **exact path + filenames** — skills route to
      literal paths, so a renamed file silently breaks routing.
- [ ] Does the package ship `dist/agent-rules.md`? — if not, keep the skill's
      fallback `agent-rules.md` current (and its doc map pointing at real paths).
- [ ] Bump `Min version` + `Last verified` cells above **and** mirror
      `targetMinVersion` in the skill's SKILL.md frontmatter (validate
      cross-checks the two).
- [ ] Add a `CHANGELOG.md` entry linking the package release to the skill change.
- [ ] New `@reopt-ai/*` package discovered? — add a row to "Tracked but no
      installer skill yet".

## Verification procedure

Quick self-check before marking a skill "verified" (runtime, not just source):

```bash
# From a throwaway Next.js / Node project with the target package installed.
# Re-invoke the skill via your agent:
#   - it should pin the BEGIN:reopt/<pkg>-agent-rules block into AGENTS.md
#   - it should NOT touch text outside the markers
#   - re-running should replace the block content, not append a second copy
#   - every dist/docs or docs path it routes to must actually exist in node_modules

npx tsc --noEmit
pnpm dev

# Auth smoke (if the skill touches auth)
curl -f http://localhost:3000/api/auth/ok

# SDK end-to-end smoke
curl -f http://localhost:3000/api/health
```

If any step fails, fix the skill before bumping compatibility.

## Historical deprecations

- **`@reopt-ai/opt-harness` retired (2026-06-13).** The harness layer shipped
  to npm as **`@reopt-ai/opt-shell`** ("runtime product-frame layer" — workspace
  recipes, density/contentWidth/navigation/motion policy, data-engine adapters,
  shared state boundaries). `opt-harness-install` was renamed to
  `opt-shell-install` and retargeted; the `Harness*` component names became
  `*Workspace` / `Shell*`. Harness **contract verification** now lives in
  `@reopt-ai/opt-cli` (`opt harness`).
- See [`CHANGELOG.md`](./CHANGELOG.md) for the full history of skill-level
  deprecations, renames, and API migrations.
