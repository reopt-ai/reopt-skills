---
name: opt-chat-install
description: |
  Install or upgrade @reopt-ai/opt-chat in a consumer project.
  Not installed → initial setup (.npmrc, Tailwind, AI SDK, Conversation components).
  Installed → detect version → analyze impact → edit code → verify.
  Triggers on: "opt-chat install", "opt-chat init", "opt-chat setup",
  "chat install", "install chat", "set up AI chat",
  "opt-chat upgrade", "opt-chat update", "chat update".
  Current version: opt-chat 0.1.0.
---

# opt-chat-install Skill

Install or upgrade `@reopt-ai/opt-chat` in a consumer project.

> **CRITICAL — execution workflow:**
>
> This file (SKILL.md) covers invocation shape and safety rules.
> The actual step-by-step procedure lives in **`command/opt-chat-install.md`**.
>
> **Read `command/opt-chat-install.md` before starting any work.**

## What opt-chat Provides

| Area      | Pattern                                                                 |
| --------- | ----------------------------------------------------------------------- |
| Core      | Conversation, Message, PromptInput (composable)                         |
| Hook      | `useChatSession` (Vercel AI SDK wrapper)                                |
| Parts     | 25 message part renderers (reasoning, tool, artifact, code, agent, ...) |
| Input     | Attachments, SpeechInput, ModelSelector                                 |
| Streaming | streamdown + shiki syntax highlighting                                  |
| Styling   | Tailwind utility classes + opt-ui CSS variable tokens                   |

## Invocation

```
/opt-chat-install                    # Auto-branch (missing → init, installed → upgrade)
/opt-chat-install --upgrade          # Explicit upgrade
/opt-chat-install --check            # Analyze only (no code changes)
```

## Auto-Branch Pipeline

| Step | Description                 | Init | Upgrade |
| ---- | --------------------------- | ---- | ------- |
| 1    | Detect current state        | O    | O       |
| 2    | .npmrc for GitHub Packages  | O    | -       |
| 3    | Package install / update    | O    | O       |
| 4    | Tailwind configuration      | O    | O       |
| 5    | AI SDK endpoint check       | O    | -       |
| 6    | Generate default Chat component | O | -       |
| 7    | Breaking-change edits       | -    | O       |
| 8    | Verify & summarize          | O    | O       |

## Prerequisites

- Node.js 18+, React 19+
- GitHub token with `read:packages` scope
- Tailwind CSS configured (opt-ui theme tokens or compatible CSS variables)
- AI backend endpoint (Vercel AI SDK compatible)

## Safety Rules

1. **Never update the package without user approval.**
2. Apply breaking changes in logical groups.
3. **Do not finish until type check and tests pass.**
4. **Never commit** — do not commit or push without an explicit request.

## References

- `references/component-patterns.md` — composition patterns for Conversation / Message / PromptInput
- `references/breaking-changes.md` — per-version breaking-change registry

## Related Skills

- `/opt-ui-install` — opt-ui theme + Tailwind config (opt-chat relies on its CSS variables)
- `/opt-editor-install` — install opt-editor (independent of opt-chat)
