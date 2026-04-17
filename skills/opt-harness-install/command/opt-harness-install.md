---
description: "Unified install/upgrade workflow for @reopt-ai/opt-harness in consumer projects."
---

Install or upgrade `@reopt-ai/opt-harness` in a consumer project.

## Step 1: State Detection

### 1a. Inspect project context

```bash
# Package manager
ls package.json bun.lockb yarn.lock pnpm-lock.yaml package-lock.json 2>/dev/null

# React version
node -e "const p = require('./package.json'); console.log(p.dependencies?.react || 'not found')"

# opt-harness install state + version
node -e "try { const p = require('./node_modules/@reopt-ai/opt-harness/package.json'); console.log('installed:', p.version) } catch { console.log('not installed') }"

# Whether opt-ui is present (theme tokens — required)
node -e "try { require.resolve('@reopt-ai/opt-ui'); console.log('opt-ui: installed') } catch { console.log('opt-ui: NOT installed') }"

# Whether opt-palette is present (theme generation engine — required)
node -e "try { require.resolve('@reopt-ai/opt-palette'); console.log('opt-palette: installed') } catch { console.log('opt-palette: NOT installed') }"

# opt-datagrid (optional — for HarnessDataGridAdapter)
node -e "try { require.resolve('@reopt-ai/opt-datagrid'); console.log('opt-datagrid: installed') } catch { console.log('opt-datagrid: not installed') }"

# opt-editor (optional — for HarnessEditorAdapter)
node -e "try { require.resolve('@reopt-ai/opt-editor'); console.log('opt-editor: installed') } catch { console.log('opt-editor: not installed') }"

# Tailwind CSS
grep -q "tailwindcss" package.json && echo "tailwind: installed" || echo "tailwind: not installed"
```

### 1b. Determine execution mode

```
if opt-harness NOT installed:
  → Init mode (Steps 2-7, 9)

if opt-harness IS installed:
  latest = npm view @reopt-ai/opt-harness version --registry=https://npm.pkg.github.com
  if installed < latest OR "$ARGUMENTS" contains "upgrade/update":
    → Upgrade mode (Steps 3, 4, 8, 9)
  else:
    → Already latest (Step 9 summary only)
```

### 1c. Prerequisite check

Stop immediately if opt-ui is missing:

```
opt-harness depends on opt-ui theme tokens.
Run /opt-ui-install first.
```

You cannot proceed without opt-ui.

**Display:**

```
=== opt-harness-install: {Init/Upgrade} Mode ===

| Check        | Status              |
| ------------ | ------------------- |
| Package mgr  | {bun/npm}           |
| React        | {version}           |
| opt-harness  | {not installed / v} |
| opt-ui       | {installed/not}     |
| opt-palette  | {installed/not}     |
| opt-datagrid | {installed/not}     |
| opt-editor   | {installed/not}     |
| Tailwind     | {installed/not}     |
```

---

## Step 2: .npmrc & Auth Setup (Init only)

```ini
@reopt-ai:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Stop and show setup instructions if `GITHUB_TOKEN` is missing.

---

## Step 3: Package Install/Update

### Init mode

```bash
{pm} add @reopt-ai/opt-harness @reopt-ai/opt-palette
```

### Upgrade mode

```bash
{pm} add @reopt-ai/opt-harness@latest
```

**Only run after user approval.**

### Optional peer dependencies

Ask the user whether they need these:

```bash
# When using the DataGrid adapter
{pm} add @reopt-ai/opt-datagrid

# When using the Editor adapter
{pm} add @reopt-ai/opt-editor
```

---

## Step 4: opt-ui Theme Verification (Init, Upgrade)

Verify the CSS variables that opt-harness components rely on:

```bash
# Confirm OptThemeProvider sits at the root
grep -r "OptThemeProvider" --include="*.tsx" -l
```

If absent, explain:

```
opt-harness components require opt-ui theme tokens such as
--opt-bg, --opt-surface, --opt-border.
Ensure your root layout wraps the app in <OptThemeProvider>.
```

---

## Step 5: Harness Manifest (Init only)

Generate a harness manifest at the project root (or under `lib/`).

**Ask the user for the app identity and defaults:**

```
App ID (for example: my-admin-tool): ___
App label (for example: Admin Tool): ___
Default density (comfortable / compact): ___
```

```ts
// lib/harness.ts
import { createHarnessApp } from "@reopt-ai/opt-harness/core";

