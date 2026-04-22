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
- `CHANGELOG.md` (this file) and a formal versioning policy in `AGENTS.md`.
- `skills/_shared/breaking-changes-template.md` describing the required
  shape for every installer skill's `references/breaking-changes.md`.
- `target` / `targetMinVersion` frontmatter fields on all seven installer
  skills, cross-checked against `COMPATIBILITY.md` by `pnpm validate`.
- `pnpm validate` now enforces `requires:` graph integrity (references
  exist, no cycles) and `target` / `targetMinVersion` consistency with
  `COMPATIBILITY.md`.

### Changed
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
