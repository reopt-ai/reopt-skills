# Changelog

All notable changes to this repository are recorded here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
at the repository level — see `AGENTS.md` → _Versioning_ for what MAJOR /
MINOR / PATCH mean for a skills repository.

Each release is tagged `vX.Y.Z` in git; consumers can pin to a tag via the
`skills` CLI.

## [Unreleased]

## [2.2.0] — 2026-08-27

### Changed

**`@reopt-ai/cli` 0.5.0 → 0.6.0 — 2026-08-27** (`reopt-cli` `targetMinVersion` → 0.6.0)

- The agent-integration work recorded as "landing in the next release" has
  shipped. `reopt-cli` Step 4 and the shared `cli-agent-rules` fallback now
  document the installed `plugin.json` + `mcp.json` + `skills/` bundle (remote
  MCP server only), the remote catalog at **30** tools (four new feedback /
  proposal tools — proposals queue a `WorkspaceProposal` for Studio approval and
  never send or mutate CRM state), and per-tool annotations on both surfaces
  (a 0.5.0 `reopt mcp` still has none). The CLI command tree is unchanged, so
  `reopt-brandapp` / `reopt-eav` are untouched.

### Added

**Public reopt Data SDK skills — 2026-08-27**

- Added `data-sdk-install` for Next.js-first installation and upgrade of
  the public `data-sdk-client` / `data-sdk-server` suite, with
  first-party ingest, request-scoped identity, consent, and optional devtool
  guardrails. It connects existing credentials and never provisions remote Data
  resources.
- Added `data-sdk-review` as a read-only audit of package versions, credential
  boundaries, proxy/bootstrap behavior, identity, consent, delivery, and
  production devtool exposure. Both skills share the
  `reopt/data-sdk-agent-rules` marker fallback.
- Verified the source, public npm metadata and tarball README layout for client
  0.1.6, server 0.1.6, devtool 0.1.0, and contract 0.6.3 against the
  `reopt-data-sdk-example` reference app. Internal SDK development
  workflow remains private to the `reopt-data` repository.

## [2.1.0] — 2026-08-22

### Changed

**Portable CLI documentation routing — 2026-08-21** (no target-version change)

- Updated `reopt-cli`, `reopt-brandapp`, `reopt-eav`, and the shared CLI
  agent-rules fallback to prefer the live `--help` command tree and resolve the
  CLI package/source `README.md` from the actual installation. Removed the
  assumption that every consumer has `node_modules/@reopt-ai/cli/README.md`.

**Doc-map gap closed — 2026-08-22** (no target-version change)

- **Four `@reopt-ai/brandapp-sdk` exports were reachable but unrouted.**
  `sdk.terms`, `sdk.feedback`, `sdk.push`, and the `ai-provider` entry have all
  been on the SDK root since before 3.6, yet no skill doc map named them — an
  agent scanning the map had no way to learn they exist. Added rows to both
  SKILL.md doc maps and the shared `agent-rules.md`.
- **Terms are brand-owned** (platform change, 2026-08-03): one set binds the
  Brandapp and the brandfront, so a per-app copy of the text or a private
  consent table is now a review finding (**T1**). `list` / `listWithMeta` work
  signed-out under Basic Auth; `consent` / `withdraw` / `listMyConsents` take the
  user's Bearer token. `currentVersion.contentRich` is an `EditorSpec` for
  opt-editor's StaticRenderer, with plain `content` kept for search and legal
  record. Checkout consent stays separate — the hosted order-review page
  collects it, which `Err5` already covers.
- **`sdk.push` is a documentation gap, routed accordingly.** `docs/` carries
  only a one-line entry-point row for it — no section — so the skills route to
  the declaration JSDoc from the installed `@reopt-ai/brandapp-sdk/push` export,
  the same treatment `plans` gets. New **T2** flags hand-rolled device-token
  endpoints; all three methods are Bearer + self-scoped and `listDevices` never
  returns raw tokens.

**Skill hardening — 2026-08-22** (no target-version change)

- **`reopt-cli` gains an MCP section (Step 4) + shared agent rules.** Reopt runs
  **two** MCP servers whose tool names collide, and nothing in `--help` says so:
  the remote connector `https://mcp.reopt.ai` advertises 26 tools (10 shared +
  EAV 6 + CRM 10) with client-side OAuth, while local stdio `reopt mcp`
  advertises 14 (the same 10 + `reopt_status` / `reopt_brandapp_doctor` /
  `reopt_schema_validate` / `reopt_sdk_inspect`). Registering both hands the
  model two tools for one job, and stdio's 10 shared tools all fail before
  `reopt login`. Counts were cross-checked against the live remote tool list and
  the CLI's `src/mcp/tools.ts`, not taken from a commit message.
- **CRM tool guardrails are now skill-owned** (a security rule, so it belongs in
  SKILL.md rather than routed docs). `reopt_customer_*` / `reopt_segment_*` /
  `reopt_journey_*` require `customer:read` / `customer:write` — excluded from
  connector defaults, so an unasked connector is refused; workspace binding is
  mandatory there; `customer_list` / `segment_preview` expose **no** unmask
  parameter, raw PII opens only through single-record `customer_get` on the
  write quota with an audit flag; `customData` keys are attribute UUIDs that
  need `customer_field_list`; and `customer_note_add` is the only write.
- Added the "always call `reopt_workspace_list` first" rule — a guessed
  `workspaceId` returns an **empty result, not an error**, which is the one
  failure a model cannot diagnose on its own.
- The unreleased CLI Agent-Plugin packaging is recorded in `COMPATIBILITY.md`
  as a watch item rather than documented as installed surface: `plugin.json` /
  `mcp.json` / `remote-tools.ts` landed after 0.5.0 shipped. This avoids
  repeating the 2026-07-24 landmine, where skills documented CLI env-var names
  that did not exist at the declared `targetMinVersion`.
- **`brandapp-sdk-review` line budget (follow-up).** Converted the ten
  per-category pattern tables to bullet lists — each table cost two lines of
  `| Pattern | Grep signal |` / `|---|---|` header for zero content. All 48
  pattern rows are preserved verbatim: **137 → 117 lines**, restoring 33 lines
  of headroom under the 150-line cap (was 7 after the 4.0 sync).

