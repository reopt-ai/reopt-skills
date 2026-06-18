# Changelog

All notable changes to this repository are recorded here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
at the repository level — see `AGENTS.md` → _Versioning_ for what MAJOR /
MINOR / PATCH mean for a skills repository.

Each release is tagged `vX.Y.Z` in git; consumers can pin to a tag via the
`skills` CLI.

## [Unreleased]

### Changed

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
