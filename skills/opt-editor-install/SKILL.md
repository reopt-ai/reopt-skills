---
name: opt-editor-install
description: |
  Install, upgrade, or migrate @reopt-ai/opt-editor in a consumer project. Auto-branches by current install state. Triggers on "opt-editor install", "opt-editor init", "opt-editor setup", "editor install", "editor init", "opt-editor upgrade", "opt-editor update", "editor upgrade", "editor update", "opt-editor 2 migration", "editor schema migration", "migrate EditorSpec".
target: "@reopt-ai/opt-editor"
targetMinVersion: "2.0.0"
---

# opt-editor Install

> This is NOT the opt-editor you know. Read `node_modules/@reopt-ai/opt-editor/dist/docs/` before writing code.

## When to apply

Consumer project depends on `@reopt-ai/opt-editor`. Triggers: "install", "init", "setup", "upgrade", "update" — with or without an `opt-` / `editor` prefix.

## Invocation

```
/opt-editor-install              # Auto-branch (missing → init, installed → upgrade)
/opt-editor-install --with-ai    # Init + AI streaming integration
/opt-editor-install 2.0.0        # Upgrade to a specific version
/opt-editor-install --dry-run    # Analyze only
```

## Step 1 — Pin agent rules into AGENTS.md / CLAUDE.md

Source: the module's own agent-rules file once it ships one (`@reopt-ai/opt-editor` does not, as of 2.0.0). Fallback: `agent-rules.md` bundled with this skill. Wrap content between:

```
<!-- BEGIN:reopt/opt-editor-agent-rules -->
…content from source…
<!-- END:reopt/opt-editor-agent-rules -->
```

**Idempotent:** replace only between markers.

## Step 2 — Consumer-side setup (this skill owns; docs cannot)

1. **Public npm registry** — no token or scoped `.npmrc` entry is required. Inspect the project `.npmrc` and `npm config get @reopt-ai:registry`; if the scope still resolves to GitHub Packages, remove only the legacy project entry `@reopt-ai:registry=https://npm.pkg.github.com`. Preserve unrelated registry/auth settings, and ask before changing user/global npm config.

2. **Prereqs** — Node 20+, React 19+, bun or npm. AI integration uses optional peers `ai >= 7` and `zod >= 3`; do not install them for a non-AI editor.

3. **App wiring** — properties of the consumer app:
   - `import "@reopt-ai/opt-editor/styles.css"` at the app root.
   - Catalog file (`catalog.ts` or similar) — block-definition registry.
   - AI endpoint (when `--with-ai`): a Vercel AI SDK–compatible route.

4. **2.0 upgrade gate** — move runtime Zod schema values (`patchOpSchema`, `patchOpsArraySchema`, `createEditorOperationSchema`, catalog schema builders) from `@reopt-ai/opt-editor/server` to `/schemas`; type-only imports may stay on `/server`, and `/ai-sdk` imports are unchanged. Before loading persisted V1 JSON, migrate `props` → `attrs` and rich-text `attrs.text` → canonical `content`, with a backup and a data-level dry run. The README's `bun run migrate:v1-to-v2` is a source-repo script and is not shipped in the npm tarball; do not invoke it as a consumer command.

## Step 3 — Route to module docs

| Task signal | Read |
|---|---|
| Start here — doc index | `dist/docs/index.md` |
| Getting started / install / upgrade | `dist/docs/01-getting-started.md` |
| API (components, hooks, store, serialization, types) | `dist/docs/02-api/` |
| AI streaming integration | `dist/docs/02-api/04-ai-stream.md`, `dist/docs/03-recipes/03-ai-streaming.md` |
| 2.0 canonical V2 storage migration | `README.md` § Input Contract (the one-shot source script itself is not published) |
| High-level AI ops / agent-mode tools (EditorOperation, OperationCompiler) | `dist/docs/03-recipes/08-editor-operations.md` |
| Diff-mode suggestion review (`mode="diff"`) | `dist/docs/03-recipes/09-diff-review-integration.md` |
| Recipes (basic, custom blocks, markdown, image, …) | `dist/docs/03-recipes/` |
| Troubleshooting | `dist/docs/05-troubleshooting.md` |

## Pipeline (auto-branch)

| # | Step | Init | Upgrade |
|---|---|---|---|
| 1 | Detect current state | ✓ | ✓ |
| 2 | Public-registry preflight + legacy override cleanup | ✓ | ✓ |
| 3 | Install / update package | ✓ | ✓ |
| 4 | CSS import check | ✓ | ✓ |
| 5 | Catalog generation | ✓ | – |
| 6 | Editor component generation | ✓ | – |
| 7 | Breaking-change edits | – | ✓ |
| 8 | Deprecated fixes (opt-in) | – | ✓ |
| 9 | 2.0 import/data migration gate + summary | – | ✓ |

Detailed procedure lives in module docs — start at `dist/docs/index.md`, then `dist/docs/01-getting-started.md`. Read before acting.

## Safety

- Never upgrade without an impact scan (run `--dry-run` first).
- Confirm before overwriting existing files.
- Apply breaking-change edits in logical groups — never bulk-apply.
- Do not finish until `tsc --noEmit` passes.
- Always provide a rollback path.

## Verify

1. `npx tsc --noEmit` passes, including server imports of runtime schemas from `/schemas`.
2. Editor mounts and `StaticRenderer` renders a stored canonical V2 `EditorSpec` (rich text in `content`) without console warnings.
3. An AI-enabled setup completes one streamed patch through the AI SDK v7 route.
