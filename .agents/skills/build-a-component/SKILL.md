---
name: build-a-component
description: Use before adding, changing, reviewing or porting a component, a story, a factories file, a test or a dynamic-form widget in omni-ui-components, when asked to "add a component", "build X in the library", "add a widget", "make X usable in a schema form", "add a prop, option or variant", "write stories or a play function", "add a token or a colour", "fix the tripwire", "componentParts fails", "an allow-list line", "extend the library first" or "re-vendor", and when a consuming app needs a part the library lacks. Routes to the ADR that decides each rule, the README checklist and the gate that proves the work; it holds no rule text of its own.
---

# Build a component (or a widget)

A router. Every rule lives in an ADR under `bionic/adrs/` and the how-to lives in the README section
"How things are built here". Read the rows that match the change, then follow the README checklist. Do not
copy rule text into code comments, stories or this file.

## 1. Before any edit

1. `bionic/objectives.md`: the mission and the goal the change serves (OBJ-1 to OBJ-11).
2. README, "How things are built here": layout, mandatory parts, the widget steps, the checklist.
3. The rows below that match what you are about to touch.

## 2. Which decision governs what

| You are about to | Read |
|---|---|
| Add or change any component: props, callbacks, items, labels, state | ADR-0001; `bionic/research/references/native-app-control-variations.md` |
| Add a prop, an option, a variant or a second component for a variation | ADR-0020 (an option first) |
| Touch a colour, a size, a radius, motion or a token | ADR-0002, ADR-0003, ADR-0005, ADR-0006; `bionic/research/references/theme-contract.md` |
| Change the stylesheet, a layer or a selector that could reach a host | ADR-0004; `bionic/research/references/css-delivery.md` |
| Build or change an input | ADR-0008 (primitive plus field shell) |
| Add or change a dynamic-form widget, field or template | ADR-0019, ADR-0020, ADR-0008; README "A dynamic-form widget"; `bionic/briefs/BRIEF-dynamic-form-widget-coverage.md` |
| Write stories, factories, docs or a `play` function | ADR-0009, ADR-0018, ADR-0021 |
| Add an export to an entry point | ADR-0007; `bionic/research/references/bundle-weight.md` |
| Lay out content that may not fit | ADR-0014 |
| See `componentParts.test.ts` fail, or want to touch its allow-list | ADR-0015 |
| Meet an accessibility finding, or want an exception | ADR-0005, ADR-0006, ADR-0022 |
| Need a part for a consuming app | ADR-0016 (the library first, then re-vendor) |
| Decide which commands must be green | ADR-0017; README "Commands: what each proves, and what it does not" |
| Publish, tag or push a release | ADR-0013: you do not |

Status matters: ADR-0019 to ADR-0022 are proposed until `bionic/adrs/index.md` says otherwise. Follow them, and
say in your report that the decision is not yet accepted.

## 3. Stop and ask the owner when

- the change needs a line added to `componentParts.allowlist.ts` or to an accessibility allow-list for a new
  component or story (never add one);
- it needs an accessibility exception, a change to a brand colour, or a lowered threshold;
- it puts app wording, navigation, fetching or uploading into a component;
- it would change a default behaviour that consumers already rely on.

## 4. Finish

1. The README checklist, every line.
2. The gates of ADR-0017 that the change touches, by their real exit code. Use your own Storybook port,
   never 6006.
3. `CHANGELOG.md` under "Unreleased", and a journal entry with the `log-work` skill.
4. A decision made along the way is an ADR (`propose-adr`), not a comment.
