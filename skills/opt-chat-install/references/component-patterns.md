# opt-chat Component Patterns

## Basic Chat Layout

```tsx
<Conversation>
  <ConversationContent>
    {messages.map((msg) => (
      <Message key={msg.id} role={msg.role}>
        <MessageContent parts={msg.parts} />
      </Message>
    ))}
  </ConversationContent>
  <PromptInput>
    <PromptInputTextarea />
    <PromptInputSubmit />
  </PromptInput>
</Conversation>
```

## With Model Selector + Attachments

```tsx
<PromptInput>
  <PromptInputHeader>
    <ModelSelector models={models} value={model} onChange={setModel} />
  </PromptInputHeader>
  <PromptInputTextarea />
  <PromptInputFooter>
    <Attachments onAttach={handleAttach} />
    <PromptInputSubmit />
  </PromptInputFooter>
</PromptInput>
```

## With Message Actions + Branching

```tsx
<Message role={msg.role}>
  <MessageContent parts={msg.parts} />
  <MessageActions>
    <MessageBranch branches={msg.branches} />
  </MessageActions>
</Message>
```

## Message Parts

opt-chat includes 25 message part renderers. The `MessageContent` component
dispatches to the correct renderer based on part type:

| Part        | Type              | Use Case                |
| ----------- | ----------------- | ----------------------- |
| Reasoning   | `reasoning`       | Expandable thinking/CoT |
| Tool        | `tool-invocation` | Tool call + approval UI |
| Artifact    | `artifact`        | Editable code blocks    |
| CodeBlock   | `code`            | Syntax-highlighted code |
| Agent       | `agent`           | Agent status + tools    |
| Sources     | `sources`         | Citation carousel       |
| Plan        | `plan`            | Multi-step plans        |
| Terminal    | `terminal`        | Terminal output         |
| FileTree    | `file-tree`       | Directory structure     |
| TestResults | `test-results`    | Test pass/fail          |

## useChatSession Hook

```tsx
const chat = useChatSession({
  api: "/api/chat",
  // Optional:
  initialMessages: [],
  onFinish: (message) => {
    /* ... */
  },
  onError: (error) => {
    /* ... */
  },
});

// Returns:
// chat.messages, chat.input, chat.isLoading
// chat.handleInputChange, chat.handleSubmit
// chat.stop, chat.reload, chat.append
```

## CSS Variable Tokens

opt-chat uses these CSS variable families (provided by opt-ui theme or custom):

```
--color-surface, --color-surface-raised, --color-surface-overlay
--color-border, --color-text-primary/secondary/tertiary
--color-accent, --color-bg-subtle
--color-info/success/warning/danger (with -subtle and -fg variants)
```

## Tailwind Content Path

Add to your CSS to enable opt-chat class scanning:

```css
@source "../node_modules/@reopt-ai/opt-chat/dist";
```
