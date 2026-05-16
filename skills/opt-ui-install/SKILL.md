---
name: opt-ui-install
description: |
  Install or upgrade @reopt-ai/opt-ui in a consumer project, or add a Surface page template. Auto-branches by current install state. Triggers on "opt-ui install", "opt-ui init", "opt-ui setup", "opt-ui upgrade", "opt-ui update", "opt-ui surface", "opt-ui-cli add", "add Surface".
target: "@reopt-ai/opt-ui"
targetMinVersion: "1.2.1"
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

Source: `node_modules/@reopt-ai/opt-ui/dist/agent-rules.md`. Fallback: `agent-rules.md` shipped with this skill. Wrap content between:

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
   - Surface CLI: `npx @reopt-ai/opt-ui-cli add <template>` for page templates.

4. **Doctor** — `npx @reopt-ai/opt-ui-cli doctor` runs the 26-check environment audit.

## Step 3 — Route to module docs

| Task signal | Read |
|---|---|
| Component API, props, recipes | `dist/docs/components/` |
| Surface templates | `dist/docs/surface/` |
| Breaking changes by version | `dist/docs/CHANGELOG.md` |
| FormStore migration | `dist/docs/migrations/formstore.md` |
| Theme, styling, design tokens | `dist/docs/theme/` |
| Doctor check definitions (1–26) | `dist/docs/doctor.md` |
| Install / upgrade procedure | `dist/docs/install.md` |

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

Detailed step procedures live in module docs (`dist/docs/install.md` / `dist/docs/surface.md`). Read before acting.

## Safety

- Never upgrade without an impact scan (run `--check` first).
- Confirm before overwriting existing files.
- Apply breaking-change edits in logical groups — never bulk-apply across categories.
- Do not finish until `tsc --noEmit` passes.
- Always provide a rollback path (previous version pin + git revert range).

## Verify

1. `npx @reopt-ai/opt-ui-cli doctor` → 26/26 pass (or explained skips).
2. `npx tsc --noEmit` passes.
3. App renders without OptThemeProvider warnings.
