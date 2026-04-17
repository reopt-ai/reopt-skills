---
name: opt-editor-install
description: |
  Install @reopt-ai/opt-editor in a consumer project or upgrade it to the latest version.
  Not installed → initial setup (.npmrc, CSS, catalog, Editor component).
  Installed → detect version → analyze impact → edit code → verify.
version: 1.0.0
triggers:
  - "opt-editor install"
  - "opt-editor init"
  - "opt-editor setup"
  - "editor install"
  - "editor init"
  - "opt-editor upgrade"
  - "opt-editor update"
  - "editor upgrade"
  - "editor update"
---

# opt-editor-install Skill

Install or upgrade `@reopt-ai/opt-editor` in a consumer project.

> **CRITICAL — execution workflow:**
>
> This file (SKILL.md) covers invocation shape and safety rules.
> The actual step-by-step procedure lives in
> **`command/opt-editor-install.md`**.
>
> **Read `command/opt-editor-install.md` before starting any work.**

## Invocation

```
/opt-editor-install                 # Auto-branch (missing → init, installed → upgrade)
/opt-editor-install --with-ai       # Include AI streaming integration during init
/opt-editor-install 0.8.0           # Upgrade to a specific version
/opt-editor-install --dry-run       # Analyze only (no changes applied)
```

## Auto-Branch Pipeline

| Step | Description                       | Init | Upgrade |
| ---- | --------------------------------- | ---- | ------- |
| 1    | Detect current state              | O    | O       |
| 2    | .npmrc setup                      | O    | -       |
| 3    | Package install / update          | O    | O       |
| 4    | CSS import check                  | O    | O       |
| 5    | Catalog generation                | O    | -       |
| 6    | Editor component generation       | O    | -       |
| 7    | Breaking-change edits             | -    | O       |
| 8    | Deprecated fixes (optional)       | -    | O       |
| 9    | Doctor validation (18) & summary  | O    | O       |

## Prerequisites

- Node.js 18+, React 19+
- GitHub token with `read:packages` scope
- bun or npm

## Safety Rules

1. **Never update the package without user approval** — always run the impact scan first.
2. Confirm before overwriting existing files.
3. Apply breaking changes in logical groups — never bulk-apply.
4. **Do not finish until type check and tests pass.**
5. **Provide a rollback path** — explain how to restore the previous version on failure.

## References

- `references/breaking-changes.md` — per-version breaking-change registry
- `references/catalog-patterns.md` — block-definition pattern reference
- `references/doctor-checks.md` — detail for the 18 environment checks
- `references/fix-install.md` — checks 1–5 (package & dependencies)
- `references/fix-config.md` — checks 6–10 (CSS / TypeScript / Next.js)
- `references/fix-editor.md` — checks 11–14 (catalog / editor / store)
- `references/fix-advanced.md` — checks 15–18 (AI / compat / docs)
- `node_modules/@reopt-ai/opt-editor/dist/docs/` — package-shipped docs