**Package sync — 2026-08-22** (both sibling monorepos + public npm `latest`
re-checked; versions stay under `[Unreleased]` until a repository release is cut)

- **brandapp-sdk 3.6.0 → 4.0.0** (`brandapp-sdk-install` / `brandapp-sdk-review`).
  4.0 moves the SDK onto **Better Auth 1.7**, which rebuilt generic OAuth on the
  social-provider path: `createReoptOAuthClient()` and
  `signIn.oauth2({ providerId })` are removed (1.7 ships no client plugin),
  sign-in is `signInWithReopt()` / `linkReoptAccount()` from
  `@reopt-ai/brandapp-sdk/better-auth/client`, and the callback moved to
  `${baseURL}/api/auth/callback/reopt`. `targetMinVersion` bumped to 4.0.0 in
  both skills. The shared `agent-rules.md` gained six hard rules (1.7 client
  surface, callback path, `tokenEndpointAuthMethod`, app-local `signOut()` +
  `providerLogout` opt-in, issuer-namespaced accounts, remote-adapter
  `consumeOne`/`incrementOne`). Install gained a pre-upgrade ordering step —
  register the new redirect URI **before** bumping — and a `better-auth@^1.7.1`
  peer floor (every peer is declared optional, so npm installs none of them).
- **Review skill: an inverted grep signal is fixed.** `Auth5` keyed on
  `signIn.oauth2(`, which 4.0 **removes** — it was matching the broken call as
  if it were the correct one. `Auth5` now checks that the sign-in result is
  handled, and the new **`Auth8`** flags the removed 1.6 surface
  (`createReoptOAuthClient`, `genericOAuthClient`, `signIn.oauth2(`,
  `oauth2.link(`, the literal `/api/auth/oauth2/callback/reopt`, `better-auth`
  pinned `<1.7.1`). New `Cfg7` flags a per-environment `REOPT_ID_BASE_URL`,
  which silently forks existing users into new accounts under 4.0's
  issuer-namespaced account lookup. Step 2 gained `>= 4.0.0` / `< 4.0.0` gates;
  older gates were compressed to stay inside the 150-line budget.
- **Docs-routing correction (pre-existing bug, found this round).** `docs/`
  contains no Better Auth wiring at all — `createReoptBetterAuth` /
  `createReoptOAuth` / `createReoptAdapter` live only in the package
  `README.md`, and `docs/api-reference.md`'s "Auth Client" section is the
  user-token API (`sdk.auth.*`), a different surface. Both skills had routed
  "Better Auth + OAuth" there. That surface now routes to `README.md` +
  `CHANGELOG.md` `[4.0.0]`, and every "migration / breaking changes" route now
  states that `docs/migration.md` stops at `2.x → 3.0.0` and covers none of
  3.1–4.0.
- **Compatibility matrix.** Recorded the 2026-08-22 round and sharpened the
  drift checklist: the public-npm probe needs the **scoped**
  `--@reopt-ai:registry=` flag, because a plain `--registry=` does not override
  a `@reopt-ai:registry` line in the user `.npmrc` and GitHub Packages answers
  with much older versions — which reads as "no drift" while a major release has
  already shipped.
- No other target moved: `cli` 0.5.0, `opt-ui` 1.6.0, `opt-datagrid` 1.5.0,
  `opt-editor` 2.0.0, `opt-chat` 1.1.0, `opt-shell` 1.1.0, design CLI 1.3.0.

**Verification refresh — 2026-08-10** (no target-version change)

- Re-checked both sibling monorepos, every targeted package's live public npm
  `latest` tag, and all eight published tarball inventories. Versions, exports,
  doc paths, Node engine floors, and fallback requirements remain unchanged from
  the 2026-08-08 refresh; no package has started shipping `agent-rules.md`.
- The only later `brandapp-sdk/package.json` source changes are development-only
  dependency updates (`opt-editor` 1.1.2 → 2.0.0 and `@ai-sdk/provider` 4.0.4 →
  4.0.7). No relevant `reopt-design` target-package commit landed after the
  prior snapshot, so no SKILL.md behavior or routing change was required.

**Package sync — 2026-08-08** (both sibling monorepos, public npm metadata,
published manifests, and tarball file inventories re-checked; versions remain
under `[Unreleased]` until a repository release is cut)

- **brandapp-sdk 3.3.0 → 3.6.0** (`brandapp-sdk-install` /
  `brandapp-sdk-review`). Added routing and review rules for 3.4 subscription
  lifecycle webhooks + live Paddle checkout/unified cancellation, 3.5 Files
  folders/rename/move/read/usage APIs, and 3.6 EAV record-list `select`
  projection. Corrected the review projection pattern from the nonexistent
  `attributes:` option to `select:`. The installed 3.6 checkout client documents
  hosted order review as the current required-terms flow, while two bundled docs
  still show an older `RequiredTermsError` catch; the skills now call out that
  narrow documentation conflict instead of prescribing the stale flow.
- **reopt-design target refresh.** `opt-ui` **1.5.0 → 1.6.0** adds the optional
  `app.css` document bootstrap and block-registry terminology;
  `opt-datagrid` **1.4.2 → 1.5.0** adds the server-safe `/ai-stream` entry and a
  bounded value cache while preserving standalone theme fallbacks;
  `opt-editor` **1.1.2 → 2.0.0** moves runtime schemas from `/server` to
  `/schemas` and requires canonical V2 stored content (the migration script
  named by the README is not shipped in the npm tarball);
  `opt-chat` **1.0.0 → 1.1.0** makes `PromptInput` a native form and replaces
  StickToBottom-era conversation props; and `opt-shell` **1.0.0 → 1.1.0** adds
  document policies, persisted preferences, and shortcut layers. Package-specific
  doc routes, peers, checks, fallbacks, and shared agent rules were reconciled,
  including the suite-wide published **Node 20+** runtime floor.
- **opt-cli 1.2.0 → 1.3.0** (used by the design skills). Made `opt block` the
  primary signed-registry command (`surface` is deprecated), added `opt project`
  sync routing, and corrected verification commands: the CLI has no top-level
  `opt doctor` / `opt check`; use `opt block doctor` and, when opt-shell is
  installed, `opt harness doctor`. opt-shell is an optional lazy peer for
  harness commands, not a prerequisite for block/component operations.
