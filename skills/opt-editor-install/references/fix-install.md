# Fix: Installation & Registry (Checks 1-5)

## Check 1: opt-editor package install {#check-1}

```bash
# bun
bun add @reopt-ai/opt-editor

# npm
npm install @reopt-ai/opt-editor

# yarn
yarn add @reopt-ai/opt-editor
```

If install fails:

1. Verify `.npmrc` configuration (Check 4).
2. Verify `GITHUB_TOKEN` (Check 5).
3. Retry after `npm cache clean --force`.

---

## Check 2: opt-editor version check {#check-2}

```bash
# Installed version
node -e "console.log(require('@reopt-ai/opt-editor/package.json').version)"

# Update to the latest
bun add @reopt-ai/opt-editor@latest
```

If the version cannot be read:

- Verify that `node_modules/@reopt-ai/opt-editor/` exists.
- Re-run `bun install` or `npm install`.

---

## Check 3: React 19+ peer dependency {#check-3}

```bash
# Check the React version
node -e "console.log(require('react/package.json').version)"

# Upgrade to React 19
bun add react@latest react-dom@latest

# And the types
bun add -D @types/react@latest @types/react-dom@latest
```

> `@reopt-ai/opt-editor` requires React 19+ as a peer dependency.
> React ≤18 does not support `use()` or Server Components.

---

## Check 4: .npmrc @reopt-ai registry {#check-4}

Create or edit `.npmrc` at the project root:

```ini
@reopt-ai:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Notes:

- `${GITHUB_TOKEN}` references the environment variable (do not hardcode).
- Do not add `.npmrc` to `.gitignore` — the token is an env var, so the file itself is safe.
- In monorepos, keep the setting in the root `.npmrc`.

---

## Check 5: GITHUB_TOKEN env var {#check-5}

Create a GitHub Personal Access Token (classic):

1. GitHub → Settings → Developer settings → Personal access tokens
2. Enable the `read:packages` scope.
3. Generate the token.

Set the env var:

```bash
# ~/.zshrc or ~/.bashrc
export GITHUB_TOKEN="<your-github-token>"
```

```bash
# Apply
source ~/.zshrc
```

CI/CD:

- GitHub Actions: `secrets.GITHUB_TOKEN` is provided automatically.
- Other CI: inject via a secret variable.

> Packages that are already installed keep working locally without
> `GITHUB_TOKEN`. It is only required for new installs and updates.
