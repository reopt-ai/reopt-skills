# brandapp-sdk-review

Audit consumer-project code for `@reopt-ai/brandapp-sdk` anti-patterns and propose concrete fixes (EAV, Auth, Error, Config, Schema, Perf, React, Webhook).

## Use When

- a project already depends on `@reopt-ai/brandapp-sdk` and you want a usage audit
- you need to convert hand-rolled singletons, manual upserts, or `.find()` loops to SDK primitives
- pre-release review to catch missing error handling or SDK error-type branching
