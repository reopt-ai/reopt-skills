# This is NOT the opt-shell you know

`@reopt-ai/opt-shell` (formerly `@reopt-ai/opt-harness`) is the runtime product-frame layer between opt-ui and product screens. It ships frequent breaking changes that may differ from your training data, and **no** `dist/docs/` — read `node_modules/@reopt-ai/opt-shell/shell-llms.txt` and `README.md` before writing or reviewing any shell code.

## Doc map

| Task | Read |
|---|---|
| Recipe decision tree, slot rules, policy | `shell-llms.txt` |
| Component / prop API, published exports (`.`, `./core`, `./meta`, `./datagrid`, `./editor`, `./calendar`) | `README.md` + installed `package.json` |
| Authoring audit / scoring | `@reopt-ai/opt-cli/audit`; `npx @reopt-ai/opt-cli harness check|test|doctor` |
| Breaking changes per version | `CHANGELOG.md` |

## Hard rules

- `@reopt-ai/opt-harness` was renamed to `@reopt-ai/opt-shell`; the `Harness*` components are now `*Workspace` / `Shell*`. Migrate the dependency before writing new code.
- `@reopt-ai/*` installs from public npm — never add a GitHub Packages scope or token. Remove only the exact legacy project-level `@reopt-ai:registry=https://npm.pkg.github.com` entry; preserve unrelated registry/auth settings and ask before changing user/global npm config.
- Node 20+ and React 19+ required. `@reopt-ai/opt-ui` (`^3.0.0` in opt-shell 2.0) is a direct dependency; `@reopt-ai/opt-palette` (`^1.2.0`) is a **required peer**. From 2.0 import adapters only from their entries — `@reopt-ai/opt-shell/datagrid` (needs opt-datagrid `^1.7.0`), `/editor` (opt-editor `^2.1.0`), `/calendar` (opt-calendar) — the root no longer exports them (TS2305) and needs no adapter peer, `zod` or `next`. On 1.1.x the adapters are root exports and the root needs all three peers plus `zod` and `next`.
- opt-shell (1.1.0, 2.0.0) exports neither `./audit` nor `./dev`, despite stale references in its README / `CHANGELOG.md`. Never import `@reopt-ai/opt-shell/audit` or `/dev`; use `@reopt-ai/opt-cli/audit` or the `opt harness` commands (through `npx` — opt-cli 1.4.0 still peers `opt-shell ^1.0.0`).
- Every workspace recipe requires `content`; all but `landing` also require `header` (`LandingWorkspace` still types `header` as required — pass `header={null}`). Other slots are recipe-specific.
- Pick a recipe via the decision tree in `shell-llms.txt`; for full-viewport tools use `ShellFullscreenToolSurface`, not a workspace recipe.
- `ShellProvider` 1.1 applies density/motion/text-scale/shortcut-hint policy on `<html>` by default; import opt-ui `app.css` so document policies have CSS effects. The motion default is `system`, not `reduced`.
- Use `useShellPreferences()` for persisted/cross-tab policy overrides and the Shell shortcut registry for global shortcuts; don't rebuild those layers per app.
- opt-shell consumes opt-ui tokens directly — don't override chrome with raw colors.
- Apply breaking-change edits in logical groups, never bulk.
