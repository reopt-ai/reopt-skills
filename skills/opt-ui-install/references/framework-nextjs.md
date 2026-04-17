# Next.js App Router Setup

Use this for consumer projects with `next` and an `app/` or `src/app/` layout.

## Prerequisites

- React 19+
- Tailwind CSS v4
- `GITHUB_TOKEN` with `read:packages`
- `.npmrc` configured for GitHub Packages

## Minimal Install

Use the project's package manager. Example:

```bash
bun add @reopt-ai/opt-ui
bun add -d tailwindcss @tailwindcss/postcss postcss
```

`.npmrc`:

```ini
@reopt-ai:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

## Global CSS

For `app/globals.css`:

```css
@import "tailwindcss";
@import "@reopt-ai/opt-ui/tailwind.css";

@source "../node_modules/@reopt-ai/opt-ui/dist";
```

For `src/app/globals.css`:

```css
@import "tailwindcss";
@import "@reopt-ai/opt-ui/tailwind.css";

@source "../../node_modules/@reopt-ai/opt-ui/dist";
```

Notes:

- `@source` is relative to the CSS file location.
- `@reopt-ai/opt-ui/tailwind.css` includes theme presets, dark variant, token mapping, and base defaults.

## Root Layout

```tsx
import { OptThemeProvider } from "@reopt-ai/opt-ui";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <OptThemeProvider defaultPreset="default">{children}</OptThemeProvider>
      </body>
    </html>
  );
}
```

## PostCSS

`postcss.config.mjs`:

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

## Optional: `next.config.ts`

Add this if Next.js shows ESM or package-transpile issues:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@reopt-ai/opt-ui"],
};

export default nextConfig;
```

## Surface Workflow

```bash
npx @reopt-ai/opt-ui-cli list
npx @reopt-ai/opt-ui-cli add billing-page
```

Copied Surface files become local app code.

## Verification

- `@reopt-ai/opt-ui` exists in dependencies
- global CSS imports `@reopt-ai/opt-ui/tailwind.css`
- `@source` points to the package `dist`
- root layout uses `OptThemeProvider`
