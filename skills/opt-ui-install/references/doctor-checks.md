---
description: Diagnose opt-ui environment issues in the target project. Runs 26 checks for package installation, CLI Surface setup, Tailwind config, theme presets, theme style quality, peer deps, CLAUDE.md references, and more.
---

Run an opt-ui environment diagnosis. Executes 26 checks and outputs the results as a table.

## Arguments

- If `$ARGUMENTS` includes `--fix`, also print fix code for FAIL/WARN items.
- Without arguments, only the diagnosis runs.

## Execution Steps

### Step 0: Locate project root

1. Look for `package.json` in the current directory.
2. If missing, walk up parent directories until `package.json` is found.
3. If `package.json` cannot be found, print an error and exit:
   > "package.json not found. Run this from the project root."

Read `package.json` and parse `dependencies` and `devDependencies`.

### Step 1: Check opt-ui package install

**Severity: ERROR**

Check whether `@reopt-ai/opt-ui` is present in `dependencies` or `devDependencies` of `package.json`.

- **PASS**: installed → record version (e.g., `@reopt-ai/opt-ui@1.1.0`)
- **FAIL**: missing → `@reopt-ai/opt-ui not found in dependencies`

### Step 2: Check CLI Surface setup

**Severity: WARN**

Confirm that the project has an `opt-ui.json` file and that the Surface CLI configuration is valid. Surfaces are distributed by copying them into the project locally via `@reopt-ai/opt-ui-cli`.

**Validation**:

1. Look for `opt-ui.json` at the project root.
2. If the file exists, parse the JSON and check the `surfacesDir` and `surfaces` fields.
3. Verify the `surfacesDir` path points to an existing directory.

- **PASS**: `opt-ui.json` exists + valid surfacesDir → `opt-ui.json configured ({N} surfaces installed)`
- **WARN**: `opt-ui.json` missing → `opt-ui.json not found — run npx @reopt-ai/opt-ui-cli add <slug> to use Surfaces`
- **WARN**: `opt-ui.json` exists but the surfacesDir directory is missing → `surfacesDir "{dir}" does not exist`
- **WARN**: `opt-ui.json` fails to parse → `opt-ui.json is not valid JSON`

> **Note**: Projects that do not use Surfaces can safely ignore this warning.

### Step 3: Check package version currency

**Severity: WARN**

Compare the installed `@reopt-ai/opt-ui` version with the latest version on the npm registry.

Validation:

```bash
npm view @reopt-ai/opt-ui version --registry=https://npm.pkg.github.com 2>/dev/null
```

- Command fails (registry unreachable) → **SKIP**: `Cannot reach registry`
- Versions match → **PASS**: `1.1.0 (latest)`
- Versions differ → **WARN**: `installed 1.0.7, latest 1.1.0`
- If Step 1 FAILed → **SKIP**: `opt-ui not installed`

### Step 4: Check React version

**Severity: ERROR**

Check the `react` version in `package.json`. opt-ui requires React 19+.

Read the `react` version from `dependencies` or `devDependencies`.

- Strip prefixes such as `^`, `~`, and `>=` from the version string and compare the major version.
- For values like `workspace:*`, resolve the actual installed version:

  ```bash
  node -e "console.log(require('react/package.json').version)" 2>/dev/null
  ```

- **PASS**: major >= 19 → `react@19.1.0`
- **FAIL**: major < 19 → `react@18.2.0 (requires >=19)`
- **FAIL**: react not installed → `react not found`

### Step 5: Check Next.js version

**Severity: WARN**

Check whether `next` is listed in `package.json`.

- `next` missing → **SKIP**: `Next.js not used`
- major >= 16 → **PASS**: `next@16.1.0`
- major < 16 → **WARN**: `next@15.0.0 (recommended >=16)`

### Step 6: Check Tailwind CSS install

**Severity: ERROR**

Check whether `tailwindcss` is present in `dependencies` or `devDependencies` of `package.json`.

- **PASS**: installed → `tailwindcss@4.x.x`
- **FAIL**: missing → `tailwindcss not found in dependencies`

### Step 7: Check Tailwind content path

