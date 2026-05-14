---
name: brandapp-sdk-review
description: Review consumer project code for @reopt-ai/brandapp-sdk usage anti-patterns and suggest improvements. Triggers on "brandapp-sdk review", "SDK review", "improve SDK usage", "EAV optimization", "brandapp-sdk audit".
target: "@reopt-ai/brandapp-sdk"
targetMinVersion: "1.12.0"
---

# Brandapp SDK Review

Skill for scanning a consumer project's `@reopt-ai/brandapp-sdk` usage,
detecting anti-patterns, and proposing concrete improvements.

---

## Prerequisites

- `@reopt-ai/brandapp-sdk` must be in the project's dependencies.
- Run from the consumer project root (not the reopt monorepo).

---

## Step 1: Project scan

Locate the relevant files:

```
1. package.json — confirm SDK version
2. **/*.ts files that import brandapp-sdk
3. EAV-related files (keywords like eav, store, client)
```

### Version check

```bash
grep '"@reopt-ai/brandapp-sdk"' package.json
```

Recommendations:

- **< 1.3.0** — `createLazySDK`, type-safe entity client, and SDK-level
  sync are missing. Upgrade is the first review step.
- **1.3.x – 1.5.x** — works, but every Pattern below assumes 1.6+ APIs
  (4xx error classes, `FetchOptions.signal/timeout`, webhook
  `toleranceMs`). Recommend 1.6+ before applying fixes.
- **1.6.x – 1.7.x** — fine. Run the Step 2-I CMS write check (Pattern
  CMS-1) before bumping to 1.8.
- **1.8.x** — works, but Step 2-C Error Pattern 3 (missing 1.9
  narrowed catches) and Error Pattern 4 (legacy
  `e.code === 'REQUEST_ERROR'` string check) only become relevant
  after a 1.9 bump. Recommend bumping when convenient — 1.9 is a
  non-breaking minor.
- **1.9.x** — works, but the production host moved to `brand.reopt.ai`
  in 1.10. If `baseUrl` is hardcoded to `www.reopt.ai` (or the pre-1.10
  default is implicit), all `/api/v1/brandapp/*` calls 404 in prod.
- **1.10.x – 1.11.x** — fine, but Schema Pattern 5 (EAV schema drift
  unchecked) only became actionable from 1.11. Step 2-D Config
  Pattern 4 (service token + Basic Auth混用) only becomes relevant
  on 1.12+.
- **1.12.0+** — current. Run the full review. The environment-variable
  rename (`REOPT_*` consumer creds → `BRANDAPP_*`, `REOPT_SDK_*` →
  `BRANDAPP_SDK_*`) lands in the next minor; flag any remaining
  `process.env.REOPT_CLIENT_*` / `REOPT_BRANDAPP_ID` references as
  upcoming-break risks.

```
⚠️ SDK v{current} → upgrade to v1.12.0
npm install @reopt-ai/brandapp-sdk@^1.12.0
```

---

## Step 2: Detect anti-patterns

Search for the following patterns and propose an improvement whenever one
is found.

### Pattern 1: Hand-rolled singleton (Proxy pattern)

**Search**: `new Proxy({} as` + `createReoptEavClient`

**Problem**: The consumer is reimplementing Proxy-based lazy init.

**Improvement**:
```typescript
// ❌ Before
let client: ReoptEavClient | null = null
export const eav = new Proxy({} as ReoptEavClient, { ... })

// ✅ After
import { createLazySDK } from "@reopt-ai/brandapp-sdk"
export const sdk = createLazySDK(() => ({ clientId, clientSecret, brandappId }))
export const eav = sdk.eav
```

### Pattern 2: Load-everything + in-memory filter (findOne is available)

**Search**: `.find((` or `.filter((` chained on a `listAllRecords` / `records.list` result

**Example**:
```typescript
const items = await listAllRecords(entityId, { authUserId })
return items.find((item) => condition) ?? null
```

**Improvement**:
```typescript
// ✅ records.findOne + server-side filter
const record = await eav.records.findOne(entityId, {
  authUserId,
  filters: [{ attributeId: attrId, operator: "eq", value: targetValue }],
})
```

### Pattern 3: Manual upsert (find + create/update)

**Search**: `if (existing)` together with `records.create` and `records.update` in the same function

**Example**:
```typescript
const existing = await findByKey(userId, key)
if (existing) {
  return await eav.records.update(entityId, existing.id, { values })
}
return await eav.records.create(entityId, { authUserId, values })
```

**Improvement**:
```typescript
// ✅ Atomic upsert — single API call
const { data } = await eav.records.upsert(entityId, {
  authUserId,
  filters: [{ attributeId: attrs.key, operator: "eq", value: key }],
  values,
})
```

### Pattern 4: Manual pagination

