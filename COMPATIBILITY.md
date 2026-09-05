# Compatibility Matrix

Each skill declares the minimum `@reopt-ai/*` package version it assumes. "Last
verified" = date the skill was last reconciled against that package version.
Update both columns in the PR that touches a skill.

The **Target** column lists the single primary package (matches the skill's
`target` / `targetMinVersion` frontmatter, which `pnpm validate` cross-checks).
Per-version detail lives in each package's docs; this table stays terse.

> **Verification level (2026-09-05 round):** every target re-checked against
> the three sibling monorepos (`reopt`, `reopt-design`, `reopt-data`) and the
> public npm `latest` tag (scoped `--@reopt-ai:registry=` flag). Moved since the
> prior rounds: `cli` **0.6.0 → 0.7.0**, `brandapp-sdk` **4.0.0 → 4.2.0**,
> `data-sdk-client` **0.2.0 → 0.4.0**, `data-sdk-server` **0.2.0 → 0.5.0**,
> `data-contract` **0.7.0 → 0.10.0**, new **`@reopt-ai/data-cli` 0.1.0**,
> `opt-ui` **1.6.0 → 1.12.5**, `opt-datagrid` **1.5.0 → 1.6.1**, `opt-cli`
> **1.3.0 → 1.3.1**. Unchanged: `opt-editor` 2.0.0, `opt-chat` 1.1.0,
> `opt-shell` 1.1.0, `data-sdk-devtool` 0.2.0. Source-checked (CHANGELOGs,
> READMEs, `package.json` exports/peers/bins, `src/`) **and** smoke-tested from
> a throwaway project with the published tarballs (client 0.4.0, server 0.5.0,
> data-cli 0.1.0, brandapp-sdk 4.2.0, cli 0.7.0, opt-ui 1.12.5, opt-datagrid
> 1.6.1, opt-editor 2.0.0, opt-chat 1.1.0, opt-shell 1.1.0, opt-cli 1.3.1):
> every subpath export and doc path the skills route to resolves; `tsc` accepts
> the 4.2 EAV options, `startBrandappAnalytics`, the 1.6 toolbar entry, and the
> 1.10–1.12 opt-ui components; `reopt-data sourcemap inject` stamps chunk ids,
> `sourcemap upload --dry-run` needs no key and resolves refs by URL, a keyless
> upload exits 2 naming `REOPT_DATA_ORG_KEY`, the legacy `upload-sourcemaps`
> spelling resolves, `event init` seeds the five automatic events and `event
> types` emits `ReoptEventName` / `ReoptActiveEventName` / `ReoptEventProperties`;
> `reopt brandapp eav records delete-where --help` documents the exit-7 gate;
> `opt component Callout` / `opt guide` / `opt block doctor` / `opt harness
> doctor` run on 1.3.1. Not run: a live ingest / upload against a real
> project, and the `reopt-data mcp` stdio handshake. Two skill claims were
> wrong against the published types and are corrected this round:
> `exceptionRateLimit` nests under `capture` (not the config root), and
> `addExceptionStep` is a client **instance method** (no root export).
> Published data-cli 0.1.0 has only `sourcemap inject | upload`; the `list` /
> `delete` / `list-platform` / `delete-platform` commands in the upstream README
> are not in that tarball. cli 0.7.0's `plugin.json` still declares
> `"version": "0.6.0"` (cosmetic).
>
> — **Data SDK (breaking for build scripts):** `data-sdk-server` **0.5.0
> dropped its `reopt-data` bin** (`refactor(sdk)!`). Source-map upload and the
> new event-catalogue-as-code workflow live in the separate public
> `@reopt-ai/data-cli` (bin `reopt-data`, Node **22+**): `sourcemap inject |
> upload | list | delete`, `event init | pull | diff | push | verify | types`,
> `query *`, `tools --json`, and an stdio `mcp` server. The old
> `inject-chunk-ids` / `upload-sourcemaps` spellings and `--api-key` /
> `REOPT_DATA_API_KEY` still resolve on the new CLI, but a partial failure now
> exits **6** (was 1). `@reopt-ai/data-sdk` on npm (0.2.3) is a **deprecated**
> meta-package. The client README did not change between 0.2.0 and 0.4.0 (the
> 0.3/0.4 bumps carried platform-scope source maps and contract 0.9), so the
> client `targetMinVersion` stays 0.2.0; the skills now version-gate the server
> bin move and route source maps to the data-cli README. The `reopt-data`
> example repo's `postbuild` may still show the old bin — the skills say so.
>
> — **cli 0.7.0:** `reopt brandapp eav records list | get | count |
> delete-where` (operational record debugging; `--entity` / filter
> `attributeId` accept names or ids; `delete-where` counts first and exits `7`
> without `--force`) and filter operators `in` / `not_in` (empty array = 400).
> Depends on brandapp-sdk ^4.2.0. Command tree otherwise unchanged; the bundled
> `skills/` copies diverged further from this repo's (theirs are the CLI's own
> tables), so `pnpm sync:cli --force` must **not** be run.
>
> — **brandapp-sdk 4.1 / 4.2 (additive):** 4.1 adds `sdk.analytics.getConfig()`
> + `@reopt-ai/brandapp-sdk/analytics` `startBrandappAnalytics(sdk)`, which
> imports the optional peer **`@reopt-ai/data-sdk >=0.1.1`** — the deprecated
> package name, not `data-sdk-client`; neither `README.md` nor `docs/` mentions
> the subpath (route: `CHANGELOG.md [4.1.0]` + declaration JSDoc). 4.2 adds EAV
> record `version` + `update({ ifVersion })` → 412 `PreconditionFailedError`,
> `increments` (server-side atomic number deltas, `values` now optional),
> `expiresAt` TTL (client-computed absolute ISO time; hourly physical delete),
> and a 10,000-row in-memory filter cap → 422 `QUERY_TOO_BROAD`; these **are**
> in `docs/api-reference.md` § EAV Client (한도 table) + `docs/errors.md`.
> 4.2 also fixes `createReoptOAuth()` to pin authorize/token/userinfo endpoints
> (Better Auth 1.7 discovery-at-init failure left an instance with no login).
> `targetMinVersion` rises to 4.2.0 because the skills now describe those
> options.
>
> — **Design:** opt-ui 1.10 / 1.11 / 1.12.5 are additive component releases
> (`05-migration/01-breaking-changes.md` has no entry past 1.5); opt-cli 1.3.1
> regenerated the component catalog for them. opt-datagrid 1.6.0 adds
> `DataGridToolbar` / `useDataGridToolbar` on a new `./toolbar` entry point;
> 1.6.1 is docs-only but corrects two agent-facing claims (`height` defaults to
> `420` and does not fill; `getRowThemeOverride` returns plain CSS via
> `--opt-surface`). `dist/docs/` layouts are unchanged for all three.
> `@reopt-ai/opt-meta` 0.1.0 (framework-free component metadata contracts) is a
> new public package. Still no package ships `dist/agent-rules.md`.
>
> **Prior round (2026-08-29, Data SDK only):** `@reopt-ai/data-contract`
> **0.6.3 → 0.7.0**, `data-sdk-client` / `data-sdk-server` / `data-sdk-devtool`
> **0.1.6 / 0.1.6 / 0.1.0 → 0.2.0**, all published 2026-08-29 and read back with
> `npm view` on the public registry. The release is the error-tracking suite:
> the client adds structured `$exception_list` (engine stack parsers in a lazy
> chunk), a per-type exception rate limit, `captureException(error, { level,
> fingerprint, properties })`, breadcrumbs (`addExceptionStep`,
> `capture.exceptionSteps`) and `init({ release })` with a `__REOPT_RELEASE__`
> build fallback; the server adds the same structured chain to
> `createOnRequestError`, a `release` option, and a `reopt-data` bin
> (`inject-chunk-ids`, `upload-sourcemaps`) that keys maps by chunk URL. The
> devtool joined the release because its `console` prop had never been
> published (link mode hid the gap). `targetMinVersion` rises to 0.2.0 because
> every error-tracking option the skills now describe is absent on 0.1.x.
> Verified end-to-end against `reopt-data-sdk-example` (`/debug/errors` lab →
> issue page → symbolicated frame) on the 0.2.0 npm packages, not link mode.
> Docs layout unchanged: README.md only, no `docs/` dir, no `dist/agent-rules.md`.
>
> **Prior round (2026-08-22):** re-checked both sibling monorepos
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