- **Compatibility inventory.** Added public `studio-catalog` 2.0.0 and
  `opt-filemanager` 0.1.0, updated `opt-devtool` to 1.0.1, and recorded that the
  retired `opt-ui-surface` package is neither in the workspace nor published.

**Package sync — 2026-07-24** (sibling monorepo source re-checked after a two-package bump; versions frozen until a release is cut per `AGENTS.md`)

- **cli 0.3.1 → 0.5.0** (`reopt-cli` / `reopt-eav`). `targetMinVersion` bumped to
  0.5.0 to make the skill honest: the 2.0-era env-var rename (`REOPT_CLIENT_*` /
  `REOPT_ENV` / `REOPT_BRANDAPP_ID` → `BRANDAPP_*`, **no aliases**) finally landed
  in the CLI in 0.4.0, and the skills already documented the `BRANDAPP_*` names —
  which do not exist on 0.3.1. Documented 0.4.0 breaking behavior in `reopt-cli`:
  `json`/`ndjson`/`yaml` now emit **raw server items to stdout**, and
  `.reopt.config.mjs` is trust-on-first-use (`REOPT_TRUST_CONFIG=1` for CI).
  Corrected the `reopt-eav` destructive workflow — `eav sync` runs in
  **safe-mode** (0.4.0), so `--delete-orphans` (and `isRequired`/`isUnique`
  promotions / select-option removals) is blocked with exit `7` unless `--force`;
  Step 4 now applies with `--delete-orphans --force`. Noted the sync advisory lock
  (exit `10`) and 0.5.0's `--timeout`/`--max-retries` reaching `eav`.
- **brandapp-sdk 3.1.0 → 3.3.0** (`brandapp-sdk-install` / `brandapp-sdk-review`).
  Additive OIDC **Single Logout** (3.2.0, `@reopt-ai/brandapp-sdk/logout`): the
  shared `agent-rules.md` gained a doc-map row + hard rule (back-channel receive
  `createBackchannelLogoutHandler`, RP-initiated `buildEndSessionUrl`, persist the
  `id_token` `sid`, never hand-roll `logout_token` verification), install Step 3
  gained a `docs/logout.md` routing row, and review gained a `< 3.2.0` version
  gate that flags hand-rolled logout. 3.3.0 backward-compatible hardening
  (retryable 503 vs 400, reliable error `requestId`) folded into the gate +
  agent-rules. Fixed a stale host reference — the prod main API is
  **`brandapp.reopt.ai`** (the older `brand.reopt.ai` is legacy; auth stays
  `id.reopt.ai`) — in both SKILLs and the shared agent-rules, and broadened review
  `Cfg1` to also flag `brand.reopt.ai`. `targetMinVersion` bumped to 3.3.0 in both
  skills.

**Package sync — 2026-07-16** (sibling monorepo source re-checked after a bump; versions frozen until a release is cut per `AGENTS.md`)

- **brandapp-sdk 3.0.0 → 3.1.0** (`brandapp-sdk-install` / `brandapp-sdk-review`).
  Additive `sdk.plans` hosted checkout (`createCheckout` / `getCheckout` /
  `cancel`, `CheckoutSession`) with new `RequiredTermsError` (422
  `REQUIRED_TERMS`) and `LIVE_MODE_UNSUPPORTED` (409, live-payment Brandapps).
  The checkout surface is **not in `docs/` yet**, so the shared `agent-rules.md`
  gained a hard rule + doc-map row pointing at the `@reopt-ai/brandapp-sdk/plans`
  export types, install Step 3 gained a plans routing row + error codes, and
  review gained a `< 3.1.0` version gate + `Err5` (checkout without
  `RequiredTermsError` / live-mode handling). `targetMinVersion` bumped to 3.1.0
  in both skills.
- **opt-ui 1.4.1 → 1.5.0** (`opt-ui-install`). Drawer slide animations tokenized
  (`OPT_ANIMATE_DRAWER`); runtime behavior + exports unchanged.
  `targetMinVersion` bumped to 1.5.0.
- **opt-cli 1.1.1 → 1.2.0** (design CLI used by the UI skills). Added
  `opt component` (opt-ui/opt-charts metadata) and `opt surface diff` (bulk
  drift) notes to `opt-ui-install`; flagged the **`@reopt-ai/opt-shell` →
  `peerDependencies`** move so opt-ui-only consumers know to install it.
- **Tracked-only bumps** in `COMPATIBILITY.md`: `opt-ui-primitives` 1.4.2 →
  1.5.0, `opt-charts` 1.0.0 → 1.1.0.

### Fixed

**Content reconciliation against current source — 2026-07-04** (drift fixes surfaced by a full source audit of every skill; distinct from the version bumps below)

- **opt-ui — wrong CSS import subpath (hard error).** `agent-rules.md` and
  `SKILL.md` told consumers to `@import "@reopt-ai/opt-ui/styles"`, a subpath
  that does not exist in the package `exports` (would fail to resolve). Corrected
  to `@import "tailwindcss";` then `@import "@reopt-ai/opt-ui/tailwind.css";`
  (+ `@source` directive), matching `dist/docs/01-getting-started.md`. Also
  degraded the ungrounded "Doctor (26 checks)" pipeline label to
  "Doctor (environment audit)" (opt-cli computes the total dynamically).
- **opt-editor — invented `contentRich` field + missing 1.0.4 hard rules.**
  `contentRich` appears nowhere in the package; the canonical schema is
  `EditorSpec` with rich text on each element's `content`. Fixed in `SKILL.md`
  (Verify step) and `agent-rules.md`. Added two hard rules now that 1.0.4 ships
  them: the `"use client"` boundary for `<Editor>` (vs RSC-safe `StaticRenderer`),
  and `EditorMode` now `"stream" | "edit" | "diff"` (exhaustive handling must
  cover the review-only `"diff"` branch). Added routing rows for
  `03-recipes/08-editor-operations.md` (agent-mode ops) and
  `09-diff-review-integration.md`. Genericized "Doctor (18 checks)".
