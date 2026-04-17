# Contributing

Thanks for your interest in improving `reopt-skills`.

## Scope

This repository ships agent skills that target `reopt` engineering
workflows. A good contribution is a skill (or edit) that captures
reusable, organization-specific knowledge an AI agent would not get from
general training data. Prefer sharp operational guidance over generic
explanations.

## Languages

- **All skill content is authored in English**: SKILL.md bodies, READMEs,
  references, command files, commit messages, PR titles/bodies, and
  comments.
- Trigger keywords in `SKILL.md` frontmatter may include non-English
  aliases when that genuinely helps matching (for example, localized
  phrases alongside English). Everything else stays English.

## Skill authoring rules

- Skill names are lowercase kebab-case and **must** match the folder
  name under `skills/`.
- `SKILL.md` frontmatter requires at least `name` and `description`.
- Keep `SKILL.md` focused on: trigger conditions, workflow, safety rules,
  and sharp operational guidance. Move long examples to `references/`.
- Directories prefixed with `_` (for example `skills/_shared/`) are
  shared scaffolding — not installable skills. The validator skips them.
- Do not commit zip artifacts. Distribution is via the `skills` CLI,
  which consumes the directory structure directly from git.

## What not to include

- Internal hostnames, dev URLs, or credentials.
- Absolute filesystem paths from a contributor's machine.
- Company-internal acronyms without explanation.
- Binary assets under `skills/<name>/` unless the skill genuinely needs
  them. When in doubt, link to them externally instead.

## Development workflow

```bash
pnpm install       # Install dev tooling (minimal)
pnpm validate      # Validate skill structure + frontmatter
```

Validation checks:
- Every skill directory has a `SKILL.md` with frontmatter `name` and
  `description`.
- `name` matches the directory name.
- `metadata.json` (if present) parses as JSON.

## Proposing a change

1. Fork the repository.
2. Create a branch (`feat/<skill-or-change>`).
3. Make changes, run `pnpm validate`.
4. Commit with a focused message (English; explain the **why** in the
   body when the change is non-obvious).
5. Open a pull request against `main`.

### Pull request checklist

- [ ] `pnpm validate` passes.
- [ ] No Korean or other non-English prose slipped into skill content.
- [ ] No internal hostnames or credentials introduced.
- [ ] New skills include `SKILL.md`, `README.md`, and `metadata.json`.
- [ ] PR description explains motivation and testing approach.

## Reporting issues

Use GitHub Issues for bugs, unclear guidance, or requests for new
skills. When reporting a problem, include:

- The skill you invoked and the exact trigger phrase.
- The agent runtime (Claude Code, Codex, Cline, etc.).
- The observed vs. expected behavior.

## License

By contributing, you agree that your contributions will be licensed
under this repository's [MIT License](./LICENSE).
