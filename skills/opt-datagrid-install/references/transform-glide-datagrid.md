# glide-data-grid → opt-datagrid conversion rules

## 1. Import conversion

### Before

```tsx
import {
  DataEditor as GlideDataEditor,
  GridCellKind,
  GridColumn,
  GridCell,
  GridSelection,
  Item,
  EditableGridCell,
  Theme,
  TextCell,
  NumberCell,
  BooleanCell,
} from "@glideapps/glide-data-grid";

import "@glideapps/glide-data-grid/dist/index.css";
```

### After

```tsx
import {
  DataGrid,
  type DataGridColumn,
  type DataGridTheme,
} from "@reopt-ai/opt-datagrid";
```

### Import mapping

| Remove                                    | Replace with           | Notes                                |
| ----------------------------------------- | ---------------------- | ------------------------------------ |
| `DataEditor`                              | `DataGrid`             | Component renamed                    |
| `GridCellKind`                            | removed                | Replaced by editor-kind strings      |
| `GridColumn`                              | `DataGridColumn<Row>`  | Generic type                         |
| `GridCell`                                | removed                | Replaced by columns[].getValue       |
| `GridSelection`                           | `DataGridSelection`    | Only when needed                     |
| `Item`                                    | `DataGridCellPosition` | `[col, row]` → `{ col, row }`        |
| `EditableGridCell`                        | removed                | Replaced by onCellsEdited parameter  |
| `Theme`                                   | `DataGridTheme`        | Different structure                  |
| `TextCell` / `NumberCell` / `BooleanCell` | removed                | Replaced by editor kinds             |
| CSS import                                | removed                | opt-datagrid needs no CSS            |

## 2. Column definition conversion

### Core: getCellContent → columns[].getValue

glide-data-grid provides every cell's data through `getCellContent`.
opt-datagrid declares `getValue` per column instead.

### Before

```tsx
const columns: GridColumn[] = [
  { title: "Name", id: "name", width: 180 },
  { title: "Age", id: "age", width: 100 },
  { title: "Active", id: "active", width: 80 },
];

const getCellContent = ([col, row]: Item): GridCell => {
  const record = records[row];
  switch (col) {
    case 0:
      return {
        kind: GridCellKind.Text,
        data: record.name,
        displayData: record.name,
        allowOverlay: true,
        readonly: false,
      };
    case 1:
      return {
        kind: GridCellKind.Number,
        data: record.age,
        displayData: String(record.age),
        allowOverlay: true,
        readonly: false,
      };
    case 2:
      return {
        kind: GridCellKind.Boolean,
        data: record.active,
        allowOverlay: false,
        readonly: false,
      };
    default:
      return {
        kind: GridCellKind.Text,
        data: "",
        displayData: "",
        allowOverlay: false,
        readonly: true,
      };
  }
};
```

### After

```tsx
const columns: DataGridColumn<Row>[] = [
  {
    id: "name",
    title: "Name",
    width: 180,
    editable: true,
    getValue: (row) => row.name,
    setValue: (row, value) => ({ ...row, name: value }),
    editor: { kind: "text" },
  },
  {
    id: "age",
    title: "Age",
    width: 100,
    editable: true,
    getValue: (row) => row.age,
    setValue: (row, value) => ({ ...row, age: value }),
    editor: { kind: "number" },
  },
  {
    id: "active",
    title: "Active",
    width: 80,
    editable: true,
    getValue: (row) => row.active,
    setValue: (row, value) => ({ ...row, active: value }),
    editor: { kind: "checkbox" },
  },
];
```

### Conversion rules

1. Each case/branch in `getCellContent` → its own column with `getValue`.
2. `GridCellKind.X` → `editor: { kind: "..." }` (see mapping below).
3. `allowOverlay: true` → `editable: true`.
4. `readonly: true` → `editable: false` (or omit).
5. `displayData` → `formatValue` (only when a custom format is needed).
6. The value assignment in `setCellContent` / `onCellEdited` → `setValue`.