- **opt-chat — Tailwind requirement was false.** The skill required "Tailwind
  configured with opt-ui tokens"; opt-chat ships **no** Tailwind peer. Styling is
  opt-ui global CSS **or** `@reopt-ai/opt-chat/styles.css`. Reworded prereqs,
  the styling row, the pipeline step, and the agent-rules hard rule; added a
  `styles.css` wiring step + routing row and a `@reopt-ai/opt-chat/flow`
  (agent-graph Canvas) row. Part-renderer count `25` → `28+` (README).
- **opt-shell — peer requirement mislabel + missing value.** "Required peers"
  listed opt-datagrid / opt-editor as required; `peerDependenciesMeta` marks only
  `@reopt-ai/opt-palette` (+ react/react-dom) required — the adapters
  (opt-datagrid, opt-editor, **opt-calendar**) are optional. Split into
  required/optional in `SKILL.md`, the pipeline step, and `agent-rules.md`. Added
  the missing `contentWidth` value `narrow`.
- **reopt-eav — stale EAV command tree (major).** The CLI's "Phase A" rename
  replaced `eav plan` (report) / `eav migrate create|run|status|validate` with
  `eav diff` (report) / `eav plan <name>` (scaffold) / `eav migrate` / `eav
  history` / `eav verify`, and dropped the `experimental` tag. Rewrote the Step 2
  command map, Steps 3/5/6, the frontmatter triggers, and the CI-blocker safety
  line against `src/index.ts` (the `--help` source of truth; the CLI's own
  `README.md` is itself stale on this rename — flagged upstream).
- **reopt-cli — missing `token mint` + stale EAV/exit-code refs.** Added the new
  `reopt token mint` service-token flow (0.3.0/0.3.1) to Step 2 + doc-map, updated
  the EAV routing row to the new command names, and extended the exit-code summary
  with the EAV migrate/verify codes `6`–`10` (drift / destructive-blocked /
  checksum-mismatch / checksum-conflict / lock-held).
- **brandapp-sdk — error-class list completeness.** Added `DuplicateAuthUserError`
  (409) and `AuthUserNotFoundError` to the shared agent-rules `errors.md`
  enumeration (byte-identical across install + review) and to review pattern
  `Err3` (linked-user bulk ops). No API drift — the 3.0 reconciliation held.
- opt-datagrid, reopt-brandapp: audited, **no drift** — accurate as shipped.

### Changed

**Public npm migration + stable design packages — 2026-07-13** (source-confirmed in `../reopt` / `../reopt-design`, registry-confirmed on npmjs)

- **All skill target packages now install from public npm.** Removed the
  GitHub Packages PAT / scoped `.npmrc` setup from `brandapp-sdk-install` and
  all five `opt-*-install` skills. Each install path now checks for the legacy
  `@reopt-ai:registry=https://npm.pkg.github.com` override, removes only the
  project-level entry, preserves unrelated auth, and asks before changing
  user/global npm config. Updated the byte-identical brandapp install/review
  fallbacks, all opt fallback rules, contributor READMEs, and root EN/KO docs.
- **Latest public versions reconciled.** `opt-editor` **1.0.4 → 1.1.2**
  (optional `ai >= 7` / `zod >= 3` peers), `opt-chat` **0.3.1 → 1.0.0**, and
  `opt-shell` **0.1.0 → 1.0.0**. The two 1.0 releases declare no breaking API
  change from 0.x. Compatibility tracking also moves `opt-palette`,
  `opt-devtool`, `opt-charts`, and `opt-calendar` to their public 1.0.0
  releases; existing versions of brandapp-sdk, cli, opt-ui, opt-datagrid,
  opt-cli, and opt-ui-primitives were re-verified on npmjs.
- **opt-shell audit route corrected.** The published 1.0.0 manifest exports
  `.`, `./core`, and `./meta`, not the `./audit` path still mentioned by its
  bundled README / `shell-llms.txt`. The skill now routes audit helpers to
  `@reopt-ai/opt-cli/audit` and contract checks to `opt harness`.

**`reopt-design` patch family — 2026-07-04** (source-confirmed against `reopt-design/packages/*`)

- **`opt-ui` 1.4.0 → 1.4.1** and **`opt-editor` 1.0.3 → 1.0.4.** Both patch
  bumps. `dist/docs/` layout is byte-for-byte the tree the skills route to
  (re-listed against source — every routed path resolves) and neither
  `agent-rules.md` carries a version reference, so only `targetMinVersion` in
  the two `SKILL.md` frontmatters (+ the matching "does not, as of X" body line)
  and the `COMPATIBILITY.md` rows / verification note moved. `opt-ui` 1.4.1 is a
  Drawer-animation token refactor (`OPT_ANIMATE_DRAWER` in `lib/styles.ts`,
  runtime unchanged).
- **`opt-cli` 1.1.0 → 1.1.1** (unified design CLI the UI skills call via `npx`).
  `doctor` / `surface` commands intact — no skill edit, `COMPATIBILITY.md`
  "Design CLI" version note bumped only.
- **New tracked packages** added to `COMPATIBILITY.md` "Tracked but no installer
  skill yet": `opt-ui-primitives` 1.4.2 (published a11y primitives), `opt-charts`
  0.1.0 and `opt-calendar` 0.1.0 (published), `opt-doc-kit` 0.1.0 and `opt-uxflow`
  0.1.0 (`private: true`, not on npm). No new installer skills authored.
- `cli` 0.3.1, `brandapp-sdk` 3.0.0, `opt-datagrid` 1.4.2, `opt-chat` 0.3.1,
  `opt-shell` 0.1.0 unchanged this round.

**`brandapp-sdk` 2.3.0 → 3.0.0 — 2026-06-26** (security-review follow-up, source-confirmed)

- **Webhook contract realigned (3.0, breaking).** 2.x verified a raw-body hex
  signature + in-body timestamp + `record.*` event types, which mismatched the
  live platform sender and 401-rejected every production webhook. Reflected the
  new contract in the shared agent-rules + install/review skills:
  `verifySignature(timestamp, body, signature, secret)` (timestamp-first, signs
  `"{timestamp}.{body}"`, `x-reopt-signature: sha256=…` + `x-reopt-timestamp`
  headers); event types `contactCreated` / `contactUpdated` / `contactDeleted`
  / `workflowRunCompleted` / `workflowRunFailed`; payload `{ id, type,
  entityType, entityId, createdAt, data }`. Added review pattern **W2** (stale
  2.x handlers / 3-arg `verifySignature`).
