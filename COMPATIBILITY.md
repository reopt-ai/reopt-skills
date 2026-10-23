# Compatibility Matrix

Each skill declares the minimum `@reopt-ai/*` package version it assumes. "Last
verified" = date the skill was last reconciled against that package version.
Update both columns in the PR that touches a skill.

The **Target** column lists the single primary package (matches the skill's
`target` / `targetMinVersion` frontmatter, which `pnpm validate` cross-checks).
Per-version detail lives in each package's docs; this table stays terse.

> **Verification level (2026-10-23 round):** every target re-checked against the
> three sibling monorepos (`reopt`, `reopt-data`, `reopt-design` — the latter at
> its release tags / `origin/main` `78b23872`, because its local `main` has
> diverged) and the public npm registry (scoped `--@reopt-ai:registry=` flag,
> publish times, dist-tags). Moved packages' tarballs were unpacked and diffed
> against the prior verified version; Data SDK and design claims were
> type-checked (`tsc`, per entry for opt-ui / opt-shell) against scratch
> installs, peer conflicts were reproduced with `npm install --dry-run`, and the
> opt-cli 1.4.0 bin was run. Moved since the prior round: `cli` **0.8.0 →
> 0.8.1**, `data-sdk-client` **0.6.1 → 0.7.0**, `data-sdk-server` **0.7.0 →
> 0.8.0**, `data-contract` **0.15.0 → 0.16.0**, `data-sdk-devtool` **0.2.0 →
> 0.2.1** (all four 2026-10-20), `brandapp-sdk` `next` **4.7.0-rc.1 → rc.6**
> (2026-10-10…14; `latest` stays 4.6.0), `opt-ui` **1.16.1 → 3.0.0** (2.0.0 –
> 2.3.0 on 09-28 … 10-01, 3.0.0 on 10-22), `opt-chat` **1.1.1 → 2.0.0**,
> `opt-shell` **1.1.0 → 2.0.0**, `opt-editor` **2.0.0 → 2.1.0** (all 10-22),
> `opt-datagrid` **1.6.1 → 1.7.0** (09-28), `opt-cli` **1.3.3 → 1.4.0**,
> `opt-charts` **1.8.2 → 1.10.0**, `opt-palette` **1.0.0 → 1.2.0**,
> `opt-ui-primitives` **1.5.2 → 1.6.1**. Unchanged: `data-cli` 0.1.0,
> `data-adapter-apps-in-toss` 0.2.2, `studio-catalog` 4.2.2 (main has an
> unpublished 4.3.0), `opt-calendar` 1.0.0, `opt-filemanager` 0.1.0, `opt-meta`
> 0.1.0, `opt-devtool` 1.0.1. No live ingest, upload, replay or platform call
> was run.
>
> — **cli 0.8.1** (2026-09-26, after the prior round read 0.8.0): fix release —
> stdio stops advertising `tools.listChanged`, `@modelcontextprotocol/server`
> 2.1.0 (rejects a 2026-07-28 HTTP request without `MCP-Protocol-Version`, 4 MiB
> body / 100-message batch caps), `plugin.json` version fixed, dependency
> `@reopt-ai/brandapp-sdk ^4.6.0`, and the remote `eav_record_bulk_update`
> description now says values may be keyed by attribute name. Stdio still
> advertises 15 tools; the bundled `CHANGELOG.md` has no `[0.8.1]` section. Still
> no `dist/agent-rules.md`. Floor stays 0.8.0. Unreleased on `main`: an
> optional `webhooks.<key>.secret` in `reopt.workspace.ts` with a generated
> `whsec_…` at apply (operator-only surface), RFC-0034 machine credentials on the
> workspace `oauth-client` adapter, and the dev id host losing its `:3443`.
>
> — **Remote MCP (`https://mcp.reopt.ai`) 30 → 39 tools.** The 9
> `reopt_social_*` tools (RFC-0037, `apps/web/server/mcp/tool-policy.ts`,
> 2026-10-20) are deployed with the web app and need no CLI release — the count
> was read from source and from a connected client's `tools/list` on this date.
> Five reads (`workspace:read` + RBAC `channel:read`), `social_review_run`
> (`workspace:write`, spends AI credits, status unchanged) and three
> `social_post_propose_*` proposals (`social:approve` / `social:publish`); no
> tool approves, records a publish or cancels directly; Pro plan gate, demo
> workspaces read-only. A missing tool scope answers `403` with
> `WWW-Authenticate: Bearer error="insufficient_scope"` (step-up, 2026-09-26).
>
> — **BrandApp SDK — 4.6.0 corrections** (the prior rounds' routing was wrong;
> nothing changed in the package). `docs/api-reference.md` has no
> `createLazySDK`, typed `entity()` client, auto-pagination, schema sync,
> `token/mint`, `linkedTo` or `backfill` — those live in `README.md`,
> `docs/migration.md` § `2.x → 3.0.0`, `docs/errors.md` § EAV-specific and the
> `/eav` declarations. `CONFIG_BROWSER_SECRET` is only in `migration.md`. Hook
> names are `useEavRecords` / `useEavRecord` / `useEavRecordsInfinite`
> (`useRecords` / `useInfiniteRecords` never existed); `listAllRecords` and
> `handleApiError` are not SDK symbols. Only `records.list` throws
> `BadRequestError` above 100 — `listAll` / `backfill` clamp, `cms.posts.list`
> gets a server 400. The monorepo `apps/brandapp-playground` is gone (now the
> `reopt-ai/brandapp-playground` repo). 🔴 **4.6.0's non-production default host
> is `brand.reopt.de:3443` / `id.reopt.de:3443`** (`dist/config-*.js`,
> `docs/environment.md`, `docs/dev-server.md`), a domain Reopt does not own
> (`reopt` 6718adf1f: it only resolved through per-machine `/etc/hosts`; on this
> date `reopt.de` resolves publicly to a third party and `brand.` / `id.` do
> not). The skills now tell dev/test runs to set `REOPT_BASE_URL` /
> `REOPT_ID_BASE_URL` explicitly; review adds **Cfg9**.
>
> — **BrandApp server-side changes on `reopt` main** (apply to every SDK
> version once deployed; deployment not verified): new payments go through
> Lemon Squeezy instead of Paddle (9bff58462, 2026-10-14, RFC-0035 — the SDK's
> `CheckoutSession.provider` is a plain `string`, so nothing breaks at the type
> level; the skills now say "whichever provider the server picks" instead of
> "live Paddle"). Files and `external-subscription` routes accept app
> credentials only, an AI call with a customer token pins usage to that
> customer (a different body `customerId` is a 403), and unpublished CMS posts
> are hidden from customer tokens.
>
> — **BrandApp SDK — `next` 4.7.0-rc.6, pending, not adopted.** fileCount 94 →
> 114; first hard dependency `jose ^6.2.3` and first bin `reopt-keygen` (rc.1);
> peer `better-auth ^1.7.7` (rc.2) plus optional `@better-auth/core >=1.7.7`
> (rc.1). New subpaths `./machine` (rc.1), `./resource`, `./superadmin`,
> `./installation` (rc.3) with `docs/machine.md`, `docs/resource.md`,
> `docs/superadmin.md`, `docs/installation.md`; existing doc filenames unchanged.
> Machine credentials (RFC-0034): `createReoptSDK` / `createReoptAdapter({
> authorization })` (still needs `clientId`), `private_key_jwt` on
> `createReoptOAuth`, `createPlatformClient({ keyRing | privateKeyJwk })`, and the
> SDK-read `REOPT_CLIENT_PRIVATE_KEY_JWK` (+ `_NEXT`) — a consumer secret under
> `REOPT_*`, which breaks the "`REOPT_*` = hosts only" tier (`docs/environment.md`
> still states it). Server credentials are "registered by Reopt for now". Step-up
> login (`stepUp`, `/api/auth/callback/reopt-step-up`, rc.3); cursor `listAll()`
> without `QUERY_TOO_BROAD` (rc.4); `plans.changePlan` + 5xx codes (rc.5);
> `plans.resume` + 409 `SUBSCRIPTION_CANCEL_PENDING` (rc.6); dev hosts
> `*.local.reopt.io` without a port (rc.1). Unreleased after rc.6: `./social` +
> `docs/social.md`. No release-prep commit — the next publish looks like rc.7.
> What a consumer changes is in the `brandapp-playground` repo (46ec447,
> dd5c13b): bump the SDK and `better-auth` 1.7.7 together, a machine client with
> `authorization`, a served `/.well-known/reopt-client-jwks.json` exempt from
> content negotiation, and the secret kept as a fallback.
>
> — **Data SDK:** export names, peers, engines, bins and fileCounts are unchanged
> in all four moved packages; the changes are behavioural. Client 0.7.0 re-keys
> the offline queue (`<storagePrefix>queue:v2:<eventId>:<writeKey>`; legacy
> queues are not restored), purges a withdrawn category's queue, coordinates tabs
> through Web Locks (`flush()` → `skipped`), keeps quota-deferred rows queued,
> waits for in-flight requests on `flush({ drain: true })` / `close()`, and
> returns `validation_failed` for circular / `BigInt` properties. Server 0.8.0
> treats a `getProfileId` answer of `null` as authoritative (no profile-cookie
> fallback), caps the engine cache at 256 (15-min idle eviction) and keeps the
> `createOnRequestError` option set (still no `release`); its `README.ko.md` is
> byte-identical to 0.7.0's. Contract 0.16.0 adds `INGEST_CAPABILITIES_HEADER`,
> `deferred[]` (`accepted + duplicates + rejected + deferred === sent`), alert
> `notifyOnResolve`, and moves zod to `^4.6.5`; `CONTRACT_VERSION` stays
> `"0.10.0"`, segment definitions unchanged. The replay README heading still says
> "npm release pending". 🔴 **No published `data-adapter-apps-in-toss` accepts
> client 0.7.0** (0.2.2 peers `^0.4.0 || ^0.5.0 || ^0.6.0`; npm `ERESOLVE`, pnpm
> warns; its types compile against 0.7.0, so it is a declared-range gap), and
> `main` has no fix. **Correction:** the quota refusal is HTTP **429**
> `quota_exceeded` with `Retry-After: 3600` (`packages/ingest/src/core.ts`), not
> 402 — 402 was the SDK's internal transport status. Unreleased on `main` and not
> adopted: data-cli platform commands (`org *`, platform source maps) moving to a
> machine client (`REOPT_DATA_MACHINE_CLIENT_ID` + `REOPT_CLIENT_PRIVATE_KEY_JWK`)
> with the server dropping the static platform key (f1cbaf5a) — once deployed,
> published 0.1.0's platform-key commands stop working (operator-only; project
> and host uploads use the org key and are unaffected); MCP result bounding; the
> larger command set.
>
> — **Design: the pending majors all shipped.** **opt-ui 2.0.0** adds `./next`
> (`SidebarNav`, `RouteFocusManager` removed from the root and `/shells`), makes
> the `SqlEditor*` types structural and bumps the `@codemirror/commands` peer to
> `^6.11.1`; **3.0.0** adds `./sql-editor` (`SqlEditor` + 10 types removed from
> the root and `/shells`) and portals overlays into the enclosing `DialogRoot`.
> From 3.0.0 the root, `./core`, `./shells`, `./visuals` and `./query` import
> neither `next` nor `@codemirror/*` and pass `tsc` with `skipLibCheck: false`
> and neither installed; on 1.16.1 / 2.x the root still `import()`s CodeMirror.
> Every exported `*Props` / `*Labels` type only gained members. The `dist/docs/`
> tree is the same 14 files (`index.md` byte-identical);
> `05-migration/01-breaking-changes.md` gains "opt-ui Version 2.0.0" / "3.0.0"
> sections, while `01-getting-started.md` was not updated (no `/next` /
> `/sql-editor`, still names `opt doctor`). `opt-ui-install`'s floor moves to
> **3.0.0**: opt-cli 1.4.0's catalog and blocks are 3.0-only, and opt-shell 2.0
> depends on opt-ui `^3.0.0`. **opt-chat 2.0.0**: Node **≥ 22** (`nanoid ^6`; not
> in the CHANGELOG), `ToolState` removed and `ConfirmationState` exported (=
> `ConfirmationProps["state"]`), the JSXPreview family moved to `./jsx-preview`
> (the 1.1.x root's `import("react-jsx-parser")` broke Next builds without the
> parser), lazy Streamdown plugins, `ToolGroup`; the README now says
> `styles.css` is required whenever `CodeBlock` renders (opt-ui CSS has no
> `.shiki` rules). **opt-shell 2.0.0**: adapters on `./datagrid` / `./editor` /
> `./calendar` (root imports fail with TS2305); the root and `./core` reach no
> adapter peer, `zod` or `next`; floors rise to opt-ui `^3.0.0` (dependency),
> opt-palette `^1.2.0` (required peer), opt-datagrid `^1.7.0`, opt-editor
> `^2.1.0` — npm `ERESOLVE` against opt-palette 1.0.x, opt-datagrid 1.6.1 or
> opt-editor 2.0.0, so `opt-datagrid-install` → **1.7.0** and `opt-editor-install`
> → **2.1.0**. **opt-datagrid 1.7.0**: `./evaluation` (client hook) and
> server-only `./jev` (throws in a browser, calls an external evaluation API),
> four new `DataGridTheme` keys (README only), six Korean-only docs; the 1.6.1
> CHANGELOG gap is closed. **opt-editor 2.1.0**: root `useEditorAI` without the
> `ai` / `zod` peers, reactive `$state` / `$cond`, and corrected docs — route
> handlers import `createEditorHandler` / `createEditorTools` / `defineCatalog`
> from `/server`, because `/ai-sdk` has been `"use client"` since 2.0.0. The
> root entry is `"use client"` too, so RSC rendering goes through `/server`'s
> `specToHtml` / `specToMarkdown` (the README's "works as RSC" is wrong; read
> from the code, no Next build run). File count 63 → 47 is dropped `.map` files.
> **opt-cli**: 1.3.4 raised `engines` to Node ≥ 22.12 in a patch; 1.4.0 adds
> `OPT_PROJECT_TOKEN`. None of the design packages ships `dist/agent-rules.md`.
> Prior-round correction: opt-cli 1.3.3's catalog JSON says `version: "1.15.0"`,
> not 1.16.0. Unreleased on `origin/main`: only opt-charts filled `dot` markers;
> the local `main` adds unpushed opt-chat exports (`Trace`, `ToolExecution`,
> `ExecutionSteps`, `AgentRun`, `Questionnaire`) and repository-URL edits.
>
> — **Design upstream follow-up:** (1) opt-cli 1.4.0 still declares
> `peerOptional @reopt-ai/opt-shell ^1.0.0`, so a local install beside opt-shell
> 2.0.0 fails with `ERESOLVE` (only the range is wrong — `./audit` uses the
> unchanged `/core`). (2) The remote block registry (`design.reopt.ai/api/r`,
> `builder.reopt.ai/api/r`) answers 404; the CLI silently falls back to its
> bundled copy. (3) `opt block add` does not enforce the registry's opt-ui
> `^3.0.0` range. (4) opt-devtool 1.0.1 hard-depends on opt-ui `^1.6.0`. (5)
> opt-shell 2.0.0's `[2.0.0]` CHANGELOG absorbed stale pre-0.2 text (a `./dev`
> entry that does not exist, "17 removed exports" that were never in 1.1.0) and
> omits the raised floors; its README "Entry points" lists three entries and
> `./calendar` is undocumented; `./meta` types import the unpublished
> `@reopt-ai/opt-doc-kit`. (6) opt-datagrid 1.7.0's CHANGELOG omits the
> evaluation entries, and its README links to `docs/…` paths that ship under
> `dist/docs/`. (7) opt-chat 2.0.0's CHANGELOG omits the Node 22 bump. (8) The
> opt-editor README claims `StaticRenderer` works as RSC from the root.
>
> — **Upstream follow-up (raise before 4.7.0 goes `latest`):** (1) published
> `@reopt-ai/cli` 0.8.1 depends on `brandapp-sdk ^4.6.0`, which a stable 4.7.0
> satisfies, and statically imports `/workspace`; in rc.6 that subpath
> statically imports the optional peer `@better-auth/core/oauth2`
> (`dist/client-t7ASsw2Q.js:3`), which the CLI does not install — so a fresh CLI
> install would most likely fail to start (inferred, not run). (2) rc.6
> `docs/machine.md` uses pre-2.0 `REOPT_CLIENT_ID` / `REOPT_BRANDAPP_ID` and
> calls `createReoptSDK` without `clientId`. (3) A released `[1.10.0]` CHANGELOG
> line was rewritten from `reopt.de` to `local.reopt.io`. (4) A 4.6.x patch
> moving the dev default off `reopt.de` would protect users who stay on
> `latest`. (5) An adapter 0.2.3 adding `|| ^0.7.0`.

