# reopt-cli

Baseline reference for the reopt CLI — authentication, global flags, security rules, and exit codes.

## Use When

- any `reopt` CLI flow needs a baseline auth check
- a workflow will call `reopt login`, `reopt status`, or `reopt brandapp link`
- CI/CD steps need credential handling guidance
