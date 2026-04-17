# opt-editor-doctor — execution workflow

Run the 18 checks in order. Each check has a severity (ERROR/WARN/INFO)
and possible SKIP conditions.

## Step 0: Project Root Detection

1. Walk up from the current directory looking for `package.json`.
2. If none is found, **stop**: "Project root not found".
3. Designate the project root as `$ROOT`.

Detect the package manager:

- `bun.lockb` or `bun.lock` → bun
- `yarn.lock` → yarn
- default → npm

---

## Category 1: Installation & Registry (Checks 1-5)

### Check 1: opt-editor package installed [ERROR]

```
grep "@reopt-ai/opt-editor" $ROOT/package.json
```

- **PASS**: present in `dependencies` or `devDependencies`.
- **FAIL**: not installed → `references/fix-install.md#check-1`.

### Check 2: opt-editor on a current version [WARN]

**SKIP**: if Check 1 FAILs.

1. Installed version: `node -e "console.log(require('@reopt-ai/opt-editor/package.json').version)"` (run from project root)
2. If the latest-version comparison is unavailable, just display the installed version (INFO).

- **PASS**: version resolved.
- **WARN**: version unreadable → `references/fix-install.md#check-2`.

### Check 3: React 19+ peer dependency [ERROR]

```
node -e "console.log(require('react/package.json').version)"
```

- **PASS**: major >= 19.
- **FAIL**: React <19 or missing → `references/fix-install.md#check-3`.

### Check 4: .npmrc @reopt-ai registry [ERROR]

Inspect `$ROOT/.npmrc`:

```
@reopt-ai:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=
```

- **PASS**: both lines present.
- **FAIL**: missing or misconfigured → `references/fix-install.md#check-4`.

### Check 5: GITHUB_TOKEN env var [WARN]

```
echo $GITHUB_TOKEN
```

- **PASS**: value set.
- **WARN**: empty → `references/fix-install.md#check-5`.
- **NOTE**: when CI injects the token, local WARN is acceptable.

---

## Category 2: CSS & Build Config (Checks 6-10)

### Check 6: CSS import (styles.css) [ERROR]

**SKIP**: if Check 1 FAILs.

Look for the global CSS file in this order:

- `src/app/globals.css`
- `app/globals.css`
- `styles/globals.css`
- `src/styles/globals.css`
- `src/index.css`

In the file that exists, search for:

```
@import "@reopt-ai/opt-editor/styles.css"
```

or:

```
@import "@reopt-ai/opt-editor/styles"
```

- **PASS**: import present.
- **FAIL**: not found → `references/fix-config.md#check-6`.

### Check 7: CSS custom-property validity [INFO]

**SKIP**: if Check 6 FAILs.

Search global CSS for custom properties prefixed `--opt-editor-`. If
overrides are defined, verify the property names are valid.

Valid properties:

- `--opt-editor-selection`
- `--opt-editor-border`
- `--opt-editor-caption`
- `--opt-editor-code-bg`
- `--opt-editor-code-block-bg`
- `--opt-editor-link`
- `--opt-editor-callout-border`
- `--opt-editor-callout-bg`
- `--opt-editor-table-header-bg`
- `--opt-editor-quote-border`

- **PASS**: no overrides or all valid.
- **INFO**: unknown property names found → `references/fix-config.md#check-7`.

### Check 8: TypeScript moduleResolution [WARN]

Inspect `$ROOT/tsconfig.json` (or the file it extends):

```json
"moduleResolution": "bundler"
```

- **PASS**: `bundler` or `nodenext`.
- **WARN**: `node` or unset → `references/fix-config.md#check-8`.

### Check 9: TypeScript jsx [WARN]

```json
"jsx": "react-jsx"
```

- **PASS**: `react-jsx` or `preserve`.
- **WARN**: unset or other value → `references/fix-config.md#check-9`.

### Check 10: Next.js transpilePackages [WARN]

**SKIP**: if no `next.config` file exists (not a Next.js project).

In `next.config.ts`, `next.config.js`, or `next.config.mjs`:

```js
transpilePackages: ["@reopt-ai/opt-editor"];
```

or an array containing `@reopt-ai/opt-editor`.

- **PASS**: included.
- **WARN**: missing → `references/fix-config.md#check-10`.

---

## Category 3: Editor Setup (Checks 11-14)

### Check 11: Catalog definition file [WARN]

**SKIP**: if Check 1 FAILs.

Search the project for `defineCatalog` usage:

```
grep -r "defineCatalog" $ROOT/src/ $ROOT/app/ $ROOT/lib/ $ROOT/components/
```

- **PASS**: found in one or more files.
- **WARN**: not found → `references/fix-editor.md#check-11`.
- **NOTE**: using `defaultCatalog` also counts as PASS.

### Check 12: Editor component "use client" [WARN]

**SKIP**: if Check 11 SKIPs.

Find the Editor component files (files with `<Editor` or imports from `@reopt-ai/opt-editor`):

```
grep -rl "from.*@reopt-ai/opt-editor" $ROOT/src/ $ROOT/app/ $ROOT/components/
```

