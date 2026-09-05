---
name: data-sdk-integration
description: |
  Design and implement production-grade product event instrumentation with the reopt Data SDK in a consumer app, from journey discovery and measurement planning through typed contracts, browser/server delivery, consent, catalogue-as-code, tests, and live verification. Use for "instrument events", "analytics measurement plan", "reopt event taxonomy", "data SDK integration", "이벤트 설계", "이벤트 심기", "데이터 SDK 연동". Use data-sdk-review instead for a read-only audit.
requires:
  - data-sdk-install
---

# reopt Data SDK Integration

Load `data-sdk-install` first; this skill owns product instrumentation after transport setup.

## 1. Establish the real baseline

1. Inspect the framework, package manager, routes, auth/session model, existing
   analytics providers, event helpers, consent owner, server-confirmed outcomes,
   and tests. Preserve useful existing contracts instead of creating a parallel
   taxonomy.
2. Read installed client/server READMEs before choosing APIs. The catalogue
   commands come from `@reopt-ai/data-cli` (bin `reopt-data`, Node 22+, dev
   dependency); read its README and the live `reopt-data event --help` before
   using them. Never import the deprecated `@reopt-ai/data-sdk` meta-package.
3. Identify the Data project and credentials. Do not invent IDs, commit live
   placeholders, or provision remote resources without user authorization.

## 2. Write the measurement plan before call sites

- Start from decisions: acquisition, activation, engagement, completion,
  retention, sharing, and qualified conversion. Define a short funnel for each
  journey and state what question every event answers.
- Use stable snake_case names and properties. Prefer durable IDs, enums, booleans,
  counts, durations, and bounded categories; reject free text, full URLs with
  sensitive query parameters, direct PII, and high-cardinality rollup keys.
- Record attempts and outcomes separately. Emit authoritative outcomes only
  after the server or durable store confirms them.
- Give page views, web vitals, and lifecycle events one owner to prevent duplicates.

## 3. Make the contract executable

1. Create or extend one typed event registry containing description, required
   properties, conversion intent, and useful dimensions. Validate before
   delivery in development and cover required-property rules with tests.
2. Build one privacy sanitizer and event-envelope builder. Fan the same payload
   to existing providers and remove provider-only fields at adapter boundaries.
3. Once the real project ID is known, initialize `reopt-data.events.json` with
   `reopt-data event init` (or `event pull` from an existing server catalogue).
   Mark only true business outcomes as conversions and select at most the
   low-cardinality properties needed for recurring rollups. Commit the
   catalogue and `reopt-data.events.lock.json`; run `event diff`, then `event
   push` (plan) before `event push --apply --yes`; gate CI with `event verify`.
4. Generate `reopt-data event types --out src/reopt-events.d.ts` and type the
   shared `track()` wrapper with `ReoptEventName` / `ReoptEventProperties` so
   undeclared events fail at compile time.

## 4. Instrument browser journeys

- Create one SDK client per write key before any component can emit. Choose the
  framework entrypoint or client instrumentation for the app's rendering needs.
- Default hosted server/proxy traffic to `https://data.reopt.ai`; reserve an env
  override for other deployments and keep browsers on `/ingest`.
- Let the SDK own `$pageview`, `$pageleave`, and `$web_vitals`, or map the existing
  router reporter to them. Never run both owners.
- Normalize dynamic paths before automatic events. Attach global context with
  initial properties/register, then emit semantic actions from shared domain
  hooks rather than duplicating calls across every template.
- Preserve SDK retry, batching, unload delivery, and fail-open behavior.

## 5. Instrument authoritative server outcomes

- Create the server factory once at module scope. Keep client ID/secret
  server-only and bind request events to the SDK-managed device/session.
- Track only after validation and the business operation succeeds. Await or
  schedule delivery using the installed server SDK semantics; analytics failure
  must not roll back the host operation.
- For delayed jobs, persist the SDK device ID with the outbox record. Never trust
  a browser-supplied profile or session ID.

## 6. Resolve identity, consent, and rendering deliberately

- Synchronize the app's consent source of truth before tracking. Withdrawal must
  stop events and remove analytics identity.
- Call identify only for an authenticated, server-verifiable product identity;
  call reset on logout. Anonymous app/session IDs are event properties, not
  profiles.
- `getBootstrap()` reads request cookies. With Cache Components or a static root
  layout, keep that read outside cached work or omit bootstrap and rely on proxy
  cookie seeding. Never cache bootstrap data across visitors.

## 7. Verify the story, not just compilation

1. Run format, lint, types, unit tests, and the production build.
2. Test payload shape, provider-field stripping, one pageview owner, consent
   denial, reset, and server-confirmed outcomes with recording transport or mocks.
3. With non-production credentials, verify an accepted first-party ingest batch,
   then correlate one unique event ID from UI action to Query API. Exercise one
   complete funnel and confirm no PII in payloads.
4. If credentials or project ID are absent, report live ingest, catalogue sync,
   and roundtrip verification as explicitly not run; do not fake success.

## Safety

- Never expose credentials, identity cookies, personal payloads, or production batches.
- Exceptions, breadcrumbs, tracing, public source maps, and production devtools
  are separate opt-ins; event instrumentation does not authorize them.
- Do not commit, push, provision, or apply catalogue mutations without authorization.
