---
name: opt-datagrid-install
description: |
  Install, upgrade, or migrate to @reopt-ai/opt-datagrid in a consumer project. Auto-branches by current install state. Migrate mode converts glide-data-grid / ag-grid / react-data-grid / MUI DataGrid. Triggers on "opt-datagrid install", "opt-datagrid init", "opt-datagrid setup", "datagrid install", "datagrid setup", "grid setup", "opt-datagrid upgrade", "datagrid upgrade", "datagrid update", "grid update", "opt-datagrid migrate", "datagrid migrate", "grid migration", "replace glide-data-grid", "replace ag-grid".
target: "@reopt-ai/opt-datagrid"
targetMinVersion: "1.3.0"
---

# opt-datagrid Install

> This is NOT the opt-datagrid you know. Read `node_modules/@reopt-ai/opt-datagrid/dist/docs/` before writing code.

## When to apply

Consumer project depends on `@reopt-ai/opt-datagrid`, or is migrating away from another grid library. Triggers: "install", "init", "setup", "upgrade", "update", "migrate", "replace glide-data-grid", "replace ag-grid".

## Invocation

```
/opt-datagrid-install                  # Auto-branch (missing → init, installed → upgrade)
/opt-datagrid-install install          # Explicit install only
/opt-datagrid-install verify           # Verify existing installation
/opt-datagrid-install --upgrade        # Explicit upgrade
/opt-datagrid-install --check          # Analyze only
/opt-datagrid-install --target=1.3.0   # Pin a specific version
/opt-datagrid-install migrate          # Convert existing grid usage
/opt-datagrid-install migrate <file>   # Convert a single file
/opt-datagrid-install migrate --dry-run
/opt-datagrid-install example <pattern>
```

## Step 1 — Pin agent rules into AGENTS.md / CLAUDE.md

Source: `node_modules/@reopt-ai/opt-datagrid/dist/agent-rules.md`. Fallback: `agent-rules.md` shipped with this skill. Wrap content between:

```
<!-- BEGIN:reopt/opt-datagrid-agent-rules -->
…content from source…
<!-- END:reopt/opt-datagrid-agent-rules -->
```

**Idempotent:** replace only between markers.

## Step 2 — Consumer-side setup (this skill owns; docs cannot)

1. **Registry auth** — `.npmrc` for GitHub Packages (PAT with `read:packages`, injected via shell / CI secret, never hardcoded).
2. **Prereqs** — Node 18+, React 19+, bun or npm.
3. **TypeScript paths** — wire `@reopt-ai/opt-datagrid` into `tsconfig.json` paths if the project uses path aliases.
4. **opt-ui theme** — opt-datagrid consumes opt-ui CSS variable tokens. If opt-ui is not installed yet, run `/opt-ui-install` first.

## Step 3 — Route to module docs

| Task signal | Read |
|---|---|
| API reference (components, props, hooks) | `dist/docs/02-api/` |
| Column patterns | `dist/docs/02-api/columns.md` |
| Migration (glide / ag-grid / react-data-grid / MUI) | `dist/docs/04-migration/` |
| Theme integration | `dist/docs/theme.md` |
| Breaking changes per version | `dist/docs/CHANGELOG.md` |
| Install / upgrade procedure | `dist/docs/install.md` |

## Pipeline (auto-branch)

| # | Step | Init | Upgrade | Migrate |
|---|---|---|---|---|
| 1 | Detect current state | ✓ | ✓ | ✓ |
| 2 | `.npmrc` + registry auth | ✓ | – | ✓ |
| 3 | Install / update package | ✓ | ✓ | ✓ |
| 4 | TypeScript paths | ✓ | – | ✓ |
| 5 | Breaking-change edits | – | ✓ | – |
| 6 | Deprecated cleanup (opt-in) | – | ✓ | – |
| 7 | Grid migration | – | – | ✓ |
| 8 | Generate example | ✓ | – | – |
| 9 | Verify + summary | ✓ | ✓ | ✓ |

## Safety

- Never upgrade without an impact scan (run `--check` first).
- **Migrate processes files one at a time** — convert one, wait for approval, then continue.
- Apply breaking-change edits in logical groups, never bulk.
- Do not finish until `tsc --noEmit` passes.
- **Never commit** — do not commit or push without an explicit request.

## Verify

1. `npx tsc --noEmit` passes.
2. Grid renders with opt-ui theme applied (no raw colors leaking).
3. (Migrate) the converted file renders the same rows + columns as the source; spot-check sorting / selection / editing.