> **Prior round (2026-09-26):** every target re-checked against the
> three sibling monorepos (`reopt`, `reopt-design`, `reopt-data`) and the public
> npm `latest` tag (scoped `--@reopt-ai:registry=` flag). The moved packages'
> tarballs were unpacked and diffed against the prior verified version, and the
> claims that changed were type-checked (`tsc`) or run (`opt`, `reopt-data
> --help`) against a scratch install. Moved since the prior round:
> `brandapp-sdk` **4.5.0 → 4.6.0**, `opt-ui` **1.15.0 → 1.16.0**, `opt-cli`
> **1.3.2 → 1.3.3**, `opt-charts` **1.7.0 → 1.8.2**, `data-sdk-client` **0.4.0 →
> 0.6.1**, `data-sdk-server` **0.5.0 → 0.7.0**, `data-contract` **0.12.0 →
> 0.15.0**, `data-adapter-apps-in-toss` **0.2.0 → 0.2.2**, `studio-catalog`
> **4.1.0 → 4.2.2**. Unchanged: `cli` 0.8.0, `opt-datagrid` 1.6.1, `opt-editor`
> 2.0.0, `opt-chat` 1.1.0, `opt-shell` 1.1.0, `data-sdk-devtool` 0.2.0,
> `data-cli` 0.1.0. No live ingest, upload, replay or platform call was run.
>
> — **brandapp-sdk 4.6.0:** the `better-auth` peer moves `^1.7.1` →
> **`^1.7.4`** and the SDK stops forwarding `accountIssuer` (kept for source
> compatibility, `@deprecated`, inert). better-auth 1.7.3+ keys accounts by
> `providerId` / `accountId` instead of the discovered `issuer`, so the "keep
> `REOPT_ID_BASE_URL` stable" rule now applies only to lockfiles pinned at
> 1.7.0–1.7.2. A self-hosted Better Auth database whose schema came from
> 1.7.0–1.7.2 must make `account.issuer` nullable first — Reopt's own migration
> (`20260912T0754_better_auth_174_account_provider_key`) drops that column's
> NOT NULL and the issuer unique index. 4.6 also adds the operator-only
> `platformCustomerUpsertInputSchema` (RFC-0029 §13, schema only). `docs/`,
> `README.md`, exports and engines are unchanged, and every routed path exists.
> The `platform` dist-tag (`4.5.0-platform.0`) is a stale prerelease.
>
> — **cli 0.8.0 (unchanged):** remote MCP 30 tools and stdio 15, matching the
> tarball. On `main` but unpublished, and not adopted: the MCP server 2.1.0
> bump, dropping `tools.listChanged`, the `plugin.json` version fix (the 0.8.0
> tarball still says `0.7.0`), name-keyed `eav_record_bulk_update` values, and
> the remote `insufficient_scope` step-up challenge.
>
> — **Design:** 🔴 **opt-ui 1.16.0 was published without `dist/docs/`**
> (registry `fileCount` 57 vs 71 for 1.15.0), so every `dist/docs/*` route and
> `opt guide` fail on a fresh 1.16.0 install. `opt-ui-install` now falls back to
> `opt component` / `opt catalog` (opt-cli ≥ 1.3.3), `COMPONENT_CATALOG.md` and
> `README.md`. 1.16.0 itself is a fix release (`SummaryRow` passes
> `sparklineData`) plus opt-charts `^1.8.0` (`TraceWaterfall`, `TimeSeriesChart`
> bands), so the 1.15.0 docs still apply otherwise. The bundled `CHANGELOG.md` of
> opt-ui 1.16.0 and opt-cli 1.3.3 lacks its own version's section. **Import-path
> correction:** `CriteriaBuilder` (+ `criteriaBuilder*`), `splitSqlStatements`
> and the SQL placeholder helpers are **root-only** exports — importing them from
> `/shells` fails with TS2305; the query workspace and replay shells resolve from
> both. In every published release the root and `./shells` import `next/link` /
> `next/navigation` (only `./core` / `./visuals` are Next-free), and the
> published `.d.ts` references `@codemirror/*` types, so `skipLibCheck: false`
> fails without those peers. opt-cli 1.3.3 rebuilds its catalog against opt-ui
> 1.16.0 + opt-charts 1.8.2 (`opt component CriteriaBuilder` resolves) and adds
> `opt catalog`. opt-shell 1.1.0's root — the only entry with components —
> statically imports all three adapter peers, `zod` (via `opt-editor/ai-sdk`) and
> `next` (via the opt-ui root); `./core` is contracts and helpers only. opt-chat
> 1.1.0 exports `ToolState` (`@deprecated`) and declares `ConfirmationState`
> without exporting it. **Pending upstream majors, deliberately not adopted:**
> opt-ui `./next` (with `SqlEditor` types that no longer import CodeMirror),
> opt-shell `./datagrid` / `./editor` / `./calendar`, the opt-chat `ToolState`
> removal, and opt-datagrid `./evaluation` / `./jev`. reopt-skills commit
> `bb66e16` had described the opt-ui / opt-shell entries as a shipped 2.0; this
> round rewrites them as pending.
>
> — **Data SDK:** 🔴 **session replay ships from `data-sdk-client` 0.5.0**
> (published 2026-09-13, hours after the prior round read 0.4.0): `sessionReplay`
> config, a `"replay"` consent category, instance `flushReplay()`, and a lazy
> `@rrweb/record` chunk (`@rrweb/*` are now hard dependencies). The shipped README
> still heads the section "npm release pending", so the skills gate on the
> installed version or types instead. `consent.defaultConsent` is `true` for each
> listed category and `setAllConsent(true)` flips every known category — both
> grant replay unless the integration keeps it out. Client/server 0.6.0 add
> `track({ eventId })` ingest dedup; server 0.6.0 adds `./ai`
> (`createReoptAiTelemetry` for `ai@7`; content off by default, error messages on
> by default); the server 0.7.0 README is English with `README.ko.md` alongside.
> `createOnRequestError` still has no `release` key — return `{ $release_id }`
> from `beforeCapture`. The Apps-in-Toss adapter's client peer tracks client
> minors (0.2.1 adds `^0.5.0`, 0.2.2 adds `^0.6.0`). Contract 0.13–0.15 add
> `./replay`, `./ai`, `./ai-schema` and an `ai_metric` alert condition; segment
> definitions are unchanged. Floors stay at 0.2.0 — replay is gated in the text.
> Unreleased and not adopted: the larger data-cli (`login`, `segment *`,
> Project-as-Code, …) and its MCP result bounding.
>
> — **Upstream follow-up (2026-09-27, requested from this round):** reopt-design
> published **opt-ui 1.16.1** — 71 files, `dist/docs/` restored (same 14-file
> tree as 1.15.0), `dist` code byte-identical to 1.16.0, bundled `CHANGELOG.md`
> carrying `[1.16.1]` and `[1.16.0]`, still no `./next` — and **deprecated
> 1.16.0** ("Published without dist/docs (opt guide fails)"). `opt-ui-install`'s
> floor moves to **1.16.1** and the docs workaround shrinks to an upgrade note.
> **opt-chat 1.1.1** changes only d.ts JSDoc + CHANGELOG: `ToolState`'s
> deprecation now points at `ConfirmationProps["state"]` (exported since 1.1.0,
> the future `ConfirmationState`, a superset of `ToolState` — checked with
> `tsc`), which `opt-chat-install` now recommends for new code; floor stays
> 1.1.0. Both hotfixes were cut from their release tags (`@reopt-ai/opt-ui@1.16.1`
> → `e2f7ec71`, `@reopt-ai/opt-chat@1.1.1` → `10a233c1`, pushed), so none of
> `main`'s unreleased breaking work is in them. The **opt-datagrid 1.6.1**
> tarball `CHANGELOG.md` still has no `[1.6.1]` section; `main` has it, so the
> next datagrid release carries it (the skill does not route there). reopt-design
> added publish guards in `b838d39a` (missing `dist/docs/index.md`,
> CHANGELOG/version mismatch, >10% tarball shrink vs npm `latest`) — committed
> but not yet pushed at the time of writing. The 2.0 majors remain unscheduled;
> until then `main`'s workspace 1.16.1 (with breaking changes) differs from the
> npm 1.16.1.
>
> — **Corrections to the 2026-09-13 round** (its text below is left as
> recorded): (1) the `better-auth ^1.7.4` peer and the inert `accountIssuer`
> shipped in **4.6.0**, not 4.5.0 — 4.5.0 is `^1.7.1` and still forwards the
> option; (2) segment definition v2 has **eleven** criterion kinds, not seven;
> (3) data-cli 0.1.0 **does** ship `tools [--json]` and `mcp` — only `completion`
> of that group is absent; (4) `opt block remove` and the `-c` shorthand removal
> are in published opt-cli 1.3.3; (5) `CriteriaBuilder` and the SQL helpers were
> never exported from `./shells`.

