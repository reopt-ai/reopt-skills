# Breaking Changes Registry — @reopt-ai/opt-chat

A registry of Breaking / Deprecated / Added / Fixed changes per version.
The `/opt-chat-install` skill reads this file during impact analysis in upgrade mode.

> **Maintenance rule**: whenever an opt-chat release introduces a Breaking or Deprecated
> change, add an entry here in the same PR that bumps `COMPATIBILITY.md`.

## v0.1.0 (Initial Release)

No breaking changes — first public version.

### Added (A)

- Conversation, Message, PromptInput core components
- useChatSession hook (Vercel AI SDK wrapper)
- 25 message part renderers
- Input controls: Attachments, SpeechInput, ModelSelector
- Tailwind utility-based styling with CSS variable tokens
