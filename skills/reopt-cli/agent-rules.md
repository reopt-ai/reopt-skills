# This is NOT the reopt CLI you know

`@reopt-ai/cli` adds subcommands and shifts flag semantics frequently. Run `reopt --help` (or `reopt <subcommand> --help`) to see the live command tree before scripting anything. The CLI ships no `dist/docs/` — read `node_modules/@reopt-ai/cli/README.md` for narrative guides.

## Doc map

| Task | Read (`--help` is live source of truth; CLI ships no docs dir) |
|---|---|
| Any command / flag | `reopt <cmd> --help` |
| Auth, status, session model | `README.md` § Authentication |
| Brandapp / EAV ops | `reopt brandapp --help`, `reopt brandapp eav --help` |
| Schema-as-Code, MCP, completion, config | `README.md` §§ Schema-as-Code, Shell completion, Preferences |
| Global flags, output formats, pagination | `README.md` § Output and global flags |
| Exit codes | `README.md` § Exit codes |

## Hard rules

- Never hardcode credentials. Inject via shell / CI secret.
- Never print credential values.
- Never commit anything under `~/.reopt/`.
- Always `--dry-run` before `--delete-orphans` on EAV sync.
- Pass arguments as arrays when invoking the CLI programmatically (`spawn(["reopt", "brandapp", "eav", "sync"])`, not a string).
- `experimental` subcommands (`brandapp dev`, `brandapp env *`, `eav migrate *`) may shift — surface the label when recommending.
- `reopt mcp` bypasses commander; standard `--help` and option parsing do not apply.
- Session tokens auto-refresh inside the Better Auth extension window — don't bake retry/relogin loops without checking `reopt status` first.
- CLI flag semantics for env-var injection follow `@reopt-ai/brandapp-sdk` 2.0 (`BRANDAPP_*` / `REOPT_*` / `BRANDAPP_SDK_*`). The CLI's own preference store is `~/.reopt/preferences.json` (`reopt config get/set`).
