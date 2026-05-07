# Compatibility Matrix

Each skill declares the minimum `@reopt-ai/*` package version it assumes.
"Last verified" = date the skill was exercised against that package
version end-to-end (install → tsc → smoke). Update both columns in the
PR that touches a skill.

The **Target** column lists a single primary package (matches each skill's
`target` / `targetMinVersion` frontmatter fields, which `pnpm validate`
cross-checks). Companion packages that ship together are noted in the
rightmost column.

## Current state — 2026-05-07

### BrandApp SDK

| Skill | Target | Min version | Last verified | Verified on | Notes |
|-------|--------|-------------|---------------|-------------|-------|
| `brandapp-sdk-install` | `@reopt-ai/brandapp-sdk` | **1.6.0** | 2026-05-07 | 1.8.0 | `createLazySDK`, 4xx error classes, webhook `toleranceMs`, dev-server instrumentation, v1.6.1 mutation hooks; v1.7 `linkedTo` 1:1 user-metadata; v1.8 `cms` is read-only + marketing-site helpers (`toMetadata`, `toSitemapItems`, `toRssFeed`, `optimizeUrl`, `verifySession`) |
| `brandapp-sdk-review` | `@reopt-ai/brandapp-sdk` | **1.5.0** | 2026-05-07 | 1.8.0 | Adds Step 2-I (CMS / external-site patterns 1.8+): removed CMS write surface, manual metadata / sitemap / RSS, manual image URL transforms, cross-subdomain session, 1:1 user metadata. Old `REQUEST_ERROR` branch detection still pending. |

### Design / UI packages

| Skill | Target | Min version | Last verified | Verified on | Notes |
|-------|--------|-------------|---------------|-------------|-------|
| `opt-ui-install` | `@reopt-ai/opt-ui` | **1.2.1** | (unverified) | — | Ships with companion `opt-ui-cli` (Surface CLI flow) |
| `opt-datagrid-install` | `@reopt-ai/opt-datagrid` | **1.3.0** | (unverified) | — | Migrate mode: glide-data-grid / ag-grid / react-data-grid / MUI DataGrid. v1.3.0 adds `columnSortState`, `labels`, `useColumnSort.columnSortState` (additive) |
| `opt-editor-install` | `@reopt-ai/opt-editor` | **1.0.0** | (unverified) | — | First stable release — `EditorMode` widened to include `"diff"` (sole breaking change for exhaustive switches); diff/suggestion review components added |
| `opt-chat-install` | `@reopt-ai/opt-chat` | **0.1.0** | (unpublished) | — | **Package not yet published** — SKILL.md captures the planned v0.1.0 shape |
| `opt-harness-install` | `@reopt-ai/opt-harness` | **0.1.0** | (unpublished) | — | **Package not yet published** — SKILL.md captures the planned v0.1.0 shape |

### Tracked but no installer skill yet

These packages exist in the reopt-design monorepo but do not yet have a
dedicated installer skill. Add to this table when a new `@reopt-ai/*`
package surfaces; promote to its own row + skill when consumer demand
appears.

| Package | Current version | Status | Notes |
|---------|-----------------|--------|-------|
| `@reopt-ai/opt-palette` | 0.1.0 | unpublished (no git tag) | OKLCH-based color engine — harmony rules, palette generation, dark-mode derivation, WCAG auto-fix. Installer skill TBD. |
| `@reopt-ai/opt-devtool` | 0.1.0 | unpublished (no git tag) | Dev overlay for debugging opt-ui / opt-datagrid / opt-editor / opt-harness. Renamed from `@reopt-ai/opt-inspect`. Installer skill TBD. |

## Drift checklist

Run this every time a new `@reopt-ai/*` package ships:

- [ ] Skill mentions any removed / renamed API? → update examples
- [ ] Error classes / envelopes changed? → update error-handling section
- [ ] Env vars or config keys changed? → update env tables
- [ ] Minimum Node / Next / peerDep bumped? → update Step 1 / 2 requirements
- [ ] Bump "Min version" + "Last verified" cells above
- [ ] CHANGELOG.md entry links the change to the package release
- [ ] New `@reopt-ai/*` package discovered in the monorepo? → add a row to "Tracked but no installer skill yet" (or a full row + skill if it warrants one)

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
