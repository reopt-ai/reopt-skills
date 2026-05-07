# Changelog

All notable changes to this repository are recorded here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
at the repository level — see `AGENTS.md` → _Versioning_ for what MAJOR /
MINOR / PATCH mean for a skills repository.

Each release is tagged `vX.Y.Z` in git; consumers can pin to a tag via the
`skills` CLI.

## [Unreleased]

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

## [0.1.0] — TBD (planned May 2026)

Initial public release.

- 10 installable skills: `reopt-cli`, `reopt-brandapp`, `reopt-eav`,
  `brandapp-sdk-install`, `brandapp-sdk-review`, `opt-ui-install`,
  `opt-editor-install`, `opt-chat-install`, `opt-datagrid-install`,
  `opt-harness-install`.
- Shared scaffolding under `skills/_shared/upgrade-pipeline.md`.
- Root tooling: `pnpm validate`, `pnpm sync:cli`.
- Distribution via the `skills` CLI — `npx skills add reopt-ai/reopt-skills`.
