---
name: brandapp-sdk-review
description: Review consumer project code for @reopt-ai/brandapp-sdk usage anti-patterns and suggest improvements. Triggers on "brandapp-sdk review", "SDK review", "improve SDK usage", "EAV optimization", "brandapp-sdk audit".
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

If below v1.3.0, recommend an upgrade first:
```
⚠️ SDK v{current} → upgrade to v1.3.0 or later
npm install @reopt-ai/brandapp-sdk@^1.3.0
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

---

## Step 2-D: Configuration and security patterns

### Config Pattern 1: Hardcoded URL

**Search**: Reopt host string literals (`reopt.ai`, internal dev hosts, etc.) in source

**Problem**: Blocks per-environment URL switching and bypasses the SDK's `isProduction` detection.

**Improvement**:
```typescript
// ❌ Before
const baseUrl = "https://your-reopt-host.example"

// ✅ After — let the SDK decide from NODE_ENV, or override via env
// Remove the baseUrl parameter or use process.env.REOPT_BASE_URL
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

**Search**: Patterns like `process.env.REOPT_CLIENT_ID!`

**Problem**: Missing env surfaces only at runtime as `undefined` — hard to trace.

**Improvement**:
```typescript
// ✅ createLazySDK calls validateConfig() internally, so misconfig surfaces
// at SDK-creation time. For even earlier detection, validate at app start:
function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}
```

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
  secret: process.env.REOPT_WEBHOOK_SECRET!,
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

## Step 3: Emit the report

Report detections in the following shape:

```markdown
## SDK Review: {project name}

### Version
- Current: v{version}
- Recommended: v1.3.0+

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
| Error: SDK error types unused | {n} | per-status responses |
| Config: security / env | {n} | secret leak prevention |
| Schema: types unused | {n} | type safety + less boilerplate |
| Perf: duplicate client creation | {n} | instance/cache reuse |
| React: manual data fetching | {n} | automatic caching/refetch via SDK hooks |
| Webhook/Debug: custom implementations | {n} | replace with built-ins |
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
