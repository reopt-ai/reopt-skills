---
name: opt-chat-install
description: |
  Install or upgrade @reopt-ai/opt-chat in a consumer project. Auto-branches by current install state. Triggers on "opt-chat install", "opt-chat init", "opt-chat setup", "chat install", "install chat", "set up AI chat", "opt-chat upgrade", "opt-chat update", "chat update".
target: "@reopt-ai/opt-chat"
targetMinVersion: "0.3.1"
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
| Parts | 25 message part renderers (reasoning, tool, artifact, code, agent, …) |
| Input | Attachments, SpeechInput, ModelSelector |
| Streaming | streamdown + shiki syntax highlighting |
| Styling | Tailwind + opt-ui CSS variable tokens |

## Invocation

```
/opt-chat-install              # Auto-branch (missing → init, installed → upgrade)
/opt-chat-install --upgrade    # Explicit upgrade
/opt-chat-install --check      # Analyze only
```

## Step 1 — Pin agent rules into AGENTS.md / CLAUDE.md

Source: the module's own agent-rules file once it ships one (`@reopt-ai/opt-chat` does not, as of 0.3.1). Fallback: `agent-rules.md` bundled with this skill. Wrap content between:

```
<!-- BEGIN:reopt/opt-chat-agent-rules -->
…content from source…
<!-- END:reopt/opt-chat-agent-rules -->
```

**Idempotent:** replace only between markers.

## Step 2 — Consumer-side setup (this skill owns; docs cannot)

1. **Registry auth** — project-root `.npmrc`:
   ```
   @reopt-ai:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```
   PAT with `read:packages`. Never hardcode.

2. **Prereqs** — Node 18+, React 19+, Tailwind configured with opt-ui tokens (or a compatible CSS variable token set), Vercel AI SDK–compatible AI endpoint.

3. **App wiring** — properties of the consumer app:
   - AI endpoint route (e.g. `app/api/chat/route.ts`) returning a Vercel AI SDK stream.
   - Default Chat component composition (Conversation > Message[] > PromptInput).

## Step 3 — Route to module docs

opt-chat ships **no** `dist/docs/`. Route to `node_modules/@reopt-ai/opt-chat/README.md` sections (and `CHANGELOG.md`).

| Task signal | Read |
|---|---|
| Quick start + composition (Conversation / Message / PromptInput) | `README.md` §§ Quick start, Component catalog |
| Hooks (`useChatSession`), 25 part renderers, input (Attachments / SpeechInput / ModelSelector), streaming | `README.md` § Component catalog |
| opt-ui token / design-system integration | `README.md` § Design system integration |
| Version migration / breaking changes | `README.md` § Migration, `CHANGELOG.md` |

## Pipeline (auto-branch)

| # | Step | Init | Upgrade |
|---|---|---|---|
| 1 | Detect current state | ✓ | ✓ |
| 2 | `.npmrc` (GitHub Packages) | ✓ | – |
| 3 | Install / update package | ✓ | ✓ |
| 4 | Tailwind configuration check | ✓ | ✓ |
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