- **Browser `clientSecret` blocked (3.0).** `createReoptSDK` /
  `createBrandappProvider` throw `CONFIG_BROWSER_SECRET` if a `clientSecret`
  reaches a browser; token-only client config is now allowed
  (`{ brandappId, token }`, server-minted via `POST /api/v1/brandapp/{id}/token/mint`).
  Added to the install env/safety steps, the errors doc-map row, and review
  pattern **Cfg5**; retuned **Cfg4** (token wins, `clientSecret` redundant).
- **Removed `@deprecated` aliases (3.0).** `ReoptAdapterConfig` /
  `ReoptEavConfig` → `ReoptSDKConfig`; `ReoptAdapterError` → `ReoptSDKError`.
  Added review pattern **Cfg6** (mechanical rename).
- **Dev-server prod guard + log redaction (3.0).** In-memory dev server refuses
  to start under `NODE_ENV=production` (override `REOPT_DEV_SERVER_ALLOW_PRODUCTION=1`);
  `trace` debug now also redacts camelCase token keys. Noted in agent-rules +
  install safety.
- docs layout unchanged (still top-level `docs/`), so routing paths were not
  touched. Bumped `targetMinVersion` 2.3.0 → 3.0.0 in both SKILL.md frontmatters
  and the `brandapp-sdk-*` rows in `COMPATIBILITY.md` (verification note rolled
  to 2026-06-26, source-checked). `reopt-design` / `cli` packages unchanged.

**Package version bump — 2026-06-18** (`brandapp-sdk` 2.3.0 + `reopt-design` patch family, npm-confirmed)

- **`brandapp-sdk` 2.1.0 → 2.3.0.** docs layout unchanged (still top-level
  `docs/`), so routing was not touched; bumped `targetMinVersion` +
  `COMPATIBILITY.md` and reflected the 2.2 / 2.3 surface in the shared
  agent-rules and the review skill:
  - new error classes `CreditLimitError` (402), `ModelAccessError` (403),
    `ModelNotFoundError` (404), `ContentFilterError` (422), guards
    `isCreditLimitError` / `isModelAccessError`, plus the `QUERY_TOO_LARGE`
    diagnostic — added to the errors doc-map row.
  - new hard rules: mutations (POST/PATCH) aren't retried by default (2.2;
    `Idempotency-Key`, `retryNonIdempotent` opt-in); AI streaming
    `config.timeout` is idle, not wall-clock (2.2); streaming 402 →
    `CreditLimitError` and provider errors → AI SDK `APICallError` (2.3); EAV
    `backfill` batches via `bulkUpdate` (2.2).
  - AI surface (`sdk.ai.models()`, `sdk.ai.stream`, `useAiStream`,
    `useAiAgents`) + `backfill` added to the api-reference doc-map row.
  - review version gate compressed (pre-2.0 lineage folded into one row) and
    extended with `< 2.3.0` / `< 2.2.0` rows.
- **opt-\* patch bumps** (docs structure unchanged — version-only):
  `opt-datagrid` 1.4.1 → 1.4.2, `opt-editor` 1.0.2 → 1.0.3, `opt-chat`
  0.3.0 → 0.3.1. `cli` / `opt-ui` / `opt-shell` / `opt-palette` /
  `opt-devtool` / `opt-cli` unchanged.
- `COMPATIBILITY.md` rows confirmed via `npm view`; verification note +
  snapshot date rolled to 2026-06-18.

**Skill / package re-sync — 2026-06-13** (source-checked against the live `reopt` monorepo + `reopt-design` repo)

- **docs routing corrected to match what each package actually ships.** The v2
  skills routed to `dist/docs/<file>` paths that mostly did not exist in the
  installed packages. Reconciled per package:
  - `brandapp-sdk-install` / `brandapp-sdk-review`: route to top-level `docs/`
    (the package ships docs there, not `dist/docs/`). The combined surface is
    `api-reference.md`, with `environment.md` / `errors.md` / `cms.md` /
    `files.md` / `dev-server.md` / `migration.md` / `testing.md` as topic
    files. The old `quickstart` / `auth` / `eav` / `webhooks` /
    `service-token` / `react-hooks` / `troubleshooting` targets never existed.
  - `opt-ui` / `opt-datagrid` / `opt-editor`: route to the real
    numeric-prefixed `dist/docs/` tree (`01-…`, `02-api/` or `02-components/`,
    `03-recipes/`, `0N-migration/`, `0N-troubleshooting.md`) + `index.md` hub.
    Removed nonexistent `components/` / `theme/` / `doctor.md` / `install.md` /
    `CHANGELOG.md` / `catalog/` targets.
  - `opt-chat`: ships no docs dir — route to `README.md` + `CHANGELOG.md`.
  - `reopt-cli` / `reopt-brandapp` / `reopt-eav`: the CLI ships no `dist/docs/`
    — route to `--help` (live) + `README.md` sections; EAV authoring points at
    `@reopt-ai/brandapp-sdk/docs/api-reference.md`.
- **CLI commands unified on `@reopt-ai/opt-cli`.** `opt-ui-install` /
  `opt-editor-install` referenced nonexistent `@reopt-ai/opt-ui-cli` /
  `@reopt-ai/opt-editor-cli`; corrected to `npx @reopt-ai/opt-cli doctor` and
  `npx @reopt-ai/opt-cli surface add <slug>`.
- **`opt-harness-install` renamed to `opt-shell-install`.**
  `@reopt-ai/opt-harness` was never published; the harness layer ships as
  `@reopt-ai/opt-shell` (workspace recipes, density/contentWidth/navigation/
  motion policy, data-engine adapters, state boundaries; agent guide in
  `shell-llms.txt`). Marker `reopt/opt-harness-agent-rules` →
  `reopt/opt-shell-agent-rules`; `Harness*` components → `*Workspace` /
  `Shell*`. `COMPATIBILITY.md` records the retirement.
- **`brandapp-sdk` install/review `agent-rules.md` unified.** The two skills
  share one marker block but had drifted; both now ship the byte-identical
  (more complete) block. `scripts/validate-skills.mjs` now **enforces**
  agent-rules parity for any skills sharing a `reopt/<pkg>-agent-rules` marker.
