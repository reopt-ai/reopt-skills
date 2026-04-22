---
name: reopt-eav
description: EAV schema status, sync, pull, and destructive-change guardrails for reopt Brandapp projects. Use when a task involves `reopt brandapp eav status`, `sync`, `pull`, `--dry-run`, or `--delete-orphans`.
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

Load `reopt-cli` and `reopt-brandapp` first.

## Commands

| Command | Description | Mutates Server |
| --- | --- | --- |
| `eav status` | Diff local schema vs server state | no |
| `eav sync` | Apply schema diff and generate types | yes |
| `eav pull` | Generate schema file from current server state | no |

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

