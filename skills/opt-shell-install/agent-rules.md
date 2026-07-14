# This is NOT the opt-shell you know

`@reopt-ai/opt-shell` (formerly `@reopt-ai/opt-harness`) is the runtime product-frame layer between opt-ui and product screens. It ships frequent breaking changes that may differ from your training data, and **no** `dist/docs/` — read `node_modules/@reopt-ai/opt-shell/shell-llms.txt` and `README.md` before writing or reviewing any shell code.

## Doc map

| Task | Read |
|---|---|
| Recipe decision tree, slot rules, policy | `shell-llms.txt` |
| Component / prop API, published exports (`.`, `./core`, `./meta`) | `README.md` + installed `package.json` |
| Authoring audit / scoring | `@reopt-ai/opt-cli/audit`; `npx @reopt-ai/opt-cli harness check|test|doctor` |
| Breaking changes per version | `CHANGELOG.md` |

## Hard rules

- `@reopt-ai/opt-harness` was renamed to `@reopt-ai/opt-shell`; the `Harness*` components are now `*Workspace` / `Shell*`. Migrate the dependency before writing new code.
- `@reopt-ai/*` installs from public npm — never add a GitHub Packages scope or token. Remove only the exact legacy project-level `@reopt-ai:registry=https://npm.pkg.github.com` entry; preserve unrelated registry/auth settings and ask before changing user/global npm config.
- React 19+ required. Peers: `@reopt-ai/opt-palette` (theme) is **required**; `@reopt-ai/opt-datagrid` / `@reopt-ai/opt-editor` / `@reopt-ai/opt-calendar` (adapters) are **optional** — install only the ones you use.
- Published opt-shell 1.0.0 does **not** export `./audit`, despite stale references in its bundled README / `shell-llms.txt`. Never import `@reopt-ai/opt-shell/audit`; use `@reopt-ai/opt-cli/audit` or the `opt harness` commands.
- Every workspace recipe requires `header` and `content` slots — other slots are recipe-specific.
- Pick a recipe via the decision tree in `shell-llms.txt`; for full-viewport tools use `ShellFullscreenToolSurface`, not a workspace recipe.
- opt-shell consumes opt-ui tokens transitively — don't override chrome with raw colors.
- Apply breaking-change edits in logical groups, never bulk.
