---
name: opt-ui-install
description: |
  Install or upgrade @reopt-ai/opt-ui in a consumer project, or add a Surface page template. Auto-branches by current install state. Triggers on "opt-ui install", "opt-ui init", "opt-ui setup", "opt-ui upgrade", "opt-ui update", "opt-ui surface", "opt-cli surface add", "add Surface".
target: "@reopt-ai/opt-ui"
targetMinVersion: "1.4.0"
---

# opt-ui Install

> This is NOT the opt-ui you know. Read `node_modules/@reopt-ai/opt-ui/dist/docs/` before writing code.

## When to apply

Consumer project depends on `@reopt-ai/opt-ui`. Triggers: "install", "init", "setup", "upgrade", "update", "surface", "add Surface". Never use `packages/opt-ui/src/...` paths in consumer code — monorepo-internal.

## Invocation

```
/opt-ui-install                  # Auto-branch (missing → init, installed → upgrade)
/opt-ui-install surface <name>   # Add a Surface page template
/opt-ui-install --upgrade        # Explicit upgrade
/opt-ui-install --check          # Analyze only (no edits)
/opt-ui-install --target=1.2.0   # Pin a specific version
/opt-ui-install --dry-run        # Analyze only
```

## Step 1 — Pin agent rules into AGENTS.md / CLAUDE.md

Source: the module's own agent-rules file once it ships one (`@reopt-ai/opt-ui` does not, as of 1.4.0). Fallback: `agent-rules.md` bundled with this skill. Wrap content between:

```
<!-- BEGIN:reopt/opt-ui-agent-rules -->
…content from source…
<!-- END:reopt/opt-ui-agent-rules -->
```

**Idempotent:** replace only between markers. Never touch outside.

## Step 2 — Consumer-side setup (this skill owns; docs cannot)

1. **Registry auth** — project-root `.npmrc`:
   ```
   @reopt-ai:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```
   PAT with `read:packages`. Inject via shell / CI secret. **Never hardcode.**

2. **Prereqs** — Node 18+, React 19+, Tailwind CSS v4. bun or npm.

3. **App-shell wiring** — properties of the consumer app:
   - Tailwind CSS v4 `@import "@reopt-ai/opt-ui/styles"` at the root stylesheet.
   - `<OptThemeProvider>` at the app root (Next.js: `app/layout.tsx` outermost).
   - Surface CLI: `npx @reopt-ai/opt-cli surface add <slug>` for page templates (Surfaces live in the internal `opt-ui-surface` package — not installed directly).

4. **Doctor** — `npx @reopt-ai/opt-cli doctor` runs the environment audit (unified design CLI; there is no `opt-ui-cli`).

## Step 3 — Route to module docs

Real layout is a numeric-prefixed tree under `dist/docs/`; start at `index.md`.

| Task signal | Read |
|---|---|
| Start here — doc index | `dist/docs/index.md` |
| Getting started / install / upgrade | `dist/docs/01-getting-started.md` |
| Component API & props (core / visuals / shells / surfaces) | `dist/docs/02-components/` |
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
| 2 | `.npmrc` (GitHub Packages) | ✓ | – | – |
| 3 | Install / update package | ✓ | ✓ | – |
| 4 | CSS import check | ✓ | ✓ | – |
| 5 | OptThemeProvider setup | ✓ | – | – |
| 6 | Breaking-change edits | – | ✓ | – |
| 7 | Deprecated fixes (opt-in) | – | ✓ | – |
| 8 | Surface CLI workflow | opt | opt | ✓ |
| 9 | Doctor (26 checks) | ✓ | ✓ | ✓ |
| 10 | Summary + rollback path | ✓ | ✓ | ✓ |

Detailed step procedures live in module docs — start at `dist/docs/index.md`, then `dist/docs/01-getting-started.md`. Read before acting.

## Safety

- Never upgrade without an impact scan (run `--check` first).
- Confirm before overwriting existing files.
- Apply breaking-change edits in logical groups — never bulk-apply across categories.
- Do not finish until `tsc --noEmit` passes.
- Always provide a rollback path (previous version pin + git revert range).

## Verify

1. `npx @reopt-ai/opt-cli doctor` passes (or explained skips).
2. `npx tsc --noEmit` passes.
3. App renders without OptThemeProvider warnings.
