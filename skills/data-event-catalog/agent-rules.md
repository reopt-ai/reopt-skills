## reopt Data event catalogue

- Use `data-event-catalog` for catalogue changes; the installed `@reopt-ai/data-cli/README.md` and `reopt-data event --help` define supported commands and file versions.
- Treat `reopt-data.events.json` and its lock as a pair. Confirm file, project, API origin, and environment before remote reads or writes; keep credentials out of both files.
- Review the diff before applying. Event removal archives it; omitted fields reset to defaults. Property omission semantics differ in v2; read the installed contract before editing.
- Reconcile console conflicts without automatic force. Keep local edits when pull refuses them, and inspect partial writes before retrying.
- Verify drift after sync and regenerate types after declaration changes. Generated types do not replace a runtime payload schema.
- Remote writes need the organization key (CI/server only). Issuing a new one revokes every existing key, so never rotate to get one; without it, hand the file to the user for the console import (`/dashboard/<orgId>/<projectId>/events?panel=import`) and report CLI sync as not run.
