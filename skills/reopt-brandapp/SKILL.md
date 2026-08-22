---
name: reopt-brandapp
description: Brandapp linking, listing, doctor checks, terms management, project scaffolding (`init`), the in-memory dev server, seed data, and sandbox environments for the reopt CLI. Use when a task involves `reopt brandapp list`, `link`, `unlink`, `doctor`, `term list`, `init`, `dev`, `seed`, or `env`.
requires:
  - reopt-cli
---

# reopt Brandapp

> This is NOT the reopt CLI you know. Run `reopt brandapp --help` / `reopt brandapp <cmd> --help` for the live command tree. The CLI ships no `dist/docs/`; if narrative context is needed, locate the `README.md` from the actual CLI installation or source checkout instead of assuming a local `node_modules` path.

## When to apply

- listing accessible brandapps
- linking / unlinking a project directory
- repairing stale links with `doctor`
- inspecting published terms
- scaffolding BrandApp dev files (`init`)
- running the offline in-memory dev server (`dev`, `seed`)
- managing sandbox cloud environments (`env list/create/use/destroy`)

Load `reopt-cli` first. Its agent-rules block (`<!-- BEGIN:reopt/cli-agent-rules -->`) covers this skill too — if `reopt-cli` already pinned it, skip Step 1.

## Step 1 — Pin agent rules (only if `reopt-cli` hasn't already)

Same source/fallback/marker as `reopt-cli`. If the marker block is already present in AGENTS.md/CLAUDE.md, do nothing here.

## Step 2 — Command map (refer to `--help` for flags)

| Command | Purpose | Needs login | Needs link | Status |
|---|---|---|---|---|
| `brandapp list` | List accessible brandapps | ✓ | – | stable |
| `brandapp link` | Link current dir to a brandapp | ✓ | – | stable |
| `brandapp unlink` | Remove the current dir link | – | ✓ | stable |
| `brandapp doctor` | Repair stale links / missing creds | ✓ | ✓ | stable |
| `brandapp term list` | List brandapp terms | ✓ | ✓ | stable |
| `brandapp init` | Scaffold dev-mode files (see below) | – | – | stable |
| `brandapp dev` | Offline EAV/Auth/AI/Files server | – | – | experimental |
| `brandapp seed` | Apply seed data to dev server | – | – | stable |
| `brandapp env list/create/use/destroy` | Sandbox cloud envs | – | ✓ | experimental |

Term types: `termsOfService`, `privacyPolicy`, `marketingConsent`, `custom`.

## Step 3 — `init` file map (consumer project, not module docs)

`reopt brandapp init` is a **dev-environment** scaffold — not the SDK app code. It only adds:

| File | When | Purpose |
|---|---|---|
| `.env.development` | always | `REOPT_DEV_MODE=true` + Better Auth placeholders |
| `reopt.seed.ts` | always | seed-data template |
| `lib/dev-server.ts` | Next.js only | `startDevServer()` wrapping `@reopt-ai/brandapp-sdk/dev` |
| `instrumentation.ts` | Next.js only | invokes `startDevServer()` when `REOPT_DEV_MODE=true` |
| `package.json scripts.dev:local` | Next.js only | `REOPT_DEV_MODE=true next dev` |
| `.gitignore` | always | appends `.reopt/` |

Detection: presence of `next` in `package.json`. Non-Next projects get only `.env.development` + `reopt.seed.ts` + `.gitignore` and must wire `startDevServer()` manually.

`init` does **not** create `.env.local`, `lib/sdk.ts`, `lib/auth.ts`, auth route handler, or webhook files, and does not clean legacy package-registry overrides — those belong to `brandapp-sdk-install`. The two skills are complementary; run `init` first, then `brandapp-sdk-install` for the SDK app code.

## Step 4 — Route to docs

| Task signal | Read |
|---|---|
| Flag-level reference for every subcommand | `reopt brandapp <cmd> --help` |
| Dev-server protocol, persistence, AI proxy | `@reopt-ai/brandapp-sdk/docs/dev-server.md` |
| Sandbox env lifecycle, TTL, AI limits | `reopt brandapp env --help` |
| Term schema | `reopt brandapp term --help` |

## Operating notes

- In a monorepo, `.reopt.json` is resolved by walking upward from the current dir.
- Run `reopt brandapp doctor` before CI jobs that depend on linked brandapps.
- `brandapp link` has no `--dry-run`; use `brandapp list --json` first if you need a preview.
- `brandapp env *` uses **brandapp service credentials (Basic)** since CLI 0.4.0, not the `reopt login` user session — a link or `BRANDAPP_CLIENT_ID`/`BRANDAPP_CLIENT_SECRET` is enough; `reopt login` is not required. `env create` provisions a **preview** env (`--type` / `--ai-limit` warn and are ignored); OAuth `clientId`/`clientSecret` are issued in Studio, not in the JSON output. `env destroy` confirms first (type the name, or `--force`).
- `brandapp env use` overwrites `.env.local` keys for `BRANDAPP_CLIENT_ID` / `BRANDAPP_CLIENT_SECRET` / `BRANDAPP_ID` (v2.0 namespace). Run it from the project that should target the sandbox.
- `dev`, `env *`, and `eav migrate *` are flagged experimental — surface that label when recommending so users know the API may shift.
- `init` is non-destructive without `--force`; warn before passing `--force` over an existing scaffold.

## Safety

- Inherit all rules from `reopt-cli` (no hardcoded credentials, no `~/.reopt/` commits, no credential printing).
- `brandapp env destroy` is irreversible — confirm `--force` is intentional.
- `brandapp seed --reset` wipes existing rows; only run on disposable environments.
