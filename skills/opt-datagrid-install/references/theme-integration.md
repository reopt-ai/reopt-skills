# Theme Integration Reference

## When opt-ui is present (automatic)

In projects that ship opt-ui, DataGrid reads opt-ui CSS variables
automatically. No extra setup is required.

### opt-ui tokens used

| Token                  | Purpose                   | Fallback          |
| ---------------------- | ------------------------- | ----------------- |
| `--opt-surface`        | Grid background           | `#ffffff`         |
| `--opt-surface-raised` | Header, hovered row       | `#f8f9fa`         |
| `--opt-text`           | Primary text              | `#1a1a2e`         |
| `--opt-text-secondary` | Secondary text            | `#6c757d`         |
| `--opt-text-tertiary`  | Disabled text             | `#adb5bd`         |
| `--opt-border`         | Cell border               | `#dee2e6`         |
| `--opt-border-subtle`  | Subtle divider            | `#e9ecef`         |
| `--opt-border-hover`   | Hover border              | `#adb5bd`         |
| `--opt-accent`         | Selection accent          | `#4361ee`         |
| `--opt-accent-active`  | Active-cell accent        | `#3a56d4`         |
| `--opt-accent-subtle`  | Selection range background| `#4361ee1a`       |
| `--opt-accent-fg`      | Text on accent            | `#ffffff`         |
| `--opt-ring`           | Focus ring                | `#4361ee80`       |
| `--opt-info-subtle`    | Info background           | `#cff4fc`         |
| `--opt-warning`        | Warning text              | `#ffc107`         |
| `--opt-warning-subtle` | Warning background        | `#fff3cd`         |
| `--opt-shadow-sm`      | Small shadow              | `0 1px 2px ...`   |
| `--opt-shadow-md`      | Medium shadow             | `0 4px 6px ...`   |
| `--opt-shadow-lg`      | Large shadow (popover)    | `0 10px 15px ...` |

### Automatic theme preset application

opt-ui ships 6 theme presets (Default, Corporate, Playful, Minimal,
Natural, Pro). Their light/dark variants apply automatically to DataGrid.

```tsx
// No extra configuration needed when opt-ui is present
import { DataGrid } from "@reopt-ai/opt-datagrid";

<DataGrid rows={rows} columns={columns} height={400} />;
```

## Standalone usage (without opt-ui)

### Default styling

Without opt-ui's CSS variables, DataGrid uses built-in fallbacks. The
defaults assume a light theme and work out of the box.

### Custom theme

Define CSS variables directly to customize the theme:

```css
/* Light theme */
:root {
  --opt-surface: #ffffff;
  --opt-surface-raised: #f5f5f5;
  --opt-text: #1a1a1a;
  --opt-text-secondary: #666666;
  --opt-border: #e0e0e0;
  --opt-border-subtle: #f0f0f0;
  --opt-accent: #2196f3;
  --opt-accent-active: #1976d2;
  --opt-accent-subtle: rgba(33, 150, 243, 0.1);
  --opt-accent-fg: #ffffff;
  --opt-ring: rgba(33, 150, 243, 0.5);
  --opt-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --opt-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
}

/* Dark theme */
[data-theme="dark"] {
  --opt-surface: #1e1e2e;
  --opt-surface-raised: #2a2a3e;
  --opt-text: #e0e0e0;
  --opt-text-secondary: #a0a0a0;
  --opt-border: #3a3a4e;
  --opt-border-subtle: #2e2e3e;
  --opt-accent: #64b5f6;
  --opt-accent-active: #42a5f5;
  --opt-accent-subtle: rgba(100, 181, 246, 0.15);
  --opt-accent-fg: #1e1e2e;
  --opt-ring: rgba(100, 181, 246, 0.5);
}
```

### Scoped theme (per container)

Apply a theme to a specific region only:

```css
.custom-grid-wrapper {
  --opt-surface: #fafbfc;
  --opt-accent: #6366f1;
  --opt-border: #e2e8f0;
}
```

```tsx
<div className="custom-grid-wrapper">
  <DataGrid rows={rows} columns={columns} height={400} />
</div>
```

## Performance-adjacent settings

Unrelated to theming, but worth tuning at the same time:

```tsx
<DataGrid
  rows={rows}
  columns={columns}
  height={600}
  // Value cache (prevents re-invoking getValue on interactions)
  valueCache
  valueCacheStrategy="row-id"
  getRowId={(row) => String(row.id)}
  // Scroll performance
  scrollUpdateMode="raf"
  rowBufferPx={200}
  // Search debounce
  searchDebounceMs={80}
/>
```