**Search**: `while` + `page` + `totalPages` + `records.list`

**Example**:
```typescript
const records = []
let page = 1
do {
  const res = await eav.records.list(entityId, { page, limit: 100 })
  records.push(...res.records)
  page++
} while (page <= totalPages)
```

**Improvement**:
```typescript
// ✅ Built-in listAll
import { collectAll } from "@reopt-ai/brandapp-sdk/eav"
const records = await collectAll(eav.records.listAll(entityId))

// Or streaming
for await (const record of eav.records.listAll(entityId)) { ... }
```

### Pattern 5: Manual enum normalization

**Search**: `new Set<` + `.has(stringValue as` pattern

**Example**:
```typescript
const statuses = new Set<Status>(['active', 'inactive'])
function normalize(v: unknown): Status {
  const s = asString(v)
  return s && statuses.has(s as Status) ? (s as Status) : 'active'
}
```

**Improvement**:
```typescript
// ✅ Use SDK asEnum
import { asEnum } from "@reopt-ai/brandapp-sdk/eav/coerce"
const statuses = ['active', 'inactive'] as const
const normalize = (v: unknown) => asEnum(v, statuses, 'active')
```

### Pattern 6: Home-grown coerce helpers

**Search**: Local definitions of `asString`, `asNumber`, `asBoolean`, `asDate`, `asJson`

**Problem**: The SDK already ships equivalents.

**Improvement**:
```typescript
// ✅ Use SDK coerce helpers
import { asString, asNumber, asBoolean, asDate, asJson } from "@reopt-ai/brandapp-sdk/eav/coerce"
```

### Pattern 7: Per-item delete loop

**Search**: `Promise.all(` + `.map(` + `records.delete`

**Improvement**:
```typescript
// ✅ bulkDelete (when IDs are known)
await eav.records.bulkDelete(entityId, ids)

// ✅ deleteWhere (condition-based)
await eav.records.deleteWhere(entityId, {
  filters: [{ attributeId: attrs.status, operator: "eq", value: "archived" }],
})
```

### Pattern 8: Per-item update loop

**Search**: `Promise.all(` + `.map(` + `records.update`

**Improvement**:
```typescript
// ✅ bulkUpdate — one API call
await eav.records.bulkUpdate(entityId, [
  { id: "r1", values: { [attrs.is_active]: false } },
  { id: "r2", values: { [attrs.is_active]: false } },
])
```

### Pattern 9: Load-all to get a count

**Search**: `.length` on a `listAllRecords` / `records.list` result

**Improvement**:
```typescript
// ✅ count API — returns only the number, not records
const count = await eav.records.count(entityId, {
  filters: [{ attributeId: attrs.deleted_at, operator: "is_null" }],
})
```

---

## Step 2-B: Auth patterns

Run these additional checks for projects using the SDK's Better Auth integration.

### Auth Pattern 1: No error boundary around SessionProvider

**Search**: A Provider component that calls `useSession()` without try/catch or ErrorBoundary

**Problem**: If `authClient.useSession()` fails, the whole app crashes.

**Improvement**:
```typescript
// ❌ Before — app crashes on error
function SessionProvider({ children }) {
  const session = authClient.useSession()
  // ... set atoms
  return <>{children}</>
}

// ✅ After — store the error in an atom, let the app keep running
function SessionProvider({ children }) {
  const session = authClient.useSession()
  useEffect(() => {
    if (session.error) {
      setSessionError({ code: "SESSION_FETCH_FAILED", message: session.error.message })
    }
  }, [session.error])
  return <>{children}</>
}
```

### Auth Pattern 2: No Next.js middleware for route protection

**Search**: `middleware.ts` is missing, or auth checks only happen inside page components

**Problem**: Protected routes redirect only after server rendering — causes flicker and wasted server work.

**Improvement**:
```typescript
// ✅ middleware.ts — block unauthenticated requests at the edge
import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

const protectedPaths = ["/tasks", "/develop", "/agents", "/settings"]

export async function middleware(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  const isProtected = protectedPaths.some((p) => req.nextUrl.pathname.startsWith(p))

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/", req.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ["/tasks/:path*", "/develop/:path*", "/agents/:path*", "/settings/:path*"] }
```

### Auth Pattern 3: Module-level auth-state variable

**Search**: `let _authenticated` or other module-scoped boolean auth flag

**Problem**: Storing auth state outside React triggers sync bugs.

**Improvement**:
```typescript
// ❌ Before — module-level variable
let _authenticated = false
export function setAuthenticated(v: boolean) { _authenticated = v }
export function isAuthenticated() { return _authenticated }

// ✅ After — consolidate into a Jotai atom (if sessionAtom exists, reuse it)
// Delete auth-gate.ts and derive from sessionAtom.user presence.
```

