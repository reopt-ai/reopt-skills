# Block Catalog Patterns

## Basic Text Blocks

```tsx
const paragraph: BlockDefinition<{ text: string }> = {
  type: "paragraph",
  label: "Paragraph",
  schema: { text: { type: "string", default: "" } },
  component: ({ editableText }) => <p>{editableText("text")}</p>,
  editableFields: ["text"],
  prompt: "Standard paragraph.",
};

const heading: BlockDefinition<{ text: string; level: number }> = {
  type: "heading",
  label: "Heading",
  schema: {
    text: { type: "string", default: "" },
    level: { type: "number", default: 2 },
  },
  component: ({ props, editableText }) => {
    const Tag = `h${props.level}` as "h2";
    return <Tag>{editableText("text")}</Tag>;
  },
  editableFields: ["text"],
  prompt: "Heading. Set level 1-6.",
};
```

## List Block

```tsx
const list: BlockDefinition<{ ordered: boolean }> = {
  type: "list",
  label: "List",
  schema: { ordered: { type: "boolean", default: false } },
  canHaveChildren: true,
  component: ({ props, children }) => {
    const Tag = props.ordered ? "ol" : "ul";
    return <Tag>{children}</Tag>;
  },
  prompt: "List. Set ordered=true for numbered list.",
};

const listItem: BlockDefinition<{ text: string }> = {
  type: "list-item",
  label: "List Item",
  schema: { text: { type: "string", default: "" } },
  component: ({ editableText }) => <li>{editableText("text")}</li>,
  editableFields: ["text"],
};
```

## Media Blocks

```tsx
const image: BlockDefinition<{ src: string; alt: string; caption: string }> = {
  type: "image",
  label: "Image",
  schema: {
    src: { type: "string", default: "" },
    alt: { type: "string", default: "" },
    caption: { type: "string", default: "" },
  },
  component: ({ props }) => (
    <figure>
      <img src={props.src} alt={props.alt} />
      {props.caption && <figcaption>{props.caption}</figcaption>}
    </figure>
  ),
  prompt: "Image with src URL, alt text, and optional caption.",
};

const video: BlockDefinition<{ src: string }> = {
  type: "video",
  label: "Video",
  schema: { src: { type: "string", default: "" } },
  component: ({ props }) => <video src={props.src} controls />,
  prompt: "Video embed with src URL.",
};
```

## Callout Block

```tsx
const callout: BlockDefinition<{ text: string; variant: string }> = {
  type: "callout",
  label: "Callout",
  schema: {
    text: { type: "string", default: "" },
    variant: { type: "string", default: "info" },
  },
  component: ({ props, editableText }) => (
    <div className={`callout callout-${props.variant}`}>
      {editableText("text")}
    </div>
  ),
  editableFields: ["text"],
  prompt: "Callout box. variant: info, warning, error, success.",
};
```

## Table Block

```tsx
const table: BlockDefinition<{}> = {
  type: "table",
  label: "Table",
  schema: {},
  canHaveChildren: true,
  component: ({ children }) => (
    <table>
      <tbody>{children}</tbody>
    </table>
  ),
  prompt: "Table container. Children are table-row blocks.",
};

const tableRow: BlockDefinition<{}> = {
  type: "table-row",
  label: "Row",
  schema: {},
  canHaveChildren: true,
  component: ({ children }) => <tr>{children}</tr>,
};

const tableCell: BlockDefinition<{ text: string }> = {
  type: "table-cell",
  label: "Cell",
  schema: { text: { type: "string", default: "" } },
  component: ({ editableText }) => <td>{editableText("text")}</td>,
  editableFields: ["text"],
};
```

## Container / Columns

```tsx
const columns: BlockDefinition<{ count: number }> = {
  type: "columns",
  label: "Columns",
  schema: { count: { type: "number", default: 2 } },
  canHaveChildren: true,
  component: ({ props, children }) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${props.count}, 1fr)`,
        gap: "1rem",
      }}
    >
      {children}
    </div>
  ),
  prompt: "Multi-column layout. Set count for number of columns.",
};
```

## Zod Validation

```tsx
import { z } from "zod";

const image: BlockDefinition<{ src: string; alt: string }> = {
  type: "image",
  label: "Image",
  schema: {
    src: { type: "string", default: "" },
    alt: { type: "string", default: "" },
  },
  zodSchema: z.object({
    src: z.string().url("Must be a valid URL"),
    alt: z.string().min(1, "Alt text is required for accessibility"),
  }),
  component: ({ props }) => <img src={props.src} alt={props.alt} />,
};
```

## AI Prompt Tips

Each `BlockDefinition.prompt` field tells AI how to use the block:

- Be specific about when to use the block type
- Describe valid prop values and constraints
- Mention relationships (e.g., "list-item is always a child of list")

```tsx
prompt: "Table container. Always contains table-row children. Each row contains table-cell children.",
```
