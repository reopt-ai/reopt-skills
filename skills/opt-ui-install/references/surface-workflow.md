# Surface Workflow

Surfaces are installed by copying source files into the consumer project with
`@reopt-ai/opt-ui-cli`.

## When To Prefer A Surface

- the user wants a full page quickly
- the request matches a dashboard, settings, analytics, or ops page pattern
- the template fit is already high enough

## Discovery Commands

```bash
npx @reopt-ai/opt-ui-cli list
npx @reopt-ai/opt-ui-cli search --query dashboard
npx @reopt-ai/opt-ui-cli view billing-page
npx @reopt-ai/opt-ui-cli view billing-page --json
```

## Safe Install Flow

```bash
npx @reopt-ai/opt-ui-cli add billing-page --dry-run
npx @reopt-ai/opt-ui-cli add billing-page --view
npx @reopt-ai/opt-ui-cli add billing-page
```

Multiple installs are allowed:

```bash
npx @reopt-ai/opt-ui-cli add billing-page analytics-dashboard
```

## Local Ownership

- copied files are consumer-project files
- edit them locally after installation
- do not import from `@reopt-ai/opt-ui-surface`
- do not treat registry source as runtime code

## `opt-ui.json`

The first Surface install creates `opt-ui.json`.

Important fields:

- `surfacesDir`
- `importAlias`
- `surfaces[].slug`
- `surfaces[].files[]`

This file allows the CLI to reason about installed hashes and later updates.

## Maintenance Commands

```bash
npx @reopt-ai/opt-ui-cli info
npx @reopt-ai/opt-ui-cli doctor
npx @reopt-ai/opt-ui-cli update billing-page
```

## When Not To Use A Surface

- the page fit is poor
- the user only needs a table, form, or chart section
- the page is highly domain-specific and no registry template is close

In those cases, prefer Shell composition.
