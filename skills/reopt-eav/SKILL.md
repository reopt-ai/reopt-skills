---
name: reopt-eav
description: EAV schema status, sync, pull, diff, file-based migrations (plan/migrate/history/verify), and destructive-change guardrails for reopt Brandapp projects. Use when a task involves `reopt brandapp eav status`, `sync`, `pull`, `diff`, `plan`, `migrate`, `history`, `verify`, `--dry-run`, or `--delete-orphans`.
requires:
  - reopt-cli
  - reopt-brandapp
---

# reopt EAV

> This is NOT the reopt CLI you know. Run `reopt brandapp eav --help` / `reopt brandapp eav <cmd> --help` for the live command tree. The CLI ships no `dist/docs/`; if narrative context is needed, locate the `README.md` from the actual CLI installation or source checkout instead of assuming a local `node_modules` path. EAV schema authoring lives in `@reopt-ai/brandapp-sdk/docs/api-reference.md`.

## When to apply

- checking drift between local schema and server state
- syncing schema changes to the server
- generating a local schema from server state
- reviewing destructive EAV changes in CI or local development
- producing a markdown diff/risk report (`eav diff`)
- file-based migrations (`eav plan` → `migrate` → `history` / `verify`)

Load `reopt-cli` and `reopt-brandapp` first. Their shared agent-rules block (`<!-- BEGIN:reopt/cli-agent-rules -->`) covers this skill too — skip Step 1 if already pinned.

## Step 1 — Pin agent rules (only if upstream skills haven't)

Same source/fallback/marker as `reopt-cli`. Idempotent: leave the block alone if it's already present.

## Step 2 — Command map (refer to `--help` for flags)

| Command | Purpose | Mutates server | Status |
|---|---|---|---|
| `eav status` (alias `st`) | Diff local schema vs server | – | stable |
| `eav sync` (alias `up`) | Apply diff + generate types | ✓ | stable |
| `eav pull` | Generate schema file from server | – | stable |
| `eav diff` | Render schema diff vs server as a markdown report (preview) | – | stable |
| `eav plan <name>` | Scaffold a new migration file (`--from-diff` auto-fills `up()` from the live diff) | – | stable |
| `eav migrate` | Apply pending migrations sequentially behind an advisory lock (`--dry-run` to preview) | ✓ | stable |
| `eav history` | Show pending / applied / drift / missing-file state | – | stable |
| `eav verify` | CI-friendly checksum validation against applied migrations | – | stable |

Common flags (`--schema <path>`, `--out <path>`, `--json`, `--watch`, `--dry-run`, `--delete-orphans`) — see `reopt brandapp eav <cmd> --help` for the live set per command.

## Step 3 — Recommended workflow

```bash
reopt brandapp eav status --json                       # 1. check drift; skip if no diff
reopt brandapp eav sync --dry-run --json               # 2. preview (review deletes carefully)
reopt brandapp eav sync --json                         # 3. apply
reopt brandapp eav sync --watch                        # during active schema work
```

`eav diff` (separate from sync) — use when a schema change needs review (PR comment, design doc, change-control ticket). Renders the diff as markdown, grouping deletes / required-field additions in their own sections. Does **not** apply the diff; pair with `eav sync` after sign-off.

## Step 4 — Destructive guardrail (`--delete-orphans`)

`--delete-orphans` permanently removes server-side attributes and their values. Required order:

1. `reopt brandapp eav status --delete-orphans --json` — inspect every planned deletion.
2. Verify every deletion is intentional.
3. Confirm no application code still depends on those fields.
4. `reopt brandapp eav sync --delete-orphans --dry-run --json` — preview.
5. Only then `reopt brandapp eav sync --delete-orphans --json` — apply.

**Never run `--delete-orphans` blindly in automation.**

## Step 5 — File-based migrations (`plan` → `migrate` → `history` / `verify`)

File-based migrations under `./eav-migrations/` (override with `--dir <path>`). Use when you need ordered, reviewable change files instead of live `sync`.

- `eav plan <name>` scaffolds a new migration file; `--from-diff` auto-fills `up()` from the live server diff.
- `eav migrate` applies pending migrations sequentially behind an advisory lock — two pipelines cannot apply the same migration concurrently. Surface this when scripting multi-region rollouts. `--dry-run` previews without executing.
- `eav history` shows pending / applied / drift / missing-file state.
- `eav verify` is the CI step — fails when an applied migration's checksum drifts from the file on disk.
- Programmatic equivalent: `@reopt-ai/brandapp-sdk/eav/migrate` (`defineMigration` + `runner`). Identical results — use the SDK form when migrations live alongside app code (e.g. `npm run db:migrate` pre-deploy).

## Step 6 — Route to docs

| Task signal | Read |
|---|---|
| Schema authoring (`defineEntity`, `defineSchema`, `linkedTo`, drift hash) | `@reopt-ai/brandapp-sdk/docs/api-reference.md` |
| Migration runner internals, lock behavior | `reopt brandapp eav migrate --help`, `reopt brandapp eav verify --help` |
| `eav diff` output format / risk classification | `reopt brandapp eav diff --help` |
| Migration scaffolding (`--from-diff`) | `reopt brandapp eav plan --help` |

## Lock file

`eav sync` writes `eav.lock` alongside the schema. **Commit `eav.lock`** so rename detection and stable ID mapping continue to work across machines and CI.

## Safety

- Inherit all `reopt-cli` rules.
- Always `--dry-run` before any mutating EAV operation.
- `--delete-orphans` is the destructive switch — follow Step 4 in order, never shortcut.
- Treat `eav verify` failures as merge blockers in CI.
