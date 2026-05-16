---
name: opt-harness-install
description: |
  Install or upgrade @reopt-ai/opt-harness in a consumer project. Sets up HarnessAppShell, responsive Nav, first Workspace page. Auto-branches by current install state. Triggers on "opt-harness install", "opt-harness init", "opt-harness setup", "harness install", "install harness", "set up harness", "opt-harness upgrade", "opt-harness update", "harness update".
target: "@reopt-ai/opt-harness"
targetMinVersion: "0.1.0"
---

# opt-harness Install

> This is NOT the opt-harness you know. Read `node_modules/@reopt-ai/opt-harness/dist/docs/` before writing code.

## When to apply

Consumer project depends on `@reopt-ai/opt-harness`. Triggers: "install", "init", "setup", "upgrade", "update" — with `harness` / `opt-harness`.

## What opt-harness provides

| Area | Pattern |
|---|---|
| App shell | HarnessAppShell + HarnessCollapsibleNav (responsive 3-state) |
| Workspaces | 5 recipes — Dashboard, List, Detail, Editor, Landing |
| Adapters | HarnessDataGridAdapter, HarnessEditorAdapter (chrome + state boundary) |
| State UX | HarnessStateBoundary (loading/empty/error), HarnessSection |
| Layout | HarnessResizableLayout, HarnessBottomBar, HarnessFlyoutAside, HeaderStack |
| Policy | density, contentWidth, navigationMode, motionPolicy, theme generation |
| Hooks | useHarnessPageContext (facade), useHarnessNav, useHarnessDensity, … |

## Invocation

```
/opt-harness-install              # Auto-branch (missing → init, installed → upgrade)
/opt-harness-install --upgrade    # Explicit upgrade
/opt-harness-install --check      # Analyze only
```

## Step 1 — Pin agent rules into AGENTS.md / CLAUDE.md

Source: `node_modules/@reopt-ai/opt-harness/dist/agent-rules.md`. Fallback: `agent-rules.md` shipped with this skill. Wrap content between:

```
<!-- BEGIN:reopt/opt-harness-agent-rules -->
…content from source…
<!-- END:reopt/opt-harness-agent-rules -->
```

**Idempotent:** replace only between markers.

## Step 2 — Consumer-side setup (this skill owns; docs cannot)

1. **Registry auth** — `.npmrc` for GitHub Packages (PAT with `read:packages`, injected via shell / CI secret, never hardcoded).

2. **Required peers** — must already be installed (run their skills first if missing):
   - `@reopt-ai/opt-ui` — theme tokens (`/opt-ui-install`)
   - `@reopt-ai/opt-palette` — theme generation engine
   - `@reopt-ai/opt-datagrid` (optional) — for HarnessDataGridAdapter (`/opt-datagrid-install`)
   - `@reopt-ai/opt-editor` (optional) — for HarnessEditorAdapter (`/opt-editor-install`)

3. **App wiring** — properties of the consumer app:
   - `<HarnessAppShell>` at the app root.
   - Harness manifest file (registry of workspaces, nav items, theme policy).
   - First Workspace page (pick one of the 5 recipes).

## Step 3 — Route to module docs

| Task signal | Read |
|---|---|
| HarnessAppShell, CollapsibleNav | `dist/docs/app-shell/` |
| Workspace recipes (Dashboard / List / Detail / Editor / Landing) | `dist/docs/recipes/` |
| Adapters (DataGrid, Editor) | `dist/docs/adapters.md` |
| State UX (StateBoundary, Section) | `dist/docs/state-ux.md` |
| Layout primitives | `dist/docs/layout.md` |
| Policy (density, contentWidth, motion, theme) | `dist/docs/policy.md` |
| Hooks reference | `dist/docs/hooks.md` |
| Breaking changes per version | `dist/docs/CHANGELOG.md` |

## Pipeline (auto-branch)

| # | Step | Init | Upgrade |
|---|---|---|---|
| 1 | Detect current state | ✓ | ✓ |
| 2 | `.npmrc` (GitHub Packages) | ✓ | – |
| 3 | Install / update package | ✓ | ✓ |
| 4 | opt-ui theme verification | ✓ | ✓ |
| 5 | Harness manifest generation | ✓ | – |
| 6 | AppShell + Nav setup | ✓ | – |
| 7 | First Workspace page | ✓ | – |
| 8 | Breaking-change edits | – | ✓ |
| 9 | Verify + summary | ✓ | ✓ |

## Safety

- Never upgrade without an impact scan.
- Confirm before overwriting existing files.
- Apply breaking-change edits in logical groups, never bulk.
- Do not finish until `tsc --noEmit` passes.
- **Never commit** — do not commit or push without an explicit request.

## Verify

1. `npx tsc --noEmit` passes.
2. App boots into HarnessAppShell, the chosen Workspace recipe renders, nav state cycles through expanded/collapsed/hidden.
3. (If adapter used) HarnessDataGridAdapter or HarnessEditorAdapter renders the peer's content with Harness chrome.