### Auth Pattern 4: Missing error handling in sign-out

**Search**: `signOut()` calls without `.catch` or try/catch

**Problem**: Network errors silently fail — the user stays signed in.

**Improvement**:
```typescript
// ❌ Before
async function handleSignOut() {
  await authClient.signOut()
  router.push("/")
}

// ✅ After
async function handleSignOut() {
  try {
    await authClient.signOut()
  } catch {
    // Fallback: clear the cookie directly
    document.cookie = "better-auth.session_token=; Max-Age=0; path=/"
  }
  router.push("/")
}
```

### Auth Pattern 5: `signInWithReopt` swallows errors

**Search**: `signInWithReopt` or `signIn.oauth2` invocations with no error handling

**Problem**: If the OAuth server is down, the user gets no feedback.

**Improvement**:
```typescript
// ❌ Before
export async function signInWithReopt(callbackURL = "/") {
  await authClient.signIn.oauth2({ providerId: REOPT_PROVIDER_ID, callbackURL })
}

// ✅ After
export async function signInWithReopt(callbackURL = "/"): Promise<{ error?: string }> {
  try {
    await authClient.signIn.oauth2({ providerId: REOPT_PROVIDER_ID, callbackURL })
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Sign-in failed" }
  }
}
```

### Auth Pattern 6: No session cache strategy

**Search**: `getServerSession` or `auth.api.getSession` calls without React `cache()`

**Problem**: Multiple server components in the same request re-fetch the session.

**Improvement**:
```typescript
// ✅ Deduplicate per-request with React cache()
import { cache } from "react"

export const getServerSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  return session ?? undefined
})
```

---

## Step 2-C: Error handling patterns

### Error Pattern 1: SDK error types not used

**Search**: `catch (error)` blocks without importing `isReoptSDKError`

**Problem**: 401 (auth expired), 429 (rate limit), and 500 (server error) get the same treatment.

**Improvement**:
```typescript
// ❌ Before
try {
  await eav.records.list(entityId)
} catch (err) {
  console.error("failed", err)
}

// ✅ After — branch per error type
import { isReoptSDKError } from "@reopt-ai/brandapp-sdk"

try {
  await eav.records.list(entityId)
} catch (err) {
  if (isReoptSDKError(err)) {
    if (err.status === 401) { /* prompt re-login */ }
    if (err.status === 429) { /* surface a retry-later message */ }
    console.error(`[${err.code}] ${err.message}`)
  }
  throw err
}
```

### Error Pattern 2: Unhandled API errors

**Search**: `await eav.records.` or `await eav.entities.` calls without try/catch

**Problem**: Network errors or server outages cause unhandled rejections.

**Improvement**: At minimum, catch in the calling function; for server actions, forward the error to the user.

### Error Pattern 3: EAV mutation on `linkedTo='brandappAuthUser'` without 1.9 narrowed catches

**Search**: `eav.records.create` / `records.upsert` / `records.bulkCreate` calls inside try/catch where the catch only branches `instanceof ConflictError` (or has no class branch at all). Especially relevant when the surrounding entity uses `linkedTo: 'brandappAuthUser'` (Schema Pattern 4).

**Problem**: 1.8.x had to disambiguate "1:1 record already exists" / "auth user not registered" / "plan limit hit" by status + code, so most consumers swallowed them all into a single `ConflictError` branch. v1.9 ships dedicated narrowing classes — a generic catch silently misses the recoverable cases.

**Improvement**:
```typescript
// ❌ Before — generic ConflictError swallows AuthUserRecordExists / DuplicateAuthUser / etc.
try {
  await sdk.eav.records.create(entityId, { authUserId, values })
} catch (err) {
  if (err instanceof ConflictError) {
    return null // user gets a useless "conflict" toast
  }
  throw err
}

// ✅ After — narrowed branches for the cases worth recovering
import {
  AuthUserRecordExistsError,
  AuthUserNotFoundError,
  LimitExceededError,
} from "@reopt-ai/brandapp-sdk/eav"

try {
  await sdk.eav.records.create(entityId, { authUserId, values })
} catch (err) {
  if (err instanceof AuthUserRecordExistsError) {
    return sdk.eav.records.upsert(entityId, { authUserId, filters, values }) // auto-upsert
  }
  if (err instanceof AuthUserNotFoundError) {
    await provisionAuthUser(authUserId)
    return sdk.eav.records.create(entityId, { authUserId, values })
  }
  if (err instanceof LimitExceededError) {
    showUpgradePrompt(err.code) // LIMIT_EXCEEDED_ENTITIES | _ATTRIBUTES | _RECORDS
    throw err
  }
  throw err
}
```

