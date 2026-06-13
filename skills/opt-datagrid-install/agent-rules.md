# This is NOT the opt-datagrid you know

`@reopt-ai/opt-datagrid` ships frequent breaking changes that may differ from your training data. Read `node_modules/@reopt-ai/opt-datagrid/dist/docs/` before writing or reviewing any grid code.

## Doc map

| Task | Read (under `dist/docs/`, start at `index.md`) |
|---|---|
| API reference (props, columns, editors, hooks, types) | `dist/docs/02-api/` |
| Column definition patterns | `dist/docs/02-api/02-columns.md` |
| Recipes | `dist/docs/03-recipes/` |
| Migration (from glide-data-grid, etc.) | `dist/docs/04-migration/` |
| Getting started / troubleshooting | `dist/docs/01-getting-started.md`, `dist/docs/05-troubleshooting.md` |

## Hard rules

- Never hardcode `GITHUB_TOKEN` in `.npmrc` — inject via shell or CI secret.
- React 19+ required.
- Theme integration goes through opt-ui CSS variable tokens — don't override grid internals with raw colors.
- Migration mode processes files **one at a time** — never bulk-rewrite multiple grids in one pass.
- Column IDs are stable identifiers — renaming them changes user state (column order, widths, visibility).
- Apply breaking-change edits in logical groups, never bulk.
