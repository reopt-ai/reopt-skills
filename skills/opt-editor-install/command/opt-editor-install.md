---
description: Install or upgrade @reopt-ai/opt-editor in a consumer project. Auto-detects current state and branches accordingly.
---

Install or upgrade `@reopt-ai/opt-editor` in a consumer project.

> **Reference docs:**
>
> - `references/catalog-patterns.md` — block definition patterns
> - `references/breaking-changes.md` — per-version change log

## Package Config

| Variable             | Value                       |
| -------------------- | --------------------------- |
| `PACKAGE_NAME`       | `@reopt-ai/opt-editor`      |
| `PACKAGE_SHORT`      | `opt-editor`                |
| `MONOREPO_SRC_PATH`  | `packages/opt-editor/src/`  |
| `DOCTOR_SKILL`       | `/opt-editor-doctor`        |
| `COMPANION_PACKAGES` | (none)                      |

---

## Step 1: Detect current state

```bash
# Current install state + version in package.json
grep "@reopt-ai/opt-editor" package.json 2>/dev/null
```

| Result        | Branch                                              |
| ------------- | --------------------------------------------------- |
| Not installed | **Init Pipeline** (Step 2 → 3 → 4 → 5 → 6 → 9)      |
| Installed     | **Upgrade Pipeline** (Step 3 → 4 → 7 → 8 → 9)       |

For the Upgrade branch, check for a newer release:

```bash
npm view @reopt-ai/opt-editor version --registry=https://npm.pkg.github.com 2>/dev/null
```

If already on the latest, print "Already on the latest version." and exit.

---

## Step 2: .npmrc Configuration (Init only)

Check whether `.npmrc` already has the `@reopt-ai` registry:

```bash
grep -q "@reopt-ai:registry" .npmrc 2>/dev/null && echo "EXISTS" || echo "MISSING"
```

If MISSING, append:

```ini
@reopt-ai:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Verify auth:

```bash
npm whoami --registry=https://npm.pkg.github.com
```

If auth fails, stop and show setup instructions for `GITHUB_TOKEN`.

---

## Step 3: Package install / update

### Init

```bash
bun add @reopt-ai/opt-editor
```

### Upgrade

> **Follow the shared pipeline, Steps 2–4.**
> Run `../../_shared/upgrade-pipeline.md` Step 2 (collect changes), Step 3 (scope-of-impact scan), and Step 4 (package update).

Confirm install:

```bash
node -e "console.log(require('@reopt-ai/opt-editor/package.json').version)"
```

**Read dist/docs for AI reference:**

After install, read `node_modules/@reopt-ai/opt-editor/dist/docs/index.md`.

---

## Step 4: CSS import check

**Run for both Init and Upgrade.**

opt-editor requires a CSS import. Check whether the project already has it:

```bash
grep -r "@reopt-ai/opt-editor/styles" --include="*.tsx" --include="*.ts" src/ app/ components/ pages/ 2>/dev/null
```

If not, add it to the root layout or app entry:

```tsx
import "@reopt-ai/opt-editor/styles.css";
```

- **Next.js App Router**: `app/layout.tsx` or a layout that uses the editor
- **Vite/CRA**: `main.tsx` or `App.tsx`

---

## Step 5: Create Block Catalog (Init only)

Create a catalog file. Suggested locations:

- Next.js: `lib/editor/catalog.ts` or `components/editor/catalog.ts`
- General: `src/editor/catalog.ts`

Read `references/catalog-patterns.md` and create a catalog with the block
types required. At minimum: paragraph, heading, quote, code.

The catalog file should export a `catalog` produced by
`defineCatalog({ ... })`.

---

## Step 6: Create Editor Component (Init only)

```tsx
"use client";

import { useState } from "react";
import {
  Editor,
  createEditorStore,
  createEmptySpec,
} from "@reopt-ai/opt-editor";
import { catalog } from "./catalog"; // the file created in Step 5

export function ContentEditor() {
  const [store] = useState(() => createEditorStore(createEmptySpec()));

  return (
    <Editor
      store={store}
      catalog={catalog}
      mode="edit"
      ariaLabel="Content editor"
    />
  );
}
```

### With AI streaming (`--with-ai` flag)

When `--with-ai` is requested, add the streaming integration:

```tsx
"use client";

