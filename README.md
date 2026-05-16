# reopt Skills

A reusable skills repository for `reopt` engineering workflows — installable into any agent runtime that supports the [`skills`](https://skills.sh) CLI (Claude Code, Cursor, Codex, Cline, Gemini CLI, and 15+ more).

> 한국어 문서는 [README_KO.md](./README_KO.md) 를 보세요.
>
> The skills-related modules and CLI are scheduled for public release in **May 2026**.
>
> **Upgrading from v1.x?** See [MIGRATION-v2.md](./MIGRATION-v2.md) for the slim-skill rewrite.

## Quickstart

Install every skill into your agent runtime:

```bash
npx skills add reopt-ai/reopt-skills
```

Or install a single skill:

```bash
npx skills add reopt-ai/reopt-skills/reopt-eav
```

Skill pages on the directory: [`skills.sh/reopt-ai/reopt-skills`](https://skills.sh/reopt-ai/reopt-skills).

## How these skills work (v2)

Each skill has two jobs:

1. **Pin an agent-rules marker block** into the consumer project's `AGENTS.md` (or `CLAUDE.md`). The block is bracketed with `<!-- BEGIN:reopt/<pkg>-agent-rules -->` … `<!-- END:reopt/<pkg>-agent-rules -->` markers, so a re-install or version bump replaces only the block content and leaves everything else untouched. The Next.js community uses the same pattern.
2. **Route the agent to module docs.** Each `@reopt-ai/*` package ships its own `dist/docs/`. SKILL.md does not duplicate API surface — it tells the agent which doc to read for which task and pins package-level invariants the docs can't enforce (`.npmrc`, env-namespace rules, peer deps, destructive guardrails).

Until a target package publishes its own `dist/agent-rules.md`, each skill ships a fallback `agent-rules.md` alongside SKILL.md.

## Skills

### CLI workflows

Guidance for the `reopt` CLI itself. No private package access required.

| Skill | What it covers |
| --- | --- |
| [`reopt-cli`](./skills/reopt-cli/) | Baseline rules every other reopt skill loads first — auth (`login` / `status` / `logout`), global flags, MCP server, `config get/set`, exit codes, secret handling. Pins the shared `reopt/cli-agent-rules` block. |
| [`reopt-brandapp`](./skills/reopt-brandapp/) | `brandapp list` / `link` / `unlink` / `doctor` / `term list`, project scaffolding via `init`, the offline `dev` + `seed` flow, and sandbox `env list/create/use/destroy`. |
| [`reopt-eav`](./skills/reopt-eav/) | EAV schema lifecycle: `status` / `sync` / `pull` / `plan` (live flow), `migrate create/run/status/validate` (file-based, experimental), plus the `--delete-orphans` guardrail. |

### Brandapp SDK integration

For consumer projects that use `@reopt-ai/brandapp-sdk`. Runs **inside the consumer app**, not against the CLI.

| Skill | What it covers |
| --- | --- |
| [`brandapp-sdk-install`](./skills/brandapp-sdk-install/) | Pins `reopt/brandapp-sdk-agent-rules`, sets up `.npmrc` (GitHub Packages auth) + env 3-tier namespace (`BRANDAPP_*` / `REOPT_*` / `BRANDAPP_SDK_*`) + peer deps, routes the agent to module docs for `lib/sdk.ts`, `lib/auth.ts`, EAV schema, webhooks, marketing-site helpers, errors. |
| [`brandapp-sdk-review`](./skills/brandapp-sdk-review/) | Audit existing SDK usage. Lists 36 anti-patterns grouped by category (init / Auth / Error / Config / Schema / Perf / React / Webhook / Debug / CMS) with grep keys; routes the agent to `dist/docs/` for canonical fixes. |

### Package install / upgrade

For consumer projects that use the `@reopt-ai/opt-*` component packages.

| Skill | What it covers |
| --- | --- |
| [`opt-ui-install`](./skills/opt-ui-install/) | Tailwind v4 + `OptThemeProvider` + 26-check doctor + Surface CLI workflow. |
| [`opt-editor-install`](./skills/opt-editor-install/) | Block catalog + Editor component + 18-check doctor + optional AI streaming (`--with-ai`). |
| [`opt-chat-install`](./skills/opt-chat-install/) | AI SDK endpoint + Conversation scaffold; Vercel AI SDK compatible. |
| [`opt-datagrid-install`](./skills/opt-datagrid-install/) | Install / upgrade / migrate from glide-data-grid, ag-grid, react-data-grid, MUI DataGrid. |
| [`opt-harness-install`](./skills/opt-harness-install/) | HarnessAppShell + responsive Nav + first Workspace page from one of 5 recipes. Depends on opt-ui, opt-palette; integrates opt-datagrid / opt-editor. |

## Choosing a skill

Two axes decide which skill applies:

- **What you operate on** — the `reopt` CLI, or `@reopt-ai/*` package code in a consumer app.
- **What stage you're at** — installing for the first time, or auditing existing usage.

| You want to… | Use |
| --- | --- |
| Authenticate the CLI, set global flags, manage secrets | `reopt-cli` |
| Link a directory to a brandapp, run the offline dev server, manage sandbox envs | `reopt-brandapp` |
| Diff / sync / pull / migrate the EAV schema | `reopt-eav` |
| Add `@reopt-ai/brandapp-sdk` to a Next.js app for the first time | `brandapp-sdk-install` |
| Audit an existing app's SDK usage for anti-patterns | `brandapp-sdk-review` |
| Adopt or upgrade an `opt-*` component package | the matching `opt-*-install` skill |

## Typical adoption order

For a new Brandapp + Next.js consumer:

1. `reopt-cli` — log in (`reopt login`).
2. `reopt-brandapp` — `link` the project; optionally `init` for the dev-server bootstrap.
3. `reopt-eav` — author `eav.schema.ts`, then `eav sync` to publish.
4. `brandapp-sdk-install` — pin agent-rules, write `.npmrc`, wire SDK + Better Auth route handlers via module docs.
5. (over time) `brandapp-sdk-review` — periodic audit as the SDK evolves.

`reopt-brandapp init` and `brandapp-sdk-install` are complementary, not duplicates: `init` writes the **dev-mode** files (`.env.development`, `reopt.seed.ts`, `lib/dev-server.ts`, `instrumentation.ts`, `package.json` `dev:local` script, `.gitignore` `.reopt/`); `brandapp-sdk-install` writes the **SDK app code** by routing through module docs (`.npmrc`, `.env.local`, `lib/sdk.ts`, `lib/auth*.ts`, auth route handler, optional webhook). Run both for a full local-dev-capable greenfield setup.

## Structure

Each skill lives in its own directory under `skills/<skill-name>/`:

- `SKILL.md` — agent-facing instructions (required, with YAML frontmatter, ≤ 150 lines).
- `agent-rules.md` — fallback marker-block source for the transition period.
- `README.md` — contributor-facing summary (optional).
- `metadata.json` — lightweight catalog metadata (optional).

Subdirectories (`command/`, `references/`, `scripts/`) were retired in v2. Long-form content lives in the target package's `dist/docs/`.

## Development

```bash
pnpm validate    # Validate skill structure, frontmatter, line budget, marker convention
```

`pnpm sync:cli` is for reopt internal maintainers only — see [AGENTS.md](./AGENTS.md).

## License

[MIT](./LICENSE)