> **Prior round (2026-09-13):** every target re-checked against the
> three sibling monorepos (`reopt`, `reopt-data`, `reopt-design`) and the public
> npm `latest` tag (scoped `--@reopt-ai:registry=` flag). Published tarballs were
> unpacked and read for the packages whose claims changed. Moved since the prior
> round: `cli` **0.7.0 → 0.8.0**, `brandapp-sdk` **4.2.0 → 4.5.0**, `opt-ui`
> **1.12.5 → 1.15.0**, `opt-cli` **1.3.1 → 1.3.2**, `opt-charts` **1.5.0 →
> 1.7.0**, `data-contract` **0.10.0 → 0.12.0**, `studio-catalog` **2.0.0 →
> 4.1.0**, and a new public **`@reopt-ai/data-adapter-apps-in-toss` 0.2.0**.
> Unchanged: `opt-datagrid` 1.6.1, `opt-editor` 2.0.0, `opt-chat` 1.1.0,
> `opt-shell` 1.1.0, `data-sdk-client` 0.4.0, `data-sdk-server` 0.5.0,
> `data-sdk-devtool` 0.2.0, `data-cli` 0.1.0. Source-checked (CHANGELOGs,
> READMEs, `package.json` exports/peers/bins/engines, `src/`) **and** tarball-checked;
> **not** re-run through the full consumer install → `tsc --noEmit` → runtime
> smoke procedure, and no live platform `workspace apply`, ingest, or upload was
> executed. One `docs/` path is new (`brandapp-sdk` `docs/workspace.md`); every
> other routed path was confirmed present in the published tarball.
>
> — **cli 0.8.0 (Platform as Code, RFC-0030):** `reopt workspace plan | apply |
> import | export | drift | rotate-secret` declares six resource kinds in
> `reopt.workspace.ts` (`defineWorkspace` from the new `@reopt-ai/cli/workspace`
> subpath) and reconciles them through the platform API under scope
> `workspace:admin`. Apply order is `brand` → `brandapp` → `oauth-client` →
> `eav.schema` → `works.pipeline` → `webhook`, deletes in reverse and last.
> Destructive changes exit `7` without `--allow-destructive`; a stale saved
> `--plan` exits `9`; the advisory lock (shared with the EAV migration runner)
> exits `10`; a needed prompt with no TTY exits `3`. Brands and brandapps have
> **no delete path**. An uncreated-by-code resource is `import-required`, never
> overwritten. Issued OAuth secrets are written `0600` via `--secrets-out` and
> masked in human output. **`reopt brandapp eav sync` is deprecated** in favour
> of declaring `eav: { schema }`. The local stdio MCP server grew to **15** tools
> — `reopt_workspace_plan` is the fifth local-only tool and is read-only;
> `apply` / `import` are deliberately not exposed on either surface. The remote
> connector stays at 30. The `plugin.json` version now matches the release (the
> 0.6.0-vs-0.7.0 cosmetic mismatch is fixed). Requires `brandapp-sdk` >= 4.5.0.
> 🔴 **The whole `workspace` surface is operator-only and no skill teaches it.**
> `workspace:admin` is issued only in Reopt's internal superadmin console
> (`/brandapp/platform-clients`, RFC-0029 §9); RFC-0030 names external customers,
> agencies and user-delegated tokens as explicit non-goals and records the two
> supporting migrations as **not yet deployed to production**. Because the
> commands are still visible in `reopt --help` on the public package, `reopt-cli`
> carries a short step that names the surface and redirects, and `reopt-eav`
> tells agents to **ignore the `eav sync` deprecation** for consumer projects —
> the replacement path is unreachable outside the monorepo.
>
> — **brandapp-sdk 4.3 / 4.4 / 4.5:** 4.3 adds `FeedbackStatus` `resolved`
> (distinct from `responded`). 4.4 is the one with a consumer-visible sharp edge:
> `records.list({ limit })` above **100** is now a `BadRequestError` raised
> before the request rather than a silent clamp (`RECORDS_PAGE_LIMIT_MAX` is
> exported from `@reopt-ai/brandapp-sdk/eav`; use `listAll()` for more), and the
> same 100 cap applies to `cms.posts.list` — the older sitemap/RSS examples
> teaching `limit: 200` are wrong. Production 2026-08-30~09-05 lost five days of
> credit dead-letter settlement to exactly this. 4.5 adds the server-only
> `@reopt-ai/brandapp-sdk/workspace` platform client — **operator-only, same
> credential gate as the CLI surface above** — (`createPlatformClient`,
> `client_credentials` against `platform.reopt.ai`, RFC 8707 `resource` audience
> pinning, token cache with 60s-early renewal and one 401 retry) plus the
> declarative resource surface behind `workspace:admin`, all documented in the
> **new `docs/workspace.md`**. Destructive resource changes are refused with 409
> `DESTRUCTIVE_BLOCKED` and roll back the whole transaction; the apply lock
> answers `LOCK_HELD` (409) / `LOCK_UNAVAILABLE` (503). An OAuth secret is
> plaintext only in the response that creates or rotates it. `zod >= 4.0.0` is a
> new optional peer used only by that subpath, and the `better-auth` peer moved
> to **`^1.7.4`** with a forwarded `accountIssuer` now inert.
>
> — **Design:** opt-ui 1.13 / 1.14 / 1.15 are additive (`05-migration/01-breaking-changes.md`
> still has no entry past 1.5): 1.13 the nine SQL query workspace shells plus
> `SqlEditor`'s imperative handle and the SQL-splitting helpers, 1.14
> `CriteriaBuilder` and a `labels` prop on `ConditionBuilder`, 1.15 the session
> replay player shells. All come from the `./shells` entry point — the subpath
> export list is unchanged. `@codemirror/commands` joined the optional CodeMirror
> peers (undo/redo + line numbers in `SqlEditor`). The four chart types dropped
> from `lib/types.ts` were byte-identical duplicates and still resolve through
> `export * from "@reopt-ai/opt-charts"`. `dist/docs/` survived the "untrack dist
> docs copies" commit — the build regenerates it and the tarball still carries
> the full tree for opt-ui, opt-datagrid and opt-editor. opt-cli 1.3.2 only
> regenerated the catalog **against opt-ui 1.13.0**, so `opt component` misses the
> 1.14/1.15 additions; its command surface is unchanged. 26 registry blocks moved
> from the deprecated `SurfaceLayout` to `BlockLayout` (the alias remains public).
> **Unreleased and deliberately not adopted:** opt-chat's `ToolState` →
> `ConfirmationState` rename (npm latest is still 1.1.0 and its `[Unreleased]`
> section does not even log it), opt-cli's `-c` shorthand removal and `opt block
> remove`, and opt-charts' legend-toggle / waterfall-total fixes.
>
> — **Data SDK:** the only published movement is `data-contract` **0.10.0 →
> 0.12.0** (new subpaths `./segment`, `./definition`, `./integration`,
> `./integration-client`, `./cli`; segment definition **v2** — five attribute
> scopes, three time windows, seven condition kinds, nesting depth 3, per-type
> operator sets, and no create surface anywhere by design) and the new adapter
> package. Client, server, devtool and data-cli did not move. Two large bodies of
> upstream work are **unreleased and must not be written into a consumer
> project**: session replay (`sessionReplay` config, `setConsent("replay")`,
> `flushReplay()` — absent from the 0.4.0 tarball, whose README has no replay
> section at all) and the data-cli growth beyond published `0.1.0` (`login` /
> `account`, `segment *`, `org usage`, `sourcemap list|delete|*-platform`, and the
> whole Project-as-Code group). Published `0.1.0` is `config`, `event`, `org`,
> `project`, `query`, `sourcemap inject|upload` — nothing more. Quota metering
> gained a grace band: the rejection threshold is purchased quota **plus**
> platform grace, the 80%/100% notices are a different line, and a 402 /
> `quota_exceeded` preserves the batch rather than tripping the breaker. The
> Stripe removal touched only web and db — no published package references it.
> Every data package's npm tarball does carry its `README.md` despite a
> `files: ["dist"]` field (npm always includes it), so README routing is intact;
> none ships a `docs/` directory.

> **Prior round (2026-09-05):** every target re-checked against
> the three sibling monorepos (`reopt`, `reopt-design`, `reopt-data`) and the
> public npm `latest` tag (scoped `--@reopt-ai:registry=` flag). Moved since the
> prior rounds: `cli` **0.6.0 → 0.7.0**, `brandapp-sdk` **4.0.0 → 4.2.0**,
> `data-sdk-client` **0.2.0 → 0.4.0**, `data-sdk-server` **0.2.0 → 0.5.0**,
> `data-contract` **0.7.0 → 0.10.0**, new **`@reopt-ai/data-cli` 0.1.0**,
> `opt-ui` **1.6.0 → 1.12.5**, `opt-datagrid` **1.5.0 → 1.6.1**, `opt-cli`
> **1.3.0 → 1.3.1**. Unchanged: `opt-editor` 2.0.0, `opt-chat` 1.1.0,
> `opt-shell` 1.1.0, `data-sdk-devtool` 0.2.0. Source-checked (CHANGELOGs,
> READMEs, `package.json` exports/peers/bins, `src/`) **and** smoke-tested from
> a throwaway project with the published tarballs (client 0.4.0, server 0.5.0,
> data-cli 0.1.0, brandapp-sdk 4.2.0, cli 0.7.0, opt-ui 1.12.5, opt-datagrid
> 1.6.1, opt-editor 2.0.0, opt-chat 1.1.0, opt-shell 1.1.0, opt-cli 1.3.1):
> every subpath export and doc path the skills route to resolves; `tsc` accepts
> the 4.2 EAV options, `startBrandappAnalytics`, the 1.6 toolbar entry, and the
> 1.10–1.12 opt-ui components; `reopt-data sourcemap inject` stamps chunk ids,
> `sourcemap upload --dry-run` needs no key and resolves refs by URL, a keyless
> upload exits 2 naming `REOPT_DATA_ORG_KEY`, the legacy `upload-sourcemaps`
> spelling resolves, `event init` seeds the five automatic events and `event
> types` emits `ReoptEventName` / `ReoptActiveEventName` / `ReoptEventProperties`;
> `reopt brandapp eav records delete-where --help` documents the exit-7 gate;
> `opt component Callout` / `opt guide` / `opt block doctor` / `opt harness
> doctor` run on 1.3.1. Not run: a live ingest / upload against a real
> project, and the `reopt-data mcp` stdio handshake. Two skill claims were
> wrong against the published types and are corrected this round:
> `exceptionRateLimit` nests under `capture` (not the config root), and
> `addExceptionStep` is a client **instance method** (no root export).
> Published data-cli 0.1.0 has only `sourcemap inject | upload`; the `list` /
> `delete` / `list-platform` / `delete-platform` commands in the upstream README
> are not in that tarball. cli 0.7.0's `plugin.json` still declares
> `"version": "0.6.0"` (cosmetic).
>
> — **Data SDK (breaking for build scripts):** `data-sdk-server` **0.5.0
> dropped its `reopt-data` bin** (`refactor(sdk)!`). Source-map upload and the
> new event-catalogue-as-code workflow live in the separate public
> `@reopt-ai/data-cli` (bin `reopt-data`, Node **22+**): `sourcemap inject |
> upload | list | delete`, `event init | pull | diff | push | verify | types`,
> `query *`, `tools --json`, and an stdio `mcp` server. The old
> `inject-chunk-ids` / `upload-sourcemaps` spellings and `--api-key` /
> `REOPT_DATA_API_KEY` still resolve on the new CLI, but a partial failure now
> exits **6** (was 1). `@reopt-ai/data-sdk` on npm (0.2.3) is a **deprecated**
> meta-package. The client README did not change between 0.2.0 and 0.4.0 (the
> 0.3/0.4 bumps carried platform-scope source maps and contract 0.9), so the
> client `targetMinVersion` stays 0.2.0; the skills now version-gate the server
> bin move and route source maps to the data-cli README. The `reopt-data`
> example repo's `postbuild` may still show the old bin — the skills say so.
>
> — **cli 0.7.0:** `reopt brandapp eav records list | get | count |
> delete-where` (operational record debugging; `--entity` / filter
> `attributeId` accept names or ids; `delete-where` counts first and exits `7`
> without `--force`) and filter operators `in` / `not_in` (empty array = 400).
> Depends on brandapp-sdk ^4.2.0. Command tree otherwise unchanged; the bundled
> `skills/` copies diverged further from this repo's (theirs are the CLI's own
> tables), so `pnpm sync:cli --force` must **not** be run.
>
> — **brandapp-sdk 4.1 / 4.2 (additive):** 4.1 adds `sdk.analytics.getConfig()`
> + `@reopt-ai/brandapp-sdk/analytics` `startBrandappAnalytics(sdk)`, which
> imports the optional peer **`@reopt-ai/data-sdk >=0.1.1`** — the deprecated
> package name, not `data-sdk-client`; neither `README.md` nor `docs/` mentions
> the subpath (route: `CHANGELOG.md [4.1.0]` + declaration JSDoc). 4.2 adds EAV
> record `version` + `update({ ifVersion })` → 412 `PreconditionFailedError`,
> `increments` (server-side atomic number deltas, `values` now optional),
> `expiresAt` TTL (client-computed absolute ISO time; hourly physical delete),
> and a 10,000-row in-memory filter cap → 422 `QUERY_TOO_BROAD`; these **are**
> in `docs/api-reference.md` § EAV Client (한도 table) + `docs/errors.md`.
> 4.2 also fixes `createReoptOAuth()` to pin authorize/token/userinfo endpoints
> (Better Auth 1.7 discovery-at-init failure left an instance with no login).
> `targetMinVersion` rises to 4.2.0 because the skills now describe those
> options.
>
> — **Design:** opt-ui 1.10 / 1.11 / 1.12.5 are additive component releases
> (`05-migration/01-breaking-changes.md` has no entry past 1.5); opt-cli 1.3.1
> regenerated the component catalog for them. opt-datagrid 1.6.0 adds
> `DataGridToolbar` / `useDataGridToolbar` on a new `./toolbar` entry point;
> 1.6.1 is docs-only but corrects two agent-facing claims (`height` defaults to
> `420` and does not fill; `getRowThemeOverride` returns plain CSS via
> `--opt-surface`). `dist/docs/` layouts are unchanged for all three.
> `@reopt-ai/opt-meta` 0.1.0 (framework-free component metadata contracts) is a
> new public package. Still no package ships `dist/agent-rules.md`.
>
> **Prior round (2026-08-29, Data SDK only):** `@reopt-ai/data-contract`
> **0.6.3 → 0.7.0**, `data-sdk-client` / `data-sdk-server` / `data-sdk-devtool`
> **0.1.6 / 0.1.6 / 0.1.0 → 0.2.0**, all published 2026-08-29 and read back with
> `npm view` on the public registry. The release is the error-tracking suite:
> the client adds structured `$exception_list` (engine stack parsers in a lazy
> chunk), a per-type exception rate limit, `captureException(error, { level,
> fingerprint, properties })`, breadcrumbs (`addExceptionStep`,
> `capture.exceptionSteps`) and `init({ release })` with a `__REOPT_RELEASE__`
> build fallback; the server adds the same structured chain to
> `createOnRequestError`, a `release` option, and a `reopt-data` bin
> (`inject-chunk-ids`, `upload-sourcemaps`) that keys maps by chunk URL. The
> devtool joined the release because its `console` prop had never been
> published (link mode hid the gap). `targetMinVersion` rises to 0.2.0 because
> every error-tracking option the skills now describe is absent on 0.1.x.
> Verified end-to-end against `reopt-data-sdk-example` (`/debug/errors` lab →
> issue page → symbolicated frame) on the 0.2.0 npm packages, not link mode.
> Docs layout unchanged: README.md only, no `docs/` dir, no `dist/agent-rules.md`.
>
> **Prior round (2026-08-22):** re-checked both sibling monorepos
> and every target's public npm `latest` tag (with an explicit
> `--@reopt-ai:registry=https://registry.npmjs.org` — the machine's user
> `.npmrc` still scopes `@reopt-ai` to GitHub Packages, which serves much older
> versions and silently reads as "no drift"). One target moved:
> `@reopt-ai/brandapp-sdk` **3.6.0 → 4.0.0**, published 2026-08-21. Every other
> target is unchanged (`cli` 0.5.0, `opt-ui` 1.6.0, `opt-datagrid` 1.5.0,
> `opt-editor` 2.0.0, `opt-chat` 1.1.0, `opt-shell` 1.1.0, design CLI 1.3.0).
> Source-checked against `src/better-auth/*`, **not** re-run through the full
> install → `tsc --noEmit` → smoke procedure.
>
> — **brandapp-sdk 4.0.0 (Better Auth 1.7):** major because 1.7 rebuilt generic
> OAuth on the social-provider path. `createReoptOAuthClient()` and
> `signIn.oauth2({ providerId })` are **removed** (no client plugin exists in
> 1.7) — sign-in is `signInWithReopt(authClient, …)` / `linkReoptAccount()` from
> `@reopt-ai/brandapp-sdk/better-auth/client`, wrapping
> `signIn.social({ provider: "reopt" })` / `linkSocial()`. The callback moved to
> `${baseURL}/api/auth/callback/reopt` (1.6: `/api/auth/oauth2/callback/reopt`);
> Reopt system clients have both registered, a self-registered redirect URI does
> not. The `better-auth` peer is `^1.7.1` and will not work with 1.6. The SDK
> now sends `client_secret_post` (override via
> `createReoptOAuth({ tokenEndpointAuthMethod })`), keeps `signOut()` app-local
> behind `disableProviderLogout` (opt in with `providerLogout`), and delegates
> 1.7's required `consumeOne` / `incrementOne` atomic ops to the Reopt API.
> PKCE is on by default and the discovered `issuer` namespaces accounts, so
> `REOPT_ID_BASE_URL` must stay stable across deploys.
>
> — **Docs-routing correction (pre-existing, found this round).** `docs/`
> contains **no** Better Auth wiring at all: `createReoptBetterAuth` /
> `createReoptOAuth` / `createReoptAdapter` appear only in the package
> `README.md`, while `docs/api-reference.md`'s "Auth Client" section is the
> user-token API (`sdk.auth.linkCurrentUser` etc.) — a different surface. Both
> skills previously routed "Better Auth + OAuth" to `api-reference.md`. They now
> route that surface to `README.md` + `CHANGELOG.md`. Separately,
> `docs/migration.md` still tops out at `2.x → 3.0.0`, so it covers none of
> 3.1–4.0; the skills now say so explicitly rather than pointing agents at a
> file that is silent on every recent breaking change. This is the third
> consecutive release (3.1 plans, 3.6 checkout, 4.0 auth) whose breaking surface
> landed ahead of `docs/`.
>
> **Prior round (2026-08-10):** re-checked both sibling monorepos,
> every target's live public npm `latest` tag, and all eight published tarball
> inventories. There is no target-version, export, docs-layout, Node-engine, or
> fallback change since 2026-08-08; none of the packages ships `agent-rules.md`.
> The only later `brandapp-sdk/package.json` changes are development-only bumps
> (`opt-editor` 1.1.2 → 2.0.0 and `@ai-sdk/provider` 4.0.4 → 4.0.7), and no
> relevant `reopt-design` target-package commit landed after the prior snapshot.
> Full consumer install → `tsc` → runtime smoke was not repeated.
>
> **Prior round (2026-08-08):** re-checked both sibling monorepos
> (`reopt` + `reopt-design`), public npm `latest` metadata, published manifests,
> and `npm pack --dry-run` file inventories for every targeted package. Changed
> since 2026-07-24: `brandapp-sdk` **3.3.0 → 3.6.0**, `opt-ui` **1.5.0 →
> 1.6.0**, `opt-datagrid` **1.4.2 → 1.5.0**, `opt-editor` **1.1.2 → 2.0.0**,
> `opt-chat` **1.0.0 → 1.1.0**, `opt-shell` **1.0.0 → 1.1.0**, and design CLI
> **1.2.0 → 1.3.0**. `@reopt-ai/cli` remains 0.5.0.
> — **brandapp-sdk 3.4–3.6:** subscription lifecycle webhooks + live Paddle
> checkout/unified cancellation, Files folder/rename/move/preview/usage APIs, and
> EAV record-list `select` projection. Current server checkout collects required
> terms on the hosted order-review page; the published 3.6
> `docs/api-reference.md` / `docs/errors.md` still contain an older
> `RequiredTermsError` catch example, so the skills explicitly route current
> checkout behavior to the declaration JSDoc resolved from the installed
> `@reopt-ai/brandapp-sdk/plans` export until those docs catch up.
> — **design 2026-07-29 suite:** opt-editor 2.0 moves runtime Zod schema values
> from `/server` to `/schemas` and requires canonical V2 stored content;
> opt-datagrid 1.5 bounds value-cache growth and adds `/ai-stream`; opt-chat 1.1
> replaces StickToBottom-era props and makes `PromptInput` a native form;
> opt-shell 1.1 applies policy to `<html>` and adds preference/shortcut layers;
> opt-ui 1.6 adds optional `app.css`. opt-cli 1.3 makes `opt block` primary,
> adds project sync, and has **no top-level `opt doctor`** — checks are
> `opt block doctor` or `opt harness doctor`. Source + published package layout
> verified; all six packages declare Node 20+. Full consumer install → `tsc` →
> runtime smoke was not run.
>
> **Prior round (2026-07-24):** re-checked the sibling monorepo
> source (`reopt`) after a two-package bump. Changed vs the 2026-07-16 round:
> `@reopt-ai/cli` **0.3.1 → 0.5.0** and `@reopt-ai/brandapp-sdk` **3.1.0 →
> 3.3.0**.
> — **cli 0.4.0** is a breaking pre-launch hardening pass: the env-var rename
> (`REOPT_CLIENT_*` / `REOPT_ENV` / `REOPT_BRANDAPP_ID` → `BRANDAPP_*`, **no
> aliases**) finally shipped in the CLI (the skills already used the `BRANDAPP_*`
> names, so `targetMinVersion` rises to 0.5.0 to make the skill honest — those
> names do not exist on 0.3.1); data output moved to **stdout** as raw
> server items; `.reopt.config.mjs` is now trust-on-first-use (`REOPT_TRUST_CONFIG=1`);
> `eav sync` gained **safe-mode** — orphan deletes / `isRequired`·`isUnique`
> promotions / select-option removals are blocked (exit `7`) unless `--force`,
> and a mutating sync takes the migrate advisory lock (exit `10`). **cli 0.5.0**
> threads `--timeout`/`--max-retries` into `eav`, surfaces brandapp-sdk ≥3.3.0
> `context.requestId` + fix hints, and hardens `--schema` path / CSV export.
> — **brandapp-sdk 3.2.0** adds OIDC **Single Logout** (`@reopt-ai/brandapp-sdk/logout`:
> `createBackchannelLogoutHandler` / `verifyBackchannelLogoutToken` /
> `buildEndSessionUrl`; new `docs/logout.md`); **3.3.0** is backward-compatible
> logout/security hardening (JWKS refetch throttle, fail-closed fetch timeouts,
> 503-vs-400 split, reliable error `requestId`, `FetchOptions.idempotent`,
> caller-cancel `CANCELLED`, `dev.mintLogoutToken`). Also corrected a stale host
> reference across the SDK skills: the prod main API is **`brandapp.reopt.ai`**
> (the older `brand.reopt.ai` is legacy; auth stays `id.reopt.ai`).
> Source-checked, **not** re-run through the full install → `tsc --noEmit` →
> smoke procedure.
>
> **Prior round (2026-07-16):** re-checked the sibling monorepo
> source (`reopt` + `reopt-design`) after a package bump. Changed vs the
> 2026-07-13 round: `@reopt-ai/brandapp-sdk` **3.0.0 → 3.1.0** (additive —
> `sdk.plans` gains hosted checkout: `createCheckout` / `getCheckout` / `cancel`,
> new `RequiredTermsError` + `LIVE_MODE_UNSUPPORTED` 409; the checkout surface is
> **not documented in `docs/` yet**, so skills route to the
> `@reopt-ai/brandapp-sdk/plans` export types and the guardrails live in the
> shared `agent-rules.md`), `opt-ui` **1.4.1 → 1.5.0** (Drawer slide animations
> tokenized via `OPT_ANIMATE_DRAWER` — runtime behavior unchanged, exports
> identical), and `opt-cli` **1.1.1 → 1.2.0** (adds `opt component` +
> `opt surface diff`; **`@reopt-ai/opt-shell` moved to `peerDependencies`** so
> opt-ui-only consumers may need to install it — tarball 1.1 MB → 108 kB).
> Unchanged: `cli` 0.3.1, `opt-datagrid` 1.4.2, `opt-editor` 1.1.2, `opt-chat`
> 1.0.0, `opt-shell` 1.0.0. Source-checked, **not** re-run through the full
> install → `tsc --noEmit` → smoke procedure.
>
> **Prior round (2026-07-13):** every package targeted by a skill
> was checked against the sibling monorepo source and the public npmjs registry.
> `@reopt-ai/brandapp-sdk` 3.0.0, `@reopt-ai/cli` 0.3.1, `opt-ui` 1.4.1,
> `opt-datagrid` 1.4.2, `opt-editor` 1.1.2, `opt-chat` 1.0.0, `opt-shell` 1.0.0,
> and `opt-cli` 1.1.1 all resolve publicly with no install token. Install skills
> now remove a legacy `@reopt-ai:registry=https://npm.pkg.github.com` project
> override instead of creating one. `opt-chat` / `opt-shell` 1.0.0 are stable
> public releases with no breaking API change from 0.x; `opt-editor` 1.1.2 uses
> optional `ai >= 7` / `zod >= 3` peers for AI integration. Published
> `opt-shell` 1.0.0 exports only `.`, `./core`, and `./meta`; its bundled
> `./audit` references are stale, so authoring audits route to
> `@reopt-ai/opt-cli/audit` / `opt harness`. Source + registry checked,
> **not** re-run through the full install → `tsc --noEmit` → smoke procedure at
> the bottom of this file.
>
> **Prior round (2026-06-26):** `@reopt-ai/brandapp-sdk` **2.3.0 →
> 3.0.0** reconciled by reading the package source in the `reopt` monorepo
> (`packages/brandapp-sdk`) — `CHANGELOG.md`, `docs/migration.md`,
> `src/core/config.ts` (`assertBrowserSafe` / `validateConfig`), the webhook
> contract in `docs/api-reference.md`. 3.0 is a security-review follow-up: the
> webhook verification contract + `verifySignature` signature changed (now
> aligned to the live platform sender), browser `clientSecret` is blocked
> (`CONFIG_BROWSER_SECRET`) with an additive token-only config, and the
> long-`@deprecated` `ReoptAdapterConfig` / `ReoptEavConfig` / `ReoptAdapterError`
> aliases were removed. docs layout is unchanged (still top-level `docs/`), so
> routing paths were not touched — only versions + the shared agent-rules and
> the install/review surface. Source-checked, **not** re-run through the full
> install → `tsc --noEmit` → smoke procedure at the bottom of this file.
>
> **Prior round (2026-06-18):** `opt-*` 1.4.x family confirmed via `npm view`
> (`opt-datagrid` 1.4.2, `opt-editor` 1.0.3, `opt-chat` 0.3.1); unchanged this
> round.

