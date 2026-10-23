---
name: opt-ui-install
description: |
  Install or upgrade @reopt-ai/opt-ui in a consumer project, wire app.css, or add a Block/Surface page template. Auto-branches by current install state. Triggers on "opt-ui install", "opt-ui init", "opt-ui setup", "opt-ui upgrade", "opt-ui update", "opt-ui app.css", "opt-ui block", "opt-cli block add", "opt-ui surface", "add Surface", "SQL query workspace", "CriteriaBuilder", "session replay player".
target: "@reopt-ai/opt-ui"
targetMinVersion: "3.0.0"
---

# opt-ui Install

> This is NOT the opt-ui you know. Read `node_modules/@reopt-ai/opt-ui/dist/docs/` before writing code. **1.16.0 is deprecated** — it was published without that directory. A 1.x project upgrades to 3.0.0 (two import moves — Step 2, item 4).

## When to apply

Consumer project depends on `@reopt-ai/opt-ui`. Triggers: "install", "init", "setup", "upgrade", "update", "surface", "add Surface". Never use `packages/opt-ui/src/...` paths in consumer code — monorepo-internal.

## Invocation

```
/opt-ui-install                  # Auto-branch (missing → init, installed → upgrade)
/opt-ui-install block <name>     # Add a page-template Block (Surface is a legacy alias)
/opt-ui-install --upgrade        # Explicit upgrade
/opt-ui-install --check          # Analyze only (no edits)
/opt-ui-install --dry-run        # Analyze only
```

## Step 1 — Pin agent rules into AGENTS.md / CLAUDE.md

Source: the module's own agent-rules file once it ships one (`@reopt-ai/opt-ui` does not, as of 3.0.0). Fallback: `agent-rules.md` bundled with this skill. Wrap content between:

```
<!-- BEGIN:reopt/opt-ui-agent-rules -->
…content from source…
<!-- END:reopt/opt-ui-agent-rules -->
```

**Idempotent:** replace only between markers. Never touch outside.

## Step 2 — Consumer-side setup (this skill owns; docs cannot)

1. **Public npm registry** — no token or scoped `.npmrc` entry is required. Inspect the project `.npmrc` and `npm config get @reopt-ai:registry`; if the scope still resolves to GitHub Packages, remove only the legacy project entry `@reopt-ai:registry=https://npm.pkg.github.com`. Preserve unrelated registry/auth settings, and ask before changing user/global npm config.

2. **Prereqs** — Node 20+ (opt-cli ≥ 1.3.4 needs Node 22.12+), React 19+, Tailwind CSS v4. bun or npm. From 3.0 optional peers sit behind their own entries: `next` (`>=16.0.0`) only for `@reopt-ai/opt-ui/next` (`SidebarNav`, `RouteFocusManager`), and the six `@codemirror/*` packages (`commands ^6.11.1` supplies undo/redo and line numbers) only for `@reopt-ai/opt-ui/sql-editor`. The root, `./core`, `./shells`, `./visuals` and `./query` resolve with neither installed, and since 2.0 the types no longer reference CodeMirror, so `skipLibCheck: false` works. On 1.x the root and `./shells` import `next/*` and `import()` CodeMirror, which webpack / Turbopack resolve at build time — upgrade rather than work around it.

3. **App-shell wiring** — properties of the consumer app:
   - Tailwind CSS v4: `@import "tailwindcss";` then `@import "@reopt-ai/opt-ui/tailwind.css";` in the root stylesheet plus `@source "../node_modules/@reopt-ai/opt-ui/dist";` (relative to the CSS file) so Tailwind scans the package.
   - Optional app-frame base layer (1.6+): `@import "@reopt-ai/opt-ui/app.css";` for focus-visible, cursor, reduced-motion, text-scale, shortcut-hint, and skip-link behavior. It is required when opt-shell policies should affect the whole document.
   - `<OptThemeProvider>` at the app root (Next.js: `app/layout.tsx` outermost).
   - Block CLI: `npx @reopt-ai/opt-cli block add <slug>` vendors page-template Blocks from the signed registry. opt-cli 1.4.0's 32 blocks target opt-ui `^3.0.0` (`block add` does not check the installed version — `sql-workspace` imports `/sql-editor` and fails `tsc` on 1.x) and use `BlockLayout`; `SurfaceLayout` remains a public alias. The remote registry (`design.reopt.ai/api/r`) answers 404 as of 2026-10-23, so every `block` command warns and uses the copy bundled with opt-cli — do not set `OPT_REGISTRY_STRICT=1` until it is back. `block diff` bulk-checks drift (`--json` / `--exit-code` for CI); `block remove` safely uninstalls. `opt surface …` is a deprecated alias.
   - Component lookup: `npx @reopt-ai/opt-cli component [name]` prints bundled opt-ui / opt-charts metadata, props, and the exact import line; `opt catalog --query <text>` searches packages, modules, components and blocks. Both read a **snapshot** bundled with opt-cli: 1.4.0 is built against opt-ui 3.0.0 + opt-charts 1.10.0 and prints 3.0 import paths (`SqlEditor` → `/sql-editor`, `SidebarNav` → `/next`). On a 1.x install use `npx @reopt-ai/opt-cli@1.3.3` until you upgrade.

