# AGENTS.md

This repository packages reusable skills for AI coding agents working on `reopt`. It is the canonical agent-facing guide — `CLAUDE.md` imports this file for Claude Code compatibility.

## Repository Overview

- Mirror the high-level structure of `vercel-labs/agent-skills`.
- Keep each distributable skill under `skills/<skill-name>/`.
- Distribution is via the `skills` CLI (`npx skills add reopt-ai/reopt-skills`), which pulls directly from git. No zip artifacts are committed.
- Use root scripts for validation and syncing instead of ad hoc shell one-liners.

## Directory Layout

```text
skills/
  _shared/                   # shared pipeline templates (not an installable skill)
    *.md
  <skill-name>/
    SKILL.md                 # required
    README.md                # optional
    metadata.json            # optional
    command/                 # optional
    references/              # optional
    scripts/                 # optional
scripts/
  sync-from-cli.mjs          # internal maintenance only
  validate-skills.mjs
```

Directories prefixed with `_` (e.g. `_shared`) are shared scaffolding consumed by multiple skills. The validator and any build scripts skip them.

## Skill Authoring Rules

- Skill names must be lowercase kebab-case and match the folder name.
- `SKILL.md` frontmatter must include at least `name` and `description`.
- Keep `SKILL.md` focused on trigger conditions, workflow, and sharp operational guidance.
- Move long examples or variant-specific material into `references/` once a skill grows.
- Prefer reusable, organization-specific knowledge over generic advice the model already knows.
- All content — SKILL.md, README, references, commit messages — is authored in English. Non-English trigger keywords in frontmatter are allowed when they aid matching.

## Workflow

1. Edit skill files under `skills/<skill-name>/`.
2. Run `pnpm validate`. The validator enforces:
   - every skill has `SKILL.md` with `name` + `description` frontmatter
     and a matching directory name;
   - `metadata.json`, if present, is valid JSON;
   - `requires:` entries point at real skills and do not form a cycle;
   - `target` / `targetMinVersion` (when declared on installer skills)
     agree with the matching row in `COMPATIBILITY.md`.
3. Commit and push. Consumers pick up the change on their next `npx skills add` / `npx skills update`.

## Versioning

This repository ships **one version**: the root release. SemVer applies at the
repository level, not per-skill.

- **MAJOR** — a breaking change to any skill's invocation shape, required
  inputs, or output contract that would silently break an existing consumer.
- **MINOR** — new skill added, new non-breaking guidance, new optional flag or
  reference doc.
- **PATCH** — typo / wording fix, clarification, non-behavioral refactor.

### Sources of truth

- `package.json` `version` — current release number.
- `CHANGELOG.md` — per-release change log. Every PR that lands user-visible
  changes adds an entry under `## [Unreleased]`.
- `git tag vX.Y.Z` — cut at release time from `main` after moving
  `[Unreleased]` entries into a `[X.Y.Z]` section.

### Release cutting (maintainer checklist)

1. Move `[Unreleased]` entries in `CHANGELOG.md` into a new `[X.Y.Z] — YYYY-MM-DD` section.
2. Bump `package.json` `version` to match.
3. Update `skills/<name>/metadata.json` for every changed skill:
   - `version` → new release number
   - `updatedAt` → release date
   Skills that were not touched since the last release keep their prior values.
4. Tag: `git tag vX.Y.Z && git push --tags`.

### Per-skill `metadata.json`

- `version` and `updatedAt` mirror the **repository release** the file last
  shipped in — not a per-skill counter. Use `git log skills/<name>/` to see
  per-skill edit history.
- `organization`, `abstract`, `references` are descriptive and do not follow
  SemVer.

### Target package compatibility (`@reopt-ai/*`)

`COMPATIBILITY.md` tracks, for each installer/review skill, the minimum target
package version and the last version end-to-end verified. When a skill edit
lands because a target package changed:

- Update the `Min version` / `Last verified` cells in `COMPATIBILITY.md`.
- Add a `CHANGELOG.md` entry linking the package release to the skill change.

## Syncing Existing CLI Skills (internal maintenance only)

This step assumes you are working inside the reopt monorepo, where seed skills live at `../packages/cli/skills`. External contributors can ignore this section — the sibling path will not exist outside the monorepo and the script becomes a no-op.

Copy missing `SKILL.md` files:

```bash
pnpm sync:cli
```

Overwrite existing `SKILL.md` files intentionally:

```bash
pnpm sync:cli -- --force
```

The script only touches `SKILL.md` files and leaves local `README.md` / `metadata.json` files intact.
