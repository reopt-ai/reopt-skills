---
name: reopt-eav
description: EAV schema status, sync, pull, plan, file-based migrations, and destructive-change guardrails for reopt Brandapp projects. Use when a task involves `reopt brandapp eav status`, `sync`, `pull`, `plan`, `migrate`, `--dry-run`, or `--delete-orphans`.
requires:
  - reopt-cli
  - reopt-brandapp
---

# reopt EAV

Guidance for managing Brandapp EAV schemas with the `reopt` CLI.

## When to Apply

Use this skill when:

- checking drift between local schema and server state
- syncing schema changes to the server
- generating a local schema from server state
- reviewing destructive EAV changes in CI or local development
- producing a markdown plan/risk report for review (`eav plan`)
- using file-based migrations instead of live `sync` (experimental `eav migrate`)

Load `reopt-cli` and `reopt-brandapp` first.

## Commands

| Command | Description | Mutates Server | Status |
| --- | --- | --- | --- |
| `eav status` (alias `st`) | Diff local schema vs server state | no | stable |
| `eav sync` (alias `up`) | Apply schema diff and generate types | yes | stable |
| `eav pull` | Generate schema file from current server state | no | stable |
| `eav plan` | Render diff + risk classification as markdown | no | stable |
| `eav migrate create <name>` | Scaffold a new migration file | no | experimental |
| `eav migrate run` | Apply pending migrations sequentially | yes | experimental |
| `eav migrate status` | Show pending / applied / drift state | no | experimental |
| `eav migrate validate` | CI checksum validation against applied migrations | no | experimental |

## Recommended Workflow

### 1. Check drift

```bash
reopt brandapp eav status --json
```

If the summary says there is no diff, skip sync.

### 2. Preview changes

```bash
reopt brandapp eav sync --dry-run --json
```

Review planned deletes carefully.

### 3. Apply

```bash
reopt brandapp eav sync --json
```

### 4. Watch during schema work

```bash
reopt brandapp eav sync --watch
```

## Flags

### `eav sync`

| Flag | Default | Purpose |
| --- | --- | --- |
| `-s, --schema <path>` | `./eav.schema.ts` | Input schema path |
| `-o, --out <path>` | `./generated/eav.ts` | Generated types path |
| `--delete-orphans` | off | Delete server attrs missing locally |
| `--dry-run` | off | Preview only |
| `--json` | off | Emit JSON |
| `-w, --watch` | off | Watch and auto-sync |

### `eav status`

| Flag | Default | Purpose |
| --- | --- | --- |
| `-s, --schema <path>` | `./eav.schema.ts` | Input schema path |
| `--delete-orphans` | off | Include orphaned attrs in diff |
| `--json` | off | Emit JSON |
| `--verbose` | off | Show field-level diff |

### `eav pull`

| Flag | Default | Purpose |
| --- | --- | --- |
| `-o, --out <path>` | `./eav.schema.ts` | Output schema path |
| `--force` | off | Overwrite existing file |
| `--json` | off | Emit JSON |

### `eav plan`

| Flag | Default | Purpose |
| --- | --- | --- |
| `-s, --schema <path>` | `./eav.schema.ts` | Input schema path |
| `-o, --out <path>` | stdout | Write markdown to a file instead of stdout |

`eav plan` is the right tool when a schema change needs review (PR
comment, design doc, change-control ticket) — it groups the diff by risk
class and renders deletes / required-field additions in their own
sections. It does **not** apply the diff; pair it with `eav sync` after
sign-off.

### `eav migrate` (experimental)

File-based migrations live under `./eav-migrations/` (override with
`--dir <path>`). Use this mode when you need ordered, reviewable change
files instead of the live `sync` flow.

```bash
reopt brandapp eav migrate create add_customer_consent
reopt brandapp eav migrate create add_customer_consent --from-diff   # auto-fill up() body from current schema vs server
reopt brandapp eav migrate run                                       # apply every pending migration
reopt brandapp eav migrate run --dry-run                             # preview pending migrations
reopt brandapp eav migrate run --target add_customer_consent         # stop after this migration (inclusive)
reopt brandapp eav migrate status                                    # pending / applied / drift
reopt brandapp eav migrate status --json
reopt brandapp eav migrate validate                                  # CI: checksum applied migrations against files on disk
```

`migrate run` takes an advisory lock on the brandapp so two pipelines
cannot apply the same migration concurrently — surface this when scripting
multi-region rollouts. `migrate validate` is the right step in CI: it
fails when an applied migration's checksum drifts from the file on disk
(someone edited a migration after it ran).

The runner is also exposed programmatically via
`@reopt-ai/brandapp-sdk/eav/migrate` (`defineMigration` + a `runner`).
The CLI calls the same module, so a hand-written Node script and
`reopt brandapp eav migrate run` produce identical results. Use the
SDK form when migrations need to live alongside application code (for
example, in a `npm run db:migrate` pre-deploy hook).

## Destructive Change Guardrail

`--delete-orphans` permanently removes server-side attributes and their values.

Before using it:

1. Run `reopt brandapp eav status --delete-orphans --json`.
2. Verify every deletion is intentional.
3. Confirm application code no longer depends on those fields.
4. Run `reopt brandapp eav sync --delete-orphans --dry-run --json`.
5. Only then apply `reopt brandapp eav sync --delete-orphans --json`.

Do not run this flag blindly in automation.

## Schema Format

```ts
import { defineEntity, defineSchema } from "@reopt-ai/brandapp-sdk/eav/schema";

const contacts = defineEntity({
  name: "contacts",
  attributes: {
    name: { dataType: "string", label: "Name", isRequired: true }
  }
});

export default defineSchema({ entities: { contacts } });
```

## Lock File

Sync creates `eav.lock` alongside the schema. Commit `eav.lock` so rename detection and stable ID mapping continue to work.

