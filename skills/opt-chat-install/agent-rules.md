# This is NOT the opt-chat you know

`@reopt-ai/opt-chat` ships frequent breaking changes that may differ from your training data. It ships **no** `dist/docs/` — read `node_modules/@reopt-ai/opt-chat/README.md` before writing or reviewing any chat code.

## Doc map

| Task | Read (opt-chat ships no docs dir — use `README.md`) |
|---|---|
| Composition, hooks (`useChatSession`), part renderers, input, streaming | `README.md` § Component catalog |
| opt-ui token / design-system integration | `README.md` § Design system integration |
| Version migration / breaking changes | `README.md` § Migration, `CHANGELOG.md` |

## Hard rules

- `@reopt-ai/*` installs from public npm — never add a GitHub Packages scope or token. Remove only the exact legacy project-level `@reopt-ai:registry=https://npm.pkg.github.com` entry; preserve unrelated registry/auth settings and ask before changing user/global npm config.
- Node 20+ and React 19+ required.
- Import `@reopt-ai/opt-chat/styles.css` when opt-ui's global CSS isn't already loaded, or animations / shimmer render unstyled. opt-chat needs **no** Tailwind config (it ships no Tailwind peer).
- AI backend must match the AI SDK v7 transport used by opt-chat 1.1. `useChatSession` will not work against a custom SSE protocol.
- Conversation / Message / PromptInput are composable — do not wrap them in a single monolithic component.
- `PromptInput` is a native `<form>` in 1.1 — never nest it inside another form. Preserve async-submit failure state so text and attachments remain retryable.
- Conversation no longer uses StickToBottom props: remove `initial` / `resize`; use `autoScroll`, edge/peek/margin props, and `ConversationMessage scrollAnchor` for turn anchoring.
- Feed `Confirmation` and approve/deny helpers the native AI SDK tool-part object or `part.approval.id`; do not invent a second approval-state mapping.
- Apply breaking-change edits in logical groups, never bulk.
