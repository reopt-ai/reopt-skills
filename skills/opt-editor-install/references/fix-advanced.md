# Fix: AI / Compat / Documentation (Checks 15-18)

## Check 15: AI streaming handler {#check-15}

When using `useEditorStream`, implement the streaming handler:

```tsx
"use client";

import {
  Editor,
  createEditorStore,
  useEditorStream,
  buildAIMessages,
  extractSSEText,
  transformToNDJSON,
} from "@reopt-ai/opt-editor";

export function AIEditor() {
  const [store] = useState(() => createEditorStore(createEmptySpec()));

  const { stream, isStreaming } = useEditorStream(store, {
    onStream: async (prompt) => {
      const messages = buildAIMessages(store.getSpec(), prompt);

      const res = await fetch("/api/editor/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      return res.body
        .pipeThrough(extractSSEText())
        .pipeThrough(transformToNDJSON());
    },
  });

  return <Editor store={store} catalog={catalog} mode="edit" />;
}
```

Key pieces:

- The `onStream` callback returns `ReadableStream<string>` (NDJSON).
- `extractSSEText()` — extracts text from SSE events.
- `transformToNDJSON()` — converts text into NDJSON lines.
- `StreamCompiler` internally applies NDJSON → JSON Patch.

---

## Check 16: AI API route {#check-16}

Example Next.js API route (`app/api/editor/stream/route.ts`):

```ts
import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@reopt-ai/opt-editor";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: buildSystemPrompt(),
    messages,
  });

  return new Response(stream.toReadableStream(), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

**For OpenAI:**

```ts
import OpenAI from "openai";

const client = new OpenAI();

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const stream = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "system", content: buildSystemPrompt() }, ...messages],
    stream: true,
  });

  // Convert the OpenAI SDK stream into an SSE Response
  return new Response(stream.toReadableStream(), {
    headers: { "Content-Type": "text/event-stream" },
  });
}
```

> Keep the API key in an env var (store in `.env.local`).

---

## Check 17: Legacy Slate runtime conversion leftover {#check-17}

Analyze how legacy-conversion code is being used:

**Deliberate runtime use (keep for now):**

```tsx
import { isSlateFormat, slateToSpec } from "./slate-to-spec";

const spec = isSlateFormat(savedData) ? slateToSpec(savedData) : savedData;
```

**Leftover after migration (recommend cleanup):**

```tsx
// ❌ Unneeded if all stored data is already EditorSpec
import { slateToSpec } from "./slate-to-spec";

// ✅ Use directly
import { createEditorStore } from "@reopt-ai/opt-editor";
const store = createEditorStore(existingEditorSpec);
```

Cleanup procedure:

1. Confirm every stored content payload is already EditorSpec.
2. Remove the local `slate-to-spec` imports.
3. Drop the runtime format detection and pass EditorSpec directly.
4. Verify with `tsc --noEmit`.

---

## Check 18: CLAUDE.md opt-editor reference {#check-18}

Add an opt-editor section to the project's `CLAUDE.md`:

```markdown
## @reopt-ai/opt-editor

AI-first content editor with schema-driven streaming and inline editing.

### Component docs

- `node_modules/@reopt-ai/opt-editor/dist/docs/` — full docs
  - `01-getting-started.md` — getting started
  - `02-api/` — API reference
  - `03-recipes/` — custom blocks, AI streaming recipes
  - `05-troubleshooting.md` — troubleshooting

### Key rules

- Render the Editor component only from a `"use client"` file.
- Create the store via `createEditorStore` and pass it as the `store` prop.
- Use `defineCatalog()` or `defaultCatalog` for the block catalog.
- CSS: `@import "@reopt-ai/opt-editor/styles.css"` is required.
- AI streaming: `useEditorStream` + `buildSystemPrompt`.
```

With this reference in place, agents automatically consult the bundled dist docs when working on the editor.
