---
name: opt-chat-install
description: |
  Install or upgrade @reopt-ai/opt-chat in a consumer project, including its AI SDK 7 form/conversation contract. Auto-branches by current install state. Triggers on "opt-chat install", "opt-chat init", "opt-chat setup", "chat install", "install chat", "set up AI chat", "opt-chat upgrade", "opt-chat update", "chat update", "PromptInput form", "Conversation migration".
target: "@reopt-ai/opt-chat"
targetMinVersion: "1.1.0"
---

# opt-chat Install

> This is NOT the opt-chat you know. opt-chat ships **no** `dist/docs/` — read `node_modules/@reopt-ai/opt-chat/README.md` before writing code.

## When to apply

Consumer project depends on `@reopt-ai/opt-chat`. Triggers: "install", "init", "setup", "upgrade", "update" — with `chat` / `opt-chat` / "set up AI chat".

## What opt-chat provides

| Area | Pattern |
|---|---|
| Core | Conversation, Message, PromptInput (composable) |
| Hook | `useChatSession` (Vercel AI SDK wrapper) |
| Parts | Rich message part renderers (reasoning, tool, artifact, code, agent, sources, …) |
| Input | Attachments, SpeechInput, ModelSelector, AudioPlayer / VoiceSelector |
| Streaming | streamdown + shiki syntax highlighting |
| Flow | `@reopt-ai/opt-chat/flow` agent-graph Canvas (optional peer `@xyflow/react`) |
| Styling | opt-ui global CSS **or** `@reopt-ai/opt-chat/styles.css` (CSS-variable tokens) — **no Tailwind config required** |

## Invocation

```
/opt-chat-install              # Auto-branch (missing → init, installed → upgrade)
/opt-chat-install --upgrade    # Explicit upgrade
/opt-chat-install --check      # Analyze only
```

## Step 1 — Pin agent rules into AGENTS.md / CLAUDE.md

Source: the module's own agent-rules file once it ships one (`@reopt-ai/opt-chat` does not, as of 1.1.0). Fallback: `agent-rules.md` bundled with this skill. Wrap content between:

```
<!-- BEGIN:reopt/opt-chat-agent-rules -->
…content from source…
<!-- END:reopt/opt-chat-agent-rules -->
```

**Idempotent:** replace only between markers.

## Step 2 — Consumer-side setup (this skill owns; docs cannot)

1. **Public npm registry** — no token or scoped `.npmrc` entry is required. Inspect the project `.npmrc` and `npm config get @reopt-ai:registry`; if the scope still resolves to GitHub Packages, remove only the legacy project entry `@reopt-ai:registry=https://npm.pkg.github.com`. Preserve unrelated registry/auth settings, and ask before changing user/global npm config.

2. **Prereqs** — Node 20+, React 19+, an AI SDK v7-compatible endpoint (`ai` 7 / `@ai-sdk/react` 4 are direct dependencies in 1.1). **No Tailwind required.** Optional peers: `react-jsx-parser` (JSXPreview parts), `@xyflow/react` (`/flow` Canvas).

3. **App wiring** — properties of the consumer app:
   - Styles: `import "@reopt-ai/opt-chat/styles.css"` at the app root **unless** opt-ui's global CSS is already loaded (they share keyframes / data-attribute tokens).
   - AI endpoint route (e.g. `app/api/chat/route.ts`) returning a Vercel AI SDK stream.
   - Default Chat component composition (Conversation > Message[] > PromptInput).

4. **1.1 upgrade scan** — `PromptInput` now renders a native `<form>` (never nest it in another form); replace removed StickToBottom-era Conversation props (`initial`, `resize`) with `autoScroll`, `scrollEdgeThreshold`, `scrollPreviousItemPeek`, or `scrollMargin`. Pass native AI SDK tool-part approval states/objects rather than maintaining a parallel status model.

## Step 3 — Route to module docs

opt-chat ships **no** `dist/docs/`. Route to `node_modules/@reopt-ai/opt-chat/README.md` sections (and `CHANGELOG.md`).

| Task signal | Read |
|---|---|
| Quick start + composition (Conversation / Message / PromptInput) | `README.md` §§ Quick start, Component catalog |
| Hooks (`useChatSession`), part renderers, input (Attachments / SpeechInput / ModelSelector), streaming | `README.md` § Component catalog |
| Styling / CSS import (opt-ui CSS or `styles.css`) | `README.md` § Styles |
| Flow / agent-graph Canvas (`@reopt-ai/opt-chat/flow`) + optional peers | `README.md` §§ Optional peers, Flow |
| opt-ui token / design-system integration | `README.md` § Design system integration |
| Version migration / breaking changes | `CHANGELOG.md` (1.1 detail lives only there); `README.md` § "Migration 0.1 → 0.2" covers the 0.x rename only |

## Pipeline (auto-branch)

| # | Step | Init | Upgrade |
|---|---|---|---|
| 1 | Detect current state | ✓ | ✓ |
| 2 | Public-registry preflight + legacy override cleanup | ✓ | ✓ |
| 3 | Install / update package | ✓ | ✓ |
| 4 | Styles import check (opt-ui CSS or `styles.css`) | ✓ | ✓ |
| 5 | AI SDK endpoint check | ✓ | – |
| 6 | Generate default Chat component | ✓ | – |
| 7 | Breaking-change edits | – | ✓ |
| 8 | Verify + summary | ✓ | ✓ |

## Safety

- Never upgrade without an impact scan.
- Apply breaking-change edits in logical groups.
- Do not finish until `tsc --noEmit` passes.
- **Never commit** — do not commit or push without an explicit request from the user.

## Verify

1. `npx tsc --noEmit` passes.
2. Chat conversation renders, AI endpoint streams back, parts render correctly (text + at least one code block).
