---
id: ADR-0001
title: "Components are generic, typed and prop-driven, with no app knowledge"
status: Accepted
date: 2026-10-10
proposed_date: 2026-10-10
accepted_date: 2026-10-10
deprecated_date: null
superseded_date: null
supersedes: []
amends: []
superseded_by: null
deciders: ["Desmond O'Leary"]
tags: [components, philosophy, api]
related_briefs: [BRIEF-bionic-docs-and-skills-audit, BRIEF-dynamic-form-widget-coverage]
related_research: [references/native-app-control-variations]
governs: []
---

# ADR-0001 — Components are generic, typed and prop-driven, with no app knowledge

## Context

The library exists so that apps build their screens from it exclusively (OBJ-1, OBJ-8). That only holds
if a component can be dropped into a second app unchanged. The conventions that make it so were binding on
every worker of the library completion (0.1.0) and were written only in a worker preamble that sat in the
inbox, and in the habits of neighbouring folders.

## Decision

A component is a generic, typed part driven by props and data. For every component:

1. **No app knowledge.** No app or server types, no product or domain wording in names, stories or example
   data, no React context bus that an app must mount.
2. **No side effects that belong to an app.** A component does not navigate, fetch, upload or save. It reports
   intent through callbacks and draws what it is given.
3. **Typed.** Prop types are exported. A list-like component is generic over an extendable base item; items
   pass through untouched and reach every callback by reference, full item first.
4. **Callbacks are plain optional props named `on` + verb.** An absent callback means the control that exists
   for it is not drawn. A component holds no pending state, takes no `onError`, and has no async helper.
5. **State works controlled and uncontrolled**, and the change callback always fires.
6. **Words and icons belong to the app.** Every visible string goes through a `labels` prop with exported
   defaults; icons are `ReactNode` props.
7. **Accessibility is part of the component**: roles, names, focus return and keyboard, each tested.

## Alternatives Considered

### Option A — Components that know the app (context providers, app types)
- **Pros:** less wiring in the first app.
- **Why not:** every such component is unusable in the second app, which defeats OBJ-8.

### Option B — Async-aware components (pending state, `onError`)
- **Pros:** fewer lines in the app for the common case.
- **Why not:** it was built once and removed on the owner's instruction: the app owns the server error and
  the spinner, and two owners of that state disagree.

## Consequences

**Positive:**
- A component can be judged by reading its props; an app's screen is data plus composition.

**Negative:**
- The app writes the wiring (state, requests, navigation) every time. That is the intended place for it.
- Nothing checks rules 1 and 2 mechanically; they rest on review.

**Follow-on work:**
- A check for app wording or forbidden imports in component source, if review proves insufficient.

## References

- `bionic/inbox/_dispatched/2026-10-10/lib-delegate-preamble.md` section 2 (the eleven binding conventions)
- [[research/references/native-app-control-variations]]
- [[briefs/BRIEF-dynamic-form-widget-coverage]] sections B.1 and B.7
- `packages/core/src/lib/use-controllable-state.ts`
