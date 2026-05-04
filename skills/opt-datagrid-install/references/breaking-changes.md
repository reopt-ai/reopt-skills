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

## Version 1.3.0 (current)

No breaking changes — `1.1.0 → 1.3.0` is purely additive. Existing 1.1.x
consumers can upgrade without code edits; the new props/fields are all
optional.

### Added

- version: "1.3.0"
  level: A
  component: "DataGrid"
  change: "columnSortState prop for ARIA aria-sort on column headers"
  detail: "Pass the sort state per column id; opt-datagrid wires aria-sort=ascending|descending|none on the matching <th>. Auto-bridge available via useColumnSort.columnSortState."

- version: "1.3.0"
  level: A
  component: "DataGrid"
  change: "labels prop for i18n"
  detail: "All hardcoded UI strings ('Add row', 'Search in grid', etc.) are now overridable via the new DataGridLabels object. Untouched keys fall back to the built-in English labels."

- version: "1.3.0"
  level: A
  component: "useColumnSort"
  change: "columnSortState field added to the hook result"
  detail: "Pass useColumnSort().columnSortState directly to <DataGrid columnSortState={...}> for ARIA wiring without manually mapping state."

- version: "1.3.0"
  level: A
  component: "Types"
  change: "DataGridColumnSortState / DataGridColumnSortDirection / DataGridLabels exported"

- version: "1.3.0"
  level: A
  component: "Cell"
  change: "aria-readonly attribute on non-editable gridcells"
  detail: "Read-only cells now expose aria-readonly=true for assistive tech. No code changes required for consumers."

- version: "1.3.0"
  level: F
  component: "useDataGridRemoteDataSource"
  change: "Error handling guide added to README"
  detail: "Documents the existing onError / onPageError contract — no API change."

## Version 1.1.0

No breaking changes (v1.0.0 → v1.1.0 was additive).

### Added

- version: "1.1.0"
  level: A
  component: "DataGrid"
  change: "smoothScrollX / smoothScrollY props for CSS smooth scrolling"

- version: "1.1.0"
  level: A
  component: "DataGrid"
  change: "rightElement / rightElementProps for custom content after the grid body"

- version: "1.1.0"
  level: A
  component: "DataGrid"
  change: "theme prop (DataGridTheme) for inline theme overrides"

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
