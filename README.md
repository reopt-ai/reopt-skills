# reopt Skills

A reusable skills repository for `reopt` engineering workflows — installable into any agent runtime that supports the [`skills`](https://skills.sh) CLI (Claude Code, Cursor, Codex, Cline, Gemini CLI, and 15+ more).

> 한국어 문서는 [README_KO.md](./README_KO.md) 를 보세요.

> The skills-related modules and CLI are scheduled for public release in **May 2026**.

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

## Skills

### CLI workflows

Guidance for the `reopt` CLI itself. No private package access required.

| Skill | What it covers |
| --- | --- |
| [`reopt-cli`](./skills/reopt-cli/) | Baseline rules every other reopt skill loads first — `login` / `status`, global flags (`--format`, `--fields`, paging, retries), MCP, `config get/set`, exit codes, secret-handling rules. |
| [`reopt-brandapp`](./skills/reopt-brandapp/) | Brandapp lifecycle outside EAV: `list` / `link` / `unlink` / `doctor` / `term list`, project scaffolding via `init` (dev-mode bootstrap), the offline `dev` + `seed` flow, and sandbox `env list/create/use/destroy`. |
| [`reopt-eav`](./skills/reopt-eav/) | EAV schema lifecycle: `status` / `sync` / `pull` / `plan` for the live flow, `migrate create/run/status/validate` for file-based migrations, plus the `--delete-orphans` destructive-change guardrail. |

### Brandapp SDK integration

For consumer projects that use `@reopt-ai/brandapp-sdk`. These run **inside the consumer app**, not against the CLI.

| Skill | What it covers |
| --- | --- |
| [`brandapp-sdk-install`](./skills/brandapp-sdk-install/) | Greenfield SDK setup: `.npmrc` (GitHub Packages auth), `.env.local` template + zod env validation, `lib/sdk.ts` (`createLazySDK`), `lib/auth.ts` + `lib/auth-client.ts` (Better Auth + OAuth), `app/api/auth/[...all]/route.ts`, optional `lib/eav.schema.ts`, optional webhook handler, optional 1.8+ marketing-site helpers (`toMetadata`, `toSitemapItems`, `toRssFeed`, `verifySession`, `optimizeUrl`), and the verification checklist. |
| [`brandapp-sdk-review`](./skills/brandapp-sdk-review/) | Audit existing SDK usage and propose concrete fixes. Covers EAV (singletons, load-all + filter, manual upsert, manual pagination, per-item bulk loops, enum/coerce helpers, count), Auth (route protection, sign-out error handling, session caching), Error / Config / Schema / Perf / React / Webhook / Debug, and 1.8+ CMS / external-site patterns. Emits a categorized report and offers per-finding auto-apply. |

### Package install / upgrade

For consumer projects that use the `@reopt-ai/opt-*` component packages.

| Skill | What it covers |
| --- | --- |
| [`opt-ui-install`](./skills/opt-ui-install/) | Tailwind v4 + `OptThemeProvider` + theme boot script, 26-check doctor, Surface CLI workflow. |
| [`opt-editor-install`](./skills/opt-editor-install/) | Block catalog + Editor component, 18-check doctor, optional AI streaming (`--with-ai`). |
| [`opt-chat-install`](./skills/opt-chat-install/) | AI SDK endpoint + starter Conversation scaffold. |
| [`opt-datagrid-install`](./skills/opt-datagrid-install/) | Install / upgrade / migrate (glide-data-grid, ag-grid, react-data-grid, MUI DataGrid → opt-datagrid). |
| [`opt-harness-install`](./skills/opt-harness-install/) | Harness manifest + `HarnessProvider` + AppShell + first Workspace page from a recipe. |

### Shared templates

Scaffolding referenced by multiple skills — not installable on its own.

| Path | Purpose |
| --- | --- |
| [`_shared/upgrade-pipeline.md`](./skills/_shared/upgrade-pipeline.md) | Common 7-step upgrade pipeline (currently used by `opt-editor-install`). |
| [`_shared/breaking-changes-template.md`](./skills/_shared/breaking-changes-template.md) | Required shape for each install skill's `references/breaking-changes.md`. |

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
4. `brandapp-sdk-install` — install the SDK and wire `lib/sdk.ts` / Better Auth / route handlers / optional webhook.
5. (over time) `brandapp-sdk-review` — periodic audit as the SDK evolves.

`reopt-brandapp init` and `brandapp-sdk-install` are complementary, not duplicates: `init` writes the **dev-mode** files (`.env.development`, `reopt.seed.ts`, `lib/dev-server.ts`, `instrumentation.ts`, `package.json` `dev:local` script, `.gitignore` `.reopt/`); `brandapp-sdk-install` writes the **SDK app code** (`.npmrc`, `.env.local`, `lib/sdk.ts`, `lib/auth*.ts`, auth route handler, optional webhook). Run both for a full local-dev-capable greenfield setup.

## Structure

Each skill lives in its own directory under `skills/<skill-name>/`:

- `SKILL.md` — agent-facing instructions (required, with YAML frontmatter)
- `README.md` — contributor-facing summary (optional)
- `metadata.json` — lightweight catalog metadata (optional)
- `command/`, `references/`, `scripts/` — optional skill assets

Directories prefixed with `_` (for example `skills/_shared/`) are shared
scaffolding templates referenced by other skills. They are not installable
as standalone skills and are skipped by the validator.

## Development

```bash
pnpm validate    # Validate skill structure and frontmatter
```

`pnpm sync:cli` is for reopt internal maintainers only — see
[AGENTS.md](./AGENTS.md).

## License

[MIT](./LICENSE)
