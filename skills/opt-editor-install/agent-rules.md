# This is NOT the opt-editor you know

`@reopt-ai/opt-editor` ships frequent breaking changes that may differ from your training data. Read `node_modules/@reopt-ai/opt-editor/dist/docs/` before writing or reviewing any editor code.

## Doc map

| Task | Read (under `dist/docs/`, start at `index.md`) |
|---|---|
| API (components, hooks, store, serialization, types) | `dist/docs/02-api/` |
| AI streaming integration | `dist/docs/02-api/04-ai-stream.md`, `dist/docs/03-recipes/03-ai-streaming.md` |
| Recipes (custom blocks, markdown, diff-review, …) | `dist/docs/03-recipes/` |
| Getting started / troubleshooting | `dist/docs/01-getting-started.md`, `dist/docs/05-troubleshooting.md` |

## Hard rules

- Never hardcode `GITHUB_TOKEN` in `.npmrc` — inject via shell or CI secret.
- React 19+ required.
- `EditorSpec` is the canonical content schema — do not hand-parse the stored JSON. Rich text lives in each element's `content` field, not `attrs`.
- `<Editor>` uses browser APIs (contentEditable/Selection) — it must live in a `"use client"` component (Next.js App Router). `StaticRenderer` / `specToHtml` are the RSC-safe read-only path. Don't swap them.
- `EditorMode` is `"stream" | "edit" | "diff"` — any exhaustive mode handling (e.g. `switch (mode)`) must cover the review-only `"diff"` branch or it silently breaks.
- Catalog block IDs are stable identifiers — renaming them is a breaking change for stored content.
- AI streaming requires a Vercel AI SDK–compatible endpoint. Don't roll your own SSE protocol.
- Apply breaking-change edits in logical groups (per category), never bulk.
