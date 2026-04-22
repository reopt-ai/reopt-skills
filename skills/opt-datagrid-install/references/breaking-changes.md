# Breaking Changes Registry — @reopt-ai/opt-datagrid

Per-version registry of Breaking / Deprecated / Added / Fixed changes.
The `/opt-datagrid-install` skill reads this file during impact analysis in upgrade mode.

> **Maintenance rule**: whenever an opt-datagrid release introduces a Breaking or Deprecated
> change, add an entry here in the same PR that bumps `COMPATIBILITY.md`.

## Registry format

Each change carries these fields:

```yaml
- version: "X.Y.Z" # version that introduced the change
  level: B | D | A | F # classification (Breaking, Deprecated, Added, Fixed)
  component: "ComponentOrHook" # affected component/hook
  change: "summary of change"
  detail: "longer description"
  scan: "grep pattern" # pattern used to scan for impact
  fix: # fix strategy (B, D only)
    type: rename | retype | restructure | manual
    from: "old pattern"
    to: "new pattern"
```

---

## Version 1.1.0 (current)

No breaking changes (v1.0.0 → v1.1.0 was additive).

### Added

- version: "1.1.0"
  level: A
  component: "DataGrid"
  change: "Added useDataGridController / createDataGridController"
  detail: "Imperative API for programmatic grid control"

- version: "1.1.0"
  level: A
  component: "DataGrid"
  change: "Added search (Ctrl+F)"
  detail: "Built-in search with highlight and navigation"

- version: "1.1.0"
  level: A
  component: "DataGrid"
  change: "Added clipboard support (Ctrl+C/V/X)"
  detail: "Built-in clipboard support with paste validation"

---

## Version History Template

```yaml
- version: "X.Y.Z"
  level: B | D | A | F
  component: "DataGrid"
  change: "summary"
  scan: "grep pattern" # B/D only
  fix: { type: rename, from: "old", to: "new" } # B/D only
```
