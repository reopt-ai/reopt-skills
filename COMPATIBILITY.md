# Compatibility Matrix

Each skill declares the minimum `@reopt-ai/*` package version it assumes. "Last
verified" = date the skill was last reconciled against that package version.
Update both columns in the PR that touches a skill.

The **Target** column lists the single primary package (matches the skill's
`target` / `targetMinVersion` frontmatter, which `pnpm validate` cross-checks).
Per-version detail lives in each package's docs; this table stays terse.

> **Verification level (2026-07-13 round):** every package targeted by a skill
> was checked against the sibling monorepo source and the public npmjs registry.
> `@reopt-ai/brandapp-sdk` 3.0.0, `@reopt-ai/cli` 0.3.1, `opt-ui` 1.4.1,
> `opt-datagrid` 1.4.2, `opt-editor` 1.1.2, `opt-chat` 1.0.0, `opt-shell` 1.0.0,
> and `opt-cli` 1.1.1 all resolve publicly with no install token. Install skills
> now remove a legacy `@reopt-ai:registry=https://npm.pkg.github.com` project
> override instead of creating one. `opt-chat` / `opt-shell` 1.0.0 are stable
> public releases with no breaking API change from 0.x; `opt-editor` 1.1.2 uses
> optional `ai >= 7` / `zod >= 3` peers for AI integration. Published
> `opt-shell` 1.0.0 exports only `.`, `./core`, and `./meta`; its bundled
> `./audit` references are stale, so authoring audits route to
> `@reopt-ai/opt-cli/audit` / `opt harness`. Source + registry checked,
> **not** re-run through the full install → `tsc --noEmit` → smoke procedure at
> the bottom of this file.
>
> **Prior round (2026-06-26):** `@reopt-ai/brandapp-sdk` **2.3.0 →
> 3.0.0** reconciled by reading the package source in the `reopt` monorepo
> (`packages/brandapp-sdk`) — `CHANGELOG.md`, `docs/migration.md`,
> `src/core/config.ts` (`assertBrowserSafe` / `validateConfig`), the webhook
> contract in `docs/api-reference.md`. 3.0 is a security-review follow-up: the
> webhook verification contract + `verifySignature` signature changed (now
> aligned to the live platform sender), browser `clientSecret` is blocked
> (`CONFIG_BROWSER_SECRET`) with an additive token-only config, and the
> long-`@deprecated` `ReoptAdapterConfig` / `ReoptEavConfig` / `ReoptAdapterError`
> aliases were removed. docs layout is unchanged (still top-level `docs/`), so
> routing paths were not touched — only versions + the shared agent-rules and
> the install/review surface. Source-checked, **not** re-run through the full
> install → `tsc --noEmit` → smoke procedure at the bottom of this file.
>
> **Prior round (2026-06-18):** `opt-*` 1.4.x family confirmed via `npm view`
> (`opt-datagrid` 1.4.2, `opt-editor` 1.0.3, `opt-chat` 0.3.1); unchanged this
> round.

## Current state — 2026-07-13

All targets in the three tables below are public npm packages. A GitHub
Packages token or scoped `.npmrc` entry is neither required nor supported by
the install skills.

### CLI

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `reopt-cli` | `@reopt-ai/cli` | **0.3.1** | 2026-07-13 (src+npm) |

### BrandApp SDK

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `brandapp-sdk-install` | `@reopt-ai/brandapp-sdk` | **3.0.0** | 2026-07-13 (src+npm) |
| `brandapp-sdk-review` | `@reopt-ai/brandapp-sdk` | **3.0.0** | 2026-07-13 (src+npm) |

### Design / UI packages

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `opt-ui-install` | `@reopt-ai/opt-ui` | **1.4.1** | 2026-07-13 (src+npm) |
| `opt-datagrid-install` | `@reopt-ai/opt-datagrid` | **1.4.2** | 2026-07-13 (src+npm) |
| `opt-editor-install` | `@reopt-ai/opt-editor` | **1.1.2** | 2026-07-13 (src+npm) |
| `opt-chat-install` | `@reopt-ai/opt-chat` | **1.0.0** | 2026-07-13 (src+npm) |
| `opt-shell-install` | `@reopt-ai/opt-shell` | **1.0.0** | 2026-07-13 (src+npm) |

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

`@reopt-ai/opt-cli` (bin `opt`, current **1.1.1**, public npm) is the **unified** CLI for the design packages
— `opt doctor`, `opt surface add <slug>`, `opt harness …`, `opt check`. The UI
install skills call it via `npx @reopt-ai/opt-cli <cmd>`. There is **no**
`opt-ui-cli` or `opt-editor-cli` package; skill copies that referenced those
names were incorrect and have been corrected.

### Tracked but no installer skill yet

| Package | Current version | Status |
|---|---|---|
| `@reopt-ai/opt-ui-primitives` | 1.4.2 | public npm (native HTML/browser-API a11y primitives — peer of opt-ui) |
| `@reopt-ai/opt-palette` | 1.0.0 | public npm (stable OKLCH color engine — peer of opt-shell / opt-ui) |
| `@reopt-ai/opt-devtool` | 1.0.0 | public npm (stable; renamed from `@reopt-ai/opt-inspect`) |
| `@reopt-ai/opt-charts` | 1.0.0 | public npm (stable Recharts adapters + SVG viz / chart frames + shells) |
| `@reopt-ai/opt-calendar` | 1.0.0 | public npm (stable events + booking/availability, drag/resize, recurrence, timezones) |
| `@reopt-ai/opt-ui-surface` | 1.0.5 | internal, **not on npm** — add Surfaces via `npx @reopt-ai/opt-cli surface add <slug>` |
| `@reopt-ai/opt-doc-kit` | 0.1.0 | internal, **not on npm** (`private: true`) — metadata-driven docs kit, apps/web workspace |
| `@reopt-ai/opt-uxflow` | 0.1.0 | internal, **not on npm** (`private: true`) — UX flow builder |

## Drift checklist

Run every time a new `@reopt-ai/*` package ships:

- [ ] Does `npm view <package> version --@reopt-ai:registry=https://registry.npmjs.org`
      resolve the intended public release? Do not let a legacy user `.npmrc`
      silently probe GitHub Packages instead.
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
