---
name: opt-editor-install
description: |
  Install or upgrade @reopt-ai/opt-editor in a consumer project. Auto-branches by current install state. Triggers on "opt-editor install", "opt-editor init", "opt-editor setup", "editor install", "editor init", "opt-editor upgrade", "opt-editor update", "editor upgrade", "editor update".
target: "@reopt-ai/opt-editor"
targetMinVersion: "1.0.4"
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

Source: the module's own agent-rules file once it ships one (`@reopt-ai/opt-editor` does not, as of 1.0.4). Fallback: `agent-rules.md` bundled with this skill. Wrap content between:

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

4. **Doctor** — `npx @reopt-ai/opt-cli doctor` runs the audit (unified design CLI; there is no `opt-editor-cli`).

## Step 3 — Route to module docs

| Task signal | Read |
|---|---|
| Start here — doc index | `dist/docs/index.md` |
| Getting started / install / upgrade | `dist/docs/01-getting-started.md` |
| API (components, hooks, store, serialization, types) | `dist/docs/02-api/` |
| AI streaming integration | `dist/docs/02-api/04-ai-stream.md`, `dist/docs/03-recipes/03-ai-streaming.md` |
| High-level AI ops / agent-mode tools (EditorOperation, OperationCompiler) | `dist/docs/03-recipes/08-editor-operations.md` |
| Diff-mode suggestion review (`mode="diff"`) | `dist/docs/03-recipes/09-diff-review-integration.md` |
| Recipes (basic, custom blocks, markdown, image, …) | `dist/docs/03-recipes/` |
| Troubleshooting | `dist/docs/05-troubleshooting.md` |

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
| 9 | Doctor (environment audit) + summary | ✓ | ✓ |

Detailed procedure lives in module docs — start at `dist/docs/index.md`, then `dist/docs/01-getting-started.md`. Read before acting.

## Safety

- Never upgrade without an impact scan (run `--dry-run` first).
- Confirm before overwriting existing files.
- Apply breaking-change edits in logical groups — never bulk-apply.
- Do not finish until `tsc --noEmit` passes.
- Always provide a rollback path.

## Verify

1. `npx @reopt-ai/opt-cli doctor` passes.
2. `npx tsc --noEmit` passes.
3. Editor mounts and `StaticRenderer` renders a stored `EditorSpec` (its `content`) without console warnings.
