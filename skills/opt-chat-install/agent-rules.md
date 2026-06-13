# This is NOT the opt-chat you know

`@reopt-ai/opt-chat` ships frequent breaking changes that may differ from your training data. It ships **no** `dist/docs/` — read `node_modules/@reopt-ai/opt-chat/README.md` before writing or reviewing any chat code.

## Doc map

| Task | Read (opt-chat ships no docs dir — use `README.md`) |
|---|---|
| Composition, hooks (`useChatSession`), 25 part renderers, input, streaming | `README.md` § Component catalog |
| opt-ui token / design-system integration | `README.md` § Design system integration |
| Version migration / breaking changes | `README.md` § Migration, `CHANGELOG.md` |

## Hard rules

- Never hardcode `GITHUB_TOKEN` in `.npmrc` — inject via shell or CI secret.
- React 19+ required.
- Tailwind CSS must be configured with opt-ui theme tokens (or a CSS variable–compatible token set). Stock Tailwind without tokens will produce unstyled output.
- AI backend must be a Vercel AI SDK–compatible endpoint. `useChatSession` will not work against a custom SSE protocol.
- Conversation / Message / PromptInput are composable — do not wrap them in a single monolithic component.
- Apply breaking-change edits in logical groups, never bulk.
