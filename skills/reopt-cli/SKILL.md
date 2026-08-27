---
name: reopt-cli
description: Baseline guidance for the reopt CLI — authentication, login, global flags, security rules, and exit codes. Use before other reopt CLI skills or whenever a task involves `reopt login`, `reopt status`, brandapp credentials, or CI automation.
target: "@reopt-ai/cli"
targetMinVersion: "0.6.0"
---

# reopt CLI

> This is NOT the reopt CLI you know. Run `reopt --help` / `reopt <cmd> --help` for the live command tree. The CLI ships no `dist/docs/`; when narrative context is needed, locate the `README.md` from the actual CLI package installation or source checkout instead of assuming a local `node_modules` path.

## When to apply

- Any `reopt` CLI command.
- Confirming login state, writing CI/CD steps around `reopt`, scripting Brandapp OAuth credentials.
- Load before `reopt-brandapp` and `reopt-eav`.

## Step 1 — Pin agent rules into AGENTS.md / CLAUDE.md

Source: the CLI's own agent-rules file once it ships one (`@reopt-ai/cli` does not, as of 0.6.0 — its `skills/` bundle is a different thing, see Step 4). Fallback: `agent-rules.md` bundled with this skill. Wrap content between:

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
| Schema-as-Code, completion, config | relevant `--help`; installed CLI `README.md` §§ Schema-as-Code, Shell completion, Preferences |
| MCP — which server, which tools, CRM handling | **Step 4 below.** No `--help` output states that two Reopt MCP servers exist or that their tool names collide |
| Global flags, output formats, pagination | `reopt --help`; installed CLI `README.md` § Output and global flags |
| Exit codes | installed CLI `README.md` § Exit codes; summary below |

Quick global-flag reminders (subset; full list in `--help`):

- `--format json|table|csv|yaml` — JSON is the agent-friendly default. Since 0.4.0, `json`/`ndjson`/`yaml` emit **raw server items** (ids preserved, MCP-identical) to **stdout**; `table`/`csv` apply the per-command projection. Scripts that read synthesized fields (e.g. `workspace list` composite `role`) must switch to raw fields.
- `--page-all` + `--page-limit` + `--page-delay` — paginated iteration; JSON output becomes NDJSON.
- `--no-interactive` — required for unattended scripts (fail instead of prompt).
- `--dry-run` — preview only (EAV sync, brandapp link/unlink).

Exit code summary: `0` ok, `1` API/network, `2` auth, `3` validation, `4` config, `5` internal. EAV migrate/verify add `6` drift-detected, `7` destructive-blocked, `8` checksum-mismatch, `9` checksum-conflict, `10` lock-held.

## Step 4 — MCP: two servers share one tool namespace

Reopt exposes **two** MCP servers. Ten tool names are identical between them, so a client that registers both shows the model two tools for one job. Register one.

| | Remote connector | Local stdio |
|---|---|---|
| Address | `https://mcp.reopt.ai` (streamable-http; staging `mcp.reopt.io`) | `reopt mcp` |
| Auth | OAuth / dynamic client registration, handled by the client | the CLI's own session — `reopt login` first |
| Tools | **30** — 10 shared + EAV (6) + CRM (14, incl. 4 feedback/proposal) | **14** — the same 10 + 4 local-only |

- **Prefer remote.** It is the near-superset and needs no CLI login. The stdio server's 10 shared tools all fail before `reopt login`, so an unauthenticated install presents a half-broken tool list. Since 0.6.0 the installed package **is** an Agent Plugins 1.0.0 bundle: `plugin.json` + `mcp.json` (remote server only — a repo guard rejects declaring both) + `skills/` (`reopt-shared`, `reopt-brandapp`, `reopt-eav`). A client that speaks the standard discovers the remote server from `node_modules/@reopt-ai/cli` with no manual wiring; those bundled skills are the CLI's own copies and do not replace this repo's marker-pinning skills.
- **Add stdio only for its 4 local-only tools** — `reopt_status`, `reopt_brandapp_doctor`, `reopt_schema_validate`, `reopt_sdk_inspect`. They read local project files and are meaningless outside a checkout.
- **Call `reopt_workspace_list` first, always.** A guessed `workspaceId` returns an **empty result, not an error** — the one failure mode a model cannot diagnose on its own. A workspace-bound connector sees only its bound workspace there.
- Since 0.6.0 both surfaces advertise `title` + `readOnlyHint` / `destructiveHint` / `idempotentHint` / `openWorldHint` on every tool, so approval-gating clients can auto-allow reads. A 0.5.0 `reopt mcp` still ships **no annotations** (everything is "ask"). The stdio server speaks MCP 2026-07-28 and still accepts 2025-era clients.

### CRM tools are governed differently

`reopt_customer_*` / `reopt_segment_*` / `reopt_journey_*` (remote only) are the only tools that emit names, emails, phones, and addresses. Four independent layers guard them — treat each as load-bearing:

- **Scope** — `customer:read` / `customer:write`, not `workspace:read`, and deliberately excluded from connector defaults. A connector that never asked is refused rather than silently granted; an existing connector needs re-consent.
- **Workspace binding is mandatory** here, while other tools tolerate an unbound consent. Consents granted before 2026-08-21 are unbound (unrestricted).
- **Masking is the tool shape, not a flag.** `reopt_customer_list` / `reopt_segment_preview` have **no unmask parameter at all** — a roster cannot leave in one call. Raw values open only in single-record `reopt_customer_get`, which spends the **write** quota (10/min vs 100/min read) and is audit-flagged. Read each response's `pii: "masked" | "raw"` rather than treating a masked value as a real address.
- **`customData` keys are attribute UUIDs.** `reopt_customer_get` attaches labels (orphaned key → `label: null`); `reopt_customer_field_list` returns the workspace definitions, and segment `customAttribute` conditions take the same ids — without it those filters are unreachable.

Writes on this surface are `reopt_customer_note_add` plus two **proposals** — `reopt_customer_feedback_propose_reply` and `reopt_customer_propose_note` (0.6.0). A proposal sends nothing and changes no CRM state: it queues a `WorkspaceProposal` for a workspace member to edit, approve, or dismiss in Studio. Check `reopt_customer_feedback_get.pendingProposals` before proposing to avoid duplicates. `reopt_customer_feedback_list` / `_get` (read, `customer:read`) expose the full thread and linked tasks. Creating customers, editing attributes, sending messages, and deleting were left off deliberately — do not simulate one through the CLI or SDK unless the user asks for it directly.

## Safety

1. Never hardcode credentials.
2. Never print credential values.
3. Never commit files under `~/.reopt/`.
4. Inject secrets through a secret manager in CI.
5. Use `--dry-run` before any mutating EAV operation, and especially before `--delete-orphans`.
6. Pass arguments as arrays when invoking the CLI programmatically.
7. `.reopt.config.mjs` is trust-on-first-use (0.4.0) — it executes JS on load, so a changed/untrusted file is ignored non-interactively (stderr warning) or prompts on a TTY. In CI, set `REOPT_TRUST_CONFIG=1` to trust + record its hash, or use `.reopt.json` (exempt from TOFU).
