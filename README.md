# reopt Skills

A reusable skills repository for `reopt` engineering workflows, modeled after [`vercel-labs/agent-skills`](https://github.com/vercel-labs/agent-skills).

## Prerequisites

Most install skills consume `@reopt-ai/*` packages from the
[reopt-ai GitHub Packages registry](https://npm.pkg.github.com). Those
packages are currently **private** and will be made public once they
stabilize. Until then, the install skills work only for contributors with
`read:packages` access to the `reopt-ai` organization.

The CLI workflow skills (`reopt-cli`, `reopt-brandapp`, `reopt-eav`) do
not require private package access.

## Skills

### CLI workflows

No private package access required.

| Skill | Purpose |
| --- | --- |
| [`reopt-cli`](./skills/reopt-cli/) | Baseline CLI guidance — authentication, login, global flags, security rules, exit codes |
| [`reopt-brandapp`](./skills/reopt-brandapp/) | Brandapp management — `list` / `link` / `unlink` / `doctor` / `term list` |
| [`reopt-eav`](./skills/reopt-eav/) | EAV schema `status` / `sync` / `pull` with destructive-change guards |

### Brandapp SDK integration

For projects that consume `@reopt-ai/brandapp-sdk`.

| Skill | Purpose |
| --- | --- |
| [`brandapp-sdk-install`](./skills/brandapp-sdk-install/) | Scaffold `.npmrc`, env, `createLazySDK`, Better Auth, EAV schema, webhook handler |
| [`brandapp-sdk-review`](./skills/brandapp-sdk-review/) | Audit consumer code for SDK anti-patterns (EAV, Auth, Error, Config, Schema, Perf, React, Webhook, Debug) |

### Package install / upgrade

For projects that consume the `@reopt-ai/opt-*` component packages.

| Skill | Purpose |
| --- | --- |
| [`opt-ui-install`](./skills/opt-ui-install/) | Tailwind v4 + `OptThemeProvider` + theme boot script, 26-check doctor, Surface CLI workflow |
| [`opt-editor-install`](./skills/opt-editor-install/) | Block catalog + Editor component, 18-check doctor, optional AI streaming (`--with-ai`) |
| [`opt-chat-install`](./skills/opt-chat-install/) | AI SDK endpoint + starter Conversation scaffold |
| [`opt-datagrid-install`](./skills/opt-datagrid-install/) | Install / upgrade / migrate (glide-data-grid, ag-grid, react-data-grid, MUI DataGrid → opt-datagrid) |
| [`opt-harness-install`](./skills/opt-harness-install/) | Harness manifest + `HarnessProvider` + AppShell + first Workspace page from a recipe |

### Shared templates

Scaffolding referenced by multiple skills — not installable on its own.

| Path | Purpose |
| --- | --- |
| [`_shared/upgrade-pipeline.md`](./skills/_shared/upgrade-pipeline.md) | Common 7-step upgrade pipeline (currently used by `opt-editor-install`) |

## Structure

Each skill lives in its own directory under `skills/<skill-name>/`:

- `SKILL.md` — agent-facing instructions (required, with YAML frontmatter)
- `README.md` — contributor-facing summary (optional)
- `metadata.json` — lightweight catalog metadata (optional)
- `command/`, `references/`, `scripts/` — optional skill assets

Directories prefixed with `_` (for example `skills/_shared/`) are shared
scaffolding templates referenced by other skills. They are not installable
as standalone skills and are skipped by the validator.

## Install

Distribute via the [`skills` CLI](https://skills.sh) — it clones the
repository and copies the skill directory into your agent runtime.

```bash
npx skills add reopt-ai/reopt-skills
```

Install a specific skill only:

```bash
npx skills add reopt-ai/reopt-skills/reopt-eav
```

No zip archive is required — the CLI consumes the directory structure
directly from git.

## Development

```bash
pnpm validate    # Validate skill structure and frontmatter
```

`pnpm sync:cli` is for reopt internal maintainers only — see
[AGENTS.md](./AGENTS.md).

## License

[MIT](./LICENSE)