## Current state — 2026-10-23

All targets in the tables below are public npm packages. A GitHub Packages
token or scoped `.npmrc` entry is neither required nor supported by the install
skills.

### CLI

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `reopt-cli` | `@reopt-ai/cli` | **0.8.0** | 2026-10-23 (src+npm+tarball against 0.8.1; remote catalog 39 tools from source + a live connected client) |
| `reopt-brandapp` | `@reopt-ai/cli` (via `requires`) | — | 2026-10-23 (src+npm, unchanged) |
| `reopt-eav` | `@reopt-ai/cli` (via `requires`) | — | 2026-10-23 (src+npm, unchanged) |

### BrandApp SDK

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `brandapp-sdk-install` | `@reopt-ai/brandapp-sdk` | **4.6.0** | 2026-10-23 (src+npm+tarball; `next` 4.7.0-rc.6 diffed, not adopted) |
| `brandapp-sdk-review` | `@reopt-ai/brandapp-sdk` | **4.6.0** | 2026-10-23 (src+npm+tarball; `next` 4.7.0-rc.6 diffed, not adopted) |

### Data SDK

The public skills treat `@reopt-ai/data-sdk-client` as the primary target and
version-gate the companion suite during execution. Verified companions:
`@reopt-ai/data-sdk-server` 0.8.0 (**no bin** from 0.5.0; `./ai` from 0.6.0;
authoritative `getProfileId` from 0.8.0),
`@reopt-ai/data-cli` 0.1.0 (bin `reopt-data`, Node 22+ — source maps, event
catalogue, query, and the `tools [--json]` / `mcp` agent surface),
`@reopt-ai/data-sdk-devtool` 0.2.1, and `@reopt-ai/data-contract` 0.16.0.
Session replay needs client **0.5.0+**. The Apps-in-Toss adapter (0.2.2) does
not accept client 0.7.0 — adapter projects stay on client `^0.6`.
`@reopt-ai/data-sdk` (0.2.3) is a deprecated meta-package the skills refuse.

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `data-sdk-install` | `@reopt-ai/data-sdk-client` | **0.2.0** | 2026-10-23 (src+npm+tarball+`tsc` against 0.7.0 / server 0.8.0; 0.2.0 example run on 2026-08-29) |
| `data-sdk-integration` | `@reopt-ai/data-sdk-client` (via `requires`) | — | 2026-10-23 (src+npm+tarball; catalogue commands from data-cli 0.1.0, contract 0.16.0; unchanged) |
| `data-sdk-review` | `@reopt-ai/data-sdk-client` | **0.2.0** | 2026-10-23 (src+npm+tarball+`tsc` against 0.7.0 / server 0.8.0; 0.2.0 example run on 2026-08-29) |

