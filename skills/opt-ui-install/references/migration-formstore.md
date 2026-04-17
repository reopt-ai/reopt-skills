# FormStore Migration Guide (1.1.x -> 1.2.0)

## Overview

opt-ui 1.2.0 replaces the Ariakit-based form system with a self-contained `FormStore`.
The new store is built on `useSyncExternalStore` with zero external dependencies,
providing generic type inference, dirty tracking, async submit lifecycle,
and pluggable schema validation.

**Why the change:**

- Ariakit's `useFormStore` returned an opaque store requiring `as never` casts for typed access.
- `useValidate` / `useSubmit` were separate hooks that fragmented form logic across the component.
- No built-in dirty tracking, async submit state, or schema adapter.
- The new API consolidates everything into a single `useFormStore<V>(options)` call.

---

## Breaking Changes

### 1. useValidate / useSubmit -> useFormStore options

The two standalone hooks are removed. Pass `validate` and `onSubmit` directly to `useFormStore`.

**BEFORE (1.1.x):**

```tsx
import { useFormStore, useValidate, useSubmit } from "@reopt-ai/opt-ui";

function SettingsForm() {
  const form = useFormStore({
    defaultValues: { name: "", email: "" },
  });

  // Separate hooks -- spread across component body
  form.useValidate(() => {
    if (!form.getValue("name")) {
      form.setError("name", "Name is required");
    }
  });

  form.useSubmit(() => {
    console.log("Submitted:", form.getValues());
  });

  return <FormRoot store={form}>...</FormRoot>;
}
```

**AFTER (1.2.0):**

```tsx
import { useFormStore, type FormErrors } from "@reopt-ai/opt-ui";

function SettingsForm() {
  const form = useFormStore({
    defaultValues: { name: "", email: "" },
    validate: (values) => {
      const errors: FormErrors = {};
      if (!values.name) errors.name = "Name is required";
      return errors;
    },
    onSubmit: (values) => {
      console.log("Submitted:", values);
    },
  });

  return <FormRoot store={form}>...</FormRoot>;
}
```

**Key differences:**

| Aspect        | 1.1.x                                        | 1.2.0                                    |
| ------------- | -------------------------------------------- | ---------------------------------------- |
| Validation    | `form.useValidate(callback)` hook            | `validate` option in `useFormStore`      |
| Submit        | `form.useSubmit(callback)` hook              | `onSubmit` option in `useFormStore`      |
| Error setting | Imperative `form.setError()` inside validate | Return `FormErrors` object from validate |
| Location      | Scattered across component body              | Colocated in store config                |

---

### 2. Generic FormStore type

The old Ariakit store had no generics. Accessing typed values required `as never` casts everywhere.

**BEFORE (1.1.x):**

```tsx
const form = useFormStore({
  defaultValues: { name: "", count: 0 },
});

// Type is unknown -- need cast
const name = form.getValue(form.names.name) as string;
form.setValue(form.names.count, 5 as never);
```

**AFTER (1.2.0):**

```tsx
interface MyFormValues {
  name: string;
  count: number;
}

const form = useFormStore<MyFormValues>({
  defaultValues: { name: "", count: 0 },
});

// Full type inference -- no casts
const name = form.getValue("name"); // type: string
form.setValue("count", 5); // type-checked
form.setValue("count", "wrong"); // TS error!
```

The generic parameter `V` flows through:

- `defaultValues: V`
- `validate: (values: V) => FormErrors`
- `onSubmit: (values: V) => void | Promise<void>`
- `getValue<K extends keyof V>(name: K): V[K]`
- `setValue<K extends keyof V>(name: K, value: V[K]): void`

---

### 3. validate function signature

The validate function no longer mutates the store imperatively. Instead, it returns an errors object.

**BEFORE (1.1.x):**

```tsx
form.useValidate(() => {
  // Imperative error setting
  if (!form.getValue(form.names.email)) {
    form.setError(form.names.email, "Required");
  }
  if (!form.getValue(form.names.age)) {
    form.setError(form.names.age, "Required");
  }
});
```

**AFTER (1.2.0):**

```tsx
const form = useFormStore({
  defaultValues: { email: "", age: 0 },
  validate: (values) => {
    // Declarative: return errors object
    const errors: FormErrors = {};
    if (!values.email) errors.email = "Required";
    if (!values.age) errors.age = "Required";
    return errors;
  },
});
```

**Rules:**

- Return `FormErrors` (a `Partial<Record<string, string>>`) from `validate`.
- Return `{}` or `undefined`/`void` for no errors.
- Keys support dot-paths for nested fields: `"items.0.name"`.
- The store merges returned errors and marks all value paths as touched on submit.

---

### 4. async onSubmit

The new `onSubmit` supports async functions natively. The store tracks the lifecycle automatically.

**BEFORE (1.1.x):**

