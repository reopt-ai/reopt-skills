# Compatibility Matrix

Each skill declares the minimum `@reopt-ai/*` package version it assumes. "Last verified" = date the skill was exercised against that package version end-to-end (install → tsc → smoke). Update both columns in the PR that touches a skill.

The **Target** column lists the single primary package (matches the skill's `target` / `targetMinVersion` frontmatter, which `pnpm validate` cross-checks). Per-version detail lives in each package's `dist/docs/CHANGELOG.md`; this table stays terse.

## Current state — 2026-05-15

### CLI

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `reopt-cli` | `@reopt-ai/cli` | **0.1.0** | 2026-05-15 |

### BrandApp SDK

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `brandapp-sdk-install` | `@reopt-ai/brandapp-sdk` | **2.0.0** | 2026-05-15 |
| `brandapp-sdk-review` | `@reopt-ai/brandapp-sdk` | **2.0.0** | 2026-05-15 |

### Design / UI packages

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `opt-ui-install` | `@reopt-ai/opt-ui` | **1.2.1** | (unverified) |
| `opt-datagrid-install` | `@reopt-ai/opt-datagrid` | **1.3.0** | (unverified) |
| `opt-editor-install` | `@reopt-ai/opt-editor` | **1.0.0** | (unverified) |
| `opt-chat-install` | `@reopt-ai/opt-chat` | **0.1.0** | (unpublished) |
| `opt-harness-install` | `@reopt-ai/opt-harness` | **0.1.0** | (unpublished) |

### Tracked but no installer skill yet

These `@reopt-ai/*` packages exist in the monorepo but do not yet have a dedicated installer skill. Add a row + skill when consumer demand appears.

| Package | Current version | Status |
|---|---|---|
| `@reopt-ai/opt-palette` | 0.1.0 | unpublished (OKLCH color engine — peer of opt-harness) |
| `@reopt-ai/opt-devtool` | 0.1.0 | unpublished (renamed from `@reopt-ai/opt-inspect`) |

## Drift checklist

Run every time a new `@reopt-ai/*` package ships:

- [ ] Does the package's `dist/docs/` cover the new API surface? — that's where per-version detail belongs in v2.
- [ ] Does the package ship `dist/agent-rules.md`? — if not, update the skill's fallback `agent-rules.md`.
- [ ] Bump `Min version` + `Last verified` cells above.
- [ ] Add a `CHANGELOG.md` entry linking the package release to the skill change.
- [ ] New `@reopt-ai/*` package discovered? — add a row to "Tracked but no installer skill yet".

## Verification procedure

Quick self-check before marking a skill "verified":

```bash
# From a throwaway Next.js / Node project with the target package installed.
# Re-invoke the skill via your agent:
#   - it should pin the BEGIN:reopt/<pkg>-agent-rules block into AGENTS.md
#   - it should NOT touch text outside the markers
#   - re-running should replace the block content, not append a second copy

npx tsc --noEmit
pnpm dev

# Auth smoke (if the skill touches auth)
curl -f http://localhost:3000/api/auth/ok

# SDK end-to-end smoke
curl -f http://localhost:3000/api/health
```

If any step fails, fix the skill before bumping compatibility.

## Historical deprecations

See [`CHANGELOG.md`](./CHANGELOG.md) for the full history of skill-level deprecations, renames, and API migrations.
