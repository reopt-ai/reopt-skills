# This is NOT the opt-editor you know

`@reopt-ai/opt-editor` ships frequent breaking changes that may differ from your training data. Read `node_modules/@reopt-ai/opt-editor/dist/docs/` before writing or reviewing any editor code.

## Doc map

| Task | Read |
|---|---|
| Editor component, StaticRenderer, EditorSpec | `dist/docs/editor/` |
| Catalog (block-definition pattern) | `dist/docs/catalog/` |
| AI streaming integration (`--with-ai`, AI SDK wiring) | `dist/docs/ai.md` |
| Breaking changes per version | `dist/docs/CHANGELOG.md` |
| Doctor check definitions (1–18) | `dist/docs/doctor.md` |
| Install / upgrade procedure | `dist/docs/install.md` |

## Hard rules

- Never hardcode `GITHUB_TOKEN` in `.npmrc` — inject via shell or CI secret.
- React 19+ required.
- `EditorSpec` is the canonical content schema — do not parse `contentRich` JSON by hand.
- `StaticRenderer` is for read-only rendering; `Editor` mounts the live editor. Don't swap.
- Catalog block IDs are stable identifiers — renaming them is a breaking change for stored content.
- AI streaming requires a Vercel AI SDK–compatible endpoint. Don't roll your own SSE protocol.
- Apply breaking-change edits in logical groups (per category), never bulk.
