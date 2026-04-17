# Fix Guide — Package Install & Dependencies [1-5]

---

## [1] opt-ui package install (ERROR)

`@reopt-ai/opt-ui` is not installed.

**Fix**: Install the package. (You may need to configure `.npmrc` first — see [9].)

```bash
# bun
bun add @reopt-ai/opt-ui

# npm
npm install @reopt-ai/opt-ui

# yarn
yarn add @reopt-ai/opt-ui
```

---

## [2] CLI Surface setup (WARN)

To use Surface components, install them via `@reopt-ai/opt-ui-cli`. Surfaces are copied as source files into the project locally so they can be freely edited.

**Fix**: Install a Surface via the CLI (this automatically creates `opt-ui.json`).

```bash
# List available Surfaces
npx @reopt-ai/opt-ui-cli list

# Install a Surface (e.g., billing-page)
npx @reopt-ai/opt-ui-cli add billing-page

# Install multiple at once
npx @reopt-ai/opt-ui-cli add billing-page analytics-dashboard data-explorer

# Interactive selection
npx @reopt-ai/opt-ui-cli add
```

Example `opt-ui.json` generated after install:

```json
{
  "surfacesDir": "components/surfaces",
  "importAlias": "@/components/surfaces",
  "surfaces": [
    {
      "slug": "billing-page",
      "version": "1.1.0",
      "contentHash": "e33ec0c3",
      "installedAt": "2026-02-24"
    }
  ]
}
```

> **Note**: If you only use Core/Shells/Visuals and not Surfaces, this warning can be ignored.

---

## [3] Package version up-to-date (WARN)

The installed version is not the latest.

**Fix**: Update the package.

```bash
# bun
bun add @reopt-ai/opt-ui@latest

# npm
npm install @reopt-ai/opt-ui@latest
```

If Surfaces were installed via the CLI, refresh them to the latest version with:

```bash
npx @reopt-ai/opt-ui-cli add --yes <slug>
```

---

## [4] React version (ERROR)

opt-ui requires React 19 or newer.

**Fix**: Upgrade React.

```bash
# bun
bun add react@latest react-dom@latest

# npm
npm install react@latest react-dom@latest
```

> **Note**: Upgrading to React 19 may introduce breaking changes. See the [React 19 Upgrade Guide](https://react.dev/blog/2024/12/05/react-19-upgrade-guide).

---

## [5] Next.js version (WARN)

Next.js 16 or newer is recommended.

**Fix**: Upgrade Next.js.

```bash
# bun
bun add next@latest

# npm
npm install next@latest
```
