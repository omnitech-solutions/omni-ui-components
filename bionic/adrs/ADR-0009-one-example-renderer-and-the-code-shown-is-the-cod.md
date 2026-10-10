---
id: ADR-0009
title: "One example renderer, and the code shown is the code a consumer writes"
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
tags: [storybook, documentation, factories]
related_briefs: [BRIEF-storybook-audit, BRIEF-bionic-docs-and-skills-audit]
related_research: []
governs: []
---

# ADR-0009 — One example renderer, and the code shown is the code a consumer writes

## Context

A developer should learn a component from its page (OBJ-6). Storybook showed examples through six
different panels, and the code under them was often not the code that ran: demo wrappers, a generic
`onAction`, React elements printed as JSON.

## Decision

1. One renderer draws "an example with its code" everywhere: the overview pages, the Docs pages and the
   story view. No page shows two code bars.
2. The code shown is the example as a consumer writes it, read from the factories file that renders it: a
   type that extends the library's, typed data, state and typed callbacks, composed from library parts, one
   import line from the package. No demo wrapper and no stand-in callback.
3. Every component has a Docs page.
4. A story opts out of the frame only when it is a full page.

## Alternatives Considered

### Option A — Storybook's own source panel
- **Why not:** it prints from args, cannot show state or composition, and printed elements as JSON.

### Option B — Hand-written code strings beside each story
- **Why not:** they drift from what runs.

## Consequences

**Positive:**
- What a developer copies is what was rendered and typechecked.

**Negative:**
- Each example must be written as consumer code in a factories file; 43 components have no factories file
  yet (ADR-0021 checks use where one exists).

## References

- [[briefs/BRIEF-storybook-audit]] ("Result")
- Commits `6705102`, `cc3eb6c`; `.storybook/internal/support`
