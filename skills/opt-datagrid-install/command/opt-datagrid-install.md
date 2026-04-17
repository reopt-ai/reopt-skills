---
description: "Unified install/upgrade/migrate workflow for @reopt-ai/opt-datagrid in consumer projects."
---

Install, upgrade, or migrate to `@reopt-ai/opt-datagrid` in a consumer project.

## Step 1: State Detection

### 1a. Inspect project context

```bash
# Detect the package manager
ls package.json bun.lockb yarn.lock pnpm-lock.yaml package-lock.json 2>/dev/null

# React version
node -e "const p = require('./package.json'); console.log(p.dependencies?.react || 'not found')"

# opt-datagrid install state + version
node -e "try { const p = require('./node_modules/@reopt-ai/opt-datagrid/package.json'); console.log('installed:', p.version) } catch { console.log('not installed') }"

# Whether opt-ui is also present
node -e "try { require.resolve('@reopt-ai/opt-ui'); console.log('opt-ui: installed') } catch { console.log('opt-ui: not installed') }"

# Detect existing grid libraries
grep -E "glide-data-grid|ag-grid|@tanstack/react-table|react-data-grid|@mui/x-data-grid" package.json
```

### 1b. Determine execution mode

```
if "$ARGUMENTS" contains "migrate":
  → Migrate mode (Steps 2-4, 7, 9)

if "$ARGUMENTS" contains "example":
  → Example mode (Step 8 only)

if "$ARGUMENTS" contains "verify":
  → Verify mode (Step 9 only)

if opt-datagrid NOT installed:
  → Init mode (Steps 2-4, 8, 9)

if opt-datagrid IS installed:
  latest = npm view @reopt-ai/opt-datagrid version --registry=https://npm.pkg.github.com
  if installed < latest OR "$ARGUMENTS" contains "upgrade/update":
    → Upgrade mode (Steps 3, 5-6, 9)
  else:
    → Verify mode (Step 9 only)
```

**Display:**

```
=== opt-datagrid-install: {Init/Upgrade/Migrate/Verify} Mode ===

| Check           | Status              |
| --------------- | ------------------- |
| Package manager | {bun/npm}           |
| React version   | {version}           |
| opt-datagrid    | {not installed / version} |
| opt-ui          | {installed/not}     |
| Other grids     | {detected libs}     |
```

---

## Step 2: .npmrc & Auth Setup (Init, Migrate)

Configure GitHub Packages auth:

```ini
@reopt-ai:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Stop immediately if `GITHUB_TOKEN` is missing.

---

## Step 3: Package Install/Update

### Init / Migrate mode

```bash
{pm} add @reopt-ai/opt-datagrid
```

### Upgrade mode

```bash
{pm} add @reopt-ai/opt-datagrid@latest
```

**Only run after user approval.**

---

## Step 4: TypeScript Paths (Init, Migrate)

Decide whether `tsconfig.json` needs opt-datagrid path entries.

- If `moduleResolution` is `bundler` or `node16`, resolution is automatic — no change.
- Otherwise, you may need to add entries to `paths`.

---

## Step 5: Breaking Changes Detection & Fix (Upgrade only)

> **Reference**: `references/breaking-changes.md` + `node_modules/@reopt-ai/opt-datagrid/dist/docs/04-migration/`

### 5a. Load changes in the version range

Collect every Breaking/Deprecated change between installed → target.

### 5b. Scan consumer code for impact

```bash
grep -r "from ['\"]@reopt-ai/opt-datagrid['\"]" --include="*.tsx" --include="*.ts" -l
```

Extract the components, props, hooks, and types used in each file and
match them against the breaking-change registry.

### 5c. Propose edits per group

```
Breaking Change: {code}
  Files affected: {count}
  BEFORE: {old_code}
  AFTER:  {new_code}
  Apply? (yes/no)
