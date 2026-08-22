# This is NOT the opt-ui you know

`@reopt-ai/opt-ui` ships frequent breaking changes that may differ from your training data. Read `node_modules/@reopt-ai/opt-ui/dist/docs/` before writing or reviewing any UI code.

## Doc map

| Task | Read (under `dist/docs/`, start at `index.md`) |
|---|---|
| Doc index | `dist/docs/index.md` |
| Component API & props (core / visuals / shells / surfaces) | `dist/docs/02-components/` |
| Recipes (forms, dashboards, layouts) | `dist/docs/03-recipes/` |
| Theme, styling, design tokens | `dist/docs/04-theming.md` |
| Breaking changes, FormStore migration | `dist/docs/05-migration/` |

## Hard rules

- Never import from `packages/opt-ui/src/...` in consumer code — monorepo-internal paths.
- `<OptThemeProvider>` must wrap the app root, not individual routes.
- Tailwind CSS v4 only (`@import "@reopt-ai/opt-ui/tailwind.css"`, after `@import "tailwindcss"`); v3 stylesheets are not supported.
- Import `@reopt-ai/opt-ui/app.css` when app-frame behavior or opt-shell document policies (motion, text scale, shortcut hints) are used.
- `@reopt-ai/*` installs from public npm — never add a GitHub Packages scope or token. Remove only the exact legacy project-level `@reopt-ai:registry=https://npm.pkg.github.com` entry; preserve unrelated registry/auth settings and ask before changing user/global npm config.
- Node 20+ and React 19+ required. Older runtimes are outside the published package contract.
- Use `npx @reopt-ai/opt-cli block …` for page templates (`surface` is deprecated). Run `block doctor` for installed Blocks and `harness doctor` only for configured harness projects; there is no top-level `opt doctor`.
- Apply breaking-change edits in logical groups (per category), never bulk.