## Current state — 2026-09-05

All targets in the tables below are public npm packages. A GitHub Packages
token or scoped `.npmrc` entry is neither required nor supported by the install
skills.

### CLI

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `reopt-cli` | `@reopt-ai/cli` | **0.7.0** | 2026-09-05 (src+npm) |

### BrandApp SDK

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `brandapp-sdk-install` | `@reopt-ai/brandapp-sdk` | **4.2.0** | 2026-09-05 (src+npm) |
| `brandapp-sdk-review` | `@reopt-ai/brandapp-sdk` | **4.2.0** | 2026-09-05 (src+npm) |

### Data SDK

The public skills treat `@reopt-ai/data-sdk-client` as the primary target and
version-gate the companion suite during execution. Verified companions:
`@reopt-ai/data-sdk-server` 0.5.0 (**no bin** from 0.5.0), `@reopt-ai/data-cli`
0.1.0 (bin `reopt-data`, Node 22+ — source maps, event catalogue, query, MCP),
`@reopt-ai/data-sdk-devtool` 0.2.0, and `@reopt-ai/data-contract` 0.10.0.
`@reopt-ai/data-sdk` (0.2.3) is a deprecated meta-package the skills refuse.

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `data-sdk-install` | `@reopt-ai/data-sdk-client` | **0.2.0** | 2026-09-05 (src+npm; 0.2.0 example run on 2026-08-29) |
| `data-sdk-integration` | `@reopt-ai/data-sdk-client` (via `requires`) | — | 2026-09-05 (src+npm; catalogue commands from data-cli 0.1.0) |
| `data-sdk-review` | `@reopt-ai/data-sdk-client` | **0.2.0** | 2026-09-05 (src+npm; 0.2.0 example run on 2026-08-29) |