import { useState, useCallback } from "react";
import {
  Editor,
  createEditorStore,
  createEmptySpec,
  useEditorStream,
  buildAIMessages,
  extractSSEText,
  transformToNDJSON,
} from "@reopt-ai/opt-editor";
import { catalog } from "./catalog";

export function AIContentEditor() {
  const [store] = useState(() => createEditorStore(createEmptySpec()));
  const stream = useEditorStream(store);

  const generate = useCallback(
    async (prompt: string) => {
      const messages = buildAIMessages({ prompt, catalog });
      const response = await fetch("/api/ai/editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const textStream = extractSSEText(response.body!);
      const ndjsonStream = transformToNDJSON(textStream);
      stream.start(ndjsonStream);
    },
    [stream],
  );

  return (
    <div>
      <Editor store={store} catalog={catalog} mode="edit" />
      <p>Status: {stream.status}</p>
    </div>
  );
}
```

---

## Step 7: Breaking-change edits (Upgrade only)

> **Follow the shared pipeline, Step 5.**
> Run `../../_shared/upgrade-pipeline.md` Step 5 (code edits).

### opt-editor-specific patterns

**StaticRenderer migration:**

```tsx
// BEFORE
<Editor mode="view" value={content} />;

// AFTER
import { StaticRenderer } from "@reopt-ai/opt-editor";
<StaticRenderer value={content} />;
```

### Follow-ups when type errors persist

1. Consult `node_modules/@reopt-ai/opt-editor/dist/docs/05-troubleshooting.md`.
2. Re-verify the CSS import (re-run Step 4).
3. Re-check removed/renamed exports.

---

## Step 8: Deprecated fixes (Upgrade only, optional)

> **Follow the shared pipeline, Step 6.**
> Run `../../_shared/upgrade-pipeline.md` Step 6 (Deprecated fixes).

---

## Step 9: Doctor validation & summary

Run the 18 environment checks. Full procedure in `references/doctor-checks.md`.

### 9a. Run doctor

Run the 18 checks from `references/doctor-checks.md` in order and print a table:

```
=== opt-editor Doctor (18 checks) ===

 #  Check                       Status
 1  opt-editor package installed  PASS (0.8.0)
 2  React version                 PASS (19.x)
...

Summary: {PASS} passed, {WARN} warnings, {FAIL} errors
```

### 9b. Fix guidance on FAIL

Based on the failed check number, open the corresponding fix reference:

- `references/fix-install.md` — checks 1–5 (package install & dependencies)
- `references/fix-config.md` — checks 6–10 (CSS / TypeScript / Next.js)
- `references/fix-editor.md` — checks 11–14 (catalog / editor / store)
- `references/fix-advanced.md` — checks 15–18 (AI streaming / compat / docs)

### 9c. Type check

```bash
npx tsc --noEmit
```

### 9d. Tests (Upgrade)

```bash
npm test 2>/dev/null || bun test 2>/dev/null
```

### 9e. Display summary

**Init:**

```
=== opt-editor-install Complete (Init) ===

Package: @reopt-ai/opt-editor@{version}
CSS:     import "@reopt-ai/opt-editor/styles.css"
Catalog: {path}/catalog.ts
Editor:  {path}/content-editor.tsx
Doctor:  {PASS}/{total} checks passed

Next steps:
  - Add more block types (see dist/docs/03-recipes/02-custom-blocks.md)
  - Set up AI streaming (see dist/docs/03-recipes/03-ai-streaming.md)
```

**Upgrade:**

```
=== opt-editor-install Complete (Upgrade) ===

Version: {old} -> {new}
Modified files: N
Doctor:  {PASS}/{total} checks passed

Next steps:
  - git diff
  - Run tests
```

---

## Error Recovery

### npm install fails

```bash
# Check registry config
cat .npmrc | grep reopt-ai
# Check token
echo "GITHUB_TOKEN: ${GITHUB_TOKEN:+set}"
# Manual install with verbose
npm install @reopt-ai/opt-editor --registry=https://npm.pkg.github.com --verbose
```

### Missing peer dependencies

```bash
bun add react@^19 react-dom@^19
```

### Upgrade rollback

```bash
npm install @reopt-ai/opt-editor@{old-version} --registry=https://npm.pkg.github.com
```

<user-request>
$ARGUMENTS
</user-request>
