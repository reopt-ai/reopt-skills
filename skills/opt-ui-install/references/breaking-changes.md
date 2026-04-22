# Breaking Changes Registry — @reopt-ai/opt-ui

A registry of Breaking / Deprecated / Added / Fixed changes per version.
The `/opt-ui-install` skill reads this file during impact analysis in upgrade mode.

> **Maintenance rule**: whenever an opt-ui release introduces a Breaking or Deprecated
> change, add an entry here in the same PR that bumps `COMPATIBILITY.md`.

## Registry format

Each change includes the following fields:

```yaml
- version: "X.Y.Z" # Version that includes the change
  level: B | D | A | F # Classification (Breaking, Deprecated, Added, Fixed)
  component: "ComponentName" # Affected component
  change: "Change summary"
  detail: "Detailed description"
  scan: "grep pattern" # Pattern used for impact scanning
  fix: # Fix method (B, D only)
    type: rename | retype | restructure | manual
    from: "Existing pattern"
    to: "New pattern"
```

---

## Version 1.2.0 (current)

### Breaking

- version: "1.2.0"
  level: B
  component: "ToolbarRoot"
  change: "Removed focusLoop prop"
  detail: "The focusLoop prop has been removed from ToolbarRoot. Behavior now defaults to automatic focus loop."
  scan: "focusLoop"
  fix:
  type: rename
  from: "<ToolbarRoot focusLoop>"
  to: "<ToolbarRoot>"

- version: "1.2.0"
  level: B
  component: "DropdownContent"
  change: "Removed gutter prop (MenuPopoverProps change)"
  detail: "The gutter prop has been removed from DropdownContent (MenuPopover)."
  scan: "gutter="
  fix:
  type: rename
  from: '<DropdownContent gutter={4}>'
  to: "<DropdownContent>"

- version: "1.2.0"
  level: B
  component: "FormStore"
  change: "Removed useValidate/useSubmit methods → moved to useFormStore options"
  detail: "form.useValidate(callback) and form.useSubmit(callback) have been removed. Pass them via useFormStore({ validate, onSubmit, validateOn }) options instead. ⚠️ The validateOn default changed to change — since the previous useValidate only ran on submit, you must explicitly set validateOn: submit."
  scan: "useValidate\\|useSubmit"
  fix:
  type: restructure
  from: "form.useValidate(() => { ... }); form.useSubmit(() => { ... })"
  to: "useFormStore({ validateOn: 'submit', validate: (values) => errors, onSubmit: (values) => { ... } })"

- version: "1.2.0"
  level: B
  component: "TabsRoot"
  change: "setSelectedId callback type string|null → string|undefined"
  detail: "TabsRoot's selectedId/setSelectedId now uses undefined instead of null."
  scan: "setSelectedId.\*null"
  fix:
  type: retype
  from: "useState<string | null>"
  to: "useState<string | undefined>"

---

## Version 1.1.1

No Breaking Changes since the initial release (Added only).

### Added

- version: "1.1.1"
  level: A
  component: ChatSidebar
  change: "New Shell — AI chat sidebar"

- version: "1.1.1"
  level: A
  component: ChatInput
  change: "New Shell — chat input (auto-resize, model/style Select)"

- version: "1.1.1"
  level: A
  component: ChatMessageList
  change: "New Shell — chat message list (speech bubbles, typing indicator)"

- version: "1.1.1"
  level: A
  component: ChatAssistant
  change: "New Surface — AI chatbot assistant (ChatSidebar + ChatMessageList + ChatInput)"

---

## Version History Template

When a Breaking Change occurs in a future version, add it in the following format:

```yaml
## Version X.Y.Z

### Breaking

- version: "X.Y.Z"
  level: B
  component: "Button"
  change: 'variant "danger" → "destructive" rename'
  detail: "The Button danger variant has been renamed to destructive."
  scan: 'variant.*=.*["'']danger["'']'
  fix:
    type: rename
    from: 'variant="danger"'
    to: 'variant="destructive"'

### Deprecated

- version: "X.Y.Z"
  level: D
  component: "StatusSelect"
  change: "options prop → items prop rename (options still works)"
  detail: "The options prop has been renamed to items. options will be removed in the next major."
  scan: "<StatusSelect[^>]*options="
  fix:
    type: rename
    from: "options="
    to: "items="

### Added

- version: "X.Y.Z"
  level: A
  component: "NewComponent"
  change: "Added new Shell"

### Fixed

- version: "X.Y.Z"
  level: F
  component: "DateRangePicker"
  change: "Fixed off-by-one in boundary date calculation"
```

---

## Scan pattern guide

Rules for writing grep patterns used for impact analysis:

| Change type       | Example scan pattern                                         |
| ----------------- | ------------------------------------------------------------ |
| Prop rename       | `propName.*=` or `<Component[^>]*propName=`                  |
| Prop value change | `propName.*=.*["']oldValue["']`                              |
| Component rename  | `from ["']@reopt-ai/opt-ui["']` then check import name       |
| Component removal | `import.*{[^}]*OldName[^}]*}.*from ["']@reopt-ai/opt-ui["']` |
| CSS token change  | `className.*oldToken`                                        |
| Type change       | `import type.*{[^}]*OldType[^}]*}`                           |
