# data-event-catalog

Own a consumer project's reopt Data event catalogue beside its code:
`reopt-data.events.json` and its lock, the three-way diff against the server,
authorized pushes, console-conflict recovery, CI drift gates, and the generated
`ReoptEventName` / `ReoptEventProperties` types.

## Use when

- declaring or curating event metadata (display name, status, conversion,
  rollup dimensions) and, on data-cli `0.2.0`+, property type / description /
  visibility (`version: 2` files)
- pulling an existing server catalogue into the repository, or reconciling a
  file after someone edited the console
- adding `event verify` as a CI drift gate, or regenerating event types after
  a catalogue change

## Not this skill

- transport setup (`data-sdk-install`), measurement planning and call sites
  (`data-sdk-integration`), or a read-only audit (`data-sdk-review`)
- segment definitions — they are authored in the console; no CLI creates them

## What it pins

The `<!-- BEGIN:reopt/data-event-catalog-agent-rules -->` block from this
skill's `agent-rules.md`, until `@reopt-ai/data-cli` ships its own.

## Safety

- The installed `reopt-data --help` is the truth about commands and file
  versions; published `0.1.0` reads v1 files only.
- Never `--force` through a 409 or a refused `pull`; reconcile first.
- A request to draft or inspect a catalogue does not authorize `push --apply`.
