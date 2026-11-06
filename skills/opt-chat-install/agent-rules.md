# This is NOT the opt-chat you know

`@reopt-ai/opt-chat` ships frequent breaking changes that may differ from your training data. It ships **no** `dist/docs/` — read `node_modules/@reopt-ai/opt-chat/README.md` before writing or reviewing any chat code.

## Doc map

| Task | Read (opt-chat ships no docs dir — use `README.md`) |
|---|---|
| Composition, hooks (`useChatSession`), part renderers, input, streaming | `README.md` § Component catalog |
| opt-ui token / design-system integration | `README.md` § Design system integration |
| Version migration / breaking changes | `CHANGELOG.md` (§ `[2.0.0]` for 1.1 → 2.0), `README.md` §§ Migration 1.0 → 1.1 / 0.1 → 0.2 |

## Hard rules

- `@reopt-ai/*` installs from public npm — never add a GitHub Packages scope or token. Remove only the exact legacy project-level `@reopt-ai:registry=https://npm.pkg.github.com` entry; preserve unrelated registry/auth settings and ask before changing user/global npm config.
- Node 22+ (opt-chat 2.0; 1.1.x ran on 20) and React 19+ required.
- Import `@reopt-ai/opt-chat/styles.css` whenever `CodeBlock`, `ToolInput` or `ToolOutput` can render — opt-ui's global CSS has no `.shiki` dual-theme rules and covers only the shared keyframes. opt-chat needs **no** Tailwind config (it ships no Tailwind peer).
- Import the JSXPreview family only from `@reopt-ai/opt-chat/jsx-preview` and Canvas / Node only from `/flow`, never from the root.
- Type confirmation state as `ConfirmationState` (or `ConfirmationProps["state"]`); `ToolState` no longer exists in 2.0, and `ToolPartState` covers only two of its seven members.
- AI backend must match the AI SDK v7 transport used by opt-chat 1.1+. `useChatSession` will not work against a custom SSE protocol.
- Conversation / Message / PromptInput are composable — do not wrap them in a single monolithic component.
- `PromptInput` is a native `<form>` from 1.1 — never nest it inside another form. Preserve async-submit failure state so text and attachments remain retryable.
- Conversation no longer uses StickToBottom props: remove `initial` / `resize`; use `autoScroll`, edge/peek/margin props, and `ConversationMessage scrollAnchor` for turn anchoring.
- Feed `Confirmation` and approve/deny helpers the native AI SDK tool-part object or `part.approval.id`; do not invent a second approval-state mapping.
- Apply breaking-change edits in logical groups, never bulk.
