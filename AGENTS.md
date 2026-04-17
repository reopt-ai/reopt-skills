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
2. Run `pnpm validate`.
3. Commit and push. Consumers pick up the change on their next `npx skills add` / `npx skills update`.

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
