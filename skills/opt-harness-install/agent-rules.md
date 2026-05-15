# This is NOT the opt-harness you know

`@reopt-ai/opt-harness` ships frequent breaking changes that may differ from your training data. Read `node_modules/@reopt-ai/opt-harness/dist/docs/` before writing or reviewing any harness code.

## Doc map

| Task | Read |
|---|---|
| HarnessAppShell + HarnessCollapsibleNav (responsive 3-state nav) | `dist/docs/app-shell/` |
| Workspace recipes (Dashboard, List, Detail, Editor, Landing) | `dist/docs/recipes/` |
| Adapters (HarnessDataGridAdapter, HarnessEditorAdapter) | `dist/docs/adapters.md` |
| State UX (HarnessStateBoundary, HarnessSection) | `dist/docs/state-ux.md` |
| Layout (HarnessResizableLayout, HarnessBottomBar, HarnessFlyoutAside, HeaderStack) | `dist/docs/layout.md` |
| Policy (density, contentWidth, navigationMode, motionPolicy, theme generation) | `dist/docs/policy.md` |
| Hooks (useHarnessPageContext, useHarnessNav, useHarnessDensity, …) | `dist/docs/hooks.md` |
| Breaking changes per version | `dist/docs/CHANGELOG.md` |

## Hard rules

- Never hardcode `GITHUB_TOKEN` in `.npmrc` — inject via shell or CI secret.
- React 19+ required.
- `@reopt-ai/opt-ui` and `@reopt-ai/opt-palette` are required peers — opt-harness will not generate themes without opt-palette.
- HarnessDataGridAdapter requires `@reopt-ai/opt-datagrid`; HarnessEditorAdapter requires `@reopt-ai/opt-editor`. Adapters degrade gracefully when the peer isn't installed (no render), but verify the dependency before claiming a feature works.
- HarnessAppShell must wrap the app root — do not place it inside individual routes.
- Workspace recipes are templates, not abstractions — copy the recipe code into your route, don't import a recipe as a component.
- Apply breaking-change edits in logical groups, never bulk.
