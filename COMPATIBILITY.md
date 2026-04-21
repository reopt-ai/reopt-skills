# Compatibility Matrix

Each skill declares the minimum `@reopt-ai/*` package version it assumes.
"Last verified" = date the skill was exercised against that package
version end-to-end (install → tsc → smoke). Update both columns in the
PR that touches a skill.

The **Target** column lists a single primary package (matches each skill's
`target` / `targetMinVersion` frontmatter fields, which `pnpm validate`
cross-checks). Companion packages that ship together are noted in the
rightmost column.

## Current state — 2026-04-21

### BrandApp SDK

| Skill | Target | Min version | Last verified | Verified on | Notes |
|-------|--------|-------------|---------------|-------------|-------|
| `brandapp-sdk-install` | `@reopt-ai/brandapp-sdk` | **1.6.0** | 2026-04-17 | 1.6.0 | `createLazySDK`, new 4xx error classes, webhook `toleranceMs`, dev-server instrumentation |
| `brandapp-sdk-review` | `@reopt-ai/brandapp-sdk` | **1.5.0** | 2026-04-16 | 1.6.0 | v1.6-specific rules (old `REQUEST_ERROR` branches, missing `toleranceMs`) pending |

### Design / UI packages

| Skill | Target | Min version | Last verified | Verified on | Notes |
|-------|--------|-------------|---------------|-------------|-------|
| `opt-ui-install` | `@reopt-ai/opt-ui` | **1.2.1** | (unverified) | — | Ships with companion `opt-ui-cli` (Surface CLI flow) |
| `opt-datagrid-install` | `@reopt-ai/opt-datagrid` | **1.1.0** | (unverified) | — | Migrate mode: glide-data-grid / ag-grid / react-data-grid / MUI DataGrid |
| `opt-editor-install` | `@reopt-ai/opt-editor` | **0.8.0** | (unverified) | — | Pre-1.0 — breaking changes expected |
| `opt-chat-install` | `@reopt-ai/opt-chat` | **0.1.0** | (unpublished) | — | **Package not yet published** — SKILL.md captures the planned v0.1.0 shape |
| `opt-harness-install` | `@reopt-ai/opt-harness` | **0.1.0** | (unpublished) | — | **Package not yet published** — SKILL.md captures the planned v0.1.0 shape |

## Drift checklist

Run this every time a new `@reopt-ai/*` package ships:

- [ ] Skill mentions any removed / renamed API? → update examples
- [ ] Error classes / envelopes changed? → update error-handling section
- [ ] Env vars or config keys changed? → update env tables
- [ ] Minimum Node / Next / peerDep bumped? → update Step 1 / 2 requirements
- [ ] Bump "Min version" + "Last verified" cells above
- [ ] CHANGELOG.md entry links the change to the package release

## Verification procedure

Quick self-check before marking a skill "verified":

```bash
# From a throwaway Next.js / Node project with the target package installed
# Install via the skill:
npx @reopt-ai/cli@<target> brandapp init        # or the SKILL.md steps
npx tsc --noEmit
pnpm dev

# Auth smoke (if the skill touches auth)
curl -f http://localhost:3000/api/auth/ok

# SDK end-to-end smoke — playground /health pattern
curl -f http://localhost:3000/api/health
```

If any step fails, fix the skill before bumping compatibility.

## Historical deprecations

See [`CHANGELOG.md`](./CHANGELOG.md) for the full history of skill-level
deprecations, renames, and API migrations.
