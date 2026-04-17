---
name: opt-ui-install
description: |
  Install @reopt-ai/opt-ui in a consumer project or upgrade it to the latest version.
  Not installed → initial setup (.npmrc, Tailwind CSS v4, OptThemeProvider, Surface CLI).
  Installed → detect version → analyze impact → edit code → verify.
  Surface mode → add page templates via the CLI.
  Triggers on: "opt-ui install", "opt-ui init", "opt-ui setup",
  "opt-ui upgrade", "opt-ui update",
  "opt-ui surface", "opt-ui-cli add", "add Surface".
  Current version: opt-ui 1.2.1, opt-ui-cli 1.2.1.
---

# opt-ui-install Skill

Install, upgrade, or add a Surface to `@reopt-ai/opt-ui` in a consumer project.

> **CRITICAL — execution workflow:**
>
> This file (SKILL.md) covers invocation shape and safety rules.
> The actual step-by-step procedure lives in **`command/opt-ui-install.md`**.
>
> **Read `command/opt-ui-install.md` before starting any work.**

## CRITICAL: Consumer Projects Only

**This skill is only for consumer projects that depend on
`@reopt-ai/opt-ui`.** Never import from the monorepo-internal path
`packages/opt-ui/src/...` in consumer code.

## Invocation

```
/opt-ui-install                        # Auto-branch (missing → init, installed → upgrade)
/opt-ui-install surface billing-page   # Surface-add mode
/opt-ui-install --upgrade              # Explicit upgrade
/opt-ui-install --check                # Analyze only (no code changes)
/opt-ui-install --target=1.2.0         # Upgrade to a specific version
/opt-ui-install --dry-run              # Analyze only (no edits applied)
```

## Auto-Branch Pipeline

| Step | Description                 | Init | Upgrade | Surface |
| ---- | --------------------------- | ---- | ------- | ------- |
| 1    | Detect current state        | O    | O       | O       |
| 2    | .npmrc for GitHub Packages  | O    | -       | -       |
| 3    | Package install / update    | O    | O       | -       |
| 4    | CSS import check            | O    | O       | -       |
| 5    | OptThemeProvider setup      | O    | -       | -       |
| 6    | Breaking-change edits       | -    | O       | -       |
| 7    | Deprecated fixes (optional) | -    | O       | -       |
| 8    | Surface CLI workflow        | opt  | opt     | O       |
| 9    | Doctor validation (26)      | O    | O       | O       |
| 10   | Summary & next steps        | O    | O       | O       |

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

Load only what matches the task:

- `references/framework-nextjs.md` — Next.js App Router specifics (.npmrc + Tailwind + OptThemeProvider)
- `references/manual-install.md` — manual setup for non-Next.js frameworks
- `references/surface-workflow.md` — CLI-based Surface template workflow
- `references/breaking-changes.md` — per-version breaking-change registry
- `references/migration-formstore.md` — FormStore migration details
- `references/doctor-checks.md` — detail for the 26 environment checks
- `references/fix-install.md` — checks 1–5 (package install & deps)
- `references/fix-config.md` — checks 6–14 (CSS / Tailwind / TypeScript)
- `references/fix-theme.md` — checks 15, 19–23 (theme & styling)
- `references/fix-surface.md` — checks 16–18, 24–26 (Surface CLI)

## Related Skills

- `node_modules/@reopt-ai/opt-ui/dist/docs/` — component API, recipes, Surface docs