## 3. GridCellKind → editor kind

| GridCellKind                    | opt-datagrid editor                  | Notes                                    |
| ------------------------------- | ------------------------------------ | ---------------------------------------- |
| `GridCellKind.Text`             | `{ kind: "text" }`                   |                                          |
| `GridCellKind.Number`           | `{ kind: "number" }`                 |                                          |
| `GridCellKind.Boolean`          | `{ kind: "checkbox" }`               |                                          |
| `GridCellKind.Text` (multiline) | `{ kind: "textarea" }`               | When Text was used as a textarea         |
| `GridCellKind.Text` (date)      | `{ kind: "date" }`                   | When a date string was shown as Text     |
| `GridCellKind.Text` (select)    | `{ kind: "select", options: [...] }` | When options were enumerated             |
| `GridCellKind.Custom`           | `{ kind: "custom", component: ... }` |                                          |

## 4. Component JSX conversion

### Before

```tsx
<GlideDataEditor
  theme={darkTheme}
  getCellContent={getCellContent}
  columns={columns}
  rows={records.length}
  onCellEdited={onCellEdited}
  onCellClicked={onCellClicked}
  onRowAppended={onRowAppended}
  rowMarkers="both"
  gridSelection={selection}
  onGridSelectionChange={setSelection}
  trailingRowOptions={{ hint: "New row...", sticky: true, tint: true }}
  smoothScrollX={true}
  smoothScrollY={true}
  getCellsForSelection={true}
  freezeColumns={1}
  rowHeight={36}
  headerHeight={40}
  rightElementProps={{ fill: false, sticky: false }}
  keybindings={{
    selectAll: true,
    selectRow: true,
    selectColumn: true,
    downFill: false,
    rightFill: true,
  }}
/>
```

### After

```tsx
<DataGrid
  theme={theme}
  rows={records}
  columns={columns}
  onCellsEdited={handleCellsEdited}
  onCellClicked={handleCellClicked}
  onRowAppended={handleRowAppended}
  rowMarkers="both"
  gridSelection={selection}
  onGridSelectionChange={setSelection}
  trailingRowOptions={{ hint: "New row...", sticky: true, tint: true }}
  smoothScrollX={true}
  smoothScrollY={true}
  getCellsForSelection={getCellsForSelection}
  freezeColumns={1}
  rowHeight={36}
  headerHeight={40}
  rightElementProps={{ fill: false, sticky: false }}
  keybindings={{
    selectAll: true,
    selectRow: true,
    selectColumn: true,
    downFill: false,
    rightFill: true,
  }}
/>
```

### Props mapping

| glide prop                 | opt-datagrid prop       | Conversion                           |
| -------------------------- | ----------------------- | ------------------------------------ |
| `getCellContent`           | removed                 | Moved into columns[].getValue        |
| `columns`                  | `columns`               | Type becomes `DataGridColumn<Row>[]` |
| `rows` (number)            | `rows` (Row[])          | `records.length` → `records`         |
| `onCellEdited`             | `onCellsEdited`         | Signature changes (see below)        |
| `onCellClicked`            | `onCellClicked`         | `Item` → `DataGridCellPosition`      |
| `theme` (Partial\<Theme\>) | `theme` (DataGridTheme) | Structure conversion (see below)     |
| `rightElementProps`        | `rightElementProps`     | Same                                 |
| remaining props            | same                    | Same names/types                     |

## 5. Callback conversion

### onCellEdited → onCellsEdited

**Before:**

```tsx
const onCellEdited = (cell: Item, newValue: EditableGridCell) => {
  const [col, row] = cell;
  const record = records[row];
  switch (col) {
    case 0:
      record.name = (newValue as TextCell).data;
      break;
    case 1:
      record.age = (newValue as NumberCell).data;
      break;
  }
  onRecordUpdate(record.id, ...);
  return true;
};
```

**After:**