### Design / UI packages

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `opt-ui-install` | `@reopt-ai/opt-ui` | **1.12.5** | 2026-09-05 (src+npm) |
| `opt-datagrid-install` | `@reopt-ai/opt-datagrid` | **1.6.1** | 2026-09-05 (src+npm) |
| `opt-editor-install` | `@reopt-ai/opt-editor` | **2.0.0** | 2026-09-05 (src+npm, unchanged) |
| `opt-chat-install` | `@reopt-ai/opt-chat` | **1.1.0** | 2026-09-05 (src+npm, unchanged) |
| `opt-shell-install` | `@reopt-ai/opt-shell` | **1.1.0** | 2026-09-05 (src+npm, unchanged) |

> **Doc-layout note (routing-critical — skills point at literal paths):**
> - `@reopt-ai/data-sdk-client`, `data-sdk-server`, `data-sdk-devtool`, and
>   `data-cli` ship **README.md only** as agent-facing documentation; no
>   package ships a `docs/` directory. Source maps: the **data-cli README →
>   "Source maps in CI"** is canonical (server README § 4-1 shows the Next.js
>   shape and states the bin removal). Event catalogue as code and the agent
>   surface (`tools --json`, `mcp`): data-cli README. The production-shaped
>   reference implementation lives in the separate
>   `reopt-ai/reopt-data-sdk-example` repository; its `postbuild` may still
>   show the pre-0.5.0 server bin.
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

`@reopt-ai/opt-cli` (bin `opt`, current **1.3.1**, public npm) is the unified
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
| `@reopt-ai/opt-ui-primitives` | 1.5.2 | public npm (native HTML/browser-API a11y primitives; dependency of opt-ui/opt-chat) |
| `@reopt-ai/opt-palette` | 1.0.0 | public npm (stable OKLCH color engine; required peer of opt-shell) |
| `@reopt-ai/opt-devtool` | 1.0.1 | public npm (stable; renamed from `@reopt-ai/opt-inspect`) |
| `@reopt-ai/opt-charts` | 1.5.0 | public npm (stable Recharts adapters + SVG viz / chart frames + shells) |
| `@reopt-ai/opt-meta` | 0.1.0 | public npm (new; framework-free component metadata contracts shared by design packages) |
| `@reopt-ai/data-cli` | 0.1.0 | public npm (bin `reopt-data`; companion of the Data SDK skills — no installer skill of its own) |
| `@reopt-ai/data-sdk` | 0.2.3 | public npm, **deprecated** meta-package (use `data-sdk-client` / `data-sdk-server`); still the optional peer name `brandapp-sdk/analytics` imports |
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

### `@reopt-ai/cli` 0.7.0 — EAV records (2026-08-30)

Adds `reopt brandapp eav records list | get | count | delete-where` (the only
`eav` group that touches data) and the `in` / `not_in` filter operators (3-way
parity with server + SDK 4.2.0; an empty array is a 400). `--entity`, filter
`attributeId`, `--sort`, and `--select` accept names or ids and refuse a
duplicate entity name. `delete-where` counts first, exits `7` without
`--force`, and reports matched vs deleted separately. Depends on
`@reopt-ai/brandapp-sdk` ^4.2.0. `reopt-cli`, `reopt-eav`, and the shared
`cli-agent-rules` fallback document it; `reopt-brandapp` needed no edits.

### `@reopt-ai/cli` 0.6.0 — agent-integration release (2026-08-27)

The MCP body of work that was pending after 0.5.0 shipped in **0.6.0**; the
command tree (`login` / `status` / `token` / `brandapp *` / `eav *`) is
unchanged, so `reopt-brandapp` and `reopt-eav` needed no edits. What an
installed 0.6.0 now carries, and what `reopt-cli` Step 4 documents as installed
surface:

- `plugin.json` + `mcp.json` + `skills/` (`reopt-shared`, `reopt-brandapp`,
  `reopt-eav`) — an Agent Plugins 1.0.0 bundle declaring **only** the remote
  server `https://mcp.reopt.ai`. The bundled skills are the CLI's own copies;
  this repo's skills stay the marker-pinning layer on top.
- Remote catalog grew from 26 to **30** tools: `reopt_customer_feedback_list` /
  `_get` (`customer:read`) and `reopt_customer_feedback_propose_reply` /
  `reopt_customer_propose_note` (`customer:write`, queue a `WorkspaceProposal`
  for Studio approval — they never send or mutate CRM state).
- Every tool on both surfaces advertises `title` + read-only / destructive /
  idempotent / open-world hints; the stdio server speaks MCP 2026-07-28 and
  keeps 2025-era clients working. Build moved tsup → tsdown (fixes the lost
  executable bit on `dist/index.js`).

Still **not** shipped: `dist/agent-rules.md` — the `reopt/cli-agent-rules`
fallback remains authoritative.

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