```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

form.useSubmit(async () => {
  setLoading(true);
  setError(null);
  try {
    await api.save(form.getValues());
  } catch (e) {
    setError(e as Error);
  } finally {
    setLoading(false);
  }
});
```

**AFTER (1.2.0):**

```tsx
const form = useFormStore({
  defaultValues: { name: "" },
  onSubmit: async (values) => {
    await api.save(values); // throw on failure
  },
});

// Built-in state -- no manual useState needed
form.isSubmitting(); // true while Promise is pending
form.getSubmitError(); // Error object if rejected, undefined otherwise
```

The store:

- Sets `isSubmitting() === true` when the returned Promise is pending.
- Sets `isSubmitting() === false` and `getSubmitError()` on rejection.
- Clears `submitError` on the next submit or reset.
- Prevents double-submit while `isSubmitting()` is true.

---

## New APIs (Additive)

These APIs are new in 1.2.0. No migration needed -- adopt when ready.

### isDirty / isFieldDirty

```tsx
form.isDirty(); // true if any field differs from defaultValues
form.isFieldDirty("email"); // true if "email" differs from its default
```

Uses deep equality comparison. Works with nested objects and arrays.

### resetField

```tsx
form.resetField("email"); // Reset single field to default, clear its error and touched state
```

Unlike `reset()` which resets the entire form, `resetField` targets one field.

### isSubmitting / getSubmitError / getErrors

```tsx
form.isSubmitting(); // boolean -- true during async onSubmit
form.getSubmitError(); // unknown -- the rejected error, or undefined
form.getErrors(); // FormErrors -- snapshot of all current field errors
```

### validateOn option

Controls when the `validate` callback runs:

```tsx
const form = useFormStore({
  defaultValues: { name: "" },
  validateOn: "blur",    // "change" (default) | "blur" | "submit"
  validate: (values) => { ... },
});
```

| Value      | Behavior                                                        |
| ---------- | --------------------------------------------------------------- |
| `"change"` | Validate on every `setValue` call (default, immediate feedback) |
| `"blur"`   | Validate when `setFieldTouched(name, true)` is called           |
| `"submit"` | Validate only on `submit()` call (least intrusive)              |

### schemaValidator adapter

Zero-dependency adapter for Zod, Valibot, or any library with a `safeParse` method:

```tsx
import { useFormStore, schemaValidator } from "@reopt-ai/opt-ui";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  age: z.number().min(1, "Age is required"),
});

const form = useFormStore({
  defaultValues: { email: "", age: 0 },
  validate: schemaValidator(schema),
});
```

The `SchemaLike` interface requires only:

```ts
interface SchemaLike {
  safeParse(data: unknown):
    | { success: true }
    | {
        success: false;
        error: { issues: { path: (string | number)[]; message: string }[] };
      };
}
```

### useFieldValue hook

Subscribe to a single field value. Re-renders only when that specific field changes:

```tsx
import { useFieldValue } from "@reopt-ai/opt-ui";

function EmailPreview({ form }: { form: FormStoreInstance }) {
  // Only re-renders when "email" changes, not when other fields change
  const email = useFieldValue<string>(form, "email");
  return <p>Preview: {email}</p>;
}
```

### FormProvider + useFormContext

Share a form store via React context without prop drilling:

```tsx
import { FormProvider, useFormContext, useFormStore } from "@reopt-ai/opt-ui";

function MyForm() {
  const form = useFormStore({ defaultValues: { name: "" } });
  return (
    <FormProvider store={form}>
      <NameField />
      <SubmitButton />
    </FormProvider>
  );
}

function NameField() {
  const form = useFormContext(); // access store from context
  const name = useFieldValue<string>(form!, "name");
  return (
    <input
      value={name}
      onChange={(e) => form!.setValue("name", e.target.value)}
    />
  );
}
```

`FormRoot` also accepts a `store` prop and wraps children with `FormProvider` automatically:

```tsx
<FormRoot store={form}>{/* useFormContext() works inside */}</FormRoot>
```

---

## Migration Checklist

### Step 1: Identify affected files

Run the scan commands in the "Scan Commands" section below to find all files using the old API.

### Step 2: Replace useValidate

For each `form.useValidate(callback)`:

1. Extract the validation logic from the callback body.
2. Convert imperative `form.setError()` calls to a returned `FormErrors` object.
3. Move the logic to the `validate` option in `useFormStore()`.
4. Remove the `form.useValidate(...)` call.

### Step 3: Replace useSubmit

For each `form.useSubmit(callback)`:

1. Move the callback to the `onSubmit` option in `useFormStore()`.
2. Replace `form.getValues()` with the `values` parameter.
3. If the callback is async, remove manual `loading`/`error` state -- use `form.isSubmitting()` and `form.getSubmitError()`.
4. Remove the `form.useSubmit(...)` call.

