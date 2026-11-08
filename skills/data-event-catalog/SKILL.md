---
name: data-event-catalog
description: |
  Manage a consumer project's reopt Data event catalogue as code: event and property metadata, JSON and lock files, drift, conflicts, synchronization, history, and generated TypeScript types. Use for "event catalogue", "event catalog spec", "reopt-data.events.json", "이벤트 카탈로그", "이벤트 명세 관리", "카탈로그 동기화". Product journey design and tracking call sites belong to data-sdk-integration.
---

# reopt Data Event Catalogue

Own the catalogue beside the consumer's code. SDK installation is not a
prerequisite: a project can manage metadata without changing event delivery.
Use `data-sdk-install` for transport setup and `data-sdk-integration` for
measurement planning or instrumentation, only when that work is requested.

## Establish the target and installed capabilities

- Inspect existing catalogue files, locks, CLI configuration, package scripts,
  and CI before introducing another source of truth. Preserve local edits.
- Resolve `@reopt-ai/data-cli` in the consumer workspace (pnpm may not hoist it).
  Read its installed README, especially "Event catalogue as code", and the
  installed `reopt-data event --help` plus relevant subcommand help. Do not infer
  published capabilities from the upstream source tree. Published `0.1.0`
  (2026-08-30) reads only `version: 1` files and has no `--with-types`,
  `--strict-properties` / `--strict-observed`, `--include-discovered` or
  partial-write recovery; `0.2.0` (2026-10-25, contract `0.17.0`) has them all.
  If installation is needed, use the project's package manager (Node 22+).
- Confirm the API origin, environment, actual project ID, and catalogue file as
  one target. Prefer an existing configuration; never invent a project ID or
  rewrite the production file to point at a test project. Multiple projects need
  explicit file/config selection supported by the installed CLI.
- Remote operations use the CLI's documented credentials (normally an
  organization key), not a browser write key. Keep credentials outside the
  catalogue, lock, source control, output, and browser bundles.
- The organization key comes from provisioning or an operator, not the project
  console, and is shown once. Issuing another one revokes every existing key for
  that organization at once. Never rotate to obtain a key, and never ask another
  agent session for one — ask the user for the stored copy (CI/server only).
  `reopt-data login` (data-cli `0.2.0`) grants account reads only; it does not
  authorize catalogue writes.
- Without a key, finish the file locally and hand it to the user to import in
  the console at `/dashboard/<orgId>/<projectId>/events?panel=import` (accepts
  v1 and v2 files; a project member's sign-in is enough). Choose **overwrite**
  to apply every entry (**add missing** only creates absent events). Unlike
  `push`, an import never archives events the file omits, and it does not update
  the lock; refresh the lock with `event pull` once a key exists, and report CLI
  sync and `verify` as not run until then.

## Persist consumer guidance

For adoption/setup, prefer the installed CLI's `dist/agent-rules.md` if it ships
one; otherwise use this skill's `agent-rules.md`. Place the rules inside
`<!-- BEGIN:reopt/data-event-catalog-agent-rules -->` and
`<!-- END:reopt/data-event-catalog-agent-rules -->` in the consumer's `AGENTS.md`
(fallback `CLAUDE.md`). Replace only this block, preserve all surrounding text,
and avoid duplicate blocks. Read-only inspection does not modify markers.

## Author and reconcile

1. Start from `event pull` for an existing server catalogue, or `event init` for
   a new declaration. Inspect local changes before either command. Never use a
   fresh partial file to silently take ownership of an existing full catalogue.
2. Follow the installed file schema for supported fields and versions. Events
   carry display metadata, status, conversion intent, and rollup dimensions;
   v2 (data-cli `0.2.0`+) also declares `propertyType`, `description` and
   `hidden` per property under `properties.event` / `properties.profile` — the
   only two scopes. Properties are project-wide by scope/name, not per-event
   schemas; `event pull` writes only curated ones unless `--include-discovered`.
3. Keep names stable, reserve conversions for actual business outcomes, and
   choose bounded dimensions for rollups. Avoid personal data in examples and
   high-cardinality IDs, timestamps, or free text in rollup dimensions.
   `conversion` marks a whole event — it cannot filter on a property — so an
   outcome event that also records failures needs a success-only companion
   event to carry the conversion. Mark diagnostic or delivery-health events
   `status: "internal"`; metrics leave them out unless a query opts in.
4. Review `event diff` and the non-applying `event push` plan. Explain creations,
   updates, archives, server-side changes, and rollup rebuild implications.
   Omitted event fields reset to defaults; removing an event archives it.
   In v2, unmentioned properties remain untouched (and unreported unless
   `--strict-properties` / `--strict-observed` is passed to `diff` / `verify`),
   while omitted fields inside a declared property use defaults.
5. Apply with `event push --apply` only within the user's authorized target and
   scope; add `--yes` when the reviewed plan requires it. Existing authorization
   suffices. If authorization is missing, finish the local files and plan before
   asking about the concrete remote changes. A request to draft or inspect a
   catalogue does not authorize a server write.
6. A 409 signals a concurrent console edit. Preserve the local file and lock,
   compare server history/current state, and reconcile before retrying. `pull`
   can refuse unpushed edits; it is not a universal conflict-resolution command.
   Never automatically force an overwrite. If v2 reports a partial write, inspect
   the result and updated lock, re-diff, and retry only the remaining authorized
   changes after resolving the failure; stop if the same failure repeats.

## Types and verification

- Use `event types` for generated declarations and connect them to the existing
  typed `track()` wrapper when requested. `types` runs offline from the file;
  v2 declarations type the values and a key the file never names stays
  `unknown`. `--with-types` (`0.2.0`+, org key) adds the server's observed
  property keys; the file's declared type still wins over the observation.
- Catalogue types are not a complete payload validator: required fields, enums,
  nested shapes, and per-event property membership need a separate consumer
  contract. Do not promise runtime ingest rejection or strict unknown-key checks.
- Keep the catalogue and lock together in version control; do not commit unless
  requested. Regenerate types after edits and run the consumer's relevant type
  check if generated declarations or their wrapper changed.
- Run `event verify` against the selected target after sync; exit 8 means drift.
  Add it to the consumer's existing CI when adopting a drift gate, accounting for
  whether sync occurs before verification. Do not add automatic forced writes.
- Report the target, changed files, plan/applied changes, verification outcome,
  and any remote checks not run. Offline work without credentials is useful but
  must not be reported as synchronized.