`DuplicateAuthUserError` (409, `DUPLICATE_AUTH_USER`) only fires on `bulkCreate` against a 1:1 entity — it's a caller-side bug; surface a clear error rather than recovering silently. Existing `instanceof ConflictError` branches keep working because the new classes extend it.

### Error Pattern 4: Legacy `e.code === 'REQUEST_ERROR'` string check

**Search**: literal `'REQUEST_ERROR'` strings in catch blocks (`err.code === 'REQUEST_ERROR'`, `code: 'REQUEST_ERROR'`).

**Problem**: pre-1.9 backends collapsed many EAV 422/409 responses into `code: 'REQUEST_ERROR'`, so consumers wrote string-equality checks against it. From 1.9 the backend dispatches granular codes (`LIMIT_EXCEEDED_*`, `AUTH_USER_NOT_FOUND`, `AUTH_USER_RECORD_EXISTS`, `ENTITY_NOT_FOUND`, `RECORDS_NOT_FOUND`, `DUPLICATE_RECORD_ID`, `AUTH_USER_ID_REQUIRED`, …). The legacy `'REQUEST_ERROR'` check still matches generic 400s, but every new condition silently drops into the fallback branch — recoverable cases get treated as fatal.

**Improvement**: replace the string check with class branches (Error Pattern 3) or with the granular codes:

```typescript
// ❌ Before — single bucket
if (err.code === 'REQUEST_ERROR') { /* fall through to generic toast */ }

// ✅ After — granular per-code
if (err.code === 'LIMIT_EXCEEDED_RECORDS') showUpgradePrompt('records')
else if (err.code === 'AUTH_USER_NOT_FOUND') retryAfterProvisioning()
else if (err.code === 'AUTH_USER_ID_REQUIRED') reportMissingAuthUserId()
```

---

## Step 2-D: Configuration and security patterns

### Config Pattern 1: Hardcoded URL (and stale `www.reopt.ai`)

**Search**: Reopt host string literals (`reopt.ai`, internal dev hosts, etc.) in source. **Pay special attention to `https://www.reopt.ai`** — that was the pre-1.10 production default and now points at the external marketing site; `/api/v1/brandapp/*` calls against it 404.

**Problem**: Blocks per-environment URL switching, bypasses the SDK's `isProduction` detection, and risks landing on the wrong host after the 1.10 split (`brand.reopt.ai` for the API, `id.reopt.ai` for Better Auth).

**Improvement**:
```typescript
// ❌ Before
const baseUrl = "https://www.reopt.ai"            // wrong host since 1.10
const baseUrl = "https://your-reopt-host.example"  // hardcoded

// ✅ After — let the SDK decide from NODE_ENV (prod → brand.reopt.ai;
// dev → reopt.de:3443), or override via env. Auth host is derived
// automatically (brand.* → id.*); override only when needed.
// process.env.REOPT_BASE_URL
// process.env.REOPT_ID_BASE_URL   // only for non-standard topologies
```

### Config Pattern 2: Missing `server-only`

**Search**: Files that import the SDK but not `import 'server-only'` (exception: files importing `better-auth/client`)

**Problem**: Risk of `clientSecret` leaking into the client bundle.

**Improvement**:
```typescript
// ✅ Add at the top of every server file using the SDK
import 'server-only'
```

### Config Pattern 3: `!` non-null assertions without env validation

**Search**: Patterns like `process.env.BRANDAPP_CLIENT_ID!` or the legacy `process.env.REOPT_CLIENT_ID!`.

**Problem**: Missing env surfaces only at runtime as `undefined` — hard to trace. Additionally, the consumer-credentials namespace moved from `REOPT_*` to `BRANDAPP_*` (clean break, no aliases). Any remaining `REOPT_CLIENT_*` / `REOPT_BRANDAPP_ID` / `REOPT_WEBHOOK_SECRET` / `REOPT_SDK_*` reference is an upcoming-break risk.

**Improvement**:
```typescript
// ✅ Migrate to the new namespace AND validate at startup:
//   BRANDAPP_CLIENT_ID / BRANDAPP_CLIENT_SECRET / BRANDAPP_ID
//   BRANDAPP_WEBHOOK_SECRET
//   BRANDAPP_SDK_DEBUG / BRANDAPP_SDK_LOG_FORMAT
//   REOPT_BASE_URL / REOPT_ID_BASE_URL stay as platform-host knobs.
function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}
// createLazySDK calls validateConfig() internally, so misconfig surfaces
// at SDK-creation time too — but startup validation traces back to the .env.
```

### Config Pattern 4: Service token mixed with Basic Auth (1.12+)

**Search**: `createReoptSDK` / `createLazySDK` invocations passing both `token` and `clientSecret` to the same client, plus per-call `bearerToken` overrides racing with a config-level `token`.