### Step 4: Remove `as never` casts

1. Add a type parameter to `useFormStore<MyValues>(...)`.
2. Replace `form.getValue(form.names.fieldName)` with `form.getValue("fieldName")`.
3. Remove `as never` from `form.setValue(...)` calls.
4. Remove `form.names.*` references (no longer needed).

### Step 5: Update imports

```diff
- import { useFormStore, useValidate, useSubmit } from "@reopt-ai/opt-ui";
+ import { useFormStore, type FormErrors } from "@reopt-ai/opt-ui";
```

### Step 6: Verify

```bash
# Type check
npx tsc --noEmit

# Run tests
bun vitest run
```

---

## Common Patterns

### Basic form

**BEFORE (1.1.x):**

```tsx
"use client";
import {
  useFormStore,
  FormRoot,
  FormField,
  FormLabel,
  FormControl,
  FormError,
  FormSubmit,
} from "@reopt-ai/opt-ui";

function ProfileForm() {
  const form = useFormStore({
    defaultValues: { name: "", bio: "" },
  });

  form.useValidate(() => {
    if (!form.getValue(form.names.name)) {
      form.setError(form.names.name, "Name is required");
    }
  });

  form.useSubmit(async () => {
    const values = form.getValues();
    await saveProfile(values as never);
  });

  return (
    <FormRoot store={form}>
      <FormField name="name">
        <FormLabel>Name</FormLabel>
        <FormControl name="name" />
        <FormError name="name" />
      </FormField>
      <FormField name="bio">
        <FormLabel>Bio</FormLabel>
        <FormControl name="bio" />
      </FormField>
      <FormSubmit>Save</FormSubmit>
    </FormRoot>
  );
}
```

**AFTER (1.2.0):**

```tsx
"use client";
import {
  useFormStore,
  FormRoot,
  FormField,
  FormLabel,
  FormControl,
  FormError,
  FormSubmit,
  type FormErrors,
} from "@reopt-ai/opt-ui";

interface ProfileValues {
  name: string;
  bio: string;
}

function ProfileForm() {
  const form = useFormStore<ProfileValues>({
    defaultValues: { name: "", bio: "" },
    validate: (values) => {
      const errors: FormErrors = {};
      if (!values.name) errors.name = "Name is required";
      return errors;
    },
    onSubmit: async (values) => {
      await saveProfile(values); // values is typed as ProfileValues
    },
  });

  return (
    <FormRoot store={form}>
      <FormField name="name">
        <FormLabel>Name</FormLabel>
        <FormControl name="name" />
        <FormError name="name" />
      </FormField>
      <FormField name="bio">
        <FormLabel>Bio</FormLabel>
        <FormControl name="bio" />
      </FormField>
      <FormSubmit>Save</FormSubmit>
    </FormRoot>
  );
}
```

---

### Zod schema validation

**BEFORE (1.1.x):**

```tsx
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
});

function SignupForm() {
  const form = useFormStore({
    defaultValues: { email: "", age: 0 },
  });

  form.useValidate(() => {
    const result = schema.safeParse(form.getValues());
    if (!result.success) {
      for (const issue of result.error.issues) {
        form.setError(issue.path.join(".") as never, issue.message);
      }
    }
  });

  form.useSubmit(() => {
    console.log(form.getValues());
  });

  return <FormRoot store={form}>...</FormRoot>;
}
```

**AFTER (1.2.0):**

```tsx
import { z } from "zod";
import { useFormStore, schemaValidator } from "@reopt-ai/opt-ui";

const schema = z.object({
  email: z.string().email("Valid email required"),
  age: z.number().min(18, "Must be 18+"),
});

type SignupValues = z.infer<typeof schema>;

function SignupForm() {
  const form = useFormStore<SignupValues>({
    defaultValues: { email: "", age: 0 },
    validate: schemaValidator(schema), // one line!
    onSubmit: (values) => {
      console.log(values); // typed as SignupValues
    },
  });

  return <FormRoot store={form}>...</FormRoot>;
}
```

---

### Async submit with error handling

**BEFORE (1.1.x):**

```tsx
function PaymentForm() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useFormStore({ defaultValues: { amount: 0 } });

  form.useSubmit(async () => {
    setLoading(true);
    setServerError(null);
    try {
      await api.charge(form.getValues() as never);
    } catch (e) {
      setServerError((e as Error).message);
    } finally {
      setLoading(false);
    }
  });

  return (
    <FormRoot store={form}>
      <FormControl name="amount" type="number" />
      <FormSubmit disabled={loading}>
        {loading ? "Processing..." : "Pay"}
      </FormSubmit>
      {serverError && <p className="text-danger-fg">{serverError}</p>}
    </FormRoot>
  );
}
```

**AFTER (1.2.0):**

