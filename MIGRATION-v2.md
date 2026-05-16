# Migrating from reopt-skills v1.x to v2.0

v2.0 rewrites every skill around the **slim convention** that Next.js 16.2+ uses:

- Each `@reopt-ai/*` package owns its own `dist/docs/` (API surface, code samples, per-version detail).
- Each consumer project's `AGENTS.md` (or `CLAUDE.md`) gets a marker-bracketed block — `<!-- BEGIN:reopt/<pkg>-agent-rules -->` … `<!-- END:reopt/<pkg>-agent-rules -->` — that points the agent at those docs.
- SKILL.md only keeps what the docs can't cover: `.npmrc`, env-namespace rules, peer deps, requires chains, destructive guardrails, security rules. Average SKILL.md size went from ~400 lines to ~80.

This document is for consumers who already pinned an older release of `reopt-skills`.

## What changed for you

1. **Marker block injection (new)** — every install/review skill now asks the agent to add a marker block to your `AGENTS.md`/`CLAUDE.md` and re-applies it idempotently on re-runs.
2. **References folder gone** — `references/breaking-changes.md`, `references/migration-*.md`, `references/*-patterns.md` are not shipped with skills anymore. The content has moved (or is moving) into the target package's `dist/docs/`. If you relied on a specific file path from v1, see the mapping below.
3. **SKILL.md is much shorter** — agents reading SKILL.md will now route to module docs for API details instead of finding them inline.
4. **Validator is stricter** — install/review SKILL.md > 150 lines fails; the marker reference is required.

No skill names changed. The set of installable skills is the same 10.

## Step-by-step upgrade

### 1. Bump your skills pin

```bash
npx skills update reopt-ai/reopt-skills@^2.0.0
# or, if you pinned a tag:
npx skills add reopt-ai/reopt-skills@v2.0.0
```

If you want to stay on v1 for now, pin explicitly: `npx skills add reopt-ai/reopt-skills@v1`.

### 2. Re-invoke each install skill

Re-running an install skill in v2 will:

- Add a `<!-- BEGIN:reopt/<pkg>-agent-rules -->` block to your `AGENTS.md` (or `CLAUDE.md` if `AGENTS.md` doesn't exist).
- Leave the rest of the file alone.

Do this for every `@reopt-ai/*` package you use. Re-runs are safe; the marker matching is idempotent.

### 3. (Optional) Make sure your modules ship `dist/docs/`

v2 expects each `@reopt-ai/*` package to publish:

- `dist/docs/` — narrative guides, API reference, per-version changelog.
- `dist/agent-rules.md` — the canonical marker-block content for that package.

Until a module publishes its own `dist/agent-rules.md`, the skill falls back to a copy shipped alongside SKILL.md (`skills/<name>/agent-rules.md`). You don't need to do anything for the fallback — it activates automatically.

## Where v1 reference files moved

| v1 path | v2 location |
|---|---|
| `skills/opt-ui-install/references/breaking-changes.md` | `node_modules/@reopt-ai/opt-ui/dist/docs/CHANGELOG.md` |
| `skills/opt-ui-install/references/doctor-checks.md` | `node_modules/@reopt-ai/opt-ui/dist/docs/doctor.md` |
| `skills/opt-ui-install/references/fix-*.md` | `node_modules/@reopt-ai/opt-ui/dist/docs/troubleshooting.md` |
| `skills/opt-ui-install/references/framework-nextjs.md` | `node_modules/@reopt-ai/opt-ui/dist/docs/install.md` |
| `skills/opt-ui-install/references/manual-install.md` | `node_modules/@reopt-ai/opt-ui/dist/docs/install.md` |
| `skills/opt-ui-install/references/migration-formstore.md` | `node_modules/@reopt-ai/opt-ui/dist/docs/migrations/formstore.md` |
| `skills/opt-ui-install/references/surface-workflow.md` | `node_modules/@reopt-ai/opt-ui/dist/docs/surface/` |
| `skills/opt-editor-install/references/breaking-changes.md` | `node_modules/@reopt-ai/opt-editor/dist/docs/CHANGELOG.md` |
| `skills/opt-editor-install/references/catalog-patterns.md` | `node_modules/@reopt-ai/opt-editor/dist/docs/catalog/` |
| `skills/opt-editor-install/references/doctor-checks.md` | `node_modules/@reopt-ai/opt-editor/dist/docs/doctor.md` |
| `skills/opt-editor-install/references/fix-*.md` | `node_modules/@reopt-ai/opt-editor/dist/docs/troubleshooting.md` |
| `skills/opt-chat-install/references/breaking-changes.md` | `node_modules/@reopt-ai/opt-chat/dist/docs/CHANGELOG.md` |
| `skills/opt-chat-install/references/component-patterns.md` | `node_modules/@reopt-ai/opt-chat/dist/docs/components/` |
| `skills/opt-datagrid-install/references/breaking-changes.md` | `node_modules/@reopt-ai/opt-datagrid/dist/docs/CHANGELOG.md` |
| `skills/opt-datagrid-install/references/column-patterns.md` | `node_modules/@reopt-ai/opt-datagrid/dist/docs/02-api/columns.md` |
| `skills/opt-datagrid-install/references/theme-integration.md` | `node_modules/@reopt-ai/opt-datagrid/dist/docs/theme.md` |
| `skills/opt-datagrid-install/references/transform-glide-datagrid.md` | `node_modules/@reopt-ai/opt-datagrid/dist/docs/04-migration/glide.md` |
| `skills/opt-harness-install/references/breaking-changes.md` | `node_modules/@reopt-ai/opt-harness/dist/docs/CHANGELOG.md` |
| `skills/opt-harness-install/references/recipe-patterns.md` | `node_modules/@reopt-ai/opt-harness/dist/docs/recipes/` |
| `skills/_shared/upgrade-pipeline.md` | retired — see each skill's own pipeline table |
| `skills/_shared/breaking-changes-template.md` | retired — modules own their own CHANGELOG.md |

If a target module hasn't published the destination doc yet, the skill's fallback `agent-rules.md` carries the high-level rules in the meantime. The full content also remains accessible in this repo's git history (`git log -- skills/<name>/references/`).

## Env-namespace rename (Brandapp SDK only)

Independent of the skill rewrite, `@reopt-ai/brandapp-sdk@2.0.0` renamed every env var without aliases. If you haven't done this already:

- `REOPT_CLIENT_ID` → `BRANDAPP_CLIENT_ID`
- `REOPT_CLIENT_SECRET` → `BRANDAPP_CLIENT_SECRET`
- `REOPT_BRANDAPP_ID` → `BRANDAPP_ID`
- `REOPT_WEBHOOK_SECRET` → `BRANDAPP_WEBHOOK_SECRET`
- `REOPT_SDK_*` → `BRANDAPP_SDK_*`
- `NEXT_PUBLIC_REOPT_*` → `NEXT_PUBLIC_BRANDAPP_*`
- `NEXT_PUBLIC_EAV_HASH` → `NEXT_PUBLIC_BRANDAPP_EAV_HASH`
- `REOPT_BASE_URL` / `REOPT_ID_BASE_URL` stay as platform-host overrides.

The full marker block (Step 2's source) carries these rules so the agent flags any stragglers automatically once you re-run the install skill.

## Rolling back

```bash
npx skills add reopt-ai/reopt-skills@v1
```

v1 marker blocks (if any future v1.x release adds them) and v2 marker blocks share no overlap — rolling back leaves any v2 block in your AGENTS.md intact, and v1 skills will simply ignore it.