4. **Upgrading 1.x → 3.0** — follow `dist/docs/05-migration/01-breaking-changes.md` §§ "opt-ui Version 2.0.0" and "opt-ui Version 3.0.0" (the file is shared — apply only the `opt-ui` sections). (1) 2.0: move `SidebarNav` / `RouteFocusManager` imports from the root or `/shells` to `@reopt-ai/opt-ui/next`. (2) 3.0: move `SqlEditor` and its `SqlEditor*` types to `@reopt-ai/opt-ui/sql-editor`. Both are import-only moves (old paths fail with TS2305); props are unchanged and everything else from 1.6 on is additive. Bump `@codemirror/commands` to `^6.11.1` if installed, move `@reopt-ai/opt-shell` to 2.0 in the same change (it depends on opt-ui `^3.0.0`; 1.x pins `^1.6.0`), and give custom themes `--opt-danger-solid-fg` (README "Button state color contract") and `--opt-chart-1…8` (`04-theming.md`). The query workspace and replay shells resolve from the root or `/shells`; `CriteriaBuilder` (+ `criteriaBuilder*`), `splitSqlStatements` and the placeholder helpers stay **root-only**. `01-getting-started.md` was not updated for 2.0 / 3.0 (no `/next` / `/sql-editor`, and it still names `opt doctor`).

5. **CLI checks** — run `npx @reopt-ai/opt-cli block doctor` when Blocks are installed. Run `npx @reopt-ai/opt-cli harness doctor` only when the project has a harness config. There is no top-level `opt doctor`. opt-shell is an optional, lazy-loaded opt-cli peer; do not install it for block/component commands alone.

## Step 3 — Route to module docs

Real layout is a numeric-prefixed tree under `dist/docs/`; start at `index.md` (the same 14 files from 1.16.1 through 3.0.0). If `dist/docs/` is absent the project is on the deprecated **1.16.0** (`opt guide` fails with "Could not find @reopt-ai/opt-ui documentation"): upgrade. Until then `npx @reopt-ai/opt-cli@1.3.3 component <Name>` and the package's `COMPONENT_CATALOG.md` cover the same components.

| Task signal | Read |
|---|---|
| Start here — doc index | `dist/docs/index.md`, or `npx @reopt-ai/opt-cli guide` (lists every shipped doc with component counts; `opt guide <slug>` prints one; needs `dist/docs/`) |
| Getting started / install / upgrade | `dist/docs/01-getting-started.md` |
| Component API & props (core / visuals / shells / surfaces) | `dist/docs/02-components/`; `npx @reopt-ai/opt-cli component <Name>` for one component's contract, `opt ids list|show|stats` for the `data-opt-id` registry |
| Surface components | `dist/docs/02-components/04-surfaces.md` |
| SQL query workspace (`QueryWorkspace`, `SchemaTree`, `QueryResultsTable`; `SqlEditor` imperative handle from `/sql-editor`, 3.0+), `CriteriaBuilder`, replay player (`ReplayScrubber` / `ReplayTransport` / `ReplayPlayerLayout`), `SidebarNav` (`/next`, 2.0+) | `dist/docs/02-components/03-shells.md`; query + replay shells from the root or `/shells`, `CriteriaBuilder` + SQL helpers from the root only |
| Recipes (forms, dashboards, layouts) | `dist/docs/03-recipes/` |
| Theme, styling, design tokens | `dist/docs/04-theming.md` |
| Breaking changes by version (incl. opt-ui 2.0.0 / 3.0.0) | `dist/docs/05-migration/01-breaking-changes.md` |
| FormStore migration | `dist/docs/05-migration/02-formstore.md` |
| Troubleshooting | `dist/docs/06-troubleshooting.md` |

## Pipeline (auto-branch)

| # | Step | Init | Upgrade | Surface |
|---|---|---|---|---|
| 1 | Detect current state | ✓ | ✓ | ✓ |
| 2 | Public-registry preflight + legacy override cleanup | ✓ | ✓ | ✓ |
| 3 | Install / update package | ✓ | ✓ | – |
| 4 | CSS import check | ✓ | ✓ | – |
| 5 | OptThemeProvider setup | ✓ | – | – |
| 6 | Breaking-change edits | – | ✓ | – |
| 7 | Deprecated fixes (opt-in) | – | ✓ | – |
| 8 | Block CLI workflow | opt | opt | ✓ |
| 9 | Relevant CLI check (`block doctor`; `harness doctor` when configured) | opt | opt | ✓ |
| 10 | Summary + rollback path | ✓ | ✓ | ✓ |

Detailed step procedures live in module docs — start at `dist/docs/index.md`, then `dist/docs/01-getting-started.md`. Read before acting.

## Safety

- Never upgrade without an impact scan (run `--check` first).
- Confirm before overwriting existing files.
- Apply breaking-change edits in logical groups — never bulk-apply across categories.
- Do not finish until `tsc --noEmit` passes.
- Always provide a rollback path (previous version pin + git revert range).

## Verify

1. `npx @reopt-ai/opt-cli block doctor` passes when Blocks are installed; configured shell projects also pass `harness doctor`.
2. `npx tsc --noEmit` passes.
3. App renders without OptThemeProvider warnings.