Among those files, confirm `"use client"` is on the first line of the file(s) that render Editor.

- **PASS**: `"use client"` present.
- **WARN**: missing → `references/fix-editor.md#check-12`.
- **SKIP**: SKIP when the project is not a Next.js project.

### Check 13: createEditorStore usage [WARN]

**SKIP**: if Check 11 SKIPs.

```
grep -r "createEditorStore" $ROOT/src/ $ROOT/app/ $ROOT/lib/ $ROOT/components/
```

- **PASS**: usage confirmed.
- **WARN**: not found → `references/fix-editor.md#check-13`.

### Check 14: Editor required props [WARN]

**SKIP**: if Check 11 SKIPs.

In the file that renders Editor, confirm the `<Editor` JSX tag's props include:

- `store`
- `catalog`

- **PASS**: both props present.
- **WARN**: one or more missing → `references/fix-editor.md#check-14`.

---

## Category 4: AI Integration (Checks 15-16)

### Check 15: AI streaming handler [WARN]

**SKIP**: if no code uses `useEditorStream`.

```
grep -r "useEditorStream" $ROOT/src/ $ROOT/app/ $ROOT/components/
```

Where `useEditorStream` is used, confirm an `onStream` or AI handler
function exists.

- **PASS**: streaming handler implemented.
- **WARN**: `useEditorStream` used but handler incomplete → `references/fix-advanced.md#check-15`.
- **SKIP**: `useEditorStream` not used.

### Check 16: AI API route [WARN]

**SKIP**: if Check 15 SKIPs.

Look for a Next.js API route that acts as the AI endpoint:

```
# Pattern: POST export + SSE/streaming code under app/api/**/route.ts
grep -rl "export.*POST\|export.*function POST" $ROOT/app/api/
```

- **PASS**: POST handler exists.
- **WARN**: not found → `references/fix-advanced.md#check-16`.
- **SKIP**: no Next.js API route directory.

---

## Category 5: Legacy Migration (Check 17)

### Check 17: Legacy Slate runtime conversion leftover [INFO]

```
grep -r "slateToSpec\|isSlateFormat\|slate-to-spec\|loadLegacyContent" $ROOT/src/ $ROOT/app/ $ROOT/components/
```

Legacy conversion artifacts:

- `slateToSpec` — the consumer-local converter
- `isSlateFormat` — format detection
- `slate-to-spec` — references to the local converter file

- **PASS**: no legacy conversion code (migration complete).
- **INFO**: legacy conversion code present → `references/fix-advanced.md#check-17`
  - Keep it during a gradual migration.
  - If all data is already EditorSpec, consider removing it.

---

## Category 6: Documentation (Check 18)

### Check 18: CLAUDE.md opt-editor reference [WARN]

Check `$ROOT/CLAUDE.md` for opt-editor mentions:

```
grep -i "opt-editor" $ROOT/CLAUDE.md
```

- **PASS**: opt-editor-related content present.
- **WARN**: not mentioned → `references/fix-advanced.md#check-18`.

---

## Output Format

After every check runs, print the result table:

```
=== opt-editor-doctor ===

| #  | Check                       | Status | Detail                        |
|----|-----------------------------|--------|-------------------------------|
| 1  | opt-editor installed        | PASS   | @reopt-ai/opt-editor@0.2.0    |
| 2  | Version lookup              | PASS   | 0.2.0                         |
| 3  | React 19+                   | PASS   | react@19.2.3                  |
| 4  | .npmrc registry             | PASS   | GitHub Packages configured    |
| 5  | GITHUB_TOKEN                | WARN   | env var not set               |
| 6  | CSS import                  | PASS   | styles.css imported           |
| 7  | CSS custom properties       | PASS   | no overrides                  |
| 8  | TS moduleResolution         | PASS   | bundler                       |
| 9  | TS jsx                      | PASS   | react-jsx                     |
| 10 | transpilePackages           | PASS   | included in Next.js config    |
| 11 | Catalog definition          | PASS   | lib/editor/catalog.ts         |
| 12 | "use client" directive      | PASS   | components/editor.tsx         |
| 13 | createEditorStore           | PASS   | usage confirmed               |
| 14 | Editor required props       | PASS   | store, catalog                |
| 15 | AI streaming handler        | SKIP   | useEditorStream unused        |
| 16 | AI API route                | SKIP   | —                             |
| 17 | Legacy Slate conversion     | PASS   | no legacy converter           |
| 18 | CLAUDE.md reference         | WARN   | opt-editor not mentioned      |

Result: 0 ERROR, 2 WARN, 14 PASS, 2 SKIP
```

## --fix Mode

1. Run all 18 checks first.
2. Show fix guidance for ERROR/WARN items.
3. Confirm each edit with the user (y/n).
4. After editing files, re-run the affected check to verify.
5. Do not auto-run `npm install` — propose the command only.

Fix guides live in `references/fix-install.md`, `references/fix-config.md`, `references/fix-editor.md`, and `references/fix-advanced.md` — each covers a category of checks.
