---
name: reopt-cli
description: Baseline guidance for the reopt CLI — authentication, login, global flags, security rules, and exit codes. Use before other reopt CLI skills or whenever a task involves `reopt login`, `reopt status`, brandapp credentials, or CI automation.
target: "@reopt-ai/cli"
targetMinVersion: "0.5.0"
---

# reopt CLI

> This is NOT the reopt CLI you know. Run `reopt --help` / `reopt <cmd> --help` for the live command tree. The CLI ships no `dist/docs/`; when narrative context is needed, locate the `README.md` from the actual CLI package installation or source checkout instead of assuming a local `node_modules` path.

## When to apply

- Any `reopt` CLI command.
- Confirming login state, writing CI/CD steps around `reopt`, scripting Brandapp OAuth credentials.
- Load before `reopt-brandapp` and `reopt-eav`.

## Step 1 — Pin agent rules into AGENTS.md / CLAUDE.md

Source: the CLI's own agent-rules file once it ships one (`@reopt-ai/cli` does not, as of 0.5.0). Fallback: `agent-rules.md` bundled with this skill. Wrap content between:

```
<!-- BEGIN:reopt/cli-agent-rules -->
…content from source…
<!-- END:reopt/cli-agent-rules -->
```

**Idempotent:** replace only between markers. This same block is shared by `reopt-brandapp` and `reopt-eav` — those skills will skip the step if the block is already present.

## Step 2 — Auth (consumer-side credentials; CLI docs cover usage)

The CLI has three credential systems:

- **User session** — `reopt login` / `reopt status` / `reopt logout`. Tokens live in `~/.reopt/auth.json`. Session auto-refreshes inside the Better Auth extension window; do not over-engineer retry loops in CI.
- **Brandapp OAuth credentials** — `BRANDAPP_CLIENT_ID` / `BRANDAPP_CLIENT_SECRET` env vars, or `reopt brandapp link` interactively. Stored in `~/.reopt/credentials.json` + `.reopt.json` (project root).
- **Service token (CI/CD)** — `reopt token mint --ttl 15m --scope eav:migrate,eav:read` prints a short-lived, scoped JWT for headless pipelines; capture with `export BRANDAPP_CLIENT_TOKEN=$(reopt token mint --quiet)`. Pass to the SDK as a Bearer `token` — never ship a `clientSecret` where a scoped token works.

Run `reopt status` (or `reopt status --ping`) before any mutating operation. If `auth: not logged in`, run `reopt login` first.

## Step 3 — Route to module docs / `--help`

Prefer `--help` as the live source of truth. The CLI ships **no** `dist/docs/`; its package `README.md` provides narrative detail, but the path depends on whether the CLI is installed locally, globally, or run from a source checkout. Resolve the actual installation before using the README section references below.

| Task signal | Read |
|---|---|
| Any command / flag | `reopt <cmd> --help` (live) |
| Auth commands and session model | `reopt login --help`, `reopt status --help`; installed CLI `README.md` § Authentication |
| Service-token issuance (CI/CD) | `reopt token mint --help` |
| Brandapp ops (`link`, `doctor`, `init`, `dev`, `env`, …) | `reopt brandapp --help` + see `reopt-brandapp` skill |
| EAV ops (`status`, `sync`, `pull`, `diff`, `plan`, `migrate`, `history`, `verify`) | `reopt brandapp eav --help` + see `reopt-eav` skill |
| Schema-as-Code, MCP, completion, config | relevant `--help`; installed CLI `README.md` §§ Schema-as-Code, Shell completion, Preferences |
| Global flags, output formats, pagination | `reopt --help`; installed CLI `README.md` § Output and global flags |
| Exit codes | installed CLI `README.md` § Exit codes; summary below |

Quick global-flag reminders (subset; full list in `--help`):

- `--format json|table|csv|yaml` — JSON is the agent-friendly default. Since 0.4.0, `json`/`ndjson`/`yaml` emit **raw server items** (ids preserved, MCP-identical) to **stdout**; `table`/`csv` apply the per-command projection. Scripts that read synthesized fields (e.g. `workspace list` composite `role`) must switch to raw fields.
- `--page-all` + `--page-limit` + `--page-delay` — paginated iteration; JSON output becomes NDJSON.
- `--no-interactive` — required for unattended scripts (fail instead of prompt).
- `--dry-run` — preview only (EAV sync, brandapp link/unlink).

Exit code summary: `0` ok, `1` API/network, `2` auth, `3` validation, `4` config, `5` internal. EAV migrate/verify add `6` drift-detected, `7` destructive-blocked, `8` checksum-mismatch, `9` checksum-conflict, `10` lock-held.

## Safety

1. Never hardcode credentials.
2. Never print credential values.
3. Never commit files under `~/.reopt/`.
4. Inject secrets through a secret manager in CI.
5. Use `--dry-run` before any mutating EAV operation, and especially before `--delete-orphans`.
6. Pass arguments as arrays when invoking the CLI programmatically.
7. `.reopt.config.mjs` is trust-on-first-use (0.4.0) — it executes JS on load, so a changed/untrusted file is ignored non-interactively (stderr warning) or prompts on a TTY. In CI, set `REOPT_TRUST_CONFIG=1` to trust + record its hash, or use `.reopt.json` (exempt from TOFU).
