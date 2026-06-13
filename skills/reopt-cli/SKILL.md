---
name: reopt-cli
description: Baseline guidance for the reopt CLI — authentication, login, global flags, security rules, and exit codes. Use before other reopt CLI skills or whenever a task involves `reopt login`, `reopt status`, brandapp credentials, or CI automation.
target: "@reopt-ai/cli"
targetMinVersion: "0.3.1"
---

# reopt CLI

> This is NOT the reopt CLI you know. Run `reopt --help` / `reopt <cmd> --help` for the live command tree, and read `node_modules/@reopt-ai/cli/README.md` for narrative guides (the CLI ships no `dist/docs/`).

## When to apply

- Any `reopt` CLI command.
- Confirming login state, writing CI/CD steps around `reopt`, scripting Brandapp OAuth credentials.
- Load before `reopt-brandapp` and `reopt-eav`.

## Step 1 — Pin agent rules into AGENTS.md / CLAUDE.md

Source: the CLI's own agent-rules file once it ships one (`@reopt-ai/cli` does not, as of 0.3.1). Fallback: `agent-rules.md` bundled with this skill. Wrap content between:

```
<!-- BEGIN:reopt/cli-agent-rules -->
…content from source…
<!-- END:reopt/cli-agent-rules -->
```

**Idempotent:** replace only between markers. This same block is shared by `reopt-brandapp` and `reopt-eav` — those skills will skip the step if the block is already present.

## Step 2 — Auth (consumer-side credentials; CLI docs cover usage)

The CLI has two credential systems:

- **User session** — `reopt login` / `reopt status` / `reopt logout`. Tokens live in `~/.reopt/auth.json`. Session auto-refreshes inside the Better Auth extension window; do not over-engineer retry loops in CI.
- **Brandapp OAuth credentials** — `BRANDAPP_CLIENT_ID` / `BRANDAPP_CLIENT_SECRET` env vars, or `reopt brandapp link` interactively. Stored in `~/.reopt/credentials.json` + `.reopt.json` (project root).

Run `reopt status` (or `reopt status --ping`) before any mutating operation. If `auth: not logged in`, run `reopt login` first.

## Step 3 — Route to module docs / `--help`

Prefer `--help` (live source of truth); the CLI ships **no** `dist/docs/`, so narrative detail lives in `node_modules/@reopt-ai/cli/README.md`:

| Task signal | Read |
|---|---|
| Any command / flag | `reopt <cmd> --help` (live) |
| Auth commands and session model | `README.md` § Authentication |
| Brandapp ops (`link`, `doctor`, `init`, `dev`, `env`, …) | `reopt brandapp --help` + see `reopt-brandapp` skill |
| EAV ops (`status`, `sync`, `pull`, `plan`, `migrate`) | `reopt brandapp eav --help` + see `reopt-eav` skill |
| Schema-as-Code, MCP, completion, config | `README.md` §§ Schema-as-Code, Shell completion, Preferences |
| Global flags, output formats, pagination | `README.md` § Output and global flags |
| Exit codes | `README.md` § Exit codes |

Quick global-flag reminders (subset; full list in `--help`):

- `--format json|table|csv|yaml` — JSON is the agent-friendly default.
- `--page-all` + `--page-limit` + `--page-delay` — paginated iteration; JSON output becomes NDJSON.
- `--no-interactive` — required for unattended scripts (fail instead of prompt).
- `--dry-run` — preview only (EAV sync, brandapp link/unlink).

Exit code summary: `0` ok, `1` API/network, `2` auth, `3` validation, `4` config, `5` internal.

## Safety

1. Never hardcode credentials.
2. Never print credential values.
3. Never commit files under `~/.reopt/`.
4. Inject secrets through a secret manager in CI.
5. Use `--dry-run` before any mutating EAV operation, and especially before `--delete-orphans`.
6. Pass arguments as arrays when invoking the CLI programmatically.