**Severity: ERROR**

Tailwind v4 uses the CSS `@source` directive; v3 uses the `content` array in `tailwind.config`.

**Validation (priority order)**:

1. **Tailwind v4 (CSS-based)**: check globals.css (or the main CSS file) for `@source`
   - Search pattern: `@source` followed by `@reopt-ai/opt-ui` or `node_modules/@reopt-ai`
   - Example: `@source "../node_modules/@reopt-ai/opt-ui/dist";`

2. **Tailwind v3 (config-based)**: check the `content` array in `tailwind.config.{js,ts,mjs,cjs}`
   - Whether the `content` array includes `@reopt-ai/opt-ui` or `node_modules/@reopt-ai`
   - Example: `"./node_modules/@reopt-ai/opt-ui/dist/**/*.{js,mjs}"`

CSS file search locations: `src/app/globals.css`, `app/globals.css`, `styles/globals.css`, `src/styles/globals.css`, `src/index.css`

- **PASS**: path included
- **FAIL**: path missing → `opt-ui dist path missing in content/source config`
- If Step 6 FAILed → **SKIP**: `Tailwind not installed`

### Step 8: Check CSS theme preset import

**Severity: ERROR**

Check whether globals.css (or the main CSS file) includes an opt-ui theme preset import.

Search pattern: `@import` followed by `@reopt-ai/opt-ui/theme/presets/`

CSS file search locations: same as Step 7

- **PASS**: import present → `theme preset imported`
- **FAIL**: missing → `No @import for opt-ui theme preset found`

### Step 9: Check .npmrc configuration

**Severity: ERROR**

Check whether the project-root `.npmrc` file contains `@reopt-ai:registry` configuration.

Search locations (priority):

1. Project root `.npmrc`
2. Home directory `~/.npmrc`

Search pattern: lines starting with `@reopt-ai:registry=`

- **PASS**: configured → `@reopt-ai:registry configured`
- **FAIL**: missing → `.npmrc missing @reopt-ai:registry config`

### Step 10: Check TypeScript configuration

**Severity: WARN**

Read `tsconfig.json` and check key settings.

Items to check:

- `compilerOptions.moduleResolution`: must be one of `bundler`, `node16`, `nodenext`
- `compilerOptions.jsx`: must be `react-jsx` or `preserve`

- **PASS**: both items appropriate → `moduleResolution: bundler, jsx: react-jsx`
- **WARN**: one or more inappropriate → detailed message
- **SKIP**: `tsconfig.json` missing → `tsconfig.json not found`

### Step 11: Check PostCSS configuration

**Severity: WARN**

Check whether a PostCSS configuration file exists and includes the tailwindcss plugin.

Search locations: `postcss.config.{js,ts,mjs,cjs}`, the `postcss` field in `package.json`

Tailwind v4 uses the `@tailwindcss/postcss` plugin; v3 uses the `tailwindcss` plugin.

- **PASS**: PostCSS config + tailwind plugin confirmed
- **WARN**: PostCSS config missing or plugin not listed
- If Step 6 FAILed → **SKIP**: `Tailwind not installed`

### Step 12: Check transpilePackages

**Severity: WARN**

For Next.js projects, check whether `next.config.{js,ts,mjs}` has a `transpilePackages` array that includes `@reopt-ai` packages.

- **PASS**: includes `@reopt-ai/opt-ui` (or `@reopt-ai`)
- **WARN**: not included → `@reopt-ai packages not in transpilePackages`
- **SKIP**: not a Next.js project (Step 5 is SKIP) → `Not a Next.js project`

### Step 13: Check GITHUB_TOKEN environment variable

**Severity: WARN**

If the `.npmrc` found in Step 9 references `${GITHUB_TOKEN}`, check whether the actual environment variable is set.

Validation:

```bash
echo "${GITHUB_TOKEN:+set}"
```

- `.npmrc` does not reference `${GITHUB_TOKEN}` → **SKIP**
- Environment variable set → **PASS**: `GITHUB_TOKEN is set`
- Environment variable empty → **WARN**: `GITHUB_TOKEN not set — npm install may fail for @reopt-ai packages`

