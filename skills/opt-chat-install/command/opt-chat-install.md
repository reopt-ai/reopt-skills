---
description: "Unified install/upgrade workflow for @reopt-ai/opt-chat in consumer projects."
---

Install or upgrade `@reopt-ai/opt-chat` in a consumer project.

## Step 1: State Detection

### 1a. Inspect project context

```bash
# Package manager
ls package.json bun.lockb yarn.lock pnpm-lock.yaml package-lock.json 2>/dev/null

# React version
node -e "const p = require('./package.json'); console.log(p.dependencies?.react || 'not found')"

# opt-chat install state + version
node -e "try { const p = require('./node_modules/@reopt-ai/opt-chat/package.json'); console.log('installed:', p.version) } catch { console.log('not installed') }"

# Whether opt-ui is present (provides theme tokens)
node -e "try { require.resolve('@reopt-ai/opt-ui'); console.log('opt-ui: installed') } catch { console.log('opt-ui: not installed') }"

# Tailwind CSS
grep -q "tailwindcss" package.json && echo "tailwind: installed" || echo "tailwind: not installed"

# AI SDK
grep -q '"ai"' package.json && echo "ai-sdk: installed" || echo "ai-sdk: not installed"
```

### 1b. Determine execution mode

```
if opt-chat NOT installed:
  → Init mode (Steps 2-6, 8)

if opt-chat IS installed:
  latest = npm view @reopt-ai/opt-chat version --registry=https://npm.pkg.github.com
  if installed < latest OR "$ARGUMENTS" contains "upgrade/update":
    → Upgrade mode (Steps 3, 4, 7, 8)
  else:
    → Already latest (Step 8 summary only)
```

**Display:**

```
=== opt-chat-install: {Init/Upgrade} Mode ===

| Check      | Status              |
| ---------- | ------------------- |
| Package    | {bun/npm}           |
| React      | {version}           |
| opt-chat   | {not installed / v} |
| opt-ui     | {installed/not}     |
| Tailwind   | {installed/not}     |
| AI SDK     | {installed/not}     |
```

---

## Step 2: .npmrc & Auth Setup (Init only)

```ini
@reopt-ai:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Stop immediately if `GITHUB_TOKEN` is missing.

---

## Step 3: Package Install/Update

### Init mode

```bash
{pm} add @reopt-ai/opt-chat
```

Install the AI SDK too when missing:

```bash
{pm} add ai @ai-sdk/react
```

### Upgrade mode

```bash
{pm} add @reopt-ai/opt-chat@latest
```

**Only run after user approval.**

### Optional peer dependencies

Offer these when relevant:

```bash
# Media playback (AudioPlayer)
{pm} add media-chrome

# JSX message rendering
{pm} add react-jsx-parser

# ANSI colors (Terminal part)
{pm} add ansi-to-react

# Token counting (Context part)
{pm} add tokenlens
```

---

## Step 4: Tailwind Configuration (Init, Upgrade)

opt-chat uses Tailwind utility classes plus CSS variable tokens.

### When opt-ui is installed

opt-ui's theme already ships the required CSS variables, so no extra
setup is needed. Just include `@reopt-ai/opt-chat/dist` in Tailwind's
content scan:

```css
@source "../node_modules/@reopt-ai/opt-chat/dist";
```

### When opt-ui is absent

Define the CSS variable tokens opt-chat expects:

```css
:root {
  --color-surface: #ffffff;
  --color-surface-raised: #f8f9fa;
  --color-border: #e5e7eb;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  --color-accent: #3b82f6;
  --color-bg-subtle: #f3f4f6;
}
```

> When opt-ui is not in the project, recommend `/opt-ui-install` for a proper theme setup.

---

## Step 5: AI SDK Endpoint (Init only)

`useChatSession` wraps Vercel AI SDK's `useChat`, so a server endpoint is
required.

### Next.js App Router

```ts
// app/api/chat/route.ts
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: openai("gpt-4o"),
    messages,
  });
  return result.toDataStreamResponse();
}
```

### Endpoint check

Look for an existing AI endpoint:

```bash
find . -path "*/api/chat*" -name "route.*" 2>/dev/null
```

If none exists, offer to create the default endpoint above (create only
after user confirmation).

---

## Step 6: Chat Component Scaffold (Init only)

Generate a starter Chat page component.

```tsx
"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  Message,
  MessageContent,
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  useChatSession,
} from "@reopt-ai/opt-chat";

export function ChatPage() {
  const chat = useChatSession({ api: "/api/chat" });

  return (
    <Conversation>
      <ConversationContent>
        {chat.messages.length === 0 ? (
          <ConversationEmptyState />
        ) : (
          chat.messages.map((message) => (
            <Message key={message.id} role={message.role}>
              <MessageContent parts={message.parts} />
            </Message>
          ))
        )}
      </ConversationContent>
      <PromptInput
        value={chat.input}
        onChange={chat.handleInputChange}
        onSubmit={chat.handleSubmit}
        isLoading={chat.isLoading}
      >
        <PromptInputTextarea placeholder="Enter a message..." />
        <PromptInputSubmit />
      </PromptInput>
    </Conversation>
  );
}
```

**Confirm the file path with the user before creating it** (for example, `app/chat/page.tsx`).

---

## Step 7: Breaking Changes (Upgrade only)

> **Reference**: `references/breaking-changes.md`

### 7a. Load changes

Collect Breaking/Deprecated changes between installed → target versions.

### 7b. Scan consumer code for impact

```bash
grep -r "from ['\"]@reopt-ai/opt-chat['\"]" --include="*.tsx" --include="*.ts" -l
```

### 7c. Propose edits per group

```
Breaking Change: {code}
  Files affected: {count}
  BEFORE: {old_code}
  AFTER:  {new_code}
  Apply? (yes/no)
```

Run `tsc --noEmit` after every group.

---

## Step 8: Validation & Summary

### Verification

```bash
npx tsc --noEmit
{pm} test  # If existing tests are present
```

### Init Summary

```
=== opt-chat-install Complete (Init) ===

Installed: @reopt-ai/opt-chat@{version}
AI SDK: {ai@version}
Theme: {opt-ui tokens / custom CSS variables}
Endpoint: {path or "not created"}
Component: {path or "not created"}

Next steps:
  - Wire your AI endpoint with an actual model provider
  - Customize ConversationEmptyState + MessageParts
  - Add optional deps: media-chrome, tokenlens (if needed)
```

### Upgrade Summary

```
=== opt-chat-install Complete (Upgrade) ===

Upgraded: @reopt-ai/opt-chat {old} → {new}
Breaking changes fixed: {count}

Next steps:
  - git diff
  - Run tests
```

<user-request>
$ARGUMENTS
</user-request>
