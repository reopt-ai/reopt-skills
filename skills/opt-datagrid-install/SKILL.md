---
name: opt-datagrid-install
description: |
  Install, upgrade, tune, or migrate to @reopt-ai/opt-datagrid in a consumer project. Auto-branches by current install state. Migrate mode converts glide-data-grid / ag-grid / react-data-grid / MUI DataGrid. Triggers on "opt-datagrid install", "opt-datagrid init", "opt-datagrid setup", "datagrid install", "datagrid setup", "grid setup", "opt-datagrid upgrade", "datagrid upgrade", "datagrid update", "grid update", "opt-datagrid migrate", "datagrid migrate", "grid migration", "replace glide-data-grid", "replace ag-grid", "datagrid performance", "valueCacheMaxRows", "datagrid ai-stream".
target: "@reopt-ai/opt-datagrid"
targetMinVersion: "1.6.1"
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

Source: the module's own agent-rules file once it ships one (`@reopt-ai/opt-datagrid` does not, as of 1.6.1). Fallback: `agent-rules.md` bundled with this skill. Wrap content between:

```
<!-- BEGIN:reopt/opt-datagrid-agent-rules -->
…content from source…
<!-- END:reopt/opt-datagrid-agent-rules -->
```

**Idempotent:** replace only between markers.

## Step 2 — Consumer-side setup (this skill owns; docs cannot)

1. **Public npm registry** — no token or scoped `.npmrc` entry is required. Inspect the project `.npmrc` and `npm config get @reopt-ai:registry`; if the scope still resolves to GitHub Packages, remove only the legacy project entry `@reopt-ai:registry=https://npm.pkg.github.com`. Preserve unrelated registry/auth settings, and ask before changing user/global npm config.
2. **Prereqs** — Node 20+, React 19+, bun or npm.
3. **Import path** — use the published package entry points; an npm install needs no `tsconfig.json` path alias. Remove aliases into monorepo `packages/opt-datagrid/src` paths.
4. **Theme** — opt-datagrid reads opt-ui CSS tokens when present and has standalone fallbacks. Run `/opt-ui-install` only when the project wants the shared design-system theme; do not make opt-ui a requirement for a standalone grid.
5. **Chrome (1.6+)** — column visibility, row density, and fullscreen ship as `DataGridToolbar` / `useDataGridToolbar` from the dedicated `@reopt-ai/opt-datagrid/toolbar` entry point (controlled or uncontrolled, with locked identity columns). Wire it instead of hand-building toolbar state; column hooks cover resize / reorder / visibility chrome.
6. **Sizing** — `height` defaults to `420` and the grid does **not** fill its container when it is omitted; pass an explicit height or a measured container size. Row backgrounds from `getRowThemeOverride` are plain CSS applied through the `--opt-surface` custom property, not `DataGridTheme` keys (docs corrected in 1.6.1 — older getting-started text said the opposite).

## Step 3 — Route to module docs

| Task signal | Read |
|---|---|
| Start here — doc index | `dist/docs/index.md` |
| Getting started / install / upgrade | `dist/docs/01-getting-started.md` |
| API reference (props, columns, editors, hooks, types; every `DataGridProps` field described since 1.6.1) | `dist/docs/02-api/` |
| Toolbar chrome (`@reopt-ai/opt-datagrid/toolbar`) | `dist/docs/index.md` → "Chrome" + `dist/docs/02-api/04-hooks.md` |
| Column patterns | `dist/docs/02-api/02-columns.md` |
| Recipes (basic / editable / remote-data) | `dist/docs/03-recipes/` |
| Migration (from glide-data-grid, etc.) | `dist/docs/04-migration/` |
| Troubleshooting | `dist/docs/05-troubleshooting.md` |
| Large-grid performance / bounded value cache (`valueCacheMaxRows`) | `dist/docs/06-performance.md` |
| Future row-source / columnar-source design boundary | `dist/docs/07-design-columnar-source.md` |
| Theme integration (opt-ui tokens) | opt-ui `dist/docs/04-theming.md` |

## Pipeline (auto-branch)

| # | Step | Init | Upgrade | Migrate |
|---|---|---|---|---|
| 1 | Detect current state | ✓ | ✓ | ✓ |
| 2 | Public-registry preflight + legacy override cleanup | ✓ | ✓ | ✓ |
| 3 | Install / update package | ✓ | ✓ | ✓ |
| 4 | Import-path scan | ✓ | – | ✓ |
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
2. Grid renders with either opt-ui tokens or the supported standalone fallbacks (no raw-color overrides of grid internals).
3. (Migrate) the converted file renders the same rows + columns as the source; spot-check sorting / selection / editing.