> **Note**: Even if the token is in a `.env` file, npm will not pick it up unless the file is sourced into the shell session.

### Step 14: Check CSS @source path (dist vs src)

**Severity: WARN**

Check whether the `@source` path in the CSS file found in Step 7 points to `dist/`.

Search pattern: the line containing `@source` followed by `@reopt-ai` must contain `dist` rather than `src`.

- `@source` contains `/dist` → **PASS**: `@source points to dist/`
- `@source` contains `/src` → **WARN**: `@source points to src/ — recommend dist/ for stability`
- No `@source` → deferred to Step 7 (FAIL or SKIP)

### Step 15: Check OptThemeProvider + Boot Script

**Severity: WARN**

Check whether `OptThemeProvider` and `createThemeBootScript` are properly configured in the root layout file.

Search locations: `app/layout.tsx`, `src/app/layout.tsx`, `app/layout.jsx`

**15a. OptThemeProvider check**

Search pattern: presence of the `OptThemeProvider` string

- **PASS**: `OptThemeProvider` used
- **WARN**: `OptThemeProvider` not used → `Theme switching may not work`
- **SKIP**: layout file not found

**15b. Theme Boot Script check**

Search pattern: presence of the `createThemeBootScript` string

- **PASS**: `createThemeBootScript` used
- **WARN**: `createThemeBootScript` not used → `Theme may flash on page transitions (FOUC). Add createThemeBootScript() to <head> as an inline script.`

**15c. data-theme SSR fallback check**

Search pattern: the `<html` tag contains a `data-theme` attribute

- **PASS**: `data-theme` attribute present
- **WARN**: `data-theme` not set → `Adding data-theme="default" to <html> prevents flicker during SSR`

> **Important**: Without `createThemeBootScript()`, CSS variables are undefined until React hydration, so FOUC occurs on every page transition. This is a required configuration for the opt-ui theme.

### Step 16: Check opt-ui-primitives installation

**Severity: INFO**

Check whether `@reopt-ai/opt-ui-primitives` resolves in node_modules. It should be installed automatically as a runtime dependency of opt-ui, but may be missing due to hoisting issues.

Validation: check whether the `node_modules/@reopt-ai/opt-ui-primitives` directory exists (or search inside `node_modules/.pnpm`).

- **PASS**: `@reopt-ai/opt-ui-primitives` resolved
- **WARN**: `@reopt-ai/opt-ui-primitives not found — may cause runtime errors`
- If Step 1 FAILed → **SKIP**

### Step 17: Check Recharts installation

**Severity: INFO**

Check whether `recharts` resolves in node_modules. It should be installed automatically as a dependency of opt-ui and is required when using chart components.

Validation: check whether the `node_modules/recharts` directory exists.

- **PASS**: `recharts` resolved
- **WARN**: `recharts not found — chart components will fail`
- If Step 1 FAILed → **SKIP**

### Step 18: Check CLAUDE.md component references

**Severity: WARN**

Check whether the project's `CLAUDE.md` includes a reference guide for opt-ui components. This guidance lets AI agents automatically recognize and use the components.

**Precondition**: Step 1 must be PASS (opt-ui must be installed)

**Validation**:

1. Look for `CLAUDE.md` at the project root.
2. If the file exists, search for the patterns below:
   - Presence of the string `node_modules/@reopt-ai/opt-ui/dist/docs/`
   - Or both `@reopt-ai/opt-ui` and `dist/docs`
   - Or `@reopt-ai/opt-ui` combined with (`documentation` or `components` or `recipes`)

**Result**:

- `CLAUDE.md` missing → **WARN**: `CLAUDE.md not found — AI agents cannot discover opt-ui components`
- `CLAUDE.md` exists but no reference guide → **WARN**: `No opt-ui component reference guide in CLAUDE.md`
- Reference guide included → **PASS**: `opt-ui reference configured in CLAUDE.md`
- If Step 1 FAILed → **SKIP**: `opt-ui not installed`

**--fix mode behavior**:

On WARN, suggest adding the section below to `CLAUDE.md`:

- If `CLAUDE.md` is missing: create the file + add the section
- If `CLAUDE.md` exists but the reference is missing: append the section to the end

See entry [18] in `references/fix-surface.md` for the content to add.

### Step 19: Check theme text color opacity

**Severity: WARN**

**Precondition**: Step 8 must be PASS (theme preset CSS must be imported)

Using the theme preset CSS file imported in Step 8, check whether the `--opt-text`, `--opt-text-secondary`, and `--opt-text-tertiary` variables use `rgba()` semi-transparent colors.

**Validation**:

1. Extract the preset filename from the `@import` path confirmed in Step 8 (e.g., `default.css`).
2. Read `node_modules/@reopt-ai/opt-ui/theme/presets/{preset}.css` or `node_modules/@reopt-ai/opt-ui/dist/theme/presets/{preset}.css`.
   - If the file cannot be found, also search the package's internal source `src/lib/theme/presets/{preset}.css`.
3. Find `--opt-text`, `--opt-text-secondary`, and `--opt-text-tertiary` declarations inside every `[data-theme="..."]` block.
4. Check whether each value contains `rgba(`.

**Result**:

- No text variable contains `rgba()` → **PASS**: `Text colors use solid color values`
- At least one text variable uses `rgba()` → **WARN**: `{variable} in {theme} theme uses rgba() semi-transparency — may reduce legibility`
  - List which variables in which themes are problematic.
- If Step 8 FAILed → **SKIP**: `Theme preset not in use`
- If the preset file cannot be found → **SKIP**: `Preset file unreachable`

**Background**: `rgba()` opacity-based text alpha-blends with the background, weakening sub-pixel anti-aliasing and appearing blurry. Solid color values such as `hsl()`, `oklch()`, and `#hex` are recommended.

### Step 20: Check text-background WCAG contrast

**Severity: WARN**

**Precondition**: Step 8 must be PASS

Like Step 19, read the preset CSS file and compute the luminance contrast between `--opt-text` and `--opt-surface` in each `[data-theme]` block.

**Validation**:

1. Extract the `--opt-text` and `--opt-surface` values from each `[data-theme="..."]` block.
2. Compute the relative luminance of each color:
   - `hsl()` → convert to RGB → sRGB linearize → `L = 0.2126*R + 0.7152*G + 0.0722*B`
   - `#hex` → convert to RGB → same formula
   - `oklch()` → approximate RGB conversion → same formula
   - `rgba()` → composite with background before computing (assume background is `--opt-surface` or white/black)
3. Compute contrast ratio: `(L_lighter + 0.05) / (L_darker + 0.05)`
4. WCAG AA threshold: body text ≥ 4.5:1

**Result**:

- `--opt-text` vs `--opt-surface` contrast ≥ 4.5:1 for every theme → **PASS**: `WCAG AA met (minimum contrast: {ratio}:1)`
- At least one theme below 4.5:1 → **WARN**: `{theme} theme contrast {ratio}:1 — WCAG AA not met (≥4.5:1 required)`
- Unable to parse color value → **SKIP**: `Could not parse color value ({value})`
- If Step 8 FAILed → **SKIP**: `Theme preset not in use`

> **Note**: Secondary/tertiary text may have a lower contrast ratio, and since it is auxiliary, WCAG AA Large Text (3:1) is also acceptable. This check only validates 4.5:1 for primary text (`--opt-text`).

### Step 21: Check @custom-variant dark configuration

**Severity: WARN**

**Precondition**: Step 6 must be PASS (Tailwind CSS installed), Step 8 must be PASS (theme preset imported)

Check whether globals.css (or the main CSS file) registers the `@custom-variant dark` directive. Without it, Tailwind's `dark:` classes do not work with opt-ui's `data-theme`-based dark mode.

**Validation**:

1. Search the CSS file found in Step 7 for the string `@custom-variant dark`.
2. Check whether the match includes a `data-theme`-related selector:
   - Pattern: `@custom-variant dark` followed by `data-theme`
   - Example: `@custom-variant dark (&:where([data-theme$="-dark"], [data-theme$="-dark"] *))`