- **Compatibility matrix rolled to actual versions** (source-checked, not
  runtime-smoked): `cli` 0.3.1, `brandapp-sdk` 2.1.0, `opt-ui` 1.4.0,
  `opt-datagrid` 1.4.1, `opt-editor` 1.0.2, `opt-chat` 0.3.0 (now published —
  was flagged `unpublished`), `opt-devtool` 0.1.1, `opt-cli` 1.1.0 — the
  `reopt-design` 1.4.0 release family, confirmed via `npm view`.
  `targetMinVersion` in each SKILL.md mirrored.
  `opt-ui-surface` added to tracked packages; `opt-harness` row removed.
- `README.md` / `README_KO.md` / `AGENTS.md` updated: docs layout varies per
  package (`dist/docs/` vs top-level `docs/` vs `README.md` / `shell-llms.txt`)
  and no package ships `dist/agent-rules.md` yet, so fallbacks remain
  authoritative.

### Fixed

- `brandapp-sdk-review/metadata.json` was stuck at `version 0.1.0` /
  `updatedAt 2026-05-10`; corrected to `2.0.0` / `2026-05-15` to match the
  release it actually shipped in.

### Note

- This round is **source-checked** (package file layout / `files` / `exports` /
  shipped docs), not re-run through install → `tsc --noEmit` → smoke. Per the
  AGENTS.md release checklist, `metadata.json` `version`/`updatedAt` for the
  skills touched this round are rolled at release-cut time — except the
  `brandapp-sdk-review` fix above and the newly authored `opt-shell-install`
  files, which are set now.

## [2.0.0] — 2026-05-15

### Changed

**v2 slim-skill rewrite — 2026-05-15**

Every skill rewritten around the Next.js 16.2+ pattern: each `@reopt-ai/*` package owns its own `dist/docs/`, and the skill pins a marker-bracketed agent-rules block into the consumer's `AGENTS.md`/`CLAUDE.md` (`<!-- BEGIN:reopt/<pkg>-agent-rules -->` … `<!-- END:reopt/<pkg>-agent-rules -->`). SKILL.md stops duplicating API surface; it only keeps consumer-side setup the module can't carry (`.npmrc`, env-namespace rules, peer deps, requires chains, destructive guardrails). Average SKILL.md size 90→863 lines collapsed to ~80; references/ ≈ 5,000 lines retired, `skills/_shared/` removed. Each skill now ships a transition-period `agent-rules.md` fallback alongside SKILL.md. Validator enforces a 150-line SKILL.md cap (warn at 100) and a required `BEGIN:reopt/<pkg>-agent-rules` marker reference for every `*-install` / `*-review` skill. AGENTS.md, README.md, README_KO.md, COMPATIBILITY.md, CONTRIBUTING.md updated to match. New `MIGRATION-v2.md` documents the upgrade path and maps each retired `references/*.md` to its new module-docs location. **Breaking** at the repo level — silent contract change for any consumer that relied on inline API surface in SKILL.md or on the retired `_shared/` templates.

**Skill / package sync — 2026-05-14** (`@reopt-ai/brandapp-sdk` 2.0.0)

- `brandapp-sdk-install` SKILL: Step 3 environment-variable section
  rewritten around the 2.0 3-tier naming convention — `BRANDAPP_*`
  consumer credentials (clean break from `REOPT_CLIENT_*` /
  `REOPT_BRANDAPP_ID` / `REOPT_WEBHOOK_SECRET`), `REOPT_*` reserved
  for platform host overrides, `BRANDAPP_SDK_*` for SDK behavior
  toggles. Added the host-split explainer (`brand.reopt.ai` /
  `id.reopt.ai`, new optional `REOPT_ID_BASE_URL`), a service-token
  (1.12+) sub-section noting the single-auth-path rule, and an
  EAV-schema drift-detection recipe (1.11+) wiring
  `computeEavSchemaHash` at build time and `verifyEavSchema` at
  runtime via `NEXT_PUBLIC_BRANDAPP_EAV_HASH`. Code samples
  (`lib/auth.ts`, `lib/sdk.ts`, dev-server `instrumentation.ts`,
  `verifySession`, webhook handler, zod env schema, Output-format
  Next-steps) now use the new env names. Notes section adds v1.10 /
  v1.11 / v1.12 lines plus a dedicated v2.0.0 breaking-change line
  enumerating the rename pairs.