**Problem**: 1.12 added `ReoptSDKConfig.token` for server-to-server automation (HS256 JWT minted via `POST /token/mint` → `Authorization: Bearer`). `clientId` / `clientSecret` are still required for `validateConfig`, so the SDK accepts both, but only the token actually goes on the wire — confusion grows when one developer rotates the secret and the other rotates the token. Per-call `FetchOptions.bearerToken` further muddies which credential is in flight for `/external-auth` style flows.

**Improvement**:
```typescript
// ❌ Before — ambiguous: which credential authenticates the request?
const sdk = createLazySDK(() => ({
  clientId: process.env.BRANDAPP_CLIENT_ID!,
  clientSecret: process.env.BRANDAPP_CLIENT_SECRET!,
  brandappId: process.env.BRANDAPP_ID!,
  token: await mintServiceToken(),
}));

// ✅ After — pick one auth path per client:
// 1) Consumer-facing app → Basic Auth (clientId + clientSecret only)
// 2) Server-side automation → dedicated client with token (no per-call override)
const automation = createLazySDK(() => ({
  clientId: process.env.BRANDAPP_CLIENT_ID!,
  clientSecret: process.env.BRANDAPP_CLIENT_SECRET!, // still required by validateConfig
  brandappId: process.env.BRANDAPP_ID!,
  token: () => getCachedServiceToken(), // refresh logic owned in one place
}));
```

End-user OAuth flows (`/external-auth`) that legitimately need a per-call `bearerToken` should run on a separate Basic-Auth client to keep the credential surface obvious.

---

## Step 2-E: Schema and type patterns

### Schema Pattern 1: Type-safe entity client not used

**Search**: Schema defined with `defineSchema` + `defineEntity`, but code still uses raw `eav.records.list(entityId)` instead of `sdk.eav.entity("name")`

**Problem**: Leaves types unused → `Record<string, unknown>` + repeated manual casts.

**Improvement**:
```typescript
// ❌ Before — untyped
const record = await eav.records.get(schema.contacts.entityId, id)
const name = asString(record.values[attrs.name]) // manual coercion

// ✅ After — typed entity client
const sdk = createLazySDK(() => ({ ..., schema }))
const record = await sdk.eav.entity("contacts").records.get(id)
record.values.name // inferred
```

### Schema Pattern 2: Hand-rolled schema resolution cache

**Search**: `let schemaPromise: Promise<...> | null = null` + `getResolvedEavSchema()` pattern

**Problem**: The SDK's `entity()` method caches name→ID resolution internally; a parallel cache is unnecessary.

**Improvement**:
```typescript
// ❌ Before — manual cache
let schemaPromise: Promise<ResolvedSchema> | null = null
export function getResolvedEavSchema() {
  if (!schemaPromise) schemaPromise = resolveSchema()
  return schemaPromise
}

// ✅ After — SDK entity() caches automatically
// Delete getResolvedEavSchema
// Use sdk.eav.entity("contacts").records.list() directly,
// or call syncSchema() then use entity()
```

### Schema Pattern 3: Hardcoded attributeId

**Search**: UUID-shaped string literals passed directly to `records.create`, `records.update`, `filters`, etc.

**Problem**: attributeId can differ between environments. Use the IDs produced by a schema sync.

**Improvement**: Use the `ATTRIBUTE_IDS` constants generated by `npx reopt brandapp eav sync`, or the result of schema resolution.

---

## Step 2-F: Performance patterns

### Perf Pattern 1: Duplicate SDK clients

**Search**: `createReoptEavClient` or `createReoptSDK` called inside a function (not at module scope)

**Problem**: Every call creates a fresh HTTP client — entity-name caches reset every time.

**Improvement**:
```typescript
// ❌ Before — new client per call
async function getContacts() {
  const eav = createReoptEavClient({ ... })
  return eav.records.list(entityId)
}

// ✅ After — module-level singleton
import { createLazySDK } from "@reopt-ai/brandapp-sdk"
export const sdk = createLazySDK(() => ({ ... }))

async function getContacts() {
  return sdk.eav.records.list(entityId)
}
```

### Perf Pattern 2: Over-fetching attributes

**Search**: `records.list` or `listAll` results where only a few fields are used but everything is loaded

**Problem**: EAV joins all attribute values — cost grows with attribute count.

**Note**: The SDK currently has no field selection. For entities with 20+ attributes where only 1–2 are needed, narrowing via `findOne` + server filter is the best option.

---

## Step 2-G: React integration patterns

### React Pattern 1: Manual useEffect + useState EAV fetching

**Search**: `useEffect` + `useState` + `eav.records.list` combo

**Problem**: The SDK bundles TanStack-Query-based hooks — caching, refetching, and error handling come free.

