---
name: opt-harness-install
description: |
  Install @reopt-ai/opt-harness in a consumer project or upgrade it to the latest version.
  Not installed → initial setup (.npmrc, HarnessProvider, AppShell, first Workspace page).
  Installed → detect version → analyze impact → edit code → verify.
  Triggers on: "opt-harness install", "opt-harness init", "opt-harness setup",
  "harness install", "install harness", "set up harness",
  "opt-harness upgrade", "opt-harness update", "harness update".
  Current version: opt-harness 0.1.0.
---

# opt-harness-install Skill

Install or upgrade `@reopt-ai/opt-harness` in a consumer project.

> **CRITICAL — execution workflow:**
>
> This file (SKILL.md) covers invocation shape and safety rules.
> The actual step-by-step procedure lives in **`command/opt-harness-install.md`**.
>
> **Read `command/opt-harness-install.md` before starting any work.**

## What opt-harness Provides

| Area       | Pattern                                                                   |
| ---------- | ------------------------------------------------------------------------- |
| App Shell  | HarnessAppShell + HarnessCollapsibleNav (responsive 3-state nav)          |
| Workspaces | 5 recipes: Dashboard, List, Detail, Editor, Landing                       |
| Adapters   | HarnessDataGridAdapter, HarnessEditorAdapter (chrome + state boundary)    |
| State UX   | HarnessStateBoundary (loading/empty/error), HarnessSection                |
| Layout     | HarnessResizableLayout, HarnessBottomBar, HarnessFlyoutAside, HeaderStack |
| Policy     | density, contentWidth, navigationMode, motionPolicy, theme generation     |
| Hooks      | useHarnessPageContext (facade), useHarnessNav, useHarnessDensity, ...     |

## Invocation

```
/opt-harness-install                    # Auto-branch (missing → init, installed → upgrade)
/opt-harness-install --upgrade          # Explicit upgrade
/opt-harness-install --check            # Analyze only (no code changes)
```

## Auto-Branch Pipeline

| Step | Description                      | Init | Upgrade |
| ---- | -------------------------------- | ---- | ------- |
| 1    | Detect current state             | O    | O       |
| 2    | .npmrc for GitHub Packages       | O    | -       |
| 3    | Package install / update         | O    | O       |
| 4    | opt-ui theme verification        | O    | O       |
| 5    | Harness manifest generation      | O    | -       |
| 6    | AppShell + Nav setup             | O    | -       |
| 7    | First Workspace page             | O    | -       |
| 8    | Breaking-change edits            | -    | O       |
| 9    | Verify & summarize               | O    | O       |

## Prerequisites

- Node.js 18+, React 19+
- GitHub token with `read:packages` scope
- `@reopt-ai/opt-ui` installed (provides theme tokens)
- `@reopt-ai/opt-palette` installed (theme generation engine)

## Safety Rules

1. **Never update the package without user approval.**
2. Apply breaking changes in logical groups.
3. **Do not finish until type check and tests pass.**
4. **Never commit** — do not commit or push without an explicit request.
5. Confirm before overwriting existing files.

## References

- `references/breaking-changes.md` — per-version breaking-change registry
- `references/recipe-patterns.md` — per-workspace recipe patterns and selection guide

## Related Skills

- `/opt-ui-install` — opt-ui theme + Tailwind setup (opt-harness depends on its CSS variables)
- `/opt-datagrid-install` — install opt-datagrid (required for HarnessDataGridAdapter)
- `/opt-editor-install` — install opt-editor (required for HarnessEditorAdapter)
