# Breaking Changes Registry — @reopt-ai/opt-editor

Per-version registry of Breaking / Deprecated / Added / Fixed changes.
The `/opt-editor-install` skill reads this file during impact analysis in upgrade mode.

> **Maintenance rule**: whenever an opt-editor release introduces a Breaking or Deprecated
> change, add an entry here in the same PR that bumps `COMPATIBILITY.md`.

## Format

```
### {version}

#### Breaking (B)
- **[B{n}]** {description}
  - Before: `{old API}`
  - After: `{new API}`
  - Scan: `grep -rn "{pattern}" --include="*.tsx" --include="*.ts"`

#### Deprecated (D)
- **[D{n}]** {description}

#### Added (A)
- **[A{n}]** {description}

#### Fixed (F)
- **[F{n}]** {description}
```

---

## Version History

### 0.1.0 (Initial Release)

No breaking changes — this is the first release.

#### Added (A)

- **[A1]** Editor, EditorProvider, BlockTree, StaticRenderer components
- **[A2]** createEditorStore with undo/redo and JSON Patch
- **[A3]** defineCatalog for block type registration
- **[A4]** AI streaming: StreamCompiler, useEditorStream, buildAIMessages
- **[A5]** extractSSEText (Anthropic + OpenAI SSE format support)
- **[A6]** transformToNDJSON for text-to-NDJSON conversion
- **[A7]** Serialization: specToMarkdown, markdownToSpec, specToHtml
- **[A8]** Inline marks: bold, italic, code, strikethrough, link
- **[A9]** Slash commands and markdown shortcuts
- **[A10]** StaticRenderer for server-side rendering
- **[A11]** createStateStore for dynamic expressions
- **[A12]** createActionRegistry for custom actions
- **[A13]** Visibility conditions ($state, $and, $or)
- **[A14]** Expression system ($state, $cond, $template, $computed)

### 0.7.0

No breaking changes — purely additive.

#### Added (A)

- **[A15]** AI Command system: `AICommandMenu`, `useAICommandMenu`, `createAICommandRegistry`, `DEFAULT_AI_COMMANDS`
- **[A16]** Ghost text (copilot): `GhostTextOverlay`, `useGhostText`, `onGhostTextRequest` prop
- **[A17]** AI conversation: `useAIConversation`, `useAISuggestion`
- **[A18]** Selection context: `useAISelectionContext`, `buildBlockSelectionContext`, `buildTextSelectionContext`, `extractSelectedSpec`
- **[A19]** Editor/EditorProvider new props: `onAIRequest`, `onGhostTextRequest`
- **[A20]** BlockToolbar new props: `onAIImprove`, `onAIGenerate`
- **[A21]** Inline diff: `InlineDiffView`, `diffSpecsDetailed`, `diffWords`
- **[A22]** AI progress: `AIProgressBar`
- **[A23]** `buildAIMessages` — new optional `selectionContext` field in AIStreamOptions
- **[A24]** `buildSlashCommands`, `filterCommandsByContext` utilities
- **[A25]** `NONE_CONTEXT` constant

### 0.7.x (post-release additions)

No breaking changes — purely additive.

#### Added (A)

- **[A26]** Image `prompt` attr — AI-generation prompt placeholder. When `src` is absent and only `prompt` is set, the editor renders the prompt placeholder UI.
- **[A27]** `onImageGenerate` callback — added to `EditorProvider`/`Editor`. `(blockId: string, prompt: string) => Promise<FileUploadResult | null>`.
- **[A28]** `onImageBrowse` callback — media library modal. `() => Promise<FileUploadResult | null>`.
- **[A29]** `onFileRemove` callback — notified when an image URL is removed/replaced. `(url: string) => void`. Excludes `data:` URLs.
- **[A30]** `FileUploadResult.alt` — consumers can return alt text too. `{ url, width?, height? }` → `{ url, alt?, width?, height? }`.
- **[A31]** Image prompt serialization — HTML: `data-image-prompt` attribute, Markdown: `<!-- image-prompt: ... -->` comment. `markdownToSpec()` parses them back.
- **[A32]** Inline prompt editing — click prompt text in edit mode to modify it.

### 0.8.0

No breaking changes — purely additive.

#### Added (A)

- **[A33]** `FileUploadResult` type export — `{ url: string; alt?: string; width?: number; height?: number }`.
- **[A34]** `onFileUpload` prop — added to `EditorProvider`/`Editor`. `(file: File) => Promise<FileUploadResult>`. Server-upload handler.
- **[A35]** `onImageBrowse` prop — media-library modal (was internal in 0.7.x → promoted to a public prop in 0.8.0).
- **[A36]** `onImageGenerate` prop — AI image generation (internal in 0.7.x → public prop in 0.8.0).
- **[A37]** `onFileRemove` prop — file-URL removal notice (internal in 0.7.x → public prop in 0.8.0).
- **[A38]** Image block recipe — new `06-image-block.md` doc (alignment, resize, caption, preview, upload).
- **[A39]** AI component API docs expanded — `AICommandMenu`, `AIProgressBar`, `InlineDiffView`, `GhostTextOverlay`, `InlineToolbar` props documented.

### 0.9.0

No breaking changes — purely additive.

#### Added (A)

