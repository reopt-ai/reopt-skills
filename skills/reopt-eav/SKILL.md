---
name: reopt-eav
description: EAV schema status, sync, pull, plan, file-based migrations, and destructive-change guardrails for reopt Brandapp projects. Use when a task involves `reopt brandapp eav status`, `sync`, `pull`, `plan`, `migrate`, `--dry-run`, or `--delete-orphans`.
requires:
  - reopt-cli
  - reopt-brandapp
---

# reopt EAV

> This is NOT the reopt CLI you know. Run `reopt brandapp eav --help` / `reopt brandapp eav <cmd> --help` for the live command tree. Read `node_modules/@reopt-ai/cli/dist/docs/eav.md` for narrative guides. EAV schema authoring lives in `@reopt-ai/brandapp-sdk/dist/docs/eav.md`.

## When to apply

- checking drift between local schema and server state
- syncing schema changes to the server
- generating a local schema from server state
- reviewing destructive EAV changes in CI or local development
- producing a markdown plan/risk report (`eav plan`)
- file-based migrations (experimental `eav migrate`)

Load `reopt-cli` and `reopt-brandapp` first. Their shared agent-rules block (`<!-- BEGIN:reopt/cli-agent-rules -->`) covers this skill too — skip Step 1 if already pinned.

## Step 1 — Pin agent rules (only if upstream skills haven't)

Same source/fallback/marker as `reopt-cli`. Idempotent: leave the block alone if it's already present.

## Step 2 — Command map (refer to `--help` for flags)

| Command | Purpose | Mutates server | Status |
|---|---|---|---|
| `eav status` (alias `st`) | Diff local schema vs server | – | stable |
| `eav sync` (alias `up`) | Apply diff + generate types | ✓ | stable |
| `eav pull` | Generate schema file from server | – | stable |
| `eav plan` | Render diff + risk classification as markdown | – | stable |
| `eav migrate create <name>` | Scaffold a migration file | – | experimental |
| `eav migrate run` | Apply pending migrations | ✓ | experimental |
| `eav migrate status` | Show pending / applied / drift | – | experimental |
| `eav migrate validate` | CI checksum validation | – | experimental |

Common flags (`--schema <path>`, `--out <path>`, `--json`, `--watch`, `--dry-run`, `--delete-orphans`) — see `reopt brandapp eav <cmd> --help` for the live set per command.

## Step 3 — Recommended workflow

```bash
reopt brandapp eav status --json                       # 1. check drift; skip if no diff
reopt brandapp eav sync --dry-run --json               # 2. preview (review deletes carefully)
reopt brandapp eav sync --json                         # 3. apply
reopt brandapp eav sync --watch                        # during active schema work
```

`eav plan` (separate from sync) — use when a schema change needs review (PR comment, design doc, change-control ticket). Groups the diff by risk class, renders deletes / required-field additions in their own sections. Does **not** apply the diff; pair with `eav sync` after sign-off.

## Step 4 — Destructive guardrail (`--delete-orphans`)

`--delete-orphans` permanently removes server-side attributes and their values. Required order:

1. `reopt brandapp eav status --delete-orphans --json` — inspect every planned deletion.
2. Verify every deletion is intentional.
3. Confirm no application code still depends on those fields.
4. `reopt brandapp eav sync --delete-orphans --dry-run --json` — preview.
5. Only then `reopt brandapp eav sync --delete-orphans --json` — apply.

**Never run `--delete-orphans` blindly in automation.**

## Step 5 — `eav migrate` (experimental)

File-based migrations under `./eav-migrations/` (override with `--dir <path>`). Use when you need ordered, reviewable change files instead of live `sync`.

- `migrate run` takes an advisory lock on the brandapp — two pipelines cannot apply the same migration concurrently. Surface this when scripting multi-region rollouts.
- `migrate validate` is the CI step — fails when an applied migration's checksum drifts from the file on disk.
- Programmatic equivalent: `@reopt-ai/brandapp-sdk/eav/migrate` (`defineMigration` + `runner`). Identical results — use the SDK form when migrations live alongside app code (e.g. `npm run db:migrate` pre-deploy).

## Step 6 — Route to docs

| Task signal | Read |
|---|---|
| Schema authoring (`defineEntity`, `defineSchema`, `linkedTo`, drift hash) | `@reopt-ai/brandapp-sdk/dist/docs/eav.md` |
| Migration runner internals, lock behavior | `@reopt-ai/cli/dist/docs/eav-migrate.md` |
| `eav plan` output format | `@reopt-ai/cli/dist/docs/eav-plan.md` |
| Risk classification rubric | `@reopt-ai/cli/dist/docs/eav-risk.md` |

## Lock file

`eav sync` writes `eav.lock` alongside the schema. **Commit `eav.lock`** so rename detection and stable ID mapping continue to work across machines and CI.

## Safety

- Inherit all `reopt-cli` rules.
- Always `--dry-run` before any mutating EAV operation.
- `--delete-orphans` is the destructive switch — follow Step 4 in order, never shortcut.
- Treat `migrate validate` failures as merge blockers in CI.