### Design / UI packages

| Skill | Target | Min version | Last verified |
|---|---|---|---|
| `opt-ui-install` | `@reopt-ai/opt-ui` | **3.0.0** | 2026-10-23 (src+npm+tarball+`tsc` per entry; opt-cli 1.4.0 run; 1.16.0 stays deprecated) |
| `opt-datagrid-install` | `@reopt-ai/opt-datagrid` | **1.7.0** | 2026-10-23 (src+npm+tarball+`tsc`; opt-shell 2.0 peers `^1.7.0`) |
| `opt-editor-install` | `@reopt-ai/opt-editor` | **2.1.0** | 2026-10-23 (src+npm+tarball+`tsc`; opt-shell 2.0 peers `^2.1.0`) |
| `opt-chat-install` | `@reopt-ai/opt-chat` | **2.0.0** | 2026-10-23 (src+npm+tarball+`tsc`; Node 22+, `ToolState` removed) |
| `opt-shell-install` | `@reopt-ai/opt-shell` | **2.0.0** | 2026-10-23 (src+npm+tarball+`tsc` + npm peer dry-runs; adapters on their own entries, opt-ui `^3.0.0`) |

> **Doc-layout note (routing-critical — skills point at literal paths):**
> - `@reopt-ai/data-sdk-client`, `data-sdk-server`, `data-sdk-devtool`, and
>   `data-cli` ship **README.md only** as agent-facing documentation; no
>   package ships a `docs/` directory. Source maps: the **data-cli README →
>   "Source maps in CI"** is canonical (server README § 4-1 shows the Next.js
>   shape and states the bin removal). Event catalogue as code and the agent
>   surface (`tools --json`, `mcp`): data-cli README. The production-shaped
>   reference implementation lives in the separate
>   `reopt-ai/reopt-data-sdk-example` repository; its `postbuild` may still
>   show the pre-0.5.0 server bin.
> - `@reopt-ai/brandapp-sdk` ships docs at top-level **`docs/`** (NOT
>   `dist/docs/`) — flat files `api-reference.md`, `cms.md`, `dev-server.md`,
>   `environment.md`, `errors.md`, `files.md`, `logout.md`, `migration.md`,
>   `testing.md`, and **`workspace.md`** (new in 4.5.0 — the platform client,
>   credential/audience rules, declarative resources, fail-closed contract).
>   No `index.md`; `api-reference.md` is the combined auth/EAV/webhook/React
>   surface.
> - `@reopt-ai/opt-ui` / `opt-datagrid` / `opt-editor` ship **`dist/docs/`**
>   with a numeric-prefixed tree (`01-…`, `02-api/` or `02-components/`,
>   `03-recipes/`, `0N-migration/`, `0N-troubleshooting.md`) and an `index.md`
>   hub. Route to the directory + `index.md`, not to guessed flat filenames.
>   🔴 **Exception: opt-ui 1.16.0 shipped without `dist/docs/`** and is now
>   deprecated; the skill's floor is now 3.0.0 (the tree is the same 14 files from
>   1.16.1 through 3.0.0). Check the
>   registry `dist.fileCount` on every release.
> - `@reopt-ai/cli`, `opt-chat`, `opt-palette`, `opt-devtool` ship **no docs
>   dir** — route to `README.md` (and the CLI `--help` for `cli`).
>   `@reopt-ai/opt-shell` ships **`shell-llms.txt`** (agent guide) + `README.md`.
> - **No package ships `dist/agent-rules.md` yet** — every install/review skill
>   still relies on its bundled fallback `agent-rules.md`. Replace the fallback
>   with a pointer to the module's copy once a package starts shipping one.

