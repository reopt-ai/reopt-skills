# AGENTS.md

This repository packages reusable skills for AI coding agents working on `reopt`. It is the canonical agent-facing guide — `CLAUDE.md` imports this file for Claude Code compatibility.

## Repository Overview

- Mirror the high-level structure of `vercel-labs/agent-skills`.
- Keep each distributable skill under `skills/<skill-name>/`.
- Distribution is via the `skills` CLI (`npx skills add reopt-ai/reopt-skills`), which pulls directly from git. No zip artifacts are committed.
- Use root scripts for validation and syncing instead of ad hoc shell one-liners.

## What a skill in this repo does (v2)

A reopt skill has **two jobs**:

1. **Pin an agent-rules marker block** into the consumer project's `AGENTS.md` (fallback `CLAUDE.md`) — `<!-- BEGIN:reopt/<pkg>-agent-rules -->` … `<!-- END:reopt/<pkg>-agent-rules -->`. Markers are idempotent: a re-install replaces the block content, leaving everything outside untouched. The block source of truth is the module's own agent-rules file once it ships one — **no `@reopt-ai/*` package ships one yet**, so the skill's bundled fallback `agent-rules.md` is currently authoritative. Skills that share a marker (install + review of the same package) must ship byte-identical fallbacks; `pnpm validate` enforces this.
2. **Trigger matching + docs routing** — detect the user's intent and route to the right doc file in the installed package. **Doc layout varies per package** — `dist/docs/` (opt-ui / opt-datagrid / opt-editor, numeric-prefixed tree + `index.md`), top-level `docs/` (brandapp-sdk, flat files), or `README.md` / `shell-llms.txt` (cli, opt-chat, opt-shell, which ship no docs dir). Confirm the real path + filename before routing — skills point at literal paths. SKILL.md does not duplicate API surface; module docs are pinned to the installed version, the skill is not.

What stays in SKILL.md: consumer-project setup that cannot live inside the module (legacy registry cleanup, env-namespace rules, peer deps, requires chains, destructive guardrails, security rules). Everything else routes to the package's docs (wherever it ships them).

## Directory Layout

```text
skills/
  <skill-name>/
    SKILL.md                 # required
    agent-rules.md           # transition fallback for the marker block
    README.md                # optional
    metadata.json            # optional
scripts/
  sync-from-cli.mjs          # internal maintenance only
  validate-skills.mjs
```

Subdirectories like `command/` and `references/` were retired in v2. If you find yourself wanting to add one, the content belongs in the module's docs (`dist/docs/` or top-level `docs/`, per package) instead.

## Skill Authoring Rules

- Skill names must be lowercase kebab-case and match the folder name.
- `SKILL.md` frontmatter must include at least `name` and `description`. Installer/review skills also declare `target` + `targetMinVersion`, cross-checked against `COMPATIBILITY.md`.
- **SKILL.md length budget:** `> 150` lines fails validation, `> 100` lines warns. Move API surface, code samples, and per-version detail into the module's `dist/docs/`.
- **Marker convention:** every `*-install` / `*-review` skill must embed a literal `<!-- BEGIN:reopt/<pkg>-agent-rules -->` marker reference in SKILL.md. The validator enforces this.
- **agent-rules.md:** ship a fallback copy in `skills/<name>/agent-rules.md` until the module publishes its own `dist/agent-rules.md`. Remove the fallback once the module ships it.
- Keep `SKILL.md` focused on: trigger keywords, marker injection, consumer-side setup, docs routing, safety, verify. No long examples.
- Prefer reusable, organization-specific knowledge over generic advice the model already knows.
- All content — SKILL.md, agent-rules.md, README, commit messages — is authored in English. Non-English trigger keywords in frontmatter are allowed when they aid matching.

## Workflow

1. Edit skill files under `skills/<skill-name>/`.
2. Run `pnpm validate`. The validator enforces:
   - every skill has `SKILL.md` with `name` + `description` frontmatter and a matching directory name;
   - `metadata.json`, if present, is valid JSON;
   - `requires:` entries point at real skills and do not form a cycle;
   - `target` / `targetMinVersion` (when declared) agree with the matching row in `COMPATIBILITY.md`;
   - SKILL.md is ≤ 150 lines (warns above 100);
   - `*-install` / `*-review` skills embed the `BEGIN:reopt/<pkg>-agent-rules` marker reference.
3. Commit and push. Consumers pick up the change on their next `npx skills add` / `npx skills update`.

## Versioning

This repository ships **one version**: the root release. SemVer applies at the repository level, not per-skill.

- **MAJOR** — a breaking change to any skill's invocation shape, required inputs, or output contract that would silently break an existing consumer.
- **MINOR** — new skill added, new non-breaking guidance, new optional flag or reference doc.
- **PATCH** — typo / wording fix, clarification, non-behavioral refactor.

### Sources of truth

- `package.json` `version` — current release number.
- `CHANGELOG.md` — per-release change log. Every PR that lands user-visible changes adds an entry under `## [Unreleased]`.
- `git tag vX.Y.Z` — cut at release time from `main` after moving `[Unreleased]` entries into a `[X.Y.Z]` section.

### Release cutting (maintainer checklist)

1. Move `[Unreleased]` entries in `CHANGELOG.md` into a new `[X.Y.Z] — YYYY-MM-DD` section.
2. Bump `package.json` `version` to match.
3. Update `skills/<name>/metadata.json` for every changed skill:
   - `version` → new release number
   - `updatedAt` → release date
   Skills not touched since the last release keep their prior values.
4. Tag: `git tag vX.Y.Z && git push --tags`.

### Per-skill `metadata.json`

- `version` and `updatedAt` mirror the **repository release** the file last shipped in — not a per-skill counter. Use `git log skills/<name>/` to see per-skill edit history.
- `organization`, `abstract`, `references` are descriptive and do not follow SemVer.

### Target package compatibility (`@reopt-ai/*`)

`COMPATIBILITY.md` tracks, for each installer/review skill, the minimum target package version and the last version end-to-end verified. When a skill edit lands because a target package changed:

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

The script only touches `SKILL.md` files and leaves local `README.md` / `metadata.json` / `agent-rules.md` files intact.