**Result**:

- `@custom-variant dark` + `data-theme` present → **PASS**: `@custom-variant dark configured`
- `@custom-variant dark` present but no `data-theme` → **WARN**: `@custom-variant dark does not reference data-theme`
- `@custom-variant dark` missing → **WARN**: `@custom-variant dark not configured — dark: classes will not work`
- If Step 6 FAILed → **SKIP**: `Tailwind not installed`
- If Step 8 FAILed → **SKIP**: `Theme preset not in use`

### Step 22: Check @theme inline token mapping

**Severity: WARN**

**Precondition**: Step 6 must be PASS, Step 8 must be PASS

Check that globals.css has an `@theme inline` block and that opt-ui CSS variables are mapped to Tailwind theme tokens. Without this mapping, semantic Tailwind classes such as `bg-surface` and `text-text-primary` cannot be used.

**Validation**:

1. Search the CSS file found in Step 7 for an `@theme inline` block.
2. Inside the block, check for at least the 3 token mappings below:
   - `--color-surface` (background token)
   - `--color-text-primary` or `--color-text` (text token)
   - `--color-bg` (overall background token)
3. Pattern: declarations of the form `--color-*: var(--opt-*)`.

**Result**:

- `@theme inline` + 3 or more token mappings → **PASS**: `@theme inline token mapping configured ({N} tokens)`
- `@theme inline` present but required tokens missing → **WARN**: `Required tokens missing in @theme inline: {missing}`
- `@theme inline` missing → **WARN**: `@theme inline not configured — semantic Tailwind classes unavailable`
- If Step 6 FAILed → **SKIP**: `Tailwind not installed`
- If Step 8 FAILed → **SKIP**: `Theme preset not in use`

### Step 23: Check body base styles

**Severity: WARN**

**Precondition**: Step 8 must be PASS (theme preset imported)

Check whether globals.css defines base styles on the `body` element that apply opt-ui theme variables. Without these styles, background color, text color, fonts, and so on are not reflected when switching themes.

**Validation**:

1. Find the `body` selector in the CSS file found in Step 7.
2. Check whether the 3 required properties below are present inside the `body` block:
   - `background-color: var(--opt-bg)` or `background: var(--opt-bg)`
   - `color: var(--opt-text)`
   - `font-family: var(--opt-font-body)`
3. Check each property individually.

**Result**:

- All 3 required properties present → **PASS**: `body base styles configured`
- Some properties missing → **WARN**: `{missing property} not set on body — theme is not fully applied`
  - List the specific missing properties (e.g., `background-color, font-family missing`).
- No `body` selector → **WARN**: `body base styles not configured`
- If Step 8 FAILed → **SKIP**: `Theme preset not in use`

**--fix mode additional checks (recommended properties)**:

In addition to the 3 required properties, suggest the following recommended properties (at INFO level rather than WARN):

- `accent-color: var(--opt-primary)`
- `caret-color: var(--opt-primary)`
- `background` and `color` in the `::selection` block
- `transition: background-color 0.2s, color 0.2s`

### Step 24: Check Surface file existence

**Severity: WARN**

**Precondition**: Step 2 must be PASS (opt-ui.json must exist and be valid)

For each Surface entry in the `surfaces` array of `opt-ui.json`, verify the corresponding file exists in the `surfacesDir` directory.

**Validation**:

1. Read `surfacesDir` and `surfaces` from `opt-ui.json`.
2. For each Surface entry's `slug`, verify `{surfacesDir}/{slug}.tsx` exists.

- **PASS**: all Surface files present → `All {N} surface files present`
- **WARN**: missing files → `Missing surface files: {slug1}, {slug2} — reinstall with npx @reopt-ai/opt-ui-cli add {slug1} {slug2}`
- **SKIP**: Step 2 not PASS → `opt-ui.json not configured`

### Step 25: Check Surface contentHash match

**Severity: WARN**

**Precondition**: Step 2 must be PASS, Step 24 must be PASS

Check whether the content hash of each installed Surface file matches the `contentHash` recorded in `opt-ui.json`. A mismatch means the file has been modified locally.

