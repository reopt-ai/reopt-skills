# Breaking Changes Registry — @reopt-ai/opt-harness

## Format

Each entry follows:

```
### {version} — {title}

- **Code**: `{identifier}`
- **Type**: Breaking | Deprecated
- **What changed**: ...
- **Migration**: ...
- **Grep pattern**: `{regex to find affected code}`
```

---

## 0.1.0 (Initial Release)

No breaking changes — initial version.

### 0.1.0 — sidebar prop removed from HarnessAppShell

- **Code**: `appshell-sidebar-removed`
- **Type**: Breaking
- **What changed**: `HarnessAppShell` no longer accepts a `sidebar` prop. Use `nav` with `HarnessCollapsibleNav` instead.
- **Migration**:

  ```tsx
  // Before
  <HarnessAppShell sidebar={<MySidebar />}>

  // After
  <HarnessAppShell nav={<HarnessCollapsibleNav width={260}><MySidebar /></HarnessCollapsibleNav>}>
  ```

- **Grep pattern**: `sidebar.*HarnessAppShell\|HarnessAppShell.*sidebar`

### 0.1.0 — HarnessThemeConfig is now a discriminated union

- **Code**: `theme-config-du`
- **Type**: Breaking
- **What changed**: `HarnessThemeConfig` is now `HarnessPresetThemeConfig | HarnessGeneratedThemeConfig`. Direct access to `.palette` requires narrowing `mode === "generated"` first.
- **Migration**:

  ```ts
  // Before
  const seed = config.palette?.seed;

  // After
  const seed = config.mode === "generated" ? config.palette.seed : undefined;
  ```

- **Grep pattern**: `HarnessThemeConfig.*palette\|\.palette\?\.seed`

### 0.1.0 — ResolvedHarnessThemeConfig is now a discriminated union

- **Code**: `resolved-theme-du`
- **Type**: Breaking
- **What changed**: `ResolvedHarnessThemeConfig` is now `ResolvedHarnessPresetTheme | ResolvedHarnessGeneratedTheme`. Access to `generatedLightTokens` or `palette` requires `mode === "generated"` check.
- **Migration**:

  ```ts
  // Before
  if (theme.generatedLightTokens) { ... }

  // After
  if (theme.mode === "generated") { /* theme.generatedLightTokens is available */ }
  ```

- **Grep pattern**: `\.generatedLightTokens\|\.generatedDarkTokens`