- **[A40]** `resourceId` support — added optional `resourceId` to `ImageAttrs` and `FileUploadResult`. For DAM integration, version control, and external image editors. Serialized as `data-resource-id` in HTML and `<!-- resource-id: ... -->` in Markdown.
- **[A41]** `onImageEdit` prop — added to `EditorProvider`/`Editor`. `(context: ImageEditContext) => Promise<FileUploadResult | null>`. Integrates external image editors (e.g., Canva). Exposes an Edit button on the floating toolbar.
- **[A42]** `onFileRemove` enhanced — added an optional second `resourceId` parameter. `(url: string, resourceId?: string) => void`. Enables resource-based cleanup.

### 0.10.0

No breaking changes — purely additive.

#### Added (A)

- **[A43]** `@reopt-ai/opt-editor/ai-sdk` sub-path export — Vercel AI SDK integration adapter.
  - `createEditorHandler` — server route handler (three modes: "stream", "operations", "agent")
  - `useEditorAI` — client hook (generate, edit, multi-turn, suggestion review)
  - `useEditorCompletion` — ghost text / copilot via AI SDK
  - `useEditorChatBridge` — bridge between Chat and Editor (auto-applies data-stream patches)
  - `writeEditorPatch` / `writeEditorPatches` — UIMessageStreamWriter helpers
  - `createEditorTools` — Agent-mode AI SDK tools (getDocument, applyEdits)
  - `createEditorOperationSchema` — Zod schema for EditorOperation validation
  - `patchOpSchema` / `patchOpsArraySchema` — Zod schemas for JSON Patch
  - `catalogBlockTypes` / `buildAttrsSchema` / `catalogAttrsSchemas` — catalog-aware helpers
  - `EDITOR_PATCH_PART_TYPE` / `isEditorPatchPart` — data-stream type constants
- **[A44]** `EditorOperation` — high-level abstraction replacing JSON Patch.
  - Operations: `insert`, `update`, `remove`, `move` (Markdown-content based)
  - `OperationCompiler` — EditorOperation[] → JsonPatchOp[]
  - `OperationStreamCompiler` — NDJSON EditorOperation stream → JsonPatchOp[]
  - `createOperationStream` — Response body → patch stream
  - `catalog.prompt({ protocol: "operations" })` — Operations-protocol system prompt
- **[A45]** `buildEditorPrompt` — builds `{ system, prompt }` for the AI SDK.
- **[A46]** `createPatchStream` — Response body → `AsyncIterable<JsonPatchOp>` utility.
- **[A47]** `useAISuggestion` — shadow-store-based AI suggestion review (approve/reject/refine/per-block).
- **[A48]** `PatchSource` — universal input type: supports ReadableStream, AsyncIterable, and tagged ops.
- **[A49]** `tagPatchOps` — marks pre-parsed ops as a PatchSource.

#### Deprecated (D)

- **[D1]** `extractSSEText` — not needed when using the AI SDK (`streamText` handles SSE). Only use it when calling a raw provider API directly.

### 1.0.0

First stable release. One breaking change for consumers with exhaustive `EditorMode` handling.

#### Breaking (B)

- **[B1]** `EditorMode` expanded: `"stream" | "edit"` → `"stream" | "edit" | "diff"`.
  - Before: `switch (mode) { case "stream": ...; case "edit": ...; }` was exhaustive.
  - After: must add a `"diff"` branch (or fall through to a default) to keep TS exhaustiveness checks passing.
  - Scan: `grep -rn "EditorMode\|mode ===.*\"edit\"\|mode ===.*\"stream\"" --include="*.ts" --include="*.tsx"`
  - Diff mode renders the new `<SuggestionDecorations>` overlay; if your app does not surface AI-suggestion review, the existing `"stream"` / `"edit"` branches keep working as before — only the type union widened.

#### Added (A)

- **[A50]** `<SuggestionDecorations>` — overlay component that renders per-block accept / reject / refine controls during diff mode. Wired automatically when `mode="diff"`; no manual mounting required for the default flow.
- **[A51]** `editor-provider` props for diff mode — `onSuggestionAccept`, `onSuggestionReject`, `onSuggestionRefine` callbacks (all optional; default behavior writes through to the underlying store).
- **[A52]** New i18n keys for diff/suggestion UI in `en` / `ko` locales (9 keys covering accept, reject, refine, batch actions). Custom locale providers must extend their dictionaries — the editor falls back to English when a key is missing.
- **[A53]** Public exports in `index.ts` for the suggestion-decorations primitives (component + helpers) so consumers can compose their own review surface.
- **[A54]** Extensive CSS additions for diff layering, suggestion highlights, and accept/reject affordances — `@reopt-ai/opt-editor/styles.css` is required (not new, but the diff UI is invisible without it).

---

## Scan Pattern Guidelines

When scanning for breaking change impact, use these patterns:

| Change Type       | Scan Pattern                                                      |
| ----------------- | ----------------------------------------------------------------- |
| Removed export    | `grep -rn "import.*{OldName}" --include="*.ts" --include="*.tsx"` |
| Renamed prop      | `grep -rn "propName" --include="*.tsx"`                           |
| Changed signature | `grep -rn "functionName(" --include="*.ts" --include="*.tsx"`     |
| Removed CSS class | `grep -rn "className.*oldClass" --include="*.tsx"`                |