**Validation**:

1. Read each Surface file (`{surfacesDir}/{slug}.tsx`).
2. Compute the first 8 characters of its SHA-256 hash.
3. Compare it against the `contentHash` for the corresponding Surface in `opt-ui.json`.

- **PASS**: all hashes match → `All surface files match registry hashes`
- **WARN**: mismatch → `Modified surfaces: {slug1}, {slug2} (modified locally — may be intentional customization)`
- **SKIP**: Step 24 not PASS

> **Note**: Surfaces are designed to be freely modifiable locally. This check only reports whether they were modified — modification itself is not a problem. You can restore the original with `npx @reopt-ai/opt-ui-cli add --yes {slug}`.

### Step 26: Check Surface import validity

**Severity: WARN**

**Precondition**: Step 1 must be PASS, Step 2 must be PASS, Step 24 must be PASS

Check whether the installed Surface files correctly import from the `@reopt-ai/opt-ui` package. If relative imports (`../shells/`, `../core/`, etc.) remain, runtime errors will occur.

**Validation**:

1. Scan `{surfacesDir}/*.tsx` files.
2. Search each file for `from "..` or `from '../` (relative import) patterns.
3. Warn if a relative import references a component exported by `@reopt-ai/opt-ui`.

- **PASS**: all Surfaces use package imports → `All surfaces use package imports`
- **WARN**: relative imports found → `{slug}.tsx has relative imports — should use @reopt-ai/opt-ui`
- **SKIP**: Step 24 not PASS

## Output Format

After all checks complete, output the result table in the following format:

```
=== Diagnosis Results ===

| #  | Check                  | Status | Detail                                    |
|----|------------------------|--------|-------------------------------------------|
| 1  | opt-ui install         | PASS   | @reopt-ai/opt-ui@1.1.0                    |
| 2  | CLI Surface setup      | PASS   | opt-ui.json configured (3 surfaces)       |
| ...| ...                    | ...    | ...                                       |

Result: {FAIL_COUNT} FAIL, {WARN_COUNT} WARN, {PASS_COUNT} PASS, {SKIP_COUNT} SKIP
```

### Status icons (optional)

Icons may be used in the output:

- PASS → `PASS`
- FAIL → `FAIL`
- WARN → `WARN`
- SKIP → `SKIP`

### Fix guide for FAIL/WARN items

If there are FAIL or WARN items, print a fix guide below the result table:

```
=== Fixes Required ===

[{#}] {Check Name}:
    {fix code from the matching category file (fix-install.md, fix-config.md, fix-theme.md, fix-surface.md)}
```

If the `--fix` argument is present, print more detailed fix code.
Without `--fix`, the basic fix guide is still always printed.

## --fix Mode

When the `--fix` argument is present:

1. Run all 26 checks first.
2. For each FAIL/WARN item, print the fix code from the relevant category file (`fix-install.md`, `fix-config.md`, `fix-theme.md`, `fix-surface.md`).
3. For each fix item, confirm with the user whether to apply:
   > "[{#}] {description} — apply? (y/n)"
4. If the user responds `y`, apply the fix.
5. After applying, rerun the check to verify it now passes.

**Note**: Automatic fixes only create or modify files. For package installs such as `npm install`, only the suggested command is printed for the user.

## Error Handling

- File read failure: mark the check as SKIP and record the reason.
- Network error (`npm view`): mark Step 3 as SKIP.
- If every check passes:
  > "All checks passed. opt-ui is ready to use."

## Reference: Surface CLI distribution model

Surface components are not distributed as npm packages; instead, they are copied as source files into the project via the CLI tool (`@reopt-ai/opt-ui-cli`), following the shadcn/ui pattern.

- **Install**: `npx @reopt-ai/opt-ui-cli add <slug>`
- **List**: `npx @reopt-ai/opt-ui-cli list`
- **Config file**: `opt-ui.json` (tracks surfacesDir, importAlias, and installed Surfaces)
- **Core/Shells/Visuals**: remain in the `@reopt-ai/opt-ui` npm package (unchanged)
- **Surface**: copied as local files in the project and freely modifiable
