---
name: reopt-brandapp
description: Brandapp linking, listing, doctor checks, terms management, project scaffolding (`init`), the in-memory dev server, seed data, and sandbox environments for the reopt CLI. Use when a task involves `reopt brandapp list`, `link`, `unlink`, `doctor`, `term list`, `init`, `dev`, `seed`, or `env`.
requires:
  - reopt-cli
---

# reopt Brandapp

Operational guidance for `reopt brandapp` workflows outside EAV schema management.

## When to Apply

Use this skill when:

- listing accessible brandapps
- linking or unlinking a project directory
- repairing stale links with `doctor`
- inspecting published terms for a linked brandapp
- scaffolding BrandApp dev files into a fresh project (`init`)
- running the offline in-memory dev server (`dev`, `seed`)
- managing sandbox cloud environments (`env list/create/use/destroy`)

Load `reopt-cli` first.

## Command Coverage

| Command | Description | Requires Login | Requires Link | Status |
| --- | --- | --- | --- | --- |
| `brandapp list` | List accessible brandapps | yes | no | stable |
| `brandapp link` | Link current directory to a brandapp | yes | no | stable |
| `brandapp unlink` | Remove the current directory link | no | yes | stable |
| `brandapp doctor` | Repair stale links and missing credentials | yes | yes | stable |
| `brandapp term list` | List brandapp terms | yes | yes | stable |
| `brandapp init` | Scaffold BrandApp dev files in the current project | no | no | stable |
| `brandapp dev` | Start the in-memory dev server (offline EAV/Auth/AI/Files) | no | no | experimental |
| `brandapp seed` | Apply seed data to a running dev server | no | no | stable |
| `brandapp env list` | List sandbox environments | yes | yes | experimental |
| `brandapp env create` | Provision a new sandbox environment | yes | yes | experimental |
| `brandapp env use <envId>` | Write the environment's credentials into `.env.local` | yes | yes | experimental |
| `brandapp env destroy <envId>` | Destroy a sandbox environment | yes | yes | experimental |

## Common Flows

### List brandapps

```bash
reopt brandapp list
reopt brandapp list --json
```

### Link a directory

```bash
reopt brandapp link
```

Expected modes:

- fresh link: creates `.reopt.json` and credentials
- team onboarding: fills in missing credentials only
- re-link: switches an already linked directory

### Unlink

```bash
reopt brandapp unlink
```

### Doctor

```bash
reopt brandapp doctor
```

Doctor should remove stale server entries and repair missing local OAuth credentials.

### List terms

```bash
reopt brandapp term list
reopt brandapp term list --json
```

Supported term types: `termsOfService`, `privacyPolicy`, `marketingConsent`, `custom`.

### Scaffold the dev environment (`init`)

```bash
reopt brandapp init           # dev-mode bootstrap (see file list below)
reopt brandapp init --force   # overwrite existing files
```

`init` is a **dev-environment** scaffold — it sets up the offline
in-memory server, not the SDK app code. Files it touches:

| File | When | Purpose |
| --- | --- | --- |
| `.env.development` | always | `REOPT_DEV_MODE=true` + Better Auth placeholders |
| `reopt.seed.ts` | always | seed-data template for the dev server |
| `lib/dev-server.ts` | Next.js only | `startDevServer()` wrapping `@reopt-ai/brandapp-sdk/dev` |
| `instrumentation.ts` | Next.js only | invokes `startDevServer()` on boot when `REOPT_DEV_MODE=true` |
| `package.json` `scripts.dev:local` | Next.js only | `REOPT_DEV_MODE=true next dev` |
| `.gitignore` | always | appends `.reopt/` so persisted dev data stays local |

Detection is keyed on the `next` dependency in `package.json`. Non-Next
projects get `.env.development` + `reopt.seed.ts` + `.gitignore` only;
wire `startDevServer()` into your own bootstrap manually.

`init` does **not** create `.npmrc`, `.env.local`, `lib/sdk.ts`,
`lib/auth.ts`, `lib/auth-client.ts`, the auth route handler, or webhook
files — those belong to the `brandapp-sdk-install` skill. The two
skills are complementary: run `init` for the dev-server bootstrap, then
hand off to `brandapp-sdk-install` for the SDK app code.

### Run the dev server (`dev`, experimental)

```bash
reopt brandapp dev                                # default: ./eav.schema.ts on :4300
reopt brandapp dev --port 4400 --watch            # custom port + schema watcher
reopt brandapp dev --persist                      # write to .reopt/dev-data.json between restarts
reopt brandapp dev --seed ./reopt.seed.ts         # auto-apply seed on boot
reopt brandapp dev --proxy-ai                     # forward AI calls to a remote model
```

Flags: `-s, --schema <path>` (default `./eav.schema.ts`), `-p, --port <port>` (default `4300`), `--persist`, `--seed <path>`, `-w, --watch`, `--proxy-ai`.
The dev server provides offline EAV / Auth / AI / Files; consumer apps
point at it via `REOPT_BASE_URL=http://localhost:4300` (matches the
`instrumentation.ts` pattern used by `brandapp-sdk-install`).

### Seed a running dev server

```bash
reopt brandapp seed                                       # default seed file + localhost
reopt brandapp seed -f ./fixtures/demo.seed.ts --reset    # reset existing data first
reopt brandapp seed -t http://localhost:4400              # non-default dev server
```

`--reset` wipes existing rows before applying — use it on disposable
environments only.

### Manage sandbox environments (`env`, experimental)

Sandboxes are short-lived cloud environments scoped to the linked
brandapp. The flow is `create` → `use` → work → `destroy`.

```bash
reopt brandapp env list
reopt brandapp env list --json

reopt brandapp env create -n pr-42                          # default type=development
reopt brandapp env create -n staging -t staging --ttl 7d --ai-limit 100

reopt brandapp env use env_01abc                            # writes credentials into .env.local
reopt brandapp env destroy env_01abc                        # confirms before destroying
reopt brandapp env destroy env_01abc --force                # skip confirmation
```

`env use` overwrites `.env.local` keys for `REOPT_CLIENT_ID`,
`REOPT_CLIENT_SECRET`, and `REOPT_BRANDAPP_ID`. Run it from the project
that should target the sandbox; it does not unset previously written keys
beyond the three reopt entries.

## Operating Notes

- In a monorepo, `.reopt.json` is resolved by walking upward from the current directory.
- Run `reopt brandapp doctor` before CI jobs that depend on linked brandapps.
- `brandapp link` has no `--dry-run`; use `brandapp list --json` first if you need a preview.
- OAuth credentials are scoped per brandapp and project directory.
- `dev`, `env *`, and `eav migrate *` are flagged `[experimental]` in the CLI's own help — surface that label when you recommend them so users know the API may shift.
- `init` is non-destructive without `--force`; warn before passing `--force` over an existing scaffold.