```tsx
const handleCellsEdited = (
  edits: readonly DataGridCellEdit<Row, unknown>[],
) => {
  for (const edit of edits) {
    onRecordUpdate(edit.row.id, edit.column.id, edit.newValue);
  }
};
```

Key differences:

- glide: `(cell: [col, row], newValue: EditableGridCell)` — index-based, requires cell-type casts.
- opt-datagrid: `(edits: DataGridCellEdit[])` — array, direct row/column object access, type safe.

### onCellClicked

**Before:** `(cell: Item) => void` where `Item = [col, row]`
**After:** `(position: DataGridCellPosition, event: MouseEvent) => void`

Convert: `const [col, row] = cell` → `const { col, row } = position`.

## 6. Theme conversion

### Before (glide Theme)

```tsx
const darkTheme: Partial<Theme> = {
  accentColor: "#8b5cf6",
  accentLight: "rgba(139, 92, 246, 0.2)",
  textDark: "#ffffff",
  textMedium: "#a1a1aa",
  textLight: "#71717a",
  bgCell: "#18181b",
  bgHeader: "#27272a",
  borderColor: "#3f3f46",
  fontFamily: "ui-sans-serif, system-ui, ...",
  headerFontStyle: "600 14px",
  baseFontStyle: "13px",
};
```

### After (DataGridTheme)

```tsx
const theme: DataGridTheme = {
  accentColor: "#8b5cf6",
  accentSubtle: "rgba(139, 92, 246, 0.2)",
  textPrimary: "#ffffff",
  textSecondary: "#a1a1aa",
  textTertiary: "#71717a",
  bgCell: "#18181b",
  bgHeader: "#27272a",
  borderColor: "#3f3f46",
  fontFamily: "ui-sans-serif, system-ui, ...",
  headerFontWeight: "600",
  fontSize: "13px",
};
```

### Theme property mapping

| glide Theme                                   | DataGridTheme      | Notes                                              |
| --------------------------------------------- | ------------------ | -------------------------------------------------- |
| `accentColor`                                 | `accentColor`      | Same                                               |
| `accentLight`                                 | `accentSubtle`     | Renamed                                            |
| `textDark`                                    | `textPrimary`      |                                                    |
| `textMedium`                                  | `textSecondary`    |                                                    |
| `textLight`                                   | `textTertiary`     |                                                    |
| `bgCell`                                      | `bgCell`           | Same                                               |
| `bgHeader`                                    | `bgHeader`         | Same                                               |
| `bgCellMedium`                                | `bgSurface`        | Approximate                                        |
| `borderColor`                                 | `borderColor`      | Same                                               |
| `fontFamily`                                  | `fontFamily`       | Same                                               |
| `headerFontStyle`                             | `headerFontWeight` | "600 14px" → "600" (weight only)                   |
| `baseFontStyle`                               | `fontSize`         | "13px"                                             |
| `textHeader`                                  | —                  | Removed (set directly via CSS variables)           |
| `bgBubble`, `drilldownBorder`, `linkColor`, … | —                  | Not supported — set directly via CSS variables     |

## 7. Data model conversion

### rows conversion

**Before:** `rows={records.length}` (only the count — data comes from `getCellContent`)
**After:** `rows={records}` (pass the row array directly)

### Selection conversion

**Before:** `GridSelection` (CompactSelection-based)
**After:** `DataGridSelection` (same structure, only the type name changes)

```tsx
// glide: iterate CompactSelection
const selectedIndices: number[] = [];
for (const index of selection.rows) {
  selectedIndices.push(index);
}

// opt-datagrid: the same pattern works
```

## 8. What to remove

After conversion, delete:

1. The entire `getCellContent` function (moved into columns[].getValue).
2. `valueToCell` helpers (replaced by editor kinds).
3. `GridCellKind` imports and references.
4. Cell-type casts (`as TextCell`, `as NumberCell`).
5. glide-data-grid CSS imports.
6. Unused glide type imports (GridCell, Item, EditableGridCell, etc.).