### Design CLI (used by the UI skills)

`@reopt-ai/opt-cli` (bin `opt`, current **1.4.0**, public npm; **Node ≥ 22.12**
since 1.3.4 — that patch raised it without a CHANGELOG entry) is the unified
design CLI. Primary surfaces: `opt block add|list|view|info|update|remove|diff|doctor`
(`surface` is deprecated), `opt component`, `opt catalog`, `opt guide`, `opt ids`,
`opt project link|pull|status|push` (1.4.0: `OPT_PROJECT_TOKEN` bearer auth, Pro
plan), and `opt harness check|test|doctor`. Its component catalog and block
registry are build-time snapshots: 1.4.0 was generated against opt-ui **3.0.0** +
opt-charts 1.10.0, and its 32 blocks declare opt-ui `^3.0.0` (1.3.3: `^1.15.0`,
1.3.4: `^2.0.0`, 1.3.9: `^2.3.0`) — `block add` does not check that range, so on
opt-ui 1.x pin `npx @reopt-ai/opt-cli@1.3.3`. The remote registry
(`https://design.reopt.ai/api/r`, and `builder.reopt.ai/api/r` after the 10-17
move) answered **404** on 2026-10-23; every `block` command warns and falls back
to the bundled copy, and `OPT_REGISTRY_STRICT=1` would make them fail. There is
no top-level `opt doctor` or `opt check`. opt-shell is an optional, lazy-loaded
peer needed by harness commands, not block/component commands — but 1.4.0 still
declares it as `^1.0.0`, so a local opt-cli devDependency beside opt-shell 2.0
fails with npm `ERESOLVE` (run it through `npx`). There is no `opt-ui-cli` or
`opt-editor-cli` package.

