---
name: opt-editor-install
description: |
  Install or upgrade @reopt-ai/opt-editor in a consumer project. Auto-branches by current install state. Triggers on "opt-editor install", "opt-editor init", "opt-editor setup", "editor install", "editor init", "opt-editor upgrade", "opt-editor update", "editor upgrade", "editor update".
target: "@reopt-ai/opt-editor"
targetMinVersion: "1.0.0"
---

# opt-editor Install

> This is NOT the opt-editor you know. Read `node_modules/@reopt-ai/opt-editor/dist/docs/` before writing code.

## When to apply

Consumer project depends on `@reopt-ai/opt-editor`. Triggers: "install", "init", "setup", "upgrade", "update" — with or without an `opt-` / `editor` prefix.

## Invocation

```
/opt-editor-install              # Auto-branch (missing → init, installed → upgrade)
/opt-editor-install --with-ai    # Init + AI streaming integration
/opt-editor-install 1.0.0        # Upgrade to a specific version
/opt-editor-install --dry-run    # Analyze only
```

## Step 1 — Pin agent rules into AGENTS.md / CLAUDE.md

Source: `node_modules/@reopt-ai/opt-editor/dist/agent-rules.md`. Fallback: `agent-rules.md` shipped with this skill. Wrap content between:

```
<!-- BEGIN:reopt/opt-editor-agent-rules -->
…content from source…
<!-- END:reopt/opt-editor-agent-rules -->
```

**Idempotent:** replace only between markers.

## Step 2 — Consumer-side setup (this skill owns; docs cannot)

1. **Registry auth** — project-root `.npmrc`:
   ```
   @reopt-ai:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```
   PAT with `read:packages`. Inject via shell / CI secret. **Never hardcode.**

2. **Prereqs** — Node 18+, React 19+, bun or npm.

3. **App wiring** — properties of the consumer app:
   - Editor CSS import at the app root.
   - Catalog file (`catalog.ts` or similar) — block-definition registry.
   - AI endpoint (when `--with-ai`): a Vercel AI SDK–compatible route.

4. **Doctor** — `npx @reopt-ai/opt-editor-cli doctor` runs the 18-check audit.

## Step 3 — Route to module docs

| Task signal | Read |
|---|---|
| Editor component, StaticRenderer, EditorSpec | `dist/docs/editor/` |
| Catalog block definitions | `dist/docs/catalog/` |
| AI streaming integration | `dist/docs/ai.md` |
| Breaking changes per version | `dist/docs/CHANGELOG.md` |
| Doctor check definitions (1–18) | `dist/docs/doctor.md` |
| Install / upgrade procedure | `dist/docs/install.md` |

## Pipeline (auto-branch)

| # | Step | Init | Upgrade |
|---|---|---|---|
| 1 | Detect current state | ✓ | ✓ |
| 2 | `.npmrc` (GitHub Packages) | ✓ | – |
| 3 | Install / update package | ✓ | ✓ |
| 4 | CSS import check | ✓ | ✓ |
| 5 | Catalog generation | ✓ | – |
| 6 | Editor component generation | ✓ | – |
| 7 | Breaking-change edits | – | ✓ |
| 8 | Deprecated fixes (opt-in) | – | ✓ |
| 9 | Doctor (18 checks) + summary | ✓ | ✓ |

Detailed procedure lives in `dist/docs/install.md`. Read before acting.

## Safety

- Never upgrade without an impact scan (run `--dry-run` first).
- Confirm before overwriting existing files.
- Apply breaking-change edits in logical groups — never bulk-apply.
- Do not finish until `tsc --noEmit` passes.
- Always provide a rollback path.

## Verify

1. `npx @reopt-ai/opt-editor-cli doctor` → 18/18 pass.
2. `npx tsc --noEmit` passes.
3. Editor mounts and `StaticRenderer` renders stored `contentRich` without console warnings.
