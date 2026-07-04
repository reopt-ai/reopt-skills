---
name: opt-shell-install
description: |
  Install or upgrade @reopt-ai/opt-shell — the runtime product-frame layer (workspace recipes, density/contentWidth/navigation/motion policy, data-engine adapters, shared state boundaries). Formerly @reopt-ai/opt-harness. Auto-branches by current install state. Triggers on "opt-shell install", "opt-shell init", "opt-shell setup", "shell install", "app shell setup", "workspace recipe", "opt-shell upgrade", "opt-shell update", plus legacy "opt-harness install", "harness install", "harness setup".
target: "@reopt-ai/opt-shell"
targetMinVersion: "0.1.0"
---

# opt-shell Install

> This is NOT the opt-shell you know. `@reopt-ai/opt-shell` (formerly `@reopt-ai/opt-harness`) is the runtime product-frame layer between opt-ui and product screens. It ships **no** `dist/docs/` — read `node_modules/@reopt-ai/opt-shell/shell-llms.txt` (agent guide) and `README.md` before writing code.

## When to apply

Consumer project depends on `@reopt-ai/opt-shell`. Triggers: "install", "init", "setup", "upgrade", "update" — with `shell` / `opt-shell` (or the legacy `harness` / `opt-harness`). `@reopt-ai/opt-harness` was renamed to `@reopt-ai/opt-shell`; if a project still references `opt-harness`, migrate the dependency first.

## What opt-shell provides

| Area | Pattern |
|---|---|
| Workspace recipes | `DashboardWorkspace`, `ListWorkspace`, `DetailWorkspace`, `EditorWorkspace`, landing — pick via the decision tree in `shell-llms.txt` |
| Non-recipe surface | `ShellFullscreenToolSurface` (full-viewport tools — code editor, canvas) |
| Policy | density, contentWidth (`full` / `wide` / `normal` / `narrow`), navigationMode, motion |
| Adapters | data-engine wrappers supplying loading / empty / error chrome |
| State UX | shared state boundaries; every recipe requires `header` + `content` slots |
| Authoring audit | scoring / audit tooling behind the `./audit` sub-export |

## Invocation

```
/opt-shell-install              # Auto-branch (missing → init, installed → upgrade)
/opt-shell-install --upgrade    # Explicit upgrade
/opt-shell-install --check      # Analyze only
```

## Step 1 — Pin agent rules into AGENTS.md / CLAUDE.md

Source: the module's own agent-rules file once it ships one (`@reopt-ai/opt-shell` ships `shell-llms.txt`, an agent guide, but not a marker-block file as of 0.1.0). Fallback: `agent-rules.md` bundled with this skill. Wrap content between:

```
<!-- BEGIN:reopt/opt-shell-agent-rules -->
…content from source…
<!-- END:reopt/opt-shell-agent-rules -->
```

**Idempotent:** replace only between markers.

## Step 2 — Consumer-side setup (this skill owns; docs cannot)

1. **Registry auth** — `.npmrc` for GitHub Packages (PAT with `read:packages`, injected via shell / CI secret, never hardcoded).

2. **Peers** — opt-shell's `peerDependencies` (install / run their skills first if missing):
   - **Required:** `@reopt-ai/opt-palette` (theme engine), `react` / `react-dom` 19+
   - **Optional** (only if you use that adapter): `@reopt-ai/opt-datagrid` (`/opt-datagrid-install`), `@reopt-ai/opt-editor` (`/opt-editor-install`), `@reopt-ai/opt-calendar`

   opt-ui tokens come in transitively through opt-palette — run `/opt-ui-install` if the theme layer is missing.

3. **App wiring** — properties of the consumer app:
   - A workspace recipe at the screen root (`header` + `content` slots are mandatory).
   - A shell manifest / policy config (density, contentWidth, navigationMode, motion).
   - Adapters wired to your data engines wherever loading / empty / error chrome is needed.

## Step 3 — Route to module docs

opt-shell ships **no** `dist/docs/`. Route to `shell-llms.txt` (agent guide) and `README.md`.

| Task signal | Read |
|---|---|
| Recipe decision tree, slot rules, policy | `shell-llms.txt` |
| Component / prop API, exports (`.`, `./core`, `./meta`) | `README.md` |
| Authoring audit / scoring (`./audit`) | `shell-llms.txt`, `README.md` |
| Breaking changes per version | `CHANGELOG.md` |

## Pipeline (auto-branch)

| # | Step | Init | Upgrade |
|---|---|---|---|
| 1 | Detect current state (incl. legacy `opt-harness` dep) | ✓ | ✓ |
| 2 | `.npmrc` (GitHub Packages) | ✓ | – |
| 3 | Install / update package | ✓ | ✓ |
| 4 | Peer check (opt-palette required; opt-datagrid / opt-editor / opt-calendar optional) | ✓ | ✓ |
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
2. App boots into the chosen workspace recipe (`header` + `content` slots filled); policy (density / contentWidth / navigationMode) applies.
3. (If an adapter is used) the data-grid or editor adapter renders the peer's content with shell chrome (loading / empty / error states).
