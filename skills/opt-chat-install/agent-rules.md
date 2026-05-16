# This is NOT the opt-chat you know

`@reopt-ai/opt-chat` ships frequent breaking changes that may differ from your training data. Read `node_modules/@reopt-ai/opt-chat/dist/docs/` before writing or reviewing any chat code.

## Doc map

| Task | Read |
|---|---|
| Conversation / Message / PromptInput composition | `dist/docs/components/` |
| `useChatSession` (Vercel AI SDK wrapper) | `dist/docs/hooks.md` |
| 25 message part renderers (reasoning, tool, artifact, code, agent, …) | `dist/docs/parts.md` |
| Attachments, SpeechInput, ModelSelector | `dist/docs/input.md` |
| Streaming (streamdown + shiki) | `dist/docs/streaming.md` |
| Breaking changes per version | `dist/docs/CHANGELOG.md` |
| Install / upgrade procedure | `dist/docs/install.md` |

## Hard rules

- Never hardcode `GITHUB_TOKEN` in `.npmrc` — inject via shell or CI secret.
- React 19+ required.
- Tailwind CSS must be configured with opt-ui theme tokens (or a CSS variable–compatible token set). Stock Tailwind without tokens will produce unstyled output.
- AI backend must be a Vercel AI SDK–compatible endpoint. `useChatSession` will not work against a custom SSE protocol.
- Conversation / Message / PromptInput are composable — do not wrap them in a single monolithic component.
- Apply breaking-change edits in logical groups, never bulk.
