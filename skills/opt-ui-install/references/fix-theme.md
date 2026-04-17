# Fix Guide — Theme Provider & Styling [15, 19-23]

---

## [15] OptThemeProvider wrapping (WARN)

`OptThemeProvider` is required for theme switching (ThemeSwitcher) and system dark mode detection.

**Fix**: Add `OptThemeProvider` to the root layout.

```tsx
// app/layout.tsx
import { OptThemeProvider } from "@reopt-ai/opt-ui";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <OptThemeProvider>{children}</OptThemeProvider>
      </body>
    </html>
  );
}
```

> **Note**: The `data-theme="default"` attribute alone applies the base styles, but the Provider is required for preset switching, dark mode toggling, and system mode detection.

---

## [19] Theme text color opacity (WARN)

The theme preset's `--opt-text` variable uses `rgba()` semi-transparent colors. Semi-transparent text alpha-blends with the background, weakening sub-pixel anti-aliasing and appearing blurry.

**Fix**: Convert `rgba()` values in the preset CSS file to `hsl()` solid colors.

Conversion rules — on a light background (white):

```
rgba(0,0,0, α)    → hsl({hue} {sat}% {100 - α×100}%)
rgba(0,0,0, 0.8)  → hsl(H S% 20%)   /* 80% opacity → 20% lightness */
rgba(0,0,0, 0.6)  → hsl(H S% 40%)
rgba(0,0,0, 0.45) → hsl(H S% 55%)
```

On a dark background (black):

```
rgba(255,255,255, α)    → hsl({hue} {sat}% {α×100}%)
rgba(255,255,255, 0.85) → hsl(H S% 87%)
rgba(255,255,255, 0.55) → hsl(H S% 58%)
rgba(255,255,255, 0.35) → hsl(H S% 38%)
```

To preserve theme identity, add a bit of hue and saturation:

| Theme     | Light hue/sat             | Dark hue/sat      |
| --------- | ------------------------- | ----------------- |
| default   | `0 0%` (pure gray)        | `0 0%`            |
| corporate | `210 10%` (blue gray)     | `210 10%`         |
| playful   | `270 5%` (lavender tone)  | `270 5%`          |
| minimal   | `0 0%` (pure neutral)     | `0 0%`            |
| pro       | already uses `hsl()`      | `215 15%`         |
| natural   | already uses `hsl()`      | force-light only  |

Example (default theme):

```css
/* Before — rgba semi-transparent */
--opt-text: rgba(0, 0, 0, 0.8);
--opt-text-secondary: rgba(0, 0, 0, 0.6);
--opt-text-tertiary: rgba(0, 0, 0, 0.45);

/* After — hsl solid colors */
--opt-text: hsl(0 0% 20%);
--opt-text-secondary: hsl(0 0% 40%);
--opt-text-tertiary: hsl(0 0% 55%);
```

> **Note**: In opt-ui v1.1.0, all presets have already been converted to `hsl()` solid colors. If this warning appears, we recommend updating the package (see [3]).

---

## [20] Text-background WCAG contrast (WARN)

The contrast ratio between the theme preset's primary text color (`--opt-text`) and background (`--opt-surface`) falls below the WCAG AA threshold (4.5:1).

**Fix**: Adjust text lightness to increase contrast.

Contrast ratio reference (white background):

| Lightness | Contrast ratio | WCAG AA |
| --------- | -------------- | ------- |
| 20%       | 11.5:1         | PASS    |
| 30%       | 7.1:1          | PASS    |
| 40%       | 4.6:1          | PASS    |
| 45%       | 3.8:1          | FAIL    |
| 50%       | 3.1:1          | FAIL    |

Contrast ratio reference (dark background hsl(0 0% 12%)):

| Lightness | Contrast ratio | WCAG AA |
| --------- | -------------- | ------- |
| 87%       | 10.1:1         | PASS    |
| 80%       | 8.0:1          | PASS    |
| 70%       | 5.6:1          | PASS    |
| 58%       | 3.7:1          | FAIL\*  |
| 50%       | 2.7:1          | FAIL    |

> \*Secondary/tertiary text serves an auxiliary role, so WCAG AA Large Text (3:1) can apply.

**How to fix**: Lower `--opt-text` lightness (light theme) or raise it (dark theme) to ensure contrast.

```css
/* Light theme: lower lightness → higher contrast */
--opt-text: hsl(0 0% 15%); /* 20% → 15% strengthens contrast */

/* Dark theme: higher lightness → higher contrast */
--opt-text: hsl(0 0% 87%); /* 82% → 87% strengthens contrast */
```

