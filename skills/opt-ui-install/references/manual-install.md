# Manual / Private Install

Use this when the consumer project is not a documented Next.js App Router setup or
when you only need the private package install and Surface CLI flow.

## Registry Auth

`.npmrc`:

```ini
@reopt-ai:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Required:

- `GITHUB_TOKEN` with `read:packages`
- React 19+

## Minimal Install

```bash
bun add @reopt-ai/opt-ui
```

If the app does not already have Tailwind CSS v4, add the toolchain too:

```bash
bun add -d tailwindcss @tailwindcss/postcss postcss
```

## Canonical CSS Integration

```css
@import "tailwindcss";
@import "@reopt-ai/opt-ui/tailwind.css";

@source "../node_modules/@reopt-ai/opt-ui/dist";
```

Adjust the `@source` path relative to the actual CSS file.

## Root Theme Provider

Whatever the app shell looks like, the root render tree should include
`OptThemeProvider`:

```tsx
import { OptThemeProvider } from "@reopt-ai/opt-ui";

<OptThemeProvider defaultPreset="default">
  <App />
</OptThemeProvider>;
```

## Surface CLI

```bash
npx @reopt-ai/opt-ui-cli list
npx @reopt-ai/opt-ui-cli add billing-page
```

Copied Surface files are local application files after installation.

## Recommendation

If the app is Next.js App Router, prefer `references/framework-nextjs.md`.
That is the documented primary integration path.