**Improvement**:
```typescript
// ❌ Before — hand-rolled state management
const [records, setRecords] = useState([])
const [loading, setLoading] = useState(true)
useEffect(() => {
  eav.records.list(entityId).then(r => { setRecords(r.records); setLoading(false) })
}, [])

// ✅ After — SDK React hooks
import { useEavRecords } from "@reopt-ai/brandapp-sdk/react/hooks"
const { data, isLoading } = useEavRecords(sdk, entityId, { authUserId })
```

### React Pattern 2: Manual invalidation after mutation

**Search**: `records.create` or `records.update` followed by a manual `refetch()` or `router.refresh()`

**Problem**: SDK mutation hooks already invalidate related queries.

**Improvement**:
```typescript
// ❌ Before
async function handleCreate(values) {
  await eav.records.create(entityId, { values })
  router.refresh() // manual refresh
}

// ✅ After — automatic invalidation
import { useCreateRecord } from "@reopt-ai/brandapp-sdk/react/hooks"
const { mutate } = useCreateRecord(sdk, entityId)
// After mutate, records + recordCount queries are invalidated for you
```

### React Pattern 3: Manual infinite-scroll implementation

**Search**: `page` state + a `loadMore` function + repeated `records.list` calls

**Improvement**:
```typescript
// ✅ SDK infinite query hook
import { useEavRecordsInfinite } from "@reopt-ai/brandapp-sdk/react/hooks"
const { data, fetchNextPage, hasNextPage } = useEavRecordsInfinite(sdk, entityId)
```

---

## Step 2-H: Webhook and debug patterns

### Webhook Pattern 1: Hand-rolled webhook verification

**Search**: `x-reopt-signature` or webhook HMAC verification implemented by hand

**Problem**: The SDK ships `createWebhookHandler` — signature verification, JSON parsing, and error handling come built in.

**Improvement**:
```typescript
// ❌ Before — hand-rolled
export async function POST(req: Request) {
  const sig = req.headers.get("x-reopt-signature")
  const body = await req.text()
  // manual HMAC verification...
  const payload = JSON.parse(body)
  if (payload.type === "record.created") { ... }
}

// ✅ After — SDK webhook handler
import { createWebhookHandler } from "@reopt-ai/brandapp-sdk/webhooks"

export const POST = createWebhookHandler({
  secret: process.env.BRANDAPP_WEBHOOK_SECRET!,
  handlers: {
    "record.created": async (payload) => { ... },
    "record.updated": async (payload) => { ... },
  },
})
```

### Debug Pattern 1: Custom SDK request logging

**Search**: `console.log` + `fetch` wrapping or HTTP interceptors instrumenting SDK calls

**Problem**: The SDK has a built-in `debug: true` option — requests/responses/retries/errors are logged automatically.

**Improvement**:
```typescript
// ❌ Before — manual logging wrapper
const originalFetch = globalThis.fetch
globalThis.fetch = async (...args) => {
  console.log("→", args[0])
  const res = await originalFetch(...args)
  console.log("←", res.status)
  return res
}

// ✅ After — SDK debug mode
const sdk = createLazySDK(() => ({
  clientId, clientSecret, brandappId,
  debug: true, // [brandapp-sdk] → GET /entities, ← 200 (42ms)
}))
```

---

## Step 2-I: External-site / CMS patterns (1.8+)

Run these checks for projects that ship a separate marketing site,
blog, or `/terms` page reading from a Reopt brandapp. Most apply only
to consumers on 1.8.0 or later — 1.7.x consumers should also run
**CMS Pattern 1** before upgrading.

### CMS Pattern 1: Calling the removed CMS write surface

**Search**: `cms.posts.create`, `cms.posts.update`, `cms.posts.delete`,
`cms.postGroups.create|update|delete`, `useCreatePost`, `useUpdatePost`,
`useDeletePost`, type imports of `CreatePostInput` / `UpdatePostInput` /
`CreatePostGroupInput` / `UpdatePostGroupInput`.

**Problem**: All of these were **removed in 1.8.0**. Backend never
exposed them in production (1.7.x dev-server only) and there are no
external npm consumers, so the SDK dropped them. Calls fail at the
type layer (1.8+) or at runtime against production (any version).

**Improvement**:
```typescript
// ❌ Before — write through SDK
const post = await sdk.cms.posts.create({ groupId, title, body });

// ✅ After — author content in Reopt Studio.
// If write must stay in code, pin to 1.7.x temporarily and migrate to
// Studio. Do NOT re-implement against the brandapp HTTP API.
```

The post.* webhook event types (`post.published`, `post.updated`,
`post.deleted`) were dropped in the same release — production never
dispatched them. Remove any matching handlers; available events are
`record.*`, `entity.*`, `subscription.changed`, `customer.created`.

### CMS Pattern 2: Hand-rolled blog metadata

