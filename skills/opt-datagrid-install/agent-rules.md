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
| Large-grid performance / row-source design | `dist/docs/06-performance.md`, `dist/docs/07-design-columnar-source.md` |

## Hard rules

- `@reopt-ai/*` installs from public npm — never add a GitHub Packages scope or token. Remove only the exact legacy project-level `@reopt-ai:registry=https://npm.pkg.github.com` entry; preserve unrelated registry/auth settings and ask before changing user/global npm config.
- Node 20+ and React 19+ required.
- Use opt-ui CSS tokens when opt-ui is present; standalone fallbacks are supported. Don't override grid internals with raw colors.
- Import server-side streamed-invalidation helpers from `@reopt-ai/opt-datagrid/ai-stream`, the server-safe entry point, rather than crossing the client root boundary.
- The value cache is bounded in 1.5+; tune `valueCacheMaxRows` only after measuring the workload in `dist/docs/06-performance.md`.
- Migration mode processes files **one at a time** — never bulk-rewrite multiple grids in one pass.
- Column IDs are stable identifiers — renaming them changes user state (column order, widths, visibility).
- Apply breaking-change edits in logical groups, never bulk.