```

Apply per group after approval. Run `tsc --noEmit` after every group.

### opt-datagrid-specific fix patterns

**Column definition restructure:**

```tsx
// BEFORE
{ key: "name", renderer: NameCell, width: 200 }
// AFTER
{ key: "name", cell: NameCell, width: 200 }
```

**Hook rename:**

```tsx
// BEFORE
import { useGridSelection } from "@reopt-ai/opt-datagrid";
// AFTER
import { useDataGridSelection } from "@reopt-ai/opt-datagrid";
```

---

## Step 6: Deprecated Cleanup (Upgrade only, optional)

Migrate deprecated API calls to their replacements. Optional:

```
Deprecated: {code}
  Auto-fix available: yes
  Apply? (yes/skip)
```

---

## Step 7: Grid Migration (Migrate only)

> **Reference**: `references/transform-glide-datagrid.md` + `node_modules/@reopt-ai/opt-datagrid/dist/docs/04-migration/`

### 7a. Analyze existing grid usage

```bash
# glide-data-grid
grep -r "DataEditor\|@glideapps/glide-data-grid" --include="*.tsx" --include="*.ts" -l

# ag-grid
grep -r "AgGridReact\|ag-grid-react" --include="*.tsx" --include="*.ts" -l

# react-data-grid
grep -r "from ['\"]react-data-grid['\"]" --include="*.tsx" --include="*.ts" -l

# MUI DataGrid
grep -r "DataGrid\|@mui/x-data-grid" --include="*.tsx" --include="*.ts" -l
```

### 7b. Plan the conversion

Per-library conversion map:

| Source          | Column Def             | Cell Renderer         | Events                          | Selection                               |
| --------------- | ---------------------- | --------------------- | ------------------------------- | --------------------------------------- |
| glide-data-grid | GridColumn → ColumnDef | DrawCustomCell → cell | onCellEdited → onCellEdit       | CompactSelection → useDataGridSelection |
| ag-grid         | ColDef → ColumnDef     | cellRenderer → cell   | onCellValueChanged → onCellEdit | rowSelection → useDataGridSelection     |

See `references/transform-glide-datagrid.md` for the detailed mapping.

### 7c. Convert per file

**Process file by file.** For each file:

1. Show the original code.
2. Present the converted code as a diff.
3. Apply after user approval.
4. Confirm type safety with `tsc --noEmit`.

With `--dry-run`: print the plan only, do not edit code.

---

## Step 8: Example Generation (Init only)

Generate a starter DataGrid example.

Pattern options:

| Pattern         | Description                            |
| --------------- | -------------------------------------- |
| `basic`         | Static rows + columns, default rendering |
| `typed-editors` | Cell editors + typed columns           |
| `remote`        | Server data fetch + viewport           |
| `hooks`         | useDataGrid + useDataGridSelection     |

> **Reference**: `references/column-patterns.md` + `references/theme-integration.md`

---

## Step 9: Validation & Summary

### Verification

```bash
# Type check
npx tsc --noEmit

# Existing tests, if any
{pm} test
```

### Summary

**Init mode:**

```
=== opt-datagrid-install Complete (Init) ===

Installed: @reopt-ai/opt-datagrid@{version}
TypeScript: paths configured
Example: {pattern} generated at {path}

Next steps:
  - Read: node_modules/@reopt-ai/opt-datagrid/dist/docs/
```

**Upgrade mode:**

```
=== opt-datagrid-install Complete (Upgrade) ===

Upgraded: @reopt-ai/opt-datagrid {old} → {new}
Breaking changes fixed: {count}
Deprecated cleanup: {count}

Next steps:
  - git diff
  - Run tests
```

**Migrate mode:**

```
=== opt-datagrid-install Complete (Migrate) ===

Source: {library}
Files converted: {count}
Type errors remaining: {count}

Next steps:
  - Review converted files
  - Test grid functionality
```

<user-request>
$ARGUMENTS
</user-request>