**Search**: `generateMetadata` in `app/blog/**` that reads `post.title`
/ `post.excerpt` and assembles `Metadata` manually.

**Problem**: SDK ships `toMetadata(post)` which pulls the new `Post.seo`
fields (`metaTitle`, `metaDescription`, `metaKeywords`) and falls back
to `title`/`excerpt`. Hand-rolled versions miss SEO overrides set in
Studio.

**Improvement**:
```typescript
// ❌ Before
return {
  title: post.title,
  description: post.excerpt,
  openGraph: { title: post.title, description: post.excerpt },
}

// ✅ After
import { toMetadata } from "@reopt-ai/brandapp-sdk/cms"
return toMetadata(post)
```

### CMS Pattern 3: Hand-rolled sitemap / RSS

**Search**: `app/sitemap.ts` or RSS routes that map over `posts.list()`
into `MetadataRoute.Sitemap` or RSS XML by hand.

**Improvement**:
```typescript
// ✅ Sitemap
import { toSitemapItems } from "@reopt-ai/brandapp-sdk/cms"
return toSitemapItems(posts, { baseUrl: "https://example.com" })

// ✅ RSS
import { toRssFeed } from "@reopt-ai/brandapp-sdk/cms"
return new Response(
  toRssFeed(posts, { title, link, description }),
  { headers: { "Content-Type": "application/rss+xml" } },
)
```

Both helpers are pure functions with no Next/React imports — safe in
Edge runtimes.

### Files Pattern 1: Manual image URL transforms

**Search**: String concatenation building URLs like
`${url}?w=800&q=85`, or `<Image src={...}>` wrappers that hand-build
optimization params.

**Problem**: SDK ships `optimizeUrl(url, opts)` and
`createImageLoader()`. Importing `REOPT_IMAGE_REMOTE_PATTERNS` into
`next.config.ts` `images.remotePatterns` removes the host allow-list
maintenance burden when new Vercel Blob hosts are introduced.

**Improvement**:
```typescript
// ❌ Before
const src = `${post.coverUrl}?w=800&q=85`;

// ✅ After — inline transform
import { optimizeUrl } from "@reopt-ai/brandapp-sdk/files";
const src = optimizeUrl(post.coverUrl, { width: 800, quality: 85 });

// ✅ After — Next/Image loader
import { createImageLoader } from "@reopt-ai/brandapp-sdk/files";
<Image loader={createImageLoader()} src={post.coverUrl} width={800} height={450} />
```

`next.config.ts`:
```typescript
import { REOPT_IMAGE_REMOTE_PATTERNS } from "@reopt-ai/brandapp-sdk/files";
export default { images: { remotePatterns: [...REOPT_IMAGE_REMOTE_PATTERNS] } };
```

### Auth Pattern 7: Re-implementing cross-subdomain session verification

**Search**: Marketing/blog sites under `*.reopt.ai` that run their own
Better Auth instance, or that fetch `/api/auth/get-session` with
hand-rolled cookie forwarding.

**Problem**: 1.8 ships `verifySession(headers, opts)` and
`getSessionFromCookies(cookieHeader, opts)` that delegate verification
to `apps/id` Better Auth `/api/auth/get-session`. The consumer site
does not need its own auth instance, OAuth flow, or cookie parser.

**Improvement**:
```typescript
// ❌ Before — full Better Auth on the marketing site
const auth = betterAuth({ ...full config including database... });
const session = await auth.api.getSession({ headers });

// ✅ After — delegate to apps/id
import { verifySession } from "@reopt-ai/brandapp-sdk/auth";
const session = await verifySession(headers, {
  brandappId: process.env.BRANDAPP_ID!,
});
```

`getSessionFromCookies(cookieHeader, opts)` is the lower-level form for
non-Next runtimes (Hono, Cloudflare Workers, etc.). Both work in Edge
and Node.

### Schema Pattern 4: `defineEntity` without `linkedTo` for 1:1 user metadata

**Search**: `defineEntity({ name: "user_*" ... })` plus client-side
filters on `authUserId` to load a single per-user record (preferences,
profile metadata).

**Problem**: 1.7+ supports `linkedTo: 'brandappAuthUser'` for true 1:1
metadata entities. Server enforces 1:1 (`409` / `422`); `record.id`
equals `authUserId`, so lookups skip the list-then-find detour.

**Improvement**:
```typescript
// ❌ Before — free-form table + client filter
defineEntity({ name: "user_preferences", attributes: { theme: ... } });
const list = await eav.records.list(prefs.entityId, { filters: [...] });
const mine = list.records.find(r => r.authUserId === userId);

// ✅ After — 1:1 metadata host
defineEntity({
  name: "user_preferences",
  linkedTo: "brandappAuthUser",
  attributes: { theme: ... },
});
const mine = await sdk.eav.entity("user_preferences").records.get(userId);
```

