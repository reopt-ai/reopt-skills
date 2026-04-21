---
name: reopt-cli
description: Baseline guidance for the reopt CLI — authentication, login, global flags, security rules, and exit codes. Use before other reopt CLI skills or whenever a task involves `reopt login`, `reopt status`, brandapp credentials, or CI automation.
---

# reopt CLI

Baseline guidance for the `reopt` CLI. Load this before resource-specific `reopt` skills.

## When to Apply

Use this skill when:

- a task involves any `reopt` CLI command
- you need to confirm login state
- automation needs Brandapp OAuth credentials
- you are writing CI/CD steps around `reopt`

## Authentication

The CLI has two credential systems.

### User session

Use for interactive browsing and linking:

```bash
reopt login
reopt login --server https://app.reopt.ai
reopt status
```

Session tokens live in `~/.reopt/auth.json`.

### Brandapp OAuth credentials

Use for SDK calls and EAV sync:

```bash
export REOPT_CLIENT_ID=your_client_id
export REOPT_CLIENT_SECRET=your_client_secret
```

Or create them interactively:

```bash
reopt brandapp link
```

These credentials are written to `~/.reopt/credentials.json` and `.reopt.json` in the project root.

## Check Auth State

Run this before mutating operations:

```bash
reopt status
```

If status shows `auth: not logged in`, run `reopt login` first.

## Global Flags

| Flag | Default | Purpose |
| --- | --- | --- |
| `--json` | off | Emit machine-readable JSON |
| `--verbose` | off | Show detailed diff data |
| `--dry-run` | off | Preview changes without applying |
| `--delete-orphans` | off | Include or apply removal of server-only attrs |
| `-s, --schema <path>` | `./eav.schema.ts` | Custom EAV schema path |
| `-o, --out <path>` | varies | Custom output path |
| `-w, --watch` | off | Watch file changes for sync |

## Security Rules

1. Never hardcode credentials.
2. Never print credential values.
3. Never commit files under `~/.reopt/`.
4. Inject secrets through a secret manager in CI.
5. Use `--dry-run` before any mutating EAV operation.
6. When invoking the CLI programmatically, pass arguments as arrays.

## Schema Discovery

```bash
reopt brandapp eav pull --out ./eav.schema.ts
reopt brandapp eav status --json
reopt brandapp eav status --delete-orphans --json
```

## Exit Codes

| Code | Meaning |
| --- | --- |
| `0` | Success |
| `1` | API or network error |
| `2` | Auth error |
| `3` | Validation error |
| `4` | Config error |
| `5` | Internal error |

