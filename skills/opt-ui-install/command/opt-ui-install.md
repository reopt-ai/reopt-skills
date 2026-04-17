---
description: "Unified install/upgrade/surface workflow for @reopt-ai/opt-ui in consumer projects."
---

Install, upgrade, or add a Surface for `@reopt-ai/opt-ui` in a consumer project.

## Step 1: State Detection

Inspect project state and choose the execution mode.

### 1a. Inspect project context

Check these files:

- `package.json` — dependencies, devDependencies
- `.npmrc` — GitHub Packages auth
- `app/globals.css`, `src/app/globals.css`, `src/index.css`, `src/main.css` — CSS integration
- `app/layout.tsx`, `src/app/layout.tsx`, `src/main.tsx` — OptThemeProvider
- `tsconfig.json` — TypeScript settings
- `next.config.*` — Next.js settings
- `opt-ui.json` — Surface CLI config

Extract: package manager, framework, React version, opt-ui install state + version.

### 1b. Determine execution mode

```
if "$ARGUMENTS" contains "surface" or slug name:
  → Surface mode (Steps 8, 9, 10)

if opt-ui NOT in dependencies:
  → Init mode (Steps 2-5, 8?, 9, 10)

if opt-ui IS installed:
  installed = node -e "console.log(require('./node_modules/@reopt-ai/opt-ui/package.json').version)"
  latest = npm view @reopt-ai/opt-ui version --registry=https://npm.pkg.github.com

  if installed < latest OR "$ARGUMENTS" contains "upgrade/update":
    → Upgrade mode (Steps 3, 4, 6-7, 8?, 9, 10)
  else:
    → Surface-only mode (Steps 8, 9, 10)
```

**Show the decision to the user:**

```
=== opt-ui-install: {Init/Upgrade/Surface} Mode ===
Framework: {next/react-router/react/unknown}
Package Manager: {bun/npm/pnpm/yarn}
{opt-ui not installed | opt-ui 1.1.0 → 1.2.1 upgrade | opt-ui 1.2.1 latest}
```

---

## Step 2: .npmrc Setup (Init only)

Configure GitHub Packages auth.

1. Verify `.npmrc` contains `@reopt-ai:registry=https://npm.pkg.github.com`.
2. If missing, add it.
3. Verify `GITHUB_TOKEN` has the `read:packages` scope.

```ini
@reopt-ai:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

**Stop immediately if `GITHUB_TOKEN` is missing:**

> "Set the GITHUB_TOKEN environment variable. It needs the `read:packages` scope."

---

## Step 3: Package Install/Update

### Init mode

```bash
{pm} add @reopt-ai/opt-ui
```

### Upgrade mode

```bash
{pm} add @reopt-ai/opt-ui@latest
```

Also upgrade companion packages:

```bash
# If opt-ui-cli is already installed, upgrade it too
{pm} add @reopt-ai/opt-ui-cli@latest
```

**Only run after user approval.** Share the impact analysis first.

---

## Step 4: CSS Import Verify

Confirm global CSS wires up opt-ui.

Required entries:

```css
@import "tailwindcss";
@import "@reopt-ai/opt-ui/tailwind.css";
@import "@reopt-ai/opt-ui/theme/presets/default.css";

@source "../node_modules/@reopt-ai/opt-ui/dist";
```

- Init: add the block above to global CSS.
- Upgrade: verify the existing imports are correct; migrate `src/` → `dist/` paths.

**Framework references:**

- Next.js App Router → `references/framework-nextjs.md`
- Non-Next → `references/manual-install.md`

---

## Step 5: OptThemeProvider + Theme Boot Script (Init only)

Add `OptThemeProvider` and the **theme boot script** to the app's root layout.

> **CRITICAL:** Omitting `createThemeBootScript()` causes a flash of
> incorrect theme (FOUC) on every navigation. The inline script sets the
> `data-theme` attribute before React hydrates so the CSS variables apply
> immediately.

### Next.js App Router

```tsx
import Script from "next/script";
import { OptThemeProvider, createThemeBootScript } from "@reopt-ai/opt-ui";

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="default" suppressHydrationWarning>
      <head>
        <Script
          id="theme-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: createThemeBootScript(),
          }}
        />
      </head>
      <body>
        <OptThemeProvider>{children}</OptThemeProvider>
      </body>
    </html>
  );
}
```

**Three required pieces:**

1. `data-theme="default"` on `<html>` — SSR fallback (the pre-script default).
2. `createThemeBootScript()` — reads the user theme from localStorage and sets `data-theme` immediately.
3. `suppressHydrationWarning` — prevents warnings when the boot script overrides the SSR value.

### Non-Next.js

```tsx
import { OptThemeProvider, createThemeBootScript } from "@reopt-ai/opt-ui";

// Inject the inline script into index.html's <head>
const bootScript = document.createElement("script");
bootScript.textContent = createThemeBootScript();
document.head.prepend(bootScript);

