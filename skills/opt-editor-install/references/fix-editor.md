# Fix: Editor Setup (Checks 11-14)

## Check 11: Catalog definition file {#check-11}

Create a block catalog file (for example `lib/editor/catalog.ts`):

```ts
import { defineCatalog } from "@reopt-ai/opt-editor";

export const catalog = defineCatalog({
  paragraph: {
    type: "paragraph",
    label: "Text",
    render: ({ element, children }) => (
      <p>{children}</p>
    ),
  },
  heading: {
    type: "heading",
    label: "Heading",
    render: ({ element, children }) => {
      const level = element.props?.level ?? 1;
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      return <Tag>{children}</Tag>;
    },
  },
});
```

**Using `defaultCatalog` is also valid:**

```ts
import { defaultCatalog } from "@reopt-ai/opt-editor";

// Use as-is
export const catalog = defaultCatalog;

// Or extend it
import { defineCatalog } from "@reopt-ai/opt-editor";

export const catalog = defineCatalog({
  ...defaultCatalog.blocks,
  // Add custom blocks
  callout: {
    /* ... */
  },
});
```

> Detailed catalog patterns: see `node_modules/@reopt-ai/opt-editor/dist/docs/03-recipes/`.

---

## Check 12: "use client" directive {#check-12}

Add to the first line of any component file that uses Editor:

```tsx
"use client";

import { Editor, createEditorStore } from "@reopt-ai/opt-editor";
import { catalog } from "@/lib/editor/catalog";

export function MyEditor() {
  // ...
}
```

**Why it is needed:**

- The `Editor` component uses client hooks like `useState`, `useRef`.
- In Next.js App Router, components default to the server runtime.
- Without `"use client"`, you get a "useState is not a function" error.

**Do not use Editor directly in page.tsx:**

```tsx
// ❌ page.tsx (server component)
import { Editor } from "@reopt-ai/opt-editor";

// ✅ components/editor.tsx ("use client")
// Import that component from page.tsx
```

---

## Check 13: createEditorStore usage {#check-13}

Editor uses the external-store pattern — create the store with `createEditorStore`:

```tsx
"use client";

import {
  Editor,
  createEditorStore,
  createEmptySpec,
} from "@reopt-ai/opt-editor";
import { catalog } from "@/lib/editor/catalog";

export function MyEditor() {
  const [store] = useState(() => createEditorStore(createEmptySpec()));

  return <Editor store={store} catalog={catalog} mode="edit" />;
}
```

**With existing content:**

```tsx
const [store] = useState(() => createEditorStore(existingSpec));
```

**Gotchas:**

- Call `createEditorStore` outside render, or inside `useState`'s initializer.
- Re-creating it on every render drops state.

---

## Check 14: Editor required props {#check-14}

Required props for the `<Editor>` component:

```tsx
<Editor
  store={store} // return value of createEditorStore() (required)
  catalog={catalog} // return value of defineCatalog() (required)
  mode="edit" // "edit" | "view" (optional, default "edit")
/>
```

**If `store` is missing:**

- Runtime error: "Cannot read properties of undefined".
- Fix: add a `createEditorStore()` call.

**If `catalog` is missing:**

- Blocks fail to render (empty editor).
- Fix: pass `defineCatalog()` output or `defaultCatalog`.

**Additional optional props:**

```tsx
<Editor
  store={store}
  catalog={catalog}
  mode="edit"
  className="mx-auto max-w-3xl" // styling
  readOnly={false} // read-only
  placeholder="Type here..." // empty-state text
/>
```