```tsx
interface PaymentValues {
  amount: number;
}

function PaymentForm() {
  const form = useFormStore<PaymentValues>({
    defaultValues: { amount: 0 },
    onSubmit: async (values) => {
      await api.charge(values); // throw on failure
    },
  });

  const submitError = form.getSubmitError();

  return (
    <FormRoot store={form}>
      <FormControl name="amount" type="number" />
      <FormSubmit>{form.isSubmitting() ? "Processing..." : "Pay"}</FormSubmit>
      {submitError && (
        <p className="text-danger-fg">{(submitError as Error).message}</p>
      )}
    </FormRoot>
  );
}
```

No manual `useState` for loading or error. The store handles the full async lifecycle.

---

### Multi-field subscription with useFieldValue

```tsx
import {
  useFormStore,
  useFieldValue,
  FormProvider,
  type FormStoreInstance,
} from "@reopt-ai/opt-ui";

interface OrderValues {
  quantity: number;
  unitPrice: number;
}

// Only re-renders when quantity or unitPrice changes
function OrderTotal({ form }: { form: FormStoreInstance<OrderValues> }) {
  const qty = useFieldValue<number>(form, "quantity");
  const price = useFieldValue<number>(form, "unitPrice");
  return <p>Total: ${qty * price}</p>;
}

function OrderForm() {
  const form = useFormStore<OrderValues>({
    defaultValues: { quantity: 1, unitPrice: 10 },
    onSubmit: async (values) => {
      await api.placeOrder(values);
    },
  });

  return (
    <FormProvider store={form}>
      <FormRoot store={form}>
        <FormField name="quantity">
          <FormLabel>Quantity</FormLabel>
          <FormNumberInput name="quantity" min={1} max={100} />
        </FormField>
        <FormField name="unitPrice">
          <FormLabel>Unit Price</FormLabel>
          <FormNumberInput name="unitPrice" min={0} step={0.01} />
        </FormField>
        <OrderTotal form={form} />
        <FormSubmit>Place Order</FormSubmit>
      </FormRoot>
    </FormProvider>
  );
}
```

---

### Dirty tracking and conditional save

```tsx
function EditableProfile() {
  const form = useFormStore<ProfileValues>({
    defaultValues: { name: "Jane", email: "jane@example.com" },
    onSubmit: async (values) => {
      await api.updateProfile(values);
    },
  });

  return (
    <FormRoot store={form}>
      <FormField name="name">
        <FormLabel>Name</FormLabel>
        <FormControl name="name" />
        {form.isFieldDirty("name") && (
          <button type="button" onClick={() => form.resetField("name")}>
            Undo
          </button>
        )}
      </FormField>
      <FormField name="email">
        <FormLabel>Email</FormLabel>
        <FormControl name="email" />
      </FormField>
      <div className="gap-element flex">
        <FormSubmit disabled={!form.isDirty()}>Save Changes</FormSubmit>
        <FormReset>Discard All</FormReset>
      </div>
    </FormRoot>
  );
}
```

---

### Blur-only validation

```tsx
const form = useFormStore({
  defaultValues: { email: "" },
  validateOn: "blur",
  validate: (values) => {
    const errors: FormErrors = {};
    if (values.email && !values.email.includes("@")) {
      errors.email = "Invalid email format";
    }
    return errors;
  },
});
```

Validation runs only after the user leaves a field, not on every keystroke.

---

## Scan Commands

Use these commands in your project root to find code that needs migration.

### Find all files using old `useValidate` / `useSubmit` hooks

```bash
# Files calling useValidate or useSubmit on a form store
grep -rn "\.useValidate\|\.useSubmit" --include="*.tsx" --include="*.ts" .

# Also check imports (if they were exported separately)
grep -rn "useValidate\|useSubmit" --include="*.tsx" --include="*.ts" . \
  | grep -v node_modules | grep -v ".test."
```

### Find `as never` casts (likely FormStore related)

```bash
grep -rn "as never" --include="*.tsx" --include="*.ts" . \
  | grep -v node_modules
```

### Find old `form.names.*` pattern

```bash
grep -rn "form\.names\." --include="*.tsx" --include="*.ts" . \
  | grep -v node_modules
```

### Find all @reopt-ai/opt-ui form imports

```bash
grep -rn "useFormStore\|FormRoot\|FormField\|FormSubmit\|FormControl" \
  --include="*.tsx" --include="*.ts" . \
  | grep -v node_modules
```

### Find imperative setError inside validate callbacks

```bash
grep -rn "\.setError(" --include="*.tsx" --include="*.ts" . \
  | grep -v node_modules
```

### Count total affected files

```bash
grep -rl "useValidate\|useSubmit\|as never\|form\.names\." \
  --include="*.tsx" --include="*.ts" . \
  | grep -v node_modules | sort -u | wc -l
```