// React root
createRoot(document.getElementById("root")).render(
  <OptThemeProvider>
    <App />
  </OptThemeProvider>,
);
```

Also add the opt-ui agent rules block to AGENTS.md (or CLAUDE.md):

```markdown
<!-- BEGIN:opt-ui-agent-rules -->

# @reopt-ai/opt-ui: ALWAYS read docs before coding

Before building UI with @reopt-ai/opt-ui, read the relevant doc in
`node_modules/@reopt-ai/opt-ui/dist/docs/`.

<!-- END:opt-ui-agent-rules -->
```

---

## Step 6: Breaking Changes Detection & Fix (Upgrade only)

> **Reference**: `references/breaking-changes.md`

### 6a. Load changes in the version range

Collect every Breaking/Deprecated change between installed → target.

### 6b. Scan consumer code for impact

For each breaking change:

```bash
grep -rn "{old_pattern}" src/ app/ components/ --include="*.tsx" --include="*.ts"
```

### 6c. Propose edits per group

Show only the items that actually affect the project:

```
Breaking Change: {code}
  Level: B (Breaking)
  Files affected: {count}
  BEFORE: {old_code}
  AFTER:  {new_code}
  Apply this fix? (yes/no)
```

**Apply per group after approval. Never bulk-apply.**

### 6d. Type check

After every group:

```bash
npx tsc --noEmit
```

---

## Step 7: Deprecated Cleanup (Upgrade only, optional)

> **Reference**: Deprecated (D) items in `references/breaking-changes.md`

Migrate Deprecated APIs to their replacements. Unlike Breaking, this is
optional:

```
Deprecated: {code}
  Level: D (Deprecated — scheduled for removal in the next major)
  Files affected: {count}
  Auto-fix available: yes
  Apply? (yes/skip)
```

### FormStore special handling

When FormStore restructures are detected:

- Consult `references/migration-formstore.md`.
- Scan for `useValidate`, `useSubmit`, and `as never` patterns, then migrate.

---

## Step 8: Surface CLI Workflow (All modes, optional/explicit)

> **Reference**: `references/surface-workflow.md`

Run in Surface mode, or when the user asks for it.

### 8a. CLI check

```bash
npx @reopt-ai/opt-ui-cli --version
```

### 8b. Pick a Surface

```bash
npx @reopt-ai/opt-ui-cli list          # Full list
npx @reopt-ai/opt-ui-cli search {term} # Search
npx @reopt-ai/opt-ui-cli view {slug}   # Preview
```

### 8c. Add the Surface

```bash
npx @reopt-ai/opt-ui-cli add {slug}
```

### 8d. Post-processing

- Confirm `opt-ui.json` was updated.
- Explain how to wire real data into the copied files.

---

## Step 9: Doctor Validation (All modes)

Run the 26 environment checks. Detailed per-check procedures are in
`references/doctor-checks.md`.

### Execution

Run Steps 0–26 from `references/doctor-checks.md` in order and print the
result table:

```
=== opt-ui Doctor (26 checks) ===

 #  Check                      Status
 1  opt-ui package installed    PASS (1.2.1)
 2  CLI Surface config          WARN (opt-ui.json not found)
...

Summary: {PASS} passed, {WARN} warnings, {FAIL} errors
```

### Fix guidance on FAIL

Based on the failed check number, open the corresponding fix reference:

- `references/fix-install.md` — checks 1–5 (package install & dependencies)
- `references/fix-config.md` — checks 6–14 (CSS / Tailwind / PostCSS / TypeScript)
- `references/fix-theme.md` — checks 15, 19–23 (theme provider & styling)
- `references/fix-surface.md` — checks 16–18, 24–26 (Surface CLI & integration)

**If there is at least one ERROR, present fix guidance and then confirm with the user before continuing.**

---

## Step 10: Summary & Next Steps

### Init mode

```
=== opt-ui-install Complete (Init) ===

Installed: @reopt-ai/opt-ui@{version}
Framework: {framework}
CSS: {globals.css path} updated
Theme: OptThemeProvider added to {layout path}
Doctor: {PASS}/{total} checks passed

Next steps:
  - npx @reopt-ai/opt-ui-cli add <slug>     # Add a Surface
  - Read: node_modules/@reopt-ai/opt-ui/dist/docs/
```

### Upgrade mode

```
=== opt-ui-install Complete (Upgrade) ===

Upgraded: @reopt-ai/opt-ui {old} → {new}
Breaking changes fixed: {count}
Deprecated cleanup: {count}
Doctor: {PASS}/{total} checks passed

Next steps:
  - git diff                                  # Review the diff
  - Run tests                                 # Ensure existing tests still pass
```

### Surface mode

```
=== opt-ui-install Complete (Surface) ===

Added: {slug} → {target_path}
Doctor: {PASS}/{total} checks passed

Next steps:
  - Wire real data into the copied Surface
  - Customize layout to match your app
```

<user-request>
$ARGUMENTS
</user-request>
