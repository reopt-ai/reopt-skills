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
- Never hardcode `GITHUB_TOKEN` in `.npmrc` — inject via shell or CI secret.
- React 19+ required. React 18 will surface peer-dep warnings and may break Surface CLI.
- Run `npx @reopt-ai/opt-cli doctor` to gate any upgrade (unified design CLI; there is no `opt-ui-cli`).
- Apply breaking-change edits in logical groups (per category), never bulk.