When you adopt `linkedTo: 'brandappAuthUser'`, also wire the
`AuthUserRecordExistsError` / `AuthUserNotFoundError` /
`LimitExceededError` branches in the catch block — see Error
Pattern 3.

### Schema Pattern 5: EAV schema drift unchecked (1.11+)

**Search**: Projects that ship `lib/eav.schema.ts` to production but
have **no** reference to `verifyEavSchema`, `computeEavSchemaHash`, or
`NEXT_PUBLIC_BRANDAPP_EAV_HASH`. Typical tell-tale: a `/api/health`
route that only pings the SDK without comparing schema hashes.

**Problem**: When a deploy rolls back to an older bundle, or when a
schema sync runs against the server but the consumer bundle is stale,
mutations fail with confusing `ATTRIBUTE_NOT_FOUND` /
`ENTITY_NOT_FOUND` errors instead of a clear drift alert. 1.11 added
`computeEavSchemaHash` (canonical-JSON SHA-256, identical algorithm
on the server) for build-time embedding, and `verifyEavSchema({ client,
localHash })` to compare against `GET
/v1/brandapp/{id}/eav/schema-hash` at runtime.

**Improvement**:
```typescript
// 1) Build step — embed the hash into NEXT_PUBLIC_*
//    scripts/build-eav-hash.ts
import { computeEavSchemaHash } from "@reopt-ai/brandapp-sdk/eav";
import schema from "../lib/eav.schema";
process.stdout.write(
  `NEXT_PUBLIC_BRANDAPP_EAV_HASH=${computeEavSchemaHash(schema)}\n`
);

// package.json
// "build": "tsx scripts/build-eav-hash.ts >> .env.production.local && next build"

// 2) Runtime probe — fail readiness when the bundle drifts
//    app/api/health/route.ts
import { verifyEavSchema } from "@reopt-ai/brandapp-sdk/eav";
const r = await verifyEavSchema({
  client: sdk.eav,
  localHash: process.env.NEXT_PUBLIC_BRANDAPP_EAV_HASH!,
});
return Response.json(r, { status: r.match ? 200 : 503 });
```

Page on `r.match === false` from prod — that signal precedes a wave of
`ATTRIBUTE_NOT_FOUND` errors and lets oncall roll the deploy
deterministically.

---

## Step 3: Emit the report

Report detections in the following shape:

```markdown
## SDK Review: {project name}

### Version
- Current: v{version}
- Recommended: v1.12.0

### Detected patterns ({N})

#### 1. Manual singleton — `lib/eav/client.ts:15`
**Current**: hand-rolled Proxy
**Fix**: use `createLazySDK`
**Savings**: 15 lines of code → 5

#### 2. Load-all + filter — `lib/eav/settings-store.ts:32`
**Current**: `listSettingsForUser()` → `.find()`
**Fix**: `records.findOne()` + filters
**Savings**: N-record load → 1 (API calls O(N pages) → O(1))

...

### Summary
| Category | Count | Expected impact |
|----------|-------|-----------------|
| EAV: unnecessary full loads | {n} | fewer API calls |
| EAV: manual upsert / duplicate utils | {n} | code removal + race conditions gone |
| Auth: error handling / route protection | {n} | crash avoidance + UX improvements |
| Error: SDK error types unused / 1.9 narrowing missed | {n} | per-status responses + ergonomic 1:1-entity / plan-limit recovery |
| Config: security / env / host / token | {n} | secret leak prevention, correct host (`brand.*` / `id.*`), single auth path |
| Schema: types unused / drift unchecked | {n} | type safety + deterministic drift detection (`NEXT_PUBLIC_BRANDAPP_EAV_HASH`) |
| Perf: duplicate client creation | {n} | instance/cache reuse |
| React: manual data fetching | {n} | automatic caching/refetch via SDK hooks |
| Webhook/Debug: custom implementations | {n} | replace with built-ins |
| CMS / external-site (1.8+) | {n} | removed write surface, marketing-site helpers, cross-subdomain session, 1:1 user metadata |
```

---

## Step 4: Offer automatic fixes

Ask the user whether to auto-apply fixes:

> Found {N} improvements. Apply automatically?
> 1. Apply everything
> 2. Step through and confirm each
> 3. Report only

If "apply everything" or "step through" is chosen, edit each file via the
Edit tool and then validate with `npx tsc --noEmit`.

---

## Notes

- This skill runs in the **consumer project** (not the reopt monorepo).
- Do not modify the SDK itself.
- Every edit must stay backward compatible — existing behavior must not change.
- Never drop security-relevant filters like `authUserId`.
- Always type-check (`tsc --noEmit`) after edits.
