# Fix Guide — CSS/Tailwind/PostCSS/TypeScript configuration [6-14]

---

## [6] Tailwind CSS install (ERROR)

opt-ui uses Tailwind CSS.

**Fix (Tailwind v4)**:

```bash
# bun
bun add -D tailwindcss @tailwindcss/postcss

# npm
npm install -D tailwindcss @tailwindcss/postcss
```

**Fix (Tailwind v3)**:

```bash
# bun
bun add -D tailwindcss postcss autoprefixer

# npm
npm install -D tailwindcss postcss autoprefixer
```

---

## [7] Tailwind content path (ERROR)

opt-ui components are not included in the Tailwind build target, so styles aren't applied.

### Tailwind v4 (CSS `@source` approach)

Add to `globals.css` (or your main CSS file):

```css
@import "tailwindcss";

/* Scan opt-ui components */
@source "../node_modules/@reopt-ai/opt-ui/dist";
```

> **Path note**: The `@source` path is relative to the CSS file. Adjust based on where `node_modules` is located.

### Tailwind v3 (config `content` approach)

`tailwind.config.{js,ts}`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // Include opt-ui components
    "./node_modules/@reopt-ai/opt-ui/dist/**/*.{js,mjs}",
  ],
  // ...
};
```

---

## [8] CSS theme preset import (ERROR)

The opt-ui theme CSS variables aren't loaded, so colors, spacing, and so on don't work.

**Fix**: Add a theme preset import to `globals.css`.

```css
/* opt-ui theme preset (pick one) */
@import "@reopt-ai/opt-ui/theme/presets/default.css";
```

Available presets:

- `default.css` — default theme (recommended)
- `corporate.css` — business style
- `playful.css` — bright, rounded style
- `natural.css` — natural colors (light only)
- `minimal.css` — clean, minimal style
- `pro.css` — neon blue, mono headings

**Import order**: Import the theme preset after the Tailwind import.

```css
@import "tailwindcss";
@import "@reopt-ai/opt-ui/theme/presets/default.css";

/* @source directive ... */
```

---

## [9] .npmrc configuration (ERROR)

`@reopt-ai` packages are published to the GitHub Packages registry. `.npmrc` configuration is required.

**Fix**: Create a `.npmrc` file in the project root.

```ini
@reopt-ai:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

**Environment variable setup**:

```bash
# GitHub Personal Access Token (read:packages scope)
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

> **Security note**: Do not hardcode the token in `.npmrc`. Use the `${GITHUB_TOKEN}` environment variable reference, and either add `.npmrc` to `.gitignore` or rely on environment variables only.

---

## [10] TypeScript configuration (WARN)

The settings in `tsconfig.json` are not compatible with opt-ui.

**Fix**: Review `compilerOptions` in `tsconfig.json`.

```jsonc
{
  "compilerOptions": {
    // moduleResolution: "bundler" recommended (Next.js default)
    "moduleResolution": "bundler",
    // jsx: "react-jsx" or "preserve" (Next.js default)
    "jsx": "react-jsx",
  },
}
```

For Next.js projects, running `npx next` configures this automatically.

---

## [11] PostCSS configuration (WARN)

The PostCSS configuration file is missing or the Tailwind plugin is not listed.

### Tailwind v4

`postcss.config.mjs`:

```js
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

### Tailwind v3

`postcss.config.js`:

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

## [12] transpilePackages (WARN)

If `@reopt-ai` packages are not included in `transpilePackages` in Next.js, ESM-related errors may occur.

**Fix**: Add to `next.config.{js,ts,mjs}`.

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@reopt-ai/opt-ui"],
  // ... existing settings
};

export default nextConfig;
```

> **Note**: `transpilePackages` is available in Next.js 14+. In some cases ESM packages are handled automatically, but adding them explicitly is safer.

---

## [13] GITHUB_TOKEN environment variable (WARN)

`.npmrc` references `${GITHUB_TOKEN}` but the environment variable is not set.

**Fix**: Set the token in your shell session.

```bash
# GitHub Personal Access Token (read:packages scope)
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

To persist it:

```bash
# Add to ~/.zshrc or ~/.bashrc
echo 'export GITHUB_TOKEN=ghp_xxxxxxxxxxxx' >> ~/.zshrc
source ~/.zshrc
```

Or add it to the project `.env` file and source it via `source .env`:

```bash
echo 'GITHUB_TOKEN=ghp_xxxxxxxxxxxx' >> .env
source .env
```

---

## [14] CSS @source path dist vs src (WARN)

The `@source` path points to `src/`. Since `src/` may be excluded from future package releases, switching to `dist/` is recommended.

**Fix**: Update the path in `globals.css`.

```css
/* Before (direct src reference) */
@source "../node_modules/@reopt-ai/opt-ui/src";

/* After (dist reference — stable) */
@source "../node_modules/@reopt-ai/opt-ui/dist";
```
