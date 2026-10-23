# This is NOT the opt-ui you know

`@reopt-ai/opt-ui` ships frequent breaking changes that may differ from your training data. Read `node_modules/@reopt-ai/opt-ui/dist/docs/` before writing or reviewing any UI code. It is missing only in the deprecated 1.16.0 — upgrade, and meanwhile use `npx @reopt-ai/opt-cli@1.3.3 component <Name>` and the package's `COMPONENT_CATALOG.md`. Never guess props.

## Doc map

| Task | Read (under `dist/docs/`, start at `index.md`) |
|---|---|
| Doc index | `dist/docs/index.md` |
| Component API & props (core / visuals / shells / surfaces) | `dist/docs/02-components/` |
| Recipes (forms, dashboards, layouts) | `dist/docs/03-recipes/` |
| Theme, styling, design tokens | `dist/docs/04-theming.md` |
| Breaking changes (incl. the opt-ui 2.0.0 / 3.0.0 import moves), FormStore migration | `dist/docs/05-migration/` |

## Hard rules

- Never import from `packages/opt-ui/src/...` in consumer code — monorepo-internal paths.
- `<OptThemeProvider>` must wrap the app root, not individual routes.
- Tailwind CSS v4 only (`@import "@reopt-ai/opt-ui/tailwind.css"`, after `@import "tailwindcss"`); v3 stylesheets are not supported.
- Import `@reopt-ai/opt-ui/app.css` when app-frame behavior or opt-shell document policies (motion, text scale, shortcut hints) are used.
- `@reopt-ai/*` installs from public npm — never add a GitHub Packages scope or token. Remove only the exact legacy project-level `@reopt-ai:registry=https://npm.pkg.github.com` entry; preserve unrelated registry/auth settings and ask before changing user/global npm config.
- Node 20+ and React 19+ required for opt-ui; opt-cli 1.3.4+ needs Node 22.12+. Older runtimes are outside the published package contract.
- Use `npx @reopt-ai/opt-cli block …` for page templates (`surface` is deprecated). Upgrading opt-ui to 3.0 means moving `@reopt-ai/opt-shell` to 2.0 in the same change (opt-shell 1.x depends on opt-ui `^1.6.0`, so it would pull a second copy). Run `block doctor` for installed Blocks and `harness doctor` only for configured harness projects; there is no top-level `opt doctor`.
- Import paths: `SidebarNav` / `RouteFocusManager` from `@reopt-ai/opt-ui/next` (2.0+); `SqlEditor` and its `SqlEditor*` types from `@reopt-ai/opt-ui/sql-editor` (3.0+); the SQL query workspace and replay player shells from the root or `/shells`; `CriteriaBuilder`, the `criteriaBuilder*` helpers, `splitSqlStatements` and the SQL placeholder helpers **only from the root** `@reopt-ai/opt-ui`. The old paths fail with TS2305.
- From 3.0 the root, `./core`, `./shells`, `./visuals` and `./query` import neither `next` nor CodeMirror: install `next` only for `/next` and the `@codemirror/*` peers only for `/sql-editor`. On 1.x the root and `./shells` import `next/*` and `import()` CodeMirror, which webpack / Turbopack resolve at build time — upgrade rather than work around it.
- The CodeMirror packages are **optional** peers of `/sql-editor` only; `@codemirror/commands` (`^6.11.1` from 2.0) supplies undo/redo and line numbers. Since 2.0 the types are structural, so `skipLibCheck: false` works without them.
- `opt component <Name>` and `opt block add` read a **snapshot** bundled with opt-cli, not the installed package. opt-cli 1.4.0 is built against opt-ui 3.0.0 (its blocks target `^3.0.0` without checking the installed version); on a 1.x install use `npx @reopt-ai/opt-cli@1.3.3`. The remote block registry answers 404 as of 2026-10-23 and the CLI falls back to its bundled copy.
- Apply breaking-change edits in logical groups (per category), never bulk.