export const appHarness = createHarnessApp({
  id: "{user-input-id}",
  label: "{user-input-label}",
  defaults: {
    density: "{user-choice}",
    contentWidth: "wide",
    navigationMode: "sidebar",
  },
});
```

**Confirm the file path with the user before creating it.**

---

## Step 6: AppShell + Nav Setup (Init only)

Add HarnessProvider + HarnessAppShell to the root (or app) layout.

### 6a. Wrap in the Provider

Locate the project's root layout file:

```bash
find . -path "*/app/layout.*" -not -path "*/node_modules/*" | head -5
```

Wrap the layout with HarnessProvider:

```tsx
import { HarnessProvider } from "@reopt-ai/opt-harness";
import { appHarness } from "@/lib/harness";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <HarnessProvider manifest={appHarness}>{children}</HarnessProvider>
      </body>
    </html>
  );
}
```

### 6b. Create the AppShell

Create a separate client component for the AppShell:

```tsx
// components/app-shell.tsx
"use client";

import {
  HarnessAppShell,
  HarnessCollapsibleNav,
  HarnessNavGroup,
  HarnessNavItem,
  useHarnessNav,
} from "@reopt-ai/opt-harness";

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <HarnessAppShell
      nav={
        <HarnessCollapsibleNav width={260}>
          <HarnessNavGroup label="Menu">
            <HarnessNavItem href="/">Home</HarnessNavItem>
            {/* Edit for your actual routes */}
          </HarnessNavGroup>
        </HarnessCollapsibleNav>
      }
      mobileHeader={<MobileMenuButton />}
    >
      {children}
    </HarnessAppShell>
  );
}

function MobileMenuButton() {
  const { open } = useHarnessNav();
  return (
    <button type="button" onClick={open} aria-label="Open menu">
      <svg
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        />
      </svg>
    </button>
  );
}
```

**Customize navigation entries and routes with the user before continuing.**

---

## Step 7: First Workspace Page (Init only)

Ask the user about the first page's main purpose:

```
What is the primary content of your first page?
1. Data table (list, filter, sort) → ListWorkspace
2. Single-resource detail view    → DetailWorkspace
3. Content editor                  → EditorWorkspace
4. Dashboard (metrics, charts)     → DashboardWorkspace
5. Landing page                    → LandingWorkspace
```

Or let `selectRecipe()` recommend for you:

```ts
import { selectRecipe } from "@reopt-ai/opt-harness/core";
selectRecipe({ hasDataGrid: true }); // → "list"
```

### DashboardWorkspace example (default)

```tsx
// app/page.tsx
import { DashboardWorkspace, HarnessSection } from "@reopt-ai/opt-harness";

export default function HomePage() {
  return (
    <DashboardWorkspace
      header={<h1 className="text-lg font-semibold">Dashboard</h1>}
    >
      <HarnessSection title="Overview">
        <p>Welcome to your app.</p>
      </HarnessSection>
    </DashboardWorkspace>
  );
}
```

### ListWorkspace example (DataGrid)

```tsx
import {
  ListWorkspace,
  HarnessSection,
  HarnessDataGridAdapter,
} from "@reopt-ai/opt-harness";

export default function UsersPage() {
  return (
    <ListWorkspace
      header={<h1 className="text-lg font-semibold">Users</h1>}
      toolbar={<div>{/* Filter controls */}</div>}
    >
      <HarnessSection title="All users">
        <HarnessDataGridAdapter
          rows={[]}
          columns={[]}
          loading={false}
          empty={{
            title: "No users",
            description: "Create one to get started",
          }}
        />
      </HarnessSection>
    </ListWorkspace>
  );
}
```

**Generate the example that matches the user's choice, and confirm the file path.**

---

## Step 8: Breaking Changes (Upgrade only)

> **Reference**: `references/breaking-changes.md`

### 8a. Load changes

Collect Breaking/Deprecated changes between installed → target.

### 8b. Scan consumer code for impact

```bash
grep -r "from ['\"]@reopt-ai/opt-harness['\"]" --include="*.tsx" --include="*.ts" -l
```

### 8c. Propose edits per group

```
Breaking Change: {code}
  Files affected: {count}
  BEFORE: {old_code}
  AFTER:  {new_code}
  Apply? (yes/no)
```

Run `tsc --noEmit` after every group.

---

## Step 9: Validation & Summary

### Verification

```bash
npx tsc --noEmit
{pm} test  # When existing tests are present
```

### Init Summary

```
=== opt-harness-install Complete (Init) ===

Installed: @reopt-ai/opt-harness@{version}
Palette: @reopt-ai/opt-palette@{version}
Theme: opt-ui tokens
Manifest: {path}
AppShell: {path}
First page: {path} ({recipe})

Next steps:
  - Add navigation items to AppShell
  - Create more workspace pages (List, Detail, Editor)
  - Optional: install @reopt-ai/opt-datagrid for HarnessDataGridAdapter
  - Optional: install @reopt-ai/opt-editor for HarnessEditorAdapter
  - Customize theme: createHarnessApp defaults.theme
```

### Upgrade Summary

```
=== opt-harness-install Complete (Upgrade) ===

Upgraded: @reopt-ai/opt-harness {old} → {new}
Breaking changes fixed: {count}

Next steps:
  - git diff
  - Run tests
```

<user-request>
$ARGUMENTS
</user-request>
