# Shared Upgrade Pipeline

> This file defines the common 7-step pipeline used by the install/upgrade
> skills in this repository (currently consumed by `opt-editor-install`,
> and reusable by future package install skills that need the same flow).
> Each skill's command file declares its package-specific variables and
> unique patterns, then references this pipeline.
>
> **Variable references**: Values written as `{PACKAGE_NAME}`,
> `{PACKAGE_SHORT}`, etc. are defined in the **Package Config** block at
> the top of the calling skill's command file.

## Step 1: Detect current state

### 1a. Check current version

```bash
# Current version in package.json
grep "{PACKAGE_NAME}" package.json

# Actually installed version (from the lock file)
ls node_modules/{PACKAGE_NAME}/package.json 2>/dev/null && \
  grep '"version"' node_modules/{PACKAGE_NAME}/package.json
```

### 1b. Check latest version

```bash
npm view {PACKAGE_NAME} version --registry=https://npm.pkg.github.com 2>/dev/null || \
  echo "Registry unreachable — check GITHUB_TOKEN"
```

### 1c. Decide on version diff

| Situation          | Action                                              |
| ------------------ | --------------------------------------------------- |
| current = latest   | Print "Already on the latest version." and exit     |
| current < latest   | Continue with the upgrade                           |
| package missing    | Route to `{INIT_SKILL}` (installation required first) |

If `$ARGUMENTS` contains `--from` or `--target`, restrict the range to
those versions.

Output:

```
=== {PACKAGE_SHORT} upgrade ===

Current version: {old}
Latest version:  {new}
Upgrade range:   {old} → {new}
```

## Step 2: Collect changes

### 2a. Load the breaking-changes registry

Look up breaking-change information in this order:

1. Search under `node_modules/{PACKAGE_NAME}/dist/docs/` for files or
   directories matching `migration` or `breaking`.
2. Fall back to the skill's `references/breaking-changes.md`.

Collect every change between the current and target version.

### 2b. Track changes from source

If the monorepo is accessible, use `git log` for authoritative history:

```bash
git log {PACKAGE_NAME}@{from}..{PACKAGE_NAME}@{to} \
  --oneline -- {MONOREPO_SRC_PATH}
```

Otherwise rely solely on `references/breaking-changes.md`.

### 2c. Classify changes

Classify every collected change with the B / D / A / F taxonomy:

| Level | Description                                                       |
| ----- | ----------------------------------------------------------------- |
| **B** | Breaking: removed/renamed exports, changed signatures, behavior changes |
| **D** | Deprecated: still works, scheduled for removal in the next major  |
| **A** | Added: new exports, new props, new features                       |
| **F** | Fixed: bug fixes                                                  |

**If running in `--check` mode, stop here.**

## Step 3: Scope-of-impact scan

### 3a. Import scan

```bash
grep -r "from ['\"]{PACKAGE_NAME}['\"]" \
  --include="*.tsx" --include="*.ts" -l \
  src/ app/ components/ pages/ 2>/dev/null
```

### 3b. Map impact

For every Breaking/Deprecated change, map the affected files and
locations. Grep patterns depend on the change type (prop name, hook
name, type name, etc.).

### 3c. Print the impact report

```
=== Scope-of-impact analysis ===

[B-N] {change description}
  Affected files: N
  - path/to/file.tsx:NN — relevant code
  Fix strategy: {auto|assisted|manual}
  Risk:         {low|medium|high}

=== Totals: N files, B N (must fix) + D N (recommended)
Proceed with package update + code edits? (y/n)
```

## Step 4: Update the package

After user approval, update the package version:

```bash
npm install {PACKAGE_NAME}@{target-version} --registry=https://npm.pkg.github.com
```

If `{COMPANION_PACKAGES}` are defined, update them together.

Type-check immediately after update:

```bash
npx tsc --noEmit 2>&1 | head -30
```

- Type errors → proceed to Step 5.
- No type errors → skip Step 5 (optionally fix remaining Deprecated items).

## Step 5: Edit code (Breaking Changes)

### Edit rules

1. **Group related edits** — batch changes that belong together.
2. **Preview before edit** — show the diff per file and wait for approval.
3. **Validate after each group** — run `tsc --noEmit` after each batch.
4. **Preserve tests** — confirm existing tests still pass after edits.

### Common auto-applicable patterns

**Prop rename:**

```tsx
// BEFORE
<Component oldProp="value" />
// AFTER
<Component newProp="value" />
```

**Hook rename:**

```tsx
// BEFORE
import { useOldHook } from "{PACKAGE_NAME}";
// AFTER
import { useNewHook } from "{PACKAGE_NAME}";
```

**Type rename:**

```tsx
// BEFORE
import type { OldType } from "{PACKAGE_NAME}";
// AFTER
import type { NewType } from "{PACKAGE_NAME}";
```

**Component rename:**

```tsx
// BEFORE
import { OldName } from "{PACKAGE_NAME}";
<OldName prop="value" />;
// AFTER
import { NewName } from "{PACKAGE_NAME}";
<NewName prop="value" />;
```

> **Package-specific patterns** are defined in the calling skill's
> command file. For complex restructures, consult that skill's
> `references/` directory or
> `node_modules/{PACKAGE_NAME}/dist/docs/05-migration/`.

### Non-auto patterns (manual guidance only)

Component deletions and API restructures are not auto-edited — surface
guidance instead:

```
Manual fix required:
  path/to/file.tsx:NN
  {change description}
  See: node_modules/{PACKAGE_NAME}/dist/docs/05-migration/
```

## Step 6: Deprecated fixes (optional)

After all Breaking fixes land, ask whether to address Deprecated items:

```
Breaking-change fixes complete. Type check passed.

Fix N Deprecated items as well?
  D-N: {change description} ({N} files)
  These still work today, but will be removed in the next major.
  (y/n)
```

## Step 7: Verify and finish

### 7a. Final verification

```bash
# Type check
npx tsc --noEmit

# Tests, if any
npm test 2>/dev/null || bun test 2>/dev/null
```

### 7b. Completion report

```
=== Upgrade complete ===

Version: {old} → {new}
Files edited: N

Type check: passed
Tests:      passed

New capabilities available:
  - {list of A items}

Follow-ups:
  - {DOCTOR_SKILL}  (full environment diagnostic)
```

## Safety rules

- **Never auto-commit** — the user commits manually.
- **Rollback guidance** — if things break, advise `git checkout -- . && npm install`.
- **Step-by-step approval** — require approval per Breaking-change group.
- **Type safety** — every edit must pass `tsc --noEmit`.
- **Preserve originals** — always preview the diff before applying.

## Error recovery

### Upgrade failed

```bash
# Restore the previous version
npm install {PACKAGE_NAME}@{old-version} --registry=https://npm.pkg.github.com
```

### Persistent type errors

1. Consult the detailed guide under `node_modules/{PACKAGE_NAME}/dist/docs/05-migration/`.
2. Verify CSS imports are correct.
3. Re-check removed/renamed exports.