- `brandapp-sdk-review` SKILL: Step 1 version-check rewritten with
  1.9.x / 1.10–1.11.x / 1.12.x / 2.0.0+ rows; upgrade banner targets
  2.0.0 and includes the full `.env` rename cheat sheet. Step 2-D
  Config Pattern 1 widened to flag stale `www.reopt.ai` hosts after
  the 1.10 split; Config Pattern 3 flags any remaining
  `process.env.REOPT_CLIENT_*` / `REOPT_BRANDAPP_ID` /
  `REOPT_WEBHOOK_SECRET` / `REOPT_SDK_*` / `NEXT_PUBLIC_REOPT_*` /
  `NEXT_PUBLIC_EAV_HASH` reference as broken on 2.0 (not just a
  warning); new **Config Pattern 4** flags service-token + Basic
  Auth混用 on 1.12+. New **Schema Pattern 5** detects projects that
  ship `eav.schema.ts` to production without `verifyEavSchema` /
  `NEXT_PUBLIC_BRANDAPP_EAV_HASH`. Webhook + Auth code samples
  switched to `BRANDAPP_WEBHOOK_SECRET` / `BRANDAPP_ID`. Step 3
  report-summary rows widened ("Config: ... host / token", "Schema:
  ... drift unchecked") and the Recommended version line points at
  v2.0.0.
- `COMPATIBILITY.md` snapshot rolled to 2026-05-14; both BrandApp SDK
  rows now read min `2.0.0`, last verified `2.0.0`, with notes
  enumerating v1.10–v1.12 plus the v2.0.0 env-namespace breaking
  change.

### Added

**Skill / package sync — 2026-05-10** (`@reopt-ai/brandapp-sdk` 1.9.0)

- `brandapp-sdk-install` SKILL: Step 4 "API error handling" gained an
  "EAV-specific narrowing (1.9+)" sub-block. Mirrors the
  `docs/errors.md` reference pattern with three branches —
  `AuthUserRecordExistsError` → auto-upsert,
  `AuthUserNotFoundError` → provision-then-retry,
  `LimitExceededError` → upgrade prompt — plus a note on
  `DuplicateAuthUserError` and the legacy `REQUEST_ERROR` string
  check. Notes section gained a v1.9 line listing the four new
  classes, the granular EAV codes (`LIMIT_EXCEEDED_*`,
  `AUTH_USER_NOT_FOUND`, `AUTH_USER_RECORD_EXISTS`,
  `ENTITY_NOT_FOUND`, `ATTRIBUTE_NOT_FOUND`, `RECORD_NOT_FOUND`,
  `RECORDS_NOT_FOUND`, `DUPLICATE_RECORD_ID`,
  `AUTH_USER_ID_REQUIRED`), and the atomic JSONB merge fix.
- `brandapp-sdk-review` SKILL: Step 1 version-check rewritten with a
  1.8.x row (recommend bumping for the new patterns) and a 1.9.0+
  row; upgrade banner now points at 1.9.0. Step 2-C gained
  **Error Pattern 3** (EAV mutation on
  `linkedTo='brandappAuthUser'` missing 1.9 narrowed catches) and
  **Error Pattern 4** (legacy `e.code === 'REQUEST_ERROR'` string
  check). Schema Pattern 4 cross-references Error Pattern 3. Step 3
  report Summary row "Error: SDK error types unused" widened to "/
  1.9 narrowing missed".

### Changed

**Skill / package sync — 2026-05-10**

- `COMPATIBILITY.md` snapshot rolled to 2026-05-10; both BrandApp SDK
  rows now read "Last verified 1.9.0". Notes column for
  `brandapp-sdk-install` lists the four new error classes + granular
  codes; the `brandapp-sdk-review` row replaces the
  "Old `REQUEST_ERROR` branch detection still pending" sentence with
  the actual Error Pattern 3/4 reference now that the patterns
  exist.
- `skills/brandapp-sdk-install/metadata.json`,
  `skills/brandapp-sdk-review/metadata.json` `updatedAt` rolled to
  `2026-05-10`.

### Added

**Docs — 2026-05-09**

- `README_KO.md` — Korean translation of the top-level README (skill
  catalog, "choosing a skill" decision table, typical adoption order).
  Cross-link added at the top of `README.md`.
- `README.md` expanded: every skill row now describes the concrete
  surface it covers (commands, files, audit categories) instead of a
  one-line teaser; new "Choosing a skill" decision table and "Typical
  adoption order" section clarify when to reach for `reopt-*` (CLI)
  vs. `brandapp-sdk-*` (consumer-app code) and how `reopt brandapp
  init` relates to `brandapp-sdk-install`.

### Changed

**Docs — 2026-05-09**

- `reopt-brandapp` SKILL: `init` section rewritten with the real file
  list (`.env.development`, `reopt.seed.ts`, `lib/dev-server.ts`,
  `instrumentation.ts`, `package.json` `dev:local` script, `.gitignore`
  `.reopt/`) and the Next.js-vs-non-Next conditional behavior. Now
  states explicitly that `init` does **not** create the SDK app files
  (`.npmrc`, `lib/sdk.ts`, `lib/auth*.ts`, auth route handler) — those
  belong to `brandapp-sdk-install`.
- `brandapp-sdk-install` SKILL: Step 0 corrected. Previously implied
  `reopt brandapp init` could replace the rest of the install ("CLI
  automation (recommended fast path)") with an inflated file list that
  did not match the CLI's actual behavior. Step 0 is now framed as an
  **optional dev-environment bootstrap** with the accurate file list,
  and explicitly lists the SDK files `init` does not create.

### Added

**Skill / package sync — 2026-05-07** (`@reopt-ai/brandapp-sdk` 1.8.0)

- `brandapp-sdk-install` SKILL gained a v1.8 "External marketing site"
  feature row, full Next.js recipe block (blog routing with
  `cms.posts.getBySlug` + `toMetadata`, `app/sitemap.ts` via
  `toSitemapItems`, RSS via `toRssFeed`, `<Image>` integration with
  `optimizeUrl` / `REOPT_IMAGE_REMOTE_PATTERNS`, cross-subdomain
  session via `verifySession`), and a `linkedTo: 'brandappAuthUser'`
  note next to the EAV schema definition. The Unified-SDK feature row
  flags `.cms` as read-only as of 1.8.0; webhook handlers warn that
  `post.published / post.updated / post.deleted` were dropped.
- `brandapp-sdk-review` SKILL gained Step 2-I "External-site / CMS
  patterns (1.8+)" with five new patterns: removed CMS write surface
  (CMS-1, the breaking change), hand-rolled blog metadata (CMS-2),
  hand-rolled sitemap / RSS (CMS-3), manual image URL transforms
  (Files-1), re-implementing cross-subdomain session verification
  (Auth-7), and `defineEntity` without `linkedTo` for 1:1 user
  metadata (Schema-4). Step 1 version-check rewritten with
  per-version recommendations (`< 1.3` / `1.3–1.5` / `1.6–1.7` / `1.8`).
  Report summary template gains a "CMS / external-site (1.8+)" row.
- `reopt-eav` SKILL notes that `@reopt-ai/brandapp-sdk/eav/migrate`
  (`defineMigration` + runner) exposes the same migration runner the
  CLI calls — so a custom `npm run db:migrate` Node script and
  `reopt brandapp eav migrate run` produce identical results.

- `CHANGELOG.md` (this file) and a formal versioning policy in `AGENTS.md`.
- `skills/_shared/breaking-changes-template.md` describing the required
  shape for every installer skill's `references/breaking-changes.md`.
- `target` / `targetMinVersion` frontmatter fields on all seven installer
  skills, cross-checked against `COMPATIBILITY.md` by `pnpm validate`.
- `pnpm validate` now enforces `requires:` graph integrity (references
  exist, no cycles) and `target` / `targetMinVersion` consistency with
  `COMPATIBILITY.md`.
- `COMPATIBILITY.md`: new "Tracked but no installer skill yet" subsection
  covering `@reopt-ai/opt-palette` and `@reopt-ai/opt-devtool` (both
  0.1.0, unpublished — `opt-devtool` is the rename of `opt-inspect`).
  Drift checklist gained a matching bullet.

### Changed

**Skill / package sync — 2026-05-07**

- `COMPATIBILITY.md` snapshot dated 2026-05-07; both BrandApp SDK rows
  rolled to "Last verified 1.8.0" with notes covering 1.7 (`linkedTo`)
  and 1.8 (`cms` read-only + marketing-site helpers).
- `skills/brandapp-sdk-install/metadata.json`,
  `skills/brandapp-sdk-review/metadata.json`,
  `skills/reopt-eav/metadata.json` `updatedAt` rolled to `2026-05-07`.

**Skill / package sync — 2026-05-03**

- `opt-editor-install` bumped to minimum `@reopt-ai/opt-editor@1.0.0`
  (first stable). Added 1.0.0 entry to
  `references/breaking-changes.md` covering the `EditorMode` widening
  (`"stream" | "edit"` → `"stream" | "edit" | "diff"`) and the new
  `<SuggestionDecorations>` review surface / i18n keys / CSS additions.
- `opt-datagrid-install` bumped to minimum `@reopt-ai/opt-datagrid@1.3.0`.
  Upgrade is purely additive — `references/breaking-changes.md` lists
  `columnSortState` (ARIA), `labels` (i18n), `useColumnSort.columnSortState`
  bridge, `aria-readonly` on read-only cells, and the new exported types.
- `brandapp-sdk-install` "Last verified" rolled forward to
  `@reopt-ai/brandapp-sdk@1.6.1`. Notes call out the v1.6.1 mutation hooks
  (`useUpsertRecord`, `useBulkCreateRecords`, `useBulkUpdateRecords`,
  `useBulkDeleteRecords`, `useDeleteRecordsWhere`) and the per-call
  `signal`/`timeout` on `sdk.files.upload()`. The fixed-at-build-time
  `SDK_VERSION` constant is mentioned where consumers comment on
  telemetry.
- `brandapp-sdk-review` "Last verified" rolled forward to
  `@reopt-ai/brandapp-sdk@1.6.1` (no rule changes yet).
- `reopt-cli` SKILL.md absorbed the new top-level commands shipped in CLI
  `0.1.0`: `mcp`, `logout --all`, `status --ping`, `config get/set/unset/list`,
  `completion <shell>`, `schema [resource]`. Global flags table replaced
  with the full program-level set (`--format`, `--fields`, `--limit`,
  `--offset`, `--page-all`, `--page-limit`, `--page-delay`, `--timeout`,
  `--max-retries`, `-q/--quiet`, `-v/--verbose`, `--no-interactive`).
  Silent session refresh (Better Auth window) documented.
- `reopt-brandapp` SKILL.md absorbed `init`, `dev` (experimental),
  `seed`, and `env list/create/use/destroy` (experimental). Command table
  gained a "Status" column to mark the experimental commands explicitly.
- `reopt-eav` SKILL.md absorbed `eav plan` and `eav migrate
  create/run/status/validate` (experimental). Migration mode notes the
  advisory lock taken by `migrate run` and the CI checksum role of
  `migrate validate`.
- `COMPATIBILITY.md` snapshot date moved to 2026-05-03.
- `skills/<changed-skill>/metadata.json` `updatedAt` rolled to
  `2026-05-03` for the five skills touched in this round.

**Earlier — initial versioning + consistency pass**

- `skills/opt-editor-install/SKILL.md` frontmatter aligned with the other
  nine skills (removed split `version` / `triggers` fields; triggers and
  current target version inlined into the `description`).
- `COMPATIBILITY.md`: filled minimum versions for `opt-editor-install`
  (`0.8.0`) and `opt-harness-install` (`0.1.0`). Target cell normalized to
  a single package everywhere (companion `opt-ui-cli` moved to Notes).
- `skills/<name>/metadata.json`: `version` and `updatedAt` now mirror the
  repository release the file shipped in (previously stuck at `1.0.0` /
  `2026-04-17`).
- `COMPATIBILITY.md` _Historical deprecations_ section moved here (see
  _Deprecated / removed_ below).
- `scripts/validate-skills.mjs` rewritten around a minimal YAML-frontmatter
  parser that supports multi-line descriptions and list-valued keys.
- Five `references/breaking-changes.md` headers aligned to
  `# Breaking Changes Registry — @reopt-ai/<package>` with a consistent
  maintenance-rule blockquote.
- `reopt-cli`, `reopt-brandapp`, `reopt-eav` dropped the duplicated
  `metadata.author` / `metadata.version` block from SKILL.md frontmatter;
  per-skill metadata now lives in `metadata.json` only.

### Verified
- Registry probe confirms the pinned min versions exist on GitHub Packages
  for `brandapp-sdk@{1.5.0, 1.6.0}`, `opt-ui@1.2.1`, `opt-editor@0.8.0`,
  `opt-datagrid@1.1.0`.
- `@reopt-ai/opt-chat` and `@reopt-ai/opt-harness` are **not yet
  published** — `COMPATIBILITY.md` flags both rows as `(unpublished)` and
  marks the packages accordingly.

### Security
- Replaced GitHub token placeholder literals (`ghp_xxxx…`) with
  `<your-github-token>` in `opt-editor-install` and `opt-ui-install`
  reference docs to avoid false positives from secret scanners.

### Deprecated / removed (historical — carried over from `COMPATIBILITY.md`)
- `brandapp-sdk-install`: manual `lib/eav.ts` Proxy replaced by
  `createLazySDK` (2026-04-17; SDK shipped `createLazySDK` in v1.3).
- `brandapp-sdk-install`: references to `apps/brandapp-example/` updated to
  `apps/brandapp-playground/` (2026-04-17; example app renamed).
- `brandapp-sdk-install`: error-handling section expanded with four new 4xx
  classes (2026-04-17; SDK v1.6.0 split `REQUEST_ERROR` into dedicated
  classes).

v2.0.0 supersedes the previously planned `[0.1.0]` first-public-release — the slim rewrite went out as the first public tag instead.
