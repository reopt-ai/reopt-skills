---
name: opt-shell-install
description: |
  Install or upgrade @reopt-ai/opt-shell — the runtime product-frame layer for workspace recipes, document policy, persisted preferences, shortcuts, adapters, and state boundaries. Formerly @reopt-ai/opt-harness. Auto-branches by current install state. Triggers on "opt-shell install", "opt-shell init", "opt-shell setup", "shell install", "app shell setup", "workspace recipe", "opt-shell upgrade", "opt-shell update", "shell preferences", "shortcut registry", "document policy", plus legacy "opt-harness install", "harness install", "harness setup".
target: "@reopt-ai/opt-shell"
targetMinVersion: "2.0.0"
---

# opt-shell Install

> This is NOT the opt-shell you know. `@reopt-ai/opt-shell` (formerly `@reopt-ai/opt-harness`) is the runtime product-frame layer between opt-ui and product screens. It ships **no** `dist/docs/` — read `node_modules/@reopt-ai/opt-shell/shell-llms.txt` (agent guide) and `README.md` before writing code.

## What opt-shell provides

| Area | Pattern |
|---|---|
| Workspace recipes | `DashboardWorkspace`, `ListWorkspace`, `DetailWorkspace`, `EditorWorkspace`, landing — pick via the decision tree in `shell-llms.txt` |
| Non-recipe surface | `ShellFullscreenToolSurface` (full-viewport tools — code editor, canvas) |
| Policy | density, contentWidth, navigationMode, motionPolicy, textScale, sidebarMode, shortcutHints |
| Adapters | data-engine wrappers supplying loading / empty / error chrome — from 2.0 each on its own entry (`/datagrid`, `/editor`, `/calendar`) |
| State UX | shared state boundaries; every recipe requires `content`, and all but `landing` require `header` (`header={null}` there) |
| Authoring audit | `@reopt-ai/opt-cli/audit` + `opt harness` commands; opt-shell (1.1.0, 2.0.0) exports neither `./audit` nor `./dev` |

## Invocation

```
/opt-shell-install              # Auto-branch (missing → init, installed → upgrade)
/opt-shell-install --upgrade    # Explicit upgrade
/opt-shell-install --check      # Analyze only
```

## Step 1 — Pin agent rules into AGENTS.md / CLAUDE.md

Source: the module's own agent-rules file once it ships one (`@reopt-ai/opt-shell` ships `shell-llms.txt`, an agent guide, but not a marker-block file as of 2.0.0). Fallback: `agent-rules.md` bundled with this skill. Wrap content between:

```
<!-- BEGIN:reopt/opt-shell-agent-rules -->
…content from source…
<!-- END:reopt/opt-shell-agent-rules -->
```

**Idempotent:** replace only between markers.

## Step 2 — Consumer-side setup (this skill owns; docs cannot)

1. **Public npm registry** — no token or scoped `.npmrc` entry is required. Inspect the project `.npmrc` and `npm config get @reopt-ai:registry`; if the scope still resolves to GitHub Packages, remove only the legacy project entry `@reopt-ai:registry=https://npm.pkg.github.com`. Preserve unrelated registry/auth settings, and ask before changing user/global npm config.

