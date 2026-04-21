# Breaking Changes Registry Template

Use this template when a new install / upgrade skill needs a
`references/breaking-changes.md`. Existing skills already follow it; keep
the shape stable so the shared upgrade pipeline (`upgrade-pipeline.md`)
can consume every registry the same way.

## Required shape

```markdown
# Breaking Changes Registry — @reopt-ai/<package>

<One-line summary of what this file records.>
The `/<skill-name>` skill reads this file during impact analysis in upgrade mode.

> **Maintenance rule**: whenever an <package> release introduces a Breaking or Deprecated
> change, add an entry here in the same PR that bumps `COMPATIBILITY.md`.

## Registry format

<Describe the per-entry fields this skill's upgrade pipeline expects.
Keep the schema small: version, level (B/D/A/F), component, change,
scan pattern, and — for B/D — a fix strategy.>

## Version history

### <version> (<optional title>)

<Entries for this version, grouped by level.>
```

## Conventions

- **Level taxonomy**: `B` Breaking, `D` Deprecated, `A` Added, `F` Fixed.
  The shared upgrade pipeline uses these letters; do not rename them.
- **Scan patterns**: every `B` / `D` entry should carry a grep-style
  pattern the upgrade pipeline can use to find affected files.
- **Fix strategy**: prefer the taxonomy already in use across the repo —
  `rename`, `retype`, `restructure`, `manual`.
- **Ordering**: newest version first.
- **Initial release**: explicitly record it as "No breaking changes" so
  upgrade runs from `0.0.0 → x.y.z` do not silently skip the version.

## Freedom the template allows

The per-entry representation (YAML-style block vs. markdown paragraph vs.
bulleted `[B1]` tag list) is left to each skill because the upgrade
pipeline reads these files via the agent, not a strict parser. Pick
whichever representation is easiest for the human maintainer to keep
accurate; the repo-level validator only enforces the top-level header
and the existence of the file.
