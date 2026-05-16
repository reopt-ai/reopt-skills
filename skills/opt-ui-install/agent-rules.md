# This is NOT the opt-ui you know

`@reopt-ai/opt-ui` ships frequent breaking changes that may differ from your training data. Read `node_modules/@reopt-ai/opt-ui/dist/docs/` before writing or reviewing any UI code.

## Doc map

| Task | Read |
|---|---|
| Component API, props, recipes | `dist/docs/components/` |
| Surface templates, page recipes | `dist/docs/surface/` |
| Breaking changes per version | `dist/docs/CHANGELOG.md` |
| FormStore migration | `dist/docs/migrations/formstore.md` |
| Theme, styling, design tokens | `dist/docs/theme/` |
| Doctor check definitions (1–26) | `dist/docs/doctor.md` |

## Hard rules

- Never import from `packages/opt-ui/src/...` in consumer code — monorepo-internal paths.
- `<OptThemeProvider>` must wrap the app root, not individual routes.
- Tailwind CSS v4 only (`@import "@reopt-ai/opt-ui/styles"`); v3 stylesheets are not supported.
- Never hardcode `GITHUB_TOKEN` in `.npmrc` — inject via shell or CI secret.
- React 19+ required. React 18 will surface peer-dep warnings and may break Surface CLI.
- Run `npx @reopt-ai/opt-ui-cli doctor` to gate any upgrade — 26 checks must pass.
- Apply breaking-change edits in logical groups (per category), never bulk.