2. **Runtime / peers** — Node 20+ is required. For opt-shell's `peerDependencies`, install / run their skills first if missing:
   - **Required:** `@reopt-ai/opt-palette` (theme engine), `react` / `react-dom` 19+
   - **Required:** `@reopt-ai/opt-palette` **`^1.2.0`** in 2.0 (1.1.0: `^1.0.0` — npm `ERESOLVE` on 1.0.x).
   - **Optional, each needed only by its entry (2.0):** `@reopt-ai/opt-datagrid ^1.7.0` → `@reopt-ai/opt-shell/datagrid` (`ShellDataGridAdapter`); `@reopt-ai/opt-editor ^2.1.0` → `/editor` (`ShellEditorAdapter`, `useShellEditorAI` — uses opt-editor 2.1's root `useEditorAI`, so no `ai` / `zod`); `@reopt-ai/opt-calendar ^1.0.0` → `/calendar` (`ShellCalendarAdapter`, undocumented in README / `shell-llms.txt`). The root and `./core` reach none of them, nor `zod` or `next`. npm rejects an installed peer outside its range, so bump datagrid / editor with opt-shell. **On 1.1.x** the adapters are root exports and the root statically needs all three peers plus `zod` and `next`.
   - **1.x → 2.0 upgrade:** move every adapter import from the root to its entry (a root import fails with TS2305). The only migration note is the adapter-subpath bullet in `CHANGELOG.md` § `[2.0.0]`; the rest of that section is stale pre-0.2 text (it advertises a `./dev` entry that does not exist).

   `@reopt-ai/opt-ui` is a direct dependency of opt-shell — **`^3.0.0` in 2.0** (1.1.0: `^1.6.0`). An app whose own opt-ui is 1.x / 2.x ends up with a second, nested copy, so upgrade opt-ui to 3.x first (`/opt-ui-install`) rather than adding a source alias.

3. **App wiring** — properties of the consumer app:
   - A workspace recipe at the screen root (`content` is mandatory; `header` too, except `landing`, which takes `header={null}`).
   - A shell manifest / policy config (density, contentWidth, navigationMode, motionPolicy, textScale, sidebarMode, shortcutHints).
   - `@reopt-ai/opt-ui/app.css` in global CSS when 1.1 document policies (motion, text scale, shortcut hints) should take effect.
   - Adapters wired to your data engines wherever loading / empty / error chrome is needed.
   - Prefer `useShellPreferences()` for localStorage/cross-tab policy persistence and the Shell shortcut registry for global shortcuts; do not duplicate either layer in app code.

## Step 3 — Route to module docs

opt-shell ships **no** `dist/docs/`. Route to `shell-llms.txt` (agent guide) and `README.md`.

| Task signal | Read |
|---|---|
| Recipe decision tree, slot rules, policy | `shell-llms.txt` |
| Component / prop API, exports (`.`, `./core`, `./meta`, `./datagrid`, `./editor`, `./calendar`) | `README.md` §§ "Module map", "Which component do I need?", "Hooks" — its "Entry points" list still shows three entries; trust the installed `package.json` |
| Slot rules, z-index, theme wiring | `README.md` §§ "Slot contract", "z-index scale", "Theme configuration" |
| Import-path and surface changes for code-suggesting agents | `shell-llms.txt` § "0.2.0 — Import-path & surface changes" (the README's "AI Agent Protocol" / "ESLint Plugin" sections are gone in 2.0; its "Oxlint Plugin" names an unpublished package) |
| Authoring audit / scoring | `@reopt-ai/opt-cli/audit`; `npx @reopt-ai/opt-cli harness check|test|doctor` (opt-cli 1.4.0 needs Node ≥ 22.12 and still peers `opt-shell ^1.0.0`, so a local devDependency beside opt-shell 2.0 fails with `ERESOLVE` — run it through `npx` instead) |
| Breaking changes per version | `CHANGELOG.md` |

## Pipeline (auto-branch)

| # | Step | Init | Upgrade |
|---|---|---|---|
| 1 | Detect current state (incl. legacy `opt-harness` dep) | ✓ | ✓ |
| 2 | Public-registry preflight + legacy override cleanup | ✓ | ✓ |
| 3 | Install / update package | ✓ | ✓ |
| 4 | Dependency/peer check (opt-ui `^3` direct; opt-palette `^1.2` required; adapter peers only for the matching entry in 2.0 — all three + `zod` + `next` on 1.x) | ✓ | ✓ |
| 5 | Shell manifest / policy config | ✓ | – |
| 6 | First workspace recipe | ✓ | – |
| 7 | Breaking-change edits | – | ✓ |
| 8 | Verify + summary | ✓ | ✓ |

## Safety

- Never upgrade without an impact scan.
- Confirm before overwriting existing files.
- Apply breaking-change edits in logical groups, never bulk.
- Do not finish until `tsc --noEmit` passes.
- **Never commit** — do not commit or push without an explicit request.

## Verify

1. `npx tsc --noEmit` passes.
2. App boots into the chosen workspace recipe (`header` + `content` slots filled); policy applies, including expected `<html>` `data-density` / `data-motion` / `data-text-scale` / `data-shortcut-hints` attributes.
3. (If an adapter is used) the data-grid or editor adapter, imported from `/datagrid` / `/editor` / `/calendar`, renders the peer's content with shell chrome (loading / empty / error states).
