# reopt Skills

A reusable skills repository for `reopt` engineering workflows — installable into any agent runtime that supports the [`skills`](https://skills.sh) CLI (Claude Code, Cursor, Codex, Cline, Gemini CLI, and 15+ more).

> 한국어 문서는 [README_KO.md](./README_KO.md) 를 보세요.
>
> Every package targeted by these skills is available from the public npm registry. No GitHub Packages token or scoped `.npmrc` entry is required.
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
2. **Route the agent to module docs.** Each `@reopt-ai/*` package ships its own docs — `dist/docs/` (opt-ui / opt-datagrid / opt-editor), top-level `docs/` (brandapp-sdk), or `README.md` / `shell-llms.txt` (cli, opt-chat, opt-shell). SKILL.md does not duplicate API surface — it tells the agent which doc to read for which task and pins package-level invariants the docs can't enforce (legacy registry cleanup, env-namespace rules, peer deps, destructive guardrails).

Until a target package publishes its own `dist/agent-rules.md`, each skill ships a fallback `agent-rules.md` alongside SKILL.md.

## Skills

### CLI workflows

Guidance for the `reopt` CLI itself. The CLI is public on npm.

| Skill | What it covers |
| --- | --- |
| [`reopt-cli`](./skills/reopt-cli/) | Baseline rules every other reopt skill loads first — auth (`login` / `status` / `logout`), global flags, MCP server, `config get/set`, exit codes, secret handling. Pins the shared `reopt/cli-agent-rules` block. |
| [`reopt-brandapp`](./skills/reopt-brandapp/) | `brandapp list` / `link` / `unlink` / `doctor` / `term list`, project scaffolding via `init`, the offline `dev` + `seed` flow, and sandbox `env list/create/use/destroy`. |
| [`reopt-eav`](./skills/reopt-eav/) | EAV schema lifecycle: `status` / `sync` / `pull` / `diff`, migration `plan` / `migrate` / `history` / `verify`, plus safe-mode and `--delete-orphans --force` guardrails. |

### Brandapp SDK integration

For consumer projects that use `@reopt-ai/brandapp-sdk`. Runs **inside the consumer app**, not against the CLI.

| Skill | What it covers |
| --- | --- |
| [`brandapp-sdk-install`](./skills/brandapp-sdk-install/) | Pins `reopt/brandapp-sdk-agent-rules`, removes legacy registry overrides, sets up the env namespace + peers, and routes to the installed docs for Auth, EAV, subscription webhooks, Plans checkout, Files, logout, CMS, and errors. |
| [`brandapp-sdk-review`](./skills/brandapp-sdk-review/) | Audit existing SDK usage. Lists anti-patterns across 10 categories (init / Auth / Error / Config / Schema / Perf / React / Webhook / Debug / CMS) with grep keys; routes the agent to the module's `docs/` for canonical fixes. |

### Data SDK integration

For consumer projects that send browser and server analytics to reopt Data. Internal SDK development workflows stay in the `reopt-data` repository and are not distributed here.

| Skill | What it covers |
| --- | --- |
| [`data-sdk-install`](./skills/data-sdk-install/) | Install or upgrade the public client/server suite. Next.js App Router first, including request-scoped identity, bootstrap, first-party ingest, consent, and optional devtools. |
| [`data-sdk-review`](./skills/data-sdk-review/) | Read-only audit of package versions, credential boundaries, Next.js proxy/bootstrap, identity, consent, delivery, and devtool exposure. |

### Package install / upgrade

For consumer projects that use the `@reopt-ai/opt-*` component packages.

| Skill | What it covers |
| --- | --- |
| [`opt-ui-install`](./skills/opt-ui-install/) | Tailwind v4 + `OptThemeProvider` + optional app-frame CSS + Block CLI (`opt-cli block add/doctor`). |
| [`opt-editor-install`](./skills/opt-editor-install/) | Editor component + recipes + 2.0 schema/data migration gate + optional AI streaming (`--with-ai`). |
| [`opt-chat-install`](./skills/opt-chat-install/) | AI SDK 7 endpoint + Conversation scaffold, including the 1.1 native-form `PromptInput` contract. |
| [`opt-datagrid-install`](./skills/opt-datagrid-install/) | Install / upgrade / migrate from glide-data-grid, ag-grid, react-data-grid, MUI DataGrid. |
| [`opt-shell-install`](./skills/opt-shell-install/) | Product-frame layer (formerly opt-harness): workspace recipes, document-level policy, persisted preferences/shortcuts, adapters, and state boundaries. Required peer: opt-palette; optional adapter peers: opt-datagrid, opt-editor, opt-calendar. |

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
| Add reopt Data analytics to a consumer app | `data-sdk-install` |
| Audit an existing reopt Data SDK integration | `data-sdk-review` |
| Adopt or upgrade an `opt-*` component package (incl. the `opt-shell` product frame) | the matching `opt-*-install` skill |

## Typical adoption order

For a new Brandapp + Next.js consumer:

1. `reopt-cli` — log in (`reopt login`).
2. `reopt-brandapp` — `link` the project; optionally `init` for the dev-server bootstrap.
3. `reopt-eav` — author `eav.schema.ts`, then `eav sync` to publish.
4. `brandapp-sdk-install` — pin agent-rules, clear any legacy registry override, and wire SDK + Better Auth route handlers via module docs.
5. (over time) `brandapp-sdk-review` — periodic audit as the SDK evolves.

`reopt-brandapp init` and `brandapp-sdk-install` are complementary, not duplicates: `init` writes the **dev-mode** files (`.env.development`, `reopt.seed.ts`, `lib/dev-server.ts`, `instrumentation.ts`, `package.json` `dev:local` script, `.gitignore` `.reopt/`); `brandapp-sdk-install` writes the **SDK app code** by routing through module docs (`.env.local`, `lib/sdk.ts`, `lib/auth*.ts`, auth route handler, optional webhook) and removes a legacy project-level registry override when present. Run both for a full local-dev-capable greenfield setup.

For reopt Data, run `data-sdk-install` against an existing project and credentials, then use `data-sdk-review` as a release or upgrade gate. These public skills do not create remote Data resources and do not contain the internal SDK contributor loop.

## Structure

Each skill lives in its own directory under `skills/<skill-name>/`:

- `SKILL.md` — agent-facing instructions (required, with YAML frontmatter, ≤ 150 lines).
- `agent-rules.md` — fallback marker-block source for the transition period.
- `README.md` — contributor-facing summary (optional).
- `metadata.json` — lightweight catalog metadata (optional).

Subdirectories (`command/`, `references/`, `scripts/`) were retired in v2. Long-form content lives in the target package's docs (`dist/docs/`, top-level `docs/`, or `README.md` / `shell-llms.txt`, depending on the package).

## Development

```bash
pnpm validate    # Validate skill structure, frontmatter, line budget, marker convention
```

`pnpm sync:cli` is for reopt internal maintainers only — see [AGENTS.md](./AGENTS.md).

## License

[MIT](./LICENSE)
