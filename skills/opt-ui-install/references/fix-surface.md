# Fix Guide — Surface CLI & Integration [16-18, 24-26]

---

## [16] opt-ui-primitives install check (INFO)

`@reopt-ai/opt-ui-primitives` is missing from node_modules. It should be installed automatically as a runtime dependency of opt-ui, but may be missing due to package manager hoisting issues.

**Fix**: Install it explicitly.

```bash
bun add @reopt-ai/opt-ui-primitives
# or
npm install @reopt-ai/opt-ui-primitives
```

> **Note**: Starting in opt-ui v1.1.0, the project uses its own `@reopt-ai/opt-ui-primitives` package. `@ariakit/react` has been removed.

---

## [17] Recharts install check (INFO)

`recharts` is missing from node_modules. It is required to use chart components (LineChart, BarChart, etc.).

**Fix**: Install it explicitly.

```bash
bun add recharts
# or
npm install recharts
```

> **Note**: If you don't use chart components, this warning can be ignored.

---

## [18] CLAUDE.md component reference (WARN)

`CLAUDE.md` lacks the opt-ui component reference guide. With this guidance in place, AI agents can automatically discover and use opt-ui components when implementing UI.

**Fix**: Add the following section to `CLAUDE.md` at the project root.

```markdown
## @reopt-ai/opt-ui

When implementing UI, prefer opt-ui components.
Always check the existing components in dist docs before building anything from scratch with HTML/Tailwind.

### Component documentation

- `node_modules/@reopt-ai/opt-ui/dist/docs/02-components/` — Core/Visuals/Shells/Surfaces components
- `node_modules/@reopt-ai/opt-ui/dist/docs/03-recipes/` — composition examples and layout patterns
- Surface components: list with `npx @reopt-ai/opt-ui-cli list`, install with `npx @reopt-ai/opt-ui-cli add <slug>`

### Key rules

- Always wrap Surface components with `SurfaceLayout`
- Use semantic spacing tokens (`gap-section`/`gap-group`/`gap-element`)
- Avoid `space-y-*`/`space-x-*` (prefer semantic tokens)
```

If `CLAUDE.md` does not exist, create a new file with the content above.

---

## [24] Surface file existence (WARN)

A Surface file registered in `opt-ui.json` is missing from the actual directory.

**Fix**: Reinstall the missing Surface(s) via the CLI.

```bash
# Reinstall missing Surface
npx @reopt-ai/opt-ui-cli add <missing-slug>

# Multiple at once
npx @reopt-ai/opt-ui-cli add billing-page analytics-dashboard

# Install without confirmation
npx @reopt-ai/opt-ui-cli add --yes <slug>
```

Alternatively, remove the entry from the `surfaces` array in `opt-ui.json`.

---

## [25] Surface contentHash match (WARN)

The installed Surface file differs from the original. If you customized it locally, this is expected.

**When you need to restore the original**:

```bash
# Overwrite with the original (skip confirmation with --yes)
npx @reopt-ai/opt-ui-cli add --yes <slug>
```

**When you want to keep local edits**: This warning can be ignored. Surfaces are project-owned code and can be freely modified.

> **Note**: In the future, `npx @reopt-ai/opt-ui-cli diff <slug>` will be available to compare local changes against upstream changes.

---

## [26] Surface import validity (WARN)

The Surface file still contains relative imports (`../shells/`, `../core/`, etc.). Since Surfaces are local files in the project, they must import from the `@reopt-ai/opt-ui` package.

**Fix**: Change relative imports to package imports.

```tsx
// Before (relative imports — won't work in the project locally)
import { SearchCombobox } from "../shells/search-combobox";
import { SurfaceLayout } from "../core/surface-layout";
import { cn } from "../lib/cn";

// After (package imports — correct)
import { SearchCombobox, SurfaceLayout, cn } from "@reopt-ai/opt-ui";
```

Alternatively, reinstall the Surface via the CLI to convert imports automatically:

```bash
npx @reopt-ai/opt-ui-cli add --yes <slug>
```