### Tracked but no installer skill yet

| Package | Current version | Status |
|---|---|---|
| `@reopt-ai/studio-catalog` | 4.2.2 | public npm (versioned customer-facing product/plan/AI/usage/credit metadata; no installer skill). `reopt` main carries an unpublished 4.3.0 |
| `@reopt-ai/opt-ui-primitives` | 1.6.1 | public npm (native HTML/browser-API a11y primitives; dependency of opt-ui/opt-chat — opt-ui 3.0 needs `^1.6.1` for `useDialogPortalRoot`, which its CHANGELOG omits) |
| `@reopt-ai/opt-palette` | 1.2.0 | public npm (stable OKLCH color engine; required peer of opt-shell — `^1.2.0` from opt-shell 2.0; 1.1 danger-solid / disabled-control tokens, 1.2 `chartPalette`) |
| `@reopt-ai/opt-devtool` | 1.0.1 | public npm (stable; renamed from `@reopt-ai/opt-inspect`). Hard-depends on opt-ui `^1.6.0`, so beside opt-ui 3.0 it installs a second, nested opt-ui |
| `@reopt-ai/opt-charts` | 1.10.0 | public npm (Recharts adapters + SVG viz / chart frames + shells; 1.6 `PathFlowChart` + `FunnelChart` variants, 1.7 area-proportional `VennDiagram`, 1.8 `TraceWaterfall` + `TimeSeriesChart` bands; 1.9 funnel / legend features and `TraceWaterfall` keyboard support, 1.10 `showLegend` on only for 2+ series, an empty state instead of `null`, declaration-order tooltips; re-exported from the opt-ui root. No docs dir — README only. `main` has unreleased filled `dot` markers) |
| `@reopt-ai/opt-meta` | 0.1.0 | public npm (new; framework-free component metadata contracts shared by design packages) |
| `@reopt-ai/data-cli` | 0.1.0 | public npm (bin `reopt-data`, Node 22+; companion of the Data SDK skills — no installer skill of its own. The published command set is far smaller than the upstream README, but does include `tools` / `mcp`: see the round notes) |
| `@reopt-ai/data-sdk` | 0.2.3 | public npm, **deprecated** meta-package (use `data-sdk-client` / `data-sdk-server`); still the optional peer name `brandapp-sdk/analytics` imports |
| `@reopt-ai/data-adapter-apps-in-toss` | 0.2.2 | public npm (Apps-in-Toss WebView adapter — fans behaviour events to Toss Analytics and reopt-data; required peer `@reopt-ai/data-sdk-client ^0.4.0 \|\| ^0.5.0 \|\| ^0.6.0` (0.2.0 was `^0.4.0` only) — **does not accept client 0.7.0** (2026-10-20), and `reopt-data` main has no fix yet; Toss `send` injected rather than importing the Toss SDK. Korean README) |
| `@reopt-ai/legal` | 1.6.2 | npm **restricted** (not publicly installable) — never route an install here |
| `@reopt-ai/superadmin-cli` | 0.3.1 | GitHub Packages, **restricted** — internal operator tool, never route an install here |
| `@reopt-ai/opt-calendar` | 1.0.0 | public npm (stable events + booking/availability, drag/resize, recurrence, timezones) |
| `@reopt-ai/opt-filemanager` | 0.1.0 | public npm (connector-based file manager; first consumer of brandapp-sdk 3.5 Files APIs) |
| `@reopt-ai/opt-doc-kit` | 0.1.0 | internal, **not on npm** (`private: true`) — metadata-driven docs kit, apps/web workspace |
| `@reopt-ai/opt-uxflow` | 0.1.0 | internal, **not on npm** (`private: true`) — UX flow builder |
| `@reopt-ai/opt-ui-skills` | 0.1.0 | internal, **not on npm** (`private: true`) — new; opt-ui agent-skills bundle |
| `@reopt-ai/brandapp-ui` | 0.1.0 | internal, **not on npm** (`private: true`) — new; brandfront UI kit |
| `@reopt-ai/opt-deck` | 1.0.0 | **not on npm yet** (not `private`, npm 404 on 2026-10-23) — embeddable slide editor/viewer with validated JSON documents and json-render AI authoring; 1.0 API finalized on `reopt-design` 2026-10-10. Add an installer skill once it publishes |
| `@reopt-ai/builder-ui` | 0.1.0 | internal, **not on npm** (`private: true`) — new; shared builder infra + FormBuilder / ThemeBuilder on opt-ui |
| `@reopt-ai/tool-ui` | 0.1.0 | internal, **not on npm** (`private: true`) — new; framework-agnostic workspace shell + control primitives for reopt tools |
| `@reopt-ai/builder-ui` | 0.1.0 | internal, **not on npm** (`private: true`) — new; builder UI kit |
| `@reopt-ai/tool-ui` | 0.1.0 | internal, **not on npm** (`private: true`) — new; tool-surface UI kit |

