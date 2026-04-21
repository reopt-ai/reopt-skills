---
name: opt-datagrid-install
description: |
  Install, upgrade, or migrate to @reopt-ai/opt-datagrid in a consumer project.
  Not installed → initial setup (.npmrc, package, TypeScript paths, example).
  Installed → detect version → analyze impact → edit code → verify.
  Migrate mode → convert glide-data-grid, ag-grid, react-data-grid, or MUI DataGrid usage.
  Triggers on: "opt-datagrid install", "opt-datagrid init", "opt-datagrid setup",
  "datagrid install", "datagrid setup", "grid setup",
  "opt-datagrid upgrade", "datagrid upgrade", "datagrid update", "grid update",
  "opt-datagrid migrate", "datagrid migrate", "grid migration",
  "replace glide-data-grid", "replace ag-grid".
  Current version: opt-datagrid 1.1.0.
target: "@reopt-ai/opt-datagrid"
targetMinVersion: "1.1.0"
---

# opt-datagrid-install Skill

Install, upgrade, or migrate to `@reopt-ai/opt-datagrid` in a consumer
project.

> **CRITICAL — execution workflow:**
>
> This file (SKILL.md) covers invocation shape and safety rules.
> The actual step-by-step procedure lives in **`command/opt-datagrid-install.md`**.
>
> **Read `command/opt-datagrid-install.md` before starting any work.**

## Invocation

```
/opt-datagrid-install                        # Auto-branch (missing → init, installed → upgrade)
/opt-datagrid-install install                # Explicit install only
/opt-datagrid-install verify                 # Verify existing installation
/opt-datagrid-install --upgrade              # Explicit upgrade
/opt-datagrid-install --check                # Analyze only (no code changes)
/opt-datagrid-install --target=1.1.0         # Upgrade to a specific version
/opt-datagrid-install migrate                # Convert an existing grid to opt-datagrid
/opt-datagrid-install migrate <file>         # Convert a specific file
/opt-datagrid-install migrate --dry-run      # Print the migration plan only
/opt-datagrid-install example <pattern>      # Emit an example for a specific pattern
```

## Auto-Branch Pipeline

| Step | Description                      | Init | Upgrade | Migrate |
| ---- | -------------------------------- | ---- | ------- | ------- |
| 1    | Detect current state             | O    | O       | O       |
| 2    | .npmrc & registry auth           | O    | -       | O       |
| 3    | Package install / update         | O    | O       | O       |
| 4    | TypeScript paths                 | O    | -       | O       |
| 5    | Breaking-change edits            | -    | O       | -       |
| 6    | Deprecated cleanup (optional)    | -    | O       | -       |
| 7    | Grid migration                   | -    | -       | O       |
| 8    | Generate example                 | O    | -       | -       |
| 9    | Verify & summarize               | O    | O       | O       |

## Prerequisites

- Node.js 18+, React 19+
- GitHub token with `read:packages` scope
- bun or npm

## Safety Rules

1. **Never update the package without user approval** — always run the impact scan first.
2. **Process files one at a time** (migrate) — convert one file, wait for approval, then continue.
3. Apply breaking changes in logical groups — never bulk-apply.
4. **Do not finish until type check and tests pass.**
5. **Never commit** — do not commit or push without an explicit request.

## References

Load only what matches the task:

- `references/column-patterns.md` — column definition pattern reference
- `references/theme-integration.md` — opt-ui theme token integration
- `references/transform-glide-datagrid.md` — glide-data-grid migration rules
- `references/breaking-changes.md` — per-version breaking-change registry

In-package docs (prefer these after install):

- `node_modules/@reopt-ai/opt-datagrid/dist/docs/02-api/` — API reference
- `node_modules/@reopt-ai/opt-datagrid/dist/docs/04-migration/` — migration guide

## Related Skills

- `node_modules/@reopt-ai/opt-datagrid/dist/docs/` — component API, recipes, migration guides
