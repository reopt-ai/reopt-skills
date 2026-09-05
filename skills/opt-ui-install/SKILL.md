---
name: opt-ui-install
description: |
  Install or upgrade @reopt-ai/opt-ui in a consumer project, wire app.css, or add a Block/Surface page template. Auto-branches by current install state. Triggers on "opt-ui install", "opt-ui init", "opt-ui setup", "opt-ui upgrade", "opt-ui update", "opt-ui app.css", "opt-ui block", "opt-cli block add", "opt-ui surface", "add Surface".
target: "@reopt-ai/opt-ui"
targetMinVersion: "1.12.5"
---

# opt-ui Install

> This is NOT the opt-ui you know. Read `node_modules/@reopt-ai/opt-ui/dist/docs/` before writing code.

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

Source: the module's own agent-rules file once it ships one (`@reopt-ai/opt-ui` does not, as of 1.12.5). Fallback: `agent-rules.md` bundled with this skill. Wrap content between:

```
<!-- BEGIN:reopt/opt-ui-agent-rules -->
…content from source…
<!-- END:reopt/opt-ui-agent-rules -->
```

**Idempotent:** replace only between markers. Never touch outside.

## Step 2 — Consumer-side setup (this skill owns; docs cannot)

1. **Public npm registry** — no token or scoped `.npmrc` entry is required. Inspect the project `.npmrc` and `npm config get @reopt-ai:registry`; if the scope still resolves to GitHub Packages, remove only the legacy project entry `@reopt-ai:registry=https://npm.pkg.github.com`. Preserve unrelated registry/auth settings, and ask before changing user/global npm config.

2. **Prereqs** — Node 20+, React 19+, Tailwind CSS v4. bun or npm.

3. **App-shell wiring** — properties of the consumer app:
   - Tailwind CSS v4: `@import "tailwindcss";` then `@import "@reopt-ai/opt-ui/tailwind.css";` in the root stylesheet (plus the `@source` directive — see getting-started).
   - Optional app-frame base layer (1.6+): `@import "@reopt-ai/opt-ui/app.css";` for focus-visible, cursor, reduced-motion, text-scale, shortcut-hint, and skip-link behavior. It is required when opt-shell policies should affect the whole document.
   - `<OptThemeProvider>` at the app root (Next.js: `app/layout.tsx` outermost).
   - Block CLI: `npx @reopt-ai/opt-cli block add <slug>` vendors page-template Surfaces from the signed public registry. `block diff` bulk-checks drift (`--json` / `--exit-code` for CI); `block remove` safely uninstalls. `opt surface …` is a deprecated alias.
   - Component lookup: `npx @reopt-ai/opt-cli component [name]` (opt-cli 1.2+) prints bundled opt-ui / opt-charts metadata, props, and example code. opt-cli **1.3.1** regenerated that catalog for the 1.10–1.12 opt-ui additions; an older opt-cli will not list them.
   - 1.7 → 1.12.5 are **additive** releases (detail primitives such as `DescriptionList` / `Identity` / `EventTimeline` / `Flyout`, catalog-screen components such as `Callout` / `SegmentedControl` / `CatalogFrame` / `InspectorLayout` / `QueryFilterBar`, plus `FieldToken` / `Facet` / `InlineEdit` and friends). `05-migration/01-breaking-changes.md` has no entry past 1.5, so an upgrade from 1.6+ is a version bump plus a `tsc` run; do not invent breaking-change edits.

4. **CLI checks** — run `npx @reopt-ai/opt-cli block doctor` when Blocks are installed. Run `npx @reopt-ai/opt-cli harness doctor` only when the project has a harness config. There is no top-level `opt doctor`. opt-shell is an optional, lazy-loaded opt-cli peer; do not install it for block/component commands alone.

## Step 3 — Route to module docs

Real layout is a numeric-prefixed tree under `dist/docs/`; start at `index.md`.

| Task signal | Read |
|---|---|
| Start here — doc index | `dist/docs/index.md`, or `npx @reopt-ai/opt-cli guide` (lists every shipped doc with component counts; `opt guide <slug>` prints one — present in opt-cli 1.3.1) |
| Getting started / install / upgrade | `dist/docs/01-getting-started.md` |
| Component API & props (core / visuals / shells / surfaces) | `dist/docs/02-components/`; `npx @reopt-ai/opt-cli component <Name>` for one component's contract, `opt ids list|show|stats` for the `data-opt-id` registry |
| Surface components | `dist/docs/02-components/04-surfaces.md` |
| Recipes (forms, dashboards, layouts) | `dist/docs/03-recipes/` |
| Theme, styling, design tokens | `dist/docs/04-theming.md` |
| Breaking changes by version | `dist/docs/05-migration/01-breaking-changes.md` |
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