`@reopt-ai/opt-ui-surface` is no longer a workspace package and has never been
published to npm. Page templates now come from the signed `opt block` registry.

### `@reopt-ai/cli` 0.7.0 — EAV records (2026-08-30)

Adds `reopt brandapp eav records list | get | count | delete-where` (the only
`eav` group that touches data) and the `in` / `not_in` filter operators (3-way
parity with server + SDK 4.2.0; an empty array is a 400). `--entity`, filter
`attributeId`, `--sort`, and `--select` accept names or ids and refuse a
duplicate entity name. `delete-where` counts first, exits `7` without
`--force`, and reports matched vs deleted separately. Depends on
`@reopt-ai/brandapp-sdk` ^4.2.0. `reopt-cli`, `reopt-eav`, and the shared
`cli-agent-rules` fallback document it; `reopt-brandapp` needed no edits.

### `@reopt-ai/cli` 0.6.0 — agent-integration release (2026-08-27)

The MCP body of work that was pending after 0.5.0 shipped in **0.6.0**; the
command tree (`login` / `status` / `token` / `brandapp *` / `eav *`) is
unchanged, so `reopt-brandapp` and `reopt-eav` needed no edits. What an
installed 0.6.0 now carries, and what `reopt-cli` Step 4 documents as installed
surface:

- `plugin.json` + `mcp.json` + `skills/` (`reopt-shared`, `reopt-brandapp`,
  `reopt-eav`) — an Agent Plugins 1.0.0 bundle declaring **only** the remote
  server `https://mcp.reopt.ai`. The bundled skills are the CLI's own copies;
  this repo's skills stay the marker-pinning layer on top.
- Remote catalog grew from 26 to **30** tools: `reopt_customer_feedback_list` /
  `_get` (`customer:read`) and `reopt_customer_feedback_propose_reply` /
  `reopt_customer_propose_note` (`customer:write`, queue a `WorkspaceProposal`
  for Studio approval — they never send or mutate CRM state).
- Every tool on both surfaces advertises `title` + read-only / destructive /
  idempotent / open-world hints; the stdio server speaks MCP 2026-07-28 and
  keeps 2025-era clients working. Build moved tsup → tsdown (fixes the lost
  executable bit on `dist/index.js`).

Still **not** shipped: `dist/agent-rules.md` — the `reopt/cli-agent-rules`
fallback remains authoritative.

## Drift checklist

Run every time a new `@reopt-ai/*` package ships:

- [ ] Does `npm view <package> version --@reopt-ai:registry=https://registry.npmjs.org`
      resolve the intended public release? The **scoped** flag is required — a
      plain `--registry=` does not override a `@reopt-ai:registry` line in the
      user `.npmrc`, and GitHub Packages serves far older versions, so the check
      reads as "no drift" when a major release has already shipped.
- [ ] Compare each package's publish **time** (`npm view <pkg> time`) with the
      previous round's date, not just `latest` — data-sdk-client 0.5.0 shipped
      hours after the 2026-09-13 round read 0.4.0, and that round missed it.
- [ ] Did the tarball shrink? Compare `npm view <pkg>@<v> dist.fileCount` with
      the previous version — opt-ui 1.16.0 dropped from 71 to 57 files because
      `dist/docs/` was not built.
- [ ] Does the package's docs dir (`docs/` **or** `dist/docs/`) cover the new
      API surface? Confirm the **exact path + filenames** — skills route to
      literal paths, so a renamed file silently breaks routing. Do not trust a
      README heading about release status (client 0.5.0–0.6.1 still say replay is
      "npm release pending"); check the installed types.
- [ ] Attribute a change to the version that **published** it: read
      `npm view <pkg>@<v> peerDependencies` / the tarball, not `main`.
- [ ] Does the package ship `dist/agent-rules.md`? — if not, keep the skill's
      fallback `agent-rules.md` current (and its doc map pointing at real paths).
- [ ] Bump `Min version` + `Last verified` cells above **and** mirror
      `targetMinVersion` in the skill's SKILL.md frontmatter (validate
      cross-checks the two).
- [ ] Add a `CHANGELOG.md` entry linking the package release to the skill change.
- [ ] New `@reopt-ai/*` package discovered? — add a row to "Tracked but no
      installer skill yet".

## Verification procedure

Quick self-check before marking a skill "verified" (runtime, not just source):

```bash
# From a throwaway Next.js / Node project with the target package installed.
# Re-invoke the skill via your agent:
#   - it should pin the BEGIN:reopt/<pkg>-agent-rules block into AGENTS.md
#   - it should NOT touch text outside the markers
#   - re-running should replace the block content, not append a second copy
#   - every dist/docs or docs path it routes to must actually exist in node_modules

npx tsc --noEmit
pnpm dev

# Auth smoke (if the skill touches auth)
curl -f http://localhost:3000/api/auth/ok

# SDK end-to-end smoke
curl -f http://localhost:3000/api/health
```

If any step fails, fix the skill before bumping compatibility.

## Historical deprecations

- **`@reopt-ai/opt-harness` retired (2026-06-13).** The harness layer shipped
  to npm as **`@reopt-ai/opt-shell`** ("runtime product-frame layer" — workspace
  recipes, density/contentWidth/navigation/motion policy, data-engine adapters,
  shared state boundaries). `opt-harness-install` was renamed to
  `opt-shell-install` and retargeted; the `Harness*` component names became
  `*Workspace` / `Shell*`. Harness **contract verification** now lives in
  `@reopt-ai/opt-cli` (`opt harness`).
- See [`CHANGELOG.md`](./CHANGELOG.md) for the full history of skill-level
  deprecations, renames, and API migrations.
