# Compatibility Matrix

Each skill declares the minimum `@reopt-ai/*` package version it assumes. "Last
verified" = date the skill was last reconciled against that package version.
Update both columns in the PR that touches a skill.

The **Target** column lists the single primary package (matches the skill's
`target` / `targetMinVersion` frontmatter, which `pnpm validate` cross-checks).
Per-version detail lives in each package's docs; this table stays terse.

> **Verification level (2026-06-18 round):** reconciled by reading the package
> sources — `@reopt-ai/cli` and `@reopt-ai/brandapp-sdk` in the `reopt`
> monorepo, the `@reopt-ai/opt-*` packages in the `reopt-design` repo — i.e.
> file layout, `package.json` `files`/`exports`, and the docs each package
> actually ships. Versions marked `(npm)` were confirmed against GitHub Packages
> with `npm view`: `brandapp-sdk` 2.3.0 (the 2.2 reliability + 2.3 AI-surface
> rounds) and the `opt-*` 1.4.x family (`opt-datagrid` 1.4.2, `opt-editor`
> 1.0.3, `opt-chat` 0.3.1). docs layout is unchanged from the prior round, so
> routing was not touched — only versions + the brandapp-sdk agent-rules/review
> content (new error classes, non-idempotent retry, AI surface). It was **not**
> re-run through the full install → `tsc --noEmit` → smoke procedure at the
> bottom of this file. Treat the rows below as **source-checked**; run that
> procedure before claiming a row runtime-verified.

## Current state — 2026-06-18

### CLI

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `reopt-cli` | `@reopt-ai/cli` | **0.3.1** | 2026-06-13 (src) |

### BrandApp SDK

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `brandapp-sdk-install` | `@reopt-ai/brandapp-sdk` | **2.3.0** | 2026-06-18 (npm) |
| `brandapp-sdk-review` | `@reopt-ai/brandapp-sdk` | **2.3.0** | 2026-06-18 (npm) |

### Design / UI packages

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `opt-ui-install` | `@reopt-ai/opt-ui` | **1.4.0** | 2026-06-13 (npm) |
| `opt-datagrid-install` | `@reopt-ai/opt-datagrid` | **1.4.2** | 2026-06-18 (npm) |
| `opt-editor-install` | `@reopt-ai/opt-editor` | **1.0.3** | 2026-06-18 (npm) |
| `opt-chat-install` | `@reopt-ai/opt-chat` | **0.3.1** | 2026-06-18 (npm) |
| `opt-shell-install` | `@reopt-ai/opt-shell` | **0.1.0** | 2026-06-13 (src) |

> **Doc-layout note (routing-critical — skills point at literal paths):**
> - `@reopt-ai/brandapp-sdk` ships docs at top-level **`docs/`** (NOT
>   `dist/docs/`) — flat files `api-reference.md`, `cms.md`, `dev-server.md`,
>   `environment.md`, `errors.md`, `files.md`, `migration.md`, `testing.md`.
>   No `index.md`; `api-reference.md` is the combined auth/EAV/webhook/React
>   surface.
> - `@reopt-ai/opt-ui` / `opt-datagrid` / `opt-editor` ship **`dist/docs/`**
>   with a numeric-prefixed tree (`01-…`, `02-api/` or `02-components/`,
>   `03-recipes/`, `0N-migration/`, `0N-troubleshooting.md`) and an `index.md`
>   hub. Route to the directory + `index.md`, not to guessed flat filenames.
> - `@reopt-ai/cli`, `opt-chat`, `opt-palette`, `opt-devtool` ship **no docs
>   dir** — route to `README.md` (and the CLI `--help` for `cli`).
>   `@reopt-ai/opt-shell` ships **`shell-llms.txt`** (agent guide) + `README.md`.
> - **No package ships `dist/agent-rules.md` yet** — every install/review skill
>   still relies on its bundled fallback `agent-rules.md`. Replace the fallback
>   with a pointer to the module's copy once a package starts shipping one.

### Design CLI (used by the UI skills)

`@reopt-ai/opt-cli` (bin `opt`, current **1.1.0**) is the **unified** CLI for the design packages
— `opt doctor`, `opt surface add <slug>`, `opt harness …`, `opt check`. The UI
install skills call it via `npx @reopt-ai/opt-cli <cmd>`. There is **no**
`opt-ui-cli` or `opt-editor-cli` package; skill copies that referenced those
names were incorrect and have been corrected.

### Tracked but no installer skill yet

| Package | Current version | Status |
|---|---|---|
| `@reopt-ai/opt-palette` | 0.1.0 | published (OKLCH color engine — peer of opt-shell / opt-ui) |
| `@reopt-ai/opt-devtool` | 0.1.1 | published (renamed from `@reopt-ai/opt-inspect`) |
| `@reopt-ai/opt-ui-surface` | 1.0.5 | internal, **not on npm** — add Surfaces via `npx @reopt-ai/opt-cli surface add <slug>` |

## Drift checklist

Run every time a new `@reopt-ai/*` package ships:

- [ ] Does the package's docs dir (`docs/` **or** `dist/docs/`) cover the new
      API surface? Confirm the **exact path + filenames** — skills route to
      literal paths, so a renamed file silently breaks routing.
- [ ] Does the package ship `dist/agent-rules.md`? — if not, keep the skill's
      fallback `agent-rules.md` current (and its doc map pointing at real paths).
- [ ] Bump `Min version` + `Last verified` cells above **and** mirror
      `targetMinVersion` in the skill's SKILL.md frontmatter (validate
      cross-checks the two).
- [ ] Add a `CHANGELOG.md` entry linking the package release to the skill change.
- [ ] New `@reopt-ai/*` package discovered? — add a row to "Tracked but no
      installer skill yet".

## Verification procedure

Quick self-check before marking a skill "verified" (runtime, not just source):

```bash
# From a throwaway Next.js / Node project with the target package installed.
# Re-invoke the skill via your agent:
#   - it should pin the BEGIN:reopt/<pkg>-agent-rules block into AGENTS.md
#   - it should NOT touch text outside the markers
#   - re-running should replace the block content, not append a second copy
#   - every dist/docs or docs path it routes to must actually exist in node_modules

npx tsc --noEmit
pnpm dev

# Auth smoke (if the skill touches auth)
curl -f http://localhost:3000/api/auth/ok

# SDK end-to-end smoke
curl -f http://localhost:3000/api/health
```

If any step fails, fix the skill before bumping compatibility.

## Historical deprecations

- **`@reopt-ai/opt-harness` retired (2026-06-13).** The harness layer shipped
  to npm as **`@reopt-ai/opt-shell`** ("runtime product-frame layer" — workspace
  recipes, density/contentWidth/navigation/motion policy, data-engine adapters,
  shared state boundaries). `opt-harness-install` was renamed to
  `opt-shell-install` and retargeted; the `Harness*` component names became
  `*Workspace` / `Shell*`. Harness **contract verification** now lives in
  `@reopt-ai/opt-cli` (`opt harness`).
- See [`CHANGELOG.md`](./CHANGELOG.md) for the full history of skill-level
  deprecations, renames, and API migrations.
