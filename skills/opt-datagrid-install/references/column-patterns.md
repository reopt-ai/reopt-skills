# Column Patterns Reference

## Basic text column

```tsx
const col: DataGridColumn<Row> = {
  id: "name",
  title: "Name",
  width: 200,
  editable: true,
  getValue: (row) => row.name,
  setValue: (row, v) => ({ ...row, name: v }),
};
```

Required fields: `id`, `title`, `getValue`.
To enable editing: `editable: true` + `setValue`.

## Typed editor columns

### Select (dropdown)

```tsx
{
  id: "status",
  title: "Status",
  editable: true,
  editor: {
    kind: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
  getValue: (row) => row.status,
  setValue: (row, v) => ({ ...row, status: v }),
}
```

### Checkbox (boolean)

```tsx
{
  id: "enabled",
  title: "Enabled",
  editable: true,
  editor: { kind: "checkbox" },
  getValue: (row) => row.enabled,
  setValue: (row, v) => ({ ...row, enabled: v }),
  formatValue: (v) => (v ? "Yes" : "No"),
}
```

### Number

```tsx
{
  id: "price",
  title: "Price",
  editable: true,
  editor: { kind: "number", min: 0, max: 99999, step: 0.01 },
  getValue: (row) => row.price,
  setValue: (row, v) => ({ ...row, price: v }),
  formatValue: (v) => (v == null ? "" : `$${v.toFixed(2)}`),
}
```

### Date

```tsx
{
  id: "dueDate",
  title: "Due Date",
  editable: true,
  editor: { kind: "date" },
  getValue: (row) => row.dueDate,
  setValue: (row, v) => ({ ...row, dueDate: v }),
}
```

### Textarea (multi-line)

```tsx
{
  id: "notes",
  title: "Notes",
  editable: true,
  editor: { kind: "textarea" },
  getValue: (row) => row.notes,
  setValue: (row, v) => ({ ...row, notes: v }),
}
```

### Async combobox (async search)

```tsx
{
  id: "assignee",
  title: "Assignee",
  editable: true,
  editor: {
    kind: "async-combobox",
    loadOptions: async (query) => {
      const res = await fetch(`/api/users?q=${query}`);
      const users = await res.json();
      return users.map((u) => ({ value: u.id, label: u.name }));
    },
    placeholder: "Search users...",
  },
  getValue: (row) => row.assigneeId,
  setValue: (row, v) => ({ ...row, assigneeId: v }),
}
```

## Value pipeline

A column's value transformation chain:

```
getValue → formatValue (for display)
         → serializeValue (for copy/export)
         → deserializeValue (for paste)
         → parseInput (parse edit input)
         → validateValue (validate before commit)
```

```tsx
{
  id: "amount",
  title: "Amount",
  getValue: (row) => row.amount,
  setValue: (row, v) => ({ ...row, amount: v }),
  formatValue: (v) => `₩${v.toLocaleString()}`,
  serializeValue: (v) => String(v),
  deserializeValue: (s) => Number(s.replace(/[^0-9.-]/g, "")),
  parseInput: (input) => {
    const n = Number(input);
    return isNaN(n) ? { ok: false, error: "Please enter a number" } : { ok: true, value: n };
  },
  validateValue: (v) => {
    if (v < 0) return { valid: false, message: "Negative values not allowed" };
    return { valid: true };
  },
}
```

## Derived (computed) column

A read-only column that depends on other columns:

```tsx
{
  id: "total",
  title: "Total",
  dependsOnColumnIds: ["quantity", "price"],
  getValue: (row) => row.quantity * row.price,
  formatValue: (v) => `$${v.toFixed(2)}`,
}
```

Declaring `dependsOnColumnIds` lets `valueCache` recompute only when a
dependency changes.

## Custom editor column

When the built-in editors aren't enough:

```tsx
import { type DataGridEditorContext } from "@reopt-ai/opt-datagrid";

function ColorEditor(ctx: DataGridEditorContext<Row, string>) {
  return (
    <input
      type="color"
      value={ctx.draftValue}
      onChange={(e) => {
        ctx.setDraftValue(e.target.value);
        ctx.commit();
      }}
    />
  );
}

{
  id: "color",
  title: "Color",
  editable: true,
  editor: { kind: "custom", component: ColorEditor },
  getValue: (row) => row.color,
  setValue: (row, v) => ({ ...row, color: v }),
  renderCell: ({ value }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 16, height: 16, borderRadius: 4, background: value }} />
      {value}
    </div>
  ),
}
```

## Custom cell renderer

```tsx
{
  id: "status",
  title: "Status",
  getValue: (row) => row.status,
  renderCell: ({ value }) => (
    <span className={`badge badge-${value}`}>{value}</span>
  ),
  refreshCellRenderer: (prev, next) => prev.value === next.value,
}
```

Providing `refreshCellRenderer` skips re-rendering cells whose value did
not change.

## Column groups (collapsible)

```tsx
import { useCollapsingGroups } from "@reopt-ai/opt-datagrid";

const { columns: groupedColumns, toggle } = useCollapsingGroups({
  columns,
  groups: [
    { id: "personal", label: "Personal", columnIds: ["name", "email", "phone"] },
    { id: "metrics", label: "Metrics", columnIds: ["revenue", "visits", "conversion"] },
  ],
});

<DataGrid columns={groupedColumns} ... />
```

## Column sorting

```tsx
import { useColumnSort } from "@reopt-ai/opt-datagrid";

const { sortedRows, onHeaderClicked, sortState } = useColumnSort({
  rows,
  columns,
  initialSort: [{ columnId: "name", direction: "asc" }],
});

<DataGrid
  rows={sortedRows}
  columns={columns}
  onHeaderClicked={onHeaderClicked}
  ...
/>
```

## Column reordering

```tsx
import { useMovableColumns } from "@reopt-ai/opt-datagrid";

const { columns: movableColumns, onColumnMoved } = useMovableColumns({
  columns,
});

<DataGrid
  columns={movableColumns}
  onColumnMoved={onColumnMoved}
  ...
/>
```