---

## [21] @custom-variant dark configuration (WARN)

Tailwind's `dark:` utility classes do not work with opt-ui's `data-theme`-based dark mode. You must register a `@custom-variant dark` directive.

**Fix**: Add the directive below to `globals.css`. Place it after the theme preset import and before `@source`.

```css
@import "tailwindcss";
@import "@reopt-ai/opt-ui/theme/presets/default.css";

/* Register opt-ui dark mode variant */
@custom-variant dark (&:where([data-theme$="-dark"], [data-theme$="-dark"] *));

@source "../node_modules/@reopt-ai/opt-ui/dist";
```

**Explanation**: opt-ui uses compound theme attributes such as `[data-theme="default-dark"]`. Registering this variant makes all Tailwind `dark:` classes (e.g. `dark:bg-gray-900`, `dark:text-white`) work automatically.

> **Note**: Do not use Tailwind's default `@media (prefers-color-scheme: dark)` approach. You must configure it via `@custom-variant` based on `data-theme`.

---

## [22] @theme inline token mapping (WARN)

opt-ui CSS variables are not mapped to Tailwind theme tokens, so semantic Tailwind classes such as `bg-surface` and `text-text-primary` cannot be used.

**Fix**: Add a `@theme inline` block to `globals.css`.

```css
@theme inline {
  /* Color tokens */
  --color-bg: var(--opt-bg);
  --color-surface: var(--opt-surface);
  --color-surface-alt: var(--opt-surface-alt);
  --color-primary: var(--opt-primary);
  --color-primary-hover: var(--opt-primary-hover);
  --color-primary-foreground: var(--opt-primary-foreground);
  --color-border: var(--opt-border);
  --color-ring: var(--opt-ring);

  /* Text tokens */
  --color-text-primary: var(--opt-text);
  --color-text-secondary: var(--opt-text-secondary);
  --color-text-tertiary: var(--opt-text-tertiary);

  /* Semantic states */
  --color-success: var(--opt-success);
  --color-warning: var(--opt-warning);
  --color-error: var(--opt-error);
  --color-info: var(--opt-info);

  /* Spacing tokens */
  --spacing-section: var(--opt-space-section);
  --spacing-group: var(--opt-space-group);
  --spacing-element: var(--opt-space-element);
}
```

**Usage example**:

```html
<!-- Semantic classes available after mapping -->
<div class="bg-surface text-text-primary border-border">
  <h1 class="text-primary">Title</h1>
  <p class="text-text-secondary">Description</p>
</div>

<!-- Semantic spacing -->
<div class="gap-section p-group">...</div>
```

> **Note**: At minimum, `--color-bg`, `--color-surface`, and `--color-text-primary` are required for basic semantic classes to work. Add the rest incrementally as needed.

---

## [23] body base styles (WARN)

opt-ui theme variables are not applied to the `body` element, so background color, text color, and font are not updated when switching themes.

**Fix**: Add `body` base styles to `globals.css`.

```css
body {
  /* Required 3 properties */
  background-color: var(--opt-bg);
  color: var(--opt-text);
  font-family: var(--opt-font-body), ui-sans-serif, system-ui, sans-serif;

  /* Recommended properties */
  accent-color: var(--opt-primary);
  caret-color: var(--opt-primary);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

/* Text selection styling */
::selection {
  background: var(--opt-primary);
  color: var(--opt-primary-foreground);
}

/* Placeholder styling */
::placeholder {
  color: var(--opt-text-tertiary);
}

/* Ring offset color (focus ring background) */
* {
  --tw-ring-offset-color: var(--opt-bg);
}
```

**Required properties**:

| Property           | Role                                          | Symptom when missing                       |
| ------------------ | --------------------------------------------- | ------------------------------------------ |
| `background-color` | Overall background per theme                  | White background persists in dark mode     |
| `color`            | Base text color                               | Theme text color is not applied            |
| `font-family`      | Per-theme font (Corporate=DM Sans, etc.)      | Font does not change when preset changes   |

**Recommended properties**:

| Property       | Role                                                   |
| -------------- | ------------------------------------------------------ |
| `accent-color` | Color for checkboxes, radios, and other native controls |
| `caret-color`  | Input caret color                                       |
| `transition`   | Smooth color transition when switching themes           |
| `::selection`  | Apply theme colors to selected text                     |
| `ring-offset`  | Match the focus ring background to the theme           |

> **Note**: `transition` can be omitted if you don't need a theme switch animation.
