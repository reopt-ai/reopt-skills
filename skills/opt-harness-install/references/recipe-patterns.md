# Workspace Recipe Patterns — @reopt-ai/opt-harness

## Recipe Selection Decision Tree

```
Q: What is the primary user action on this screen?

  Browse/filter rows of data
    → ListWorkspace + HarnessDataGridAdapter

  Inspect a single resource
    → DetailWorkspace

  Author or edit rich content
    → EditorWorkspace + HarnessEditorAdapter

  Scan metrics, triage, quick actions
    → DashboardWorkspace

  Public-facing engagement / landing
    → LandingWorkspace
```

## Programmatic Selection

```ts
import { selectRecipe } from "@reopt-ai/opt-harness/core";

selectRecipe({ hasDataGrid: true }); // "list"
selectRecipe({ hasEditor: true }); // "editor"
selectRecipe({ isPublicFacing: true }); // "landing"
selectRecipe({ primaryAction: "inspect" }); // "detail"
selectRecipe({ primaryAction: "triage" }); // "dashboard"
```

---

## Recipe Patterns

### DashboardWorkspace

Best for: home screens, overview pages, metric dashboards.

```tsx
<DashboardWorkspace
  header={<PageHeader title="Dashboard" />}
  toolbar={<DateRangePicker />}
>
  <HarnessSection title="Key metrics">
    {/* Cards, charts, counters */}
  </HarnessSection>
  <HarnessSection title="Recent activity">{/* Activity feed */}</HarnessSection>
</DashboardWorkspace>
```

**Slots**: header (required), content/children (required), toolbar?, aside?, footer?
**Default width**: full | **Sticky aside**: no

Anti-patterns:

- Don't use for single-entity detail views
- Don't put a single full-width DataGrid as sole content (use list instead)

---

### ListWorkspace

Best for: data tables, record lists, filterable collections.

```tsx
<ListWorkspace
  header={<PageHeader title="Orders" />}
  toolbar={<SearchBar />}
  filters={<FilterChips />}
  aside={<PreviewPanel />}
>
  <HarnessSection title="All orders">
    <HarnessDataGridAdapter
      rows={orders}
      columns={orderColumns}
      loading={isLoading}
      empty={{ title: "No orders", description: "Create your first order" }}
    />
  </HarnessSection>
</ListWorkspace>
```

**Slots**: header (required), content/children (required), toolbar?, filters?, aside?, footer?
**Default width**: wide | **Sticky aside**: yes | **Mobile aside**: drawer

Anti-patterns:

- Don't use for single-resource detail views (use detail)
- The filters slot is exclusive to list — don't add to other recipes
- Don't nest a ListWorkspace inside another workspace's aside

---

### DetailWorkspace

Best for: single resource views, profile pages, order details.

```tsx
<DetailWorkspace
  header={<PageHeader title={user.name} />}
  aside={<MetadataPanel user={user} />}
>
  <HarnessSection title="Profile">{/* Summary cards */}</HarnessSection>
  <HarnessSection title="Activity" headingLevel={3}>
    {/* Timeline */}
  </HarnessSection>
</DetailWorkspace>
```

**Slots**: header (required), content/children (required), toolbar?, aside?, footer?
**Default width**: normal | **Sticky aside**: yes | **Mobile aside**: stack

Anti-patterns:

- Don't use for editing screens (use editor)
- Don't use for collections of records (use list)
- Don't place a DataGrid as main content

---

### EditorWorkspace

Best for: document editors, form builders, content authoring.

```tsx
<EditorWorkspace
  header={<PageHeader title="New post" />}
  toolbar={<EditorToolbar />}
  aside={<InspectorPanel />}
>
  <HarnessEditorAdapter
    store={editorStore}
    catalog={blockCatalog}
    mode="edit"
    title="Post content"
    toolbar={<UndoRedoButtons />}
  />
</EditorWorkspace>
```

**Slots**: header (required), content/children (required), toolbar?, aside?, footer?
**Default width**: wide | **Sticky aside**: no | **Mobile aside**: collapse

Anti-patterns:

- Don't use for read-only detail views (use detail)
- Don't bypass HarnessEditorAdapter — it owns chrome and state boundaries
- Avoid heavy DataGrid tables in the editor content area

---

### LandingWorkspace

Best for: marketing pages, public landing pages, promotional content.

```tsx
<LandingWorkspace header={<NavBar />} footer={<FooterLinks />}>
  <HarnessLandingPage
    hero={<HeroSection />}
    content={<FeatureGrid />}
    cta={<CTABanner />}
  />
</LandingWorkspace>
```

**Slots**: content/children (required), header?, footer?
**Default width**: full | **No aside or filters**

Anti-patterns:

- Don't use for internal operational screens
- Don't add an aside slot — landing pages are full-bleed
- Don't use for data entry or CRUD

---

## Common Patterns

### Nested HarnessSection with heading levels

```tsx
<HarnessSection title="Users" headingLevel={2}>
  <HarnessSection title="Active" headingLevel={3}>
    {/* ... */}
  </HarnessSection>
  <HarnessSection title="Archived" headingLevel={3}>
    {/* ... */}
  </HarnessSection>
</HarnessSection>
```

### State boundaries

```tsx
<HarnessStateBoundary
  loading={isLoading}
  empty={{ title: "No data", description: "Try a different filter" }}
  error={error}
>
  {/* Content only renders when not loading/empty/error */}
</HarnessStateBoundary>
```

### Resizable aside

```tsx
<HarnessResizableLayout aside={<InspectorPanel />} defaultAsideSize={30} sticky>
  {/* Main content */}
</HarnessResizableLayout>
```

### Bottom action bar

```tsx
<HarnessBottomBar position="sticky">
  <div className="flex justify-end gap-2">
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>
  </div>
</HarnessBottomBar>
```
