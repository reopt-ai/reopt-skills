---
name: reopt-brandapp
description: Brandapp linking, listing, doctor checks, and terms management for the reopt CLI. Use when a task involves `reopt brandapp list`, `link`, `unlink`, `doctor`, or `term list`.
requires:
  - reopt-cli
---

# reopt Brandapp

Operational guidance for `reopt brandapp` workflows outside EAV schema management.

## When to Apply

Use this skill when:

- listing accessible brandapps
- linking or unlinking a project directory
- repairing stale links with `doctor`
- inspecting published terms for a linked brandapp

Load `reopt-cli` first.

## Command Coverage

| Command | Description | Requires Login | Requires Link |
| --- | --- | --- | --- |
| `brandapp list` | List accessible brandapps | yes | no |
| `brandapp link` | Link current directory to a brandapp | yes | no |
| `brandapp unlink` | Remove the current directory link | no | yes |
| `brandapp doctor` | Repair stale links and missing credentials | yes | yes |
| `brandapp term list` | List brandapp terms | yes | yes |

## Common Flows

### List brandapps

```bash
reopt brandapp list
reopt brandapp list --json
```

### Link a directory

```bash
reopt brandapp link
```

Expected modes:

- fresh link: creates `.reopt.json` and credentials
- team onboarding: fills in missing credentials only
- re-link: switches an already linked directory

### Unlink

```bash
reopt brandapp unlink
```

### Doctor

```bash
reopt brandapp doctor
```

Doctor should remove stale server entries and repair missing local OAuth credentials.

### List terms

```bash
reopt brandapp term list
reopt brandapp term list --json
```

Supported term types: `termsOfService`, `privacyPolicy`, `marketingConsent`, `custom`.

## Operating Notes

- In a monorepo, `.reopt.json` is resolved by walking upward from the current directory.
- Run `reopt brandapp doctor` before CI jobs that depend on linked brandapps.
- `brandapp link` has no `--dry-run`; use `brandapp list --json` first if you need a preview.
- OAuth credentials are scoped per brandapp and project directory.

