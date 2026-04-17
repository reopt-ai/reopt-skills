# Fix: CSS & Build Config (Checks 6-10)

## Check 6: CSS import (styles.css) {#check-6}

Add to the global CSS file (for example `src/app/globals.css`):

```css
@import "@reopt-ai/opt-editor/styles.css";
```

Recommended import order:

```css
/* 1. Framework */
@import "tailwindcss";

/* 2. opt-ui (if used) */
@import "@reopt-ai/opt-ui/theme/presets/default.css";

/* 3. opt-editor */
@import "@reopt-ai/opt-editor/styles.css";

/* 4. Project-specific styles */
```

> opt-editor's styles.css ships only the minimum base styles.
> It targets `data-*` attribute selectors, so class-name collisions do not occur.

---

## Check 7: CSS custom-property validity {#check-7}

Overridable CSS custom properties:

```css
:root {
  /* Valid properties */
  --opt-editor-selection: oklch(0.8 0.1 250);
  --opt-editor-border: oklch(0.8 0 0);
  --opt-editor-caption: oklch(0.5 0 0);
  --opt-editor-code-bg: oklch(0.95 0 0);
  --opt-editor-code-block-bg: oklch(0.15 0 0);
  --opt-editor-link: oklch(0.55 0.15 250);
  --opt-editor-callout-border: oklch(0.7 0.1 250);
  --opt-editor-callout-bg: oklch(0.95 0.05 250);
  --opt-editor-table-header-bg: oklch(0.95 0 0);
  --opt-editor-quote-border: oklch(0.7 0 0);
}
```

If unknown property names appear:

- Check for typos (e.g., `--opt-editor-boarder` → `--opt-editor-border`).
- Verify that the installed package version supports that property.

---

## Check 8: TypeScript moduleResolution {#check-8}

Set in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

**Why `bundler`:**

- `@reopt-ai/opt-editor` uses the `package.json` `exports` field.
- The `node` moduleResolution does not fully support the `exports` field.
- `bundler` is compatible with Next.js, Vite, etc.

Alternative: `nodenext` works too, but import paths then require file extensions.

---

## Check 9: TypeScript jsx {#check-9}

```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

- `react-jsx`: React 17+ JSX transform (no `import React` needed).
- `preserve`: Next.js performs the transform itself.

> The `react` value is legacy — it calls `React.createElement` directly.

---

## Check 10: Next.js transpilePackages {#check-10}

`next.config.ts` (or `.js`/`.mjs`):

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@reopt-ai/opt-editor"],
};

export default nextConfig;
```

If other `@reopt-ai/*` packages are already listed, add it to the array:

```ts
transpilePackages: [
  "@reopt-ai/opt-ui",
  "@reopt-ai/opt-editor",
],
```

**Why this matters:**

- opt-editor ships as ESM.
- The setting tells Next.js to process node_modules ESM correctly.
- Without it, you can hit "Cannot use import statement" at runtime.
