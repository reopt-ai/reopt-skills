# This is NOT the reopt CLI you know

`@reopt-ai/cli` adds subcommands and shifts flag semantics frequently. Run `reopt --help` (or `reopt <subcommand> --help`) to see the live command tree before scripting anything. The CLI ships no `dist/docs/`; for narrative guides, locate the `README.md` from the actual CLI package installation or source checkout instead of assuming a local `node_modules` path.

## Doc map

| Task | Read (`--help` is live source of truth; CLI ships no docs dir) |
|---|---|
| Any command / flag | `reopt <cmd> --help` |
| Auth, status, session model | `reopt login --help`, `reopt status --help`; installed CLI `README.md` § Authentication |
| Brandapp / EAV ops | `reopt brandapp --help`, `reopt brandapp eav --help` |
| Schema-as-Code, completion, config | relevant `--help`; installed CLI `README.md` §§ Schema-as-Code, Shell completion, Preferences |
| MCP (which server, which tools, CRM rules) | the MCP rules below — there are **two** Reopt MCP servers with colliding tool names, and no `--help` output says so |
| Global flags, output formats, pagination | `reopt --help`; installed CLI `README.md` § Output and global flags |
| Exit codes | installed CLI `README.md` § Exit codes |

## Hard rules

- Never hardcode credentials. Inject via shell / CI secret.
- Never print credential values.
- Never commit anything under `~/.reopt/`.
- Always `--dry-run` before a destructive EAV sync. Since CLI 0.4.0 `eav sync` is safe-mode: `--delete-orphans`, `isRequired`/`isUnique` promotions, and select-option removals are blocked (exit `7`) unless you also pass `--force`.
- Pass arguments as arrays when invoking the CLI programmatically (`spawn(["reopt", "brandapp", "eav", "sync"])`, not a string).
- `experimental` subcommands (`brandapp dev`, `brandapp env *`, `eav migrate *`) may shift — surface the label when recommending.
- `reopt mcp` bypasses commander; standard `--help` and option parsing do not apply.
- **Two Reopt MCP servers exist and 10 of their tool names collide — register one, never both.** Remote connector `https://mcp.reopt.ai` (streamable-http, client-side OAuth) advertises 26 tools: the 10 shared ones plus EAV (6) and CRM (10). Local stdio `reopt mcp` advertises 14: the same 10 plus 4 local-only. Declaring both gives the model two tools for one job; Reopt's own agent-plugin packaging settled on remote-only for this reason, with a guard that fails a plugin declaring both (that manifest ships after CLI 0.5.0 — it is not in an installed 0.5.0).
- **Prefer the remote server.** It is the near-superset and the client handles OAuth. The stdio server's 10 shared tools all fail before `reopt login`, so an unauthenticated install looks half-broken. Add stdio only for its 4 local-only tools — `reopt_status`, `reopt_brandapp_doctor`, `reopt_schema_validate`, `reopt_sdk_inspect` — which read local project files and mean nothing without a checkout.
- **Call `reopt_workspace_list` before any other MCP tool.** A guessed `workspaceId` returns an **empty result, not an error** — the one failure a model cannot diagnose. A workspace-bound connector sees only its bound workspace in that list.
- **CRM tools (`reopt_customer_*` / `reopt_segment_*` / `reopt_journey_*`, remote only) run under different rules** — they are the only tools that emit names, emails, phones, and addresses. They need `customer:read` / `customer:write` (not `workspace:read`), which is excluded from connector defaults, so a connector that never asked is refused rather than silently granted. Workspace binding is **mandatory** here even though other tools tolerate an unbound consent.
- **Customer PII is masked by default and the boundary is the tool shape, not a flag.** `reopt_customer_list` / `reopt_segment_preview` have **no unmask parameter at all** — a roster cannot be exported in one call. Raw values open only in single-record `reopt_customer_get`, which spends the **write** quota (10/min vs 100/min read) and is audit-flagged. Read the `pii: "masked" | "raw"` field on each response instead of treating a masked value as a real address.
- **`customData` keys are attribute UUIDs, not labels.** `reopt_customer_get` attaches labels (an orphaned key comes back `label: null`); `reopt_customer_field_list` returns the workspace's definitions. Segment `customAttribute` conditions take the same ids, so that tool is the only route to those filters.
- **`reopt_customer_note_add` is the only write on the CRM surface.** There is no create / update / send / delete — creating customers, editing attributes, or sending messages was deliberately left off. Do not simulate one through the CLI or SDK on a model's initiative.
- Session tokens auto-refresh inside the Better Auth extension window — don't bake retry/relogin loops without checking `reopt status` first.
- CLI flag semantics for env-var injection follow `@reopt-ai/brandapp-sdk` 2.0 (`BRANDAPP_*` / `REOPT_*` / `BRANDAPP_SDK_*`). The CLI's own preference store is `~/.reopt/preferences.json` (`reopt config get/set`).
