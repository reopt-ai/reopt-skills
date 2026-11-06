---
name: opt-chat-install
description: |
  Install or upgrade @reopt-ai/opt-chat in a consumer project, including its AI SDK 7 form/conversation contract. Auto-branches by current install state. Triggers on "opt-chat install", "opt-chat init", "opt-chat setup", "chat install", "install chat", "set up AI chat", "opt-chat upgrade", "opt-chat update", "chat update", "PromptInput form", "Conversation migration".
target: "@reopt-ai/opt-chat"
targetMinVersion: "2.0.0"
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
| Styling | `@reopt-ai/opt-chat/styles.css` (CSS-variable tokens; required whenever code blocks render) — **no Tailwind config required** |

## Invocation

```
/opt-chat-install              # Auto-branch (missing → init, installed → upgrade)
/opt-chat-install --upgrade    # Explicit upgrade
/opt-chat-install --check      # Analyze only
```

## Step 1 — Pin agent rules into AGENTS.md / CLAUDE.md

Source: the module's own agent-rules file once it ships one (`@reopt-ai/opt-chat` does not, as of 2.0.0). Fallback: `agent-rules.md` bundled with this skill. Wrap content between:

```
<!-- BEGIN:reopt/opt-chat-agent-rules -->
…content from source…
<!-- END:reopt/opt-chat-agent-rules -->
```

**Idempotent:** replace only between markers.

## Step 2 — Consumer-side setup (this skill owns; docs cannot)

1. **Public npm registry** — no token or scoped `.npmrc` entry is required. Inspect the project `.npmrc` and `npm config get @reopt-ai:registry`; if the scope still resolves to GitHub Packages, remove only the legacy project entry `@reopt-ai:registry=https://npm.pkg.github.com`. Preserve unrelated registry/auth settings, and ask before changing user/global npm config.

2. **Prereqs** — **Node 22+** (2.0 `engines >=22.0.0`; 1.1.x was 20+ — a project that cannot leave Node 20 stays on 1.1.x), React 19+, an AI SDK v7-compatible endpoint (`ai` 7 / `@ai-sdk/react` 4 are direct dependencies). **No Tailwind required.** Optional peers, each needed only by its entry: `react-jsx-parser` → `@reopt-ai/opt-chat/jsx-preview`, `@xyflow/react` → `/flow`. From 2.0 the root reaches neither (on 1.1.x the root's `import("react-jsx-parser")` broke Next builds without the parser).

3. **App wiring** — properties of the consumer app:
   - Styles: `import "@reopt-ai/opt-chat/styles.css"` at the app root whenever `CodeBlock` (and so `ToolInput` / `ToolOutput`) can render — opt-ui's global CSS shares only the keyframes and has no `.shiki` dual-theme rules, so loading opt-ui is not a substitute.
   - AI endpoint route (e.g. `app/api/chat/route.ts`) returning a Vercel AI SDK stream.
   - Default Chat component composition (Conversation > Message[] > PromptInput).

4. **1.1 upgrade scan** — `PromptInput` now renders a native `<form>` (never nest it in another form); replace removed StickToBottom-era Conversation props (`initial`, `resize`) with `autoScroll`, `scrollEdgeThreshold`, `scrollPreviousItemPeek`, or `scrollMargin`. Pass native AI SDK tool-part approval states/objects rather than maintaining a parallel status model.

5. **2.0 upgrade scan** — (a) `ToolState` is removed (TS2305): import `ConfirmationState`, which 2.0 exports and which is identical to `ConfirmationProps["state"]` (that type works on 1.1.x and 2.0 alike); never substitute `ToolPartState` — it holds only two of the seven members. (b) `JSXPreview` / `JSXPreviewContent` / `JSXPreviewError` / `useJSXPreview` and their props types left the root — import them from `@reopt-ai/opt-chat/jsx-preview`. (c) Move CI and runtime to Node 22. (d) Import `styles.css` (above). Streamdown plugins (code, math, mermaid, shiki) now load on demand; `preloadStreamdownPlugins()` is optional. The 2.0 detail lives only in `CHANGELOG.md` § `[2.0.0]`, which omits the Node 22 bump.

## Step 3 — Route to module docs

opt-chat ships **no** `dist/docs/`. Route to `node_modules/@reopt-ai/opt-chat/README.md` sections (and `CHANGELOG.md`).

| Task signal | Read |
|---|---|
| Quick start + composition (Conversation / Message / PromptInput) | `README.md` §§ Quick start, Component catalog |
| Hooks (`useChatSession`), part renderers, input (Attachments / SpeechInput / ModelSelector), streaming | `README.md` § Component catalog |
| Styling / CSS import (`styles.css`) | `README.md` § Styles |
| Lazy Streamdown plugins (`preloadStreamdownPlugins`, `useStreamdownPlugins`) | `README.md` § "Markdown 플러그인 지연 로딩" |
| `ToolGroup`, `PromptInput disabled` (2.0) | `README.md` § "Compact operation history" |
| Flow / agent-graph Canvas (`/flow`), JSXPreview (`/jsx-preview`) + optional peers | `README.md` §§ Optional peers, Flow |
| opt-ui token / design-system integration | `README.md` § Design system integration |
| Version migration / breaking changes | `CHANGELOG.md` § `[2.0.0]` (2.0 detail lives only there); `README.md` §§ "Migration 1.0 → 1.1", "Migration 0.1 → 0.2" |

## Pipeline (auto-branch)

| # | Step | Init | Upgrade |
|---|---|---|---|
| 1 | Detect current state | ✓ | ✓ |
| 2 | Public-registry preflight + legacy override cleanup | ✓ | ✓ |
| 3 | Install / update package | ✓ | ✓ |
| 4 | Styles import check (`styles.css`) | ✓ | ✓ |
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
