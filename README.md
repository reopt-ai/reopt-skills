# reopt Skills

A reusable skills repository for `reopt` engineering workflows, modeled after [`vercel-labs/agent-skills`](https://github.com/vercel-labs/agent-skills).

## Prerequisites

Most install/init skills consume `@reopt-ai/*` packages from the
[reopt-ai GitHub Packages registry](https://npm.pkg.github.com). Those
packages are currently **private** and will be made public once they
stabilize. Until then, the skills work only for contributors with
`read:packages` access to the `reopt-ai` organization.

Skills that only document CLI workflows (for example `reopt-cli`,
`reopt-brandapp`, `reopt-eav`) do not require private package access.

## Structure

Each skill lives in its own directory under `skills/<skill-name>/`:

- `SKILL.md` — agent-facing instructions (required, with YAML frontmatter)
- `README.md` — contributor-facing summary (optional)
- `metadata.json` — lightweight catalog metadata (optional)
- `command/`, `references/`, `scripts/` — optional skill assets

Directories prefixed with `_` (for example `skills/_shared/`) are shared
scaffolding templates referenced by other skills. They are not installable
as standalone skills and are skipped by the validator.

See `skills/` for the full list of published skills.

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
[CLAUDE.md](./CLAUDE.md) / [AGENTS.md](./AGENTS.md).

## License

[MIT](./LICENSE)
