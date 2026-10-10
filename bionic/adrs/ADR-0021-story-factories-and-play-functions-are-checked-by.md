---
id: ADR-0021
title: "Story factories and play functions are checked by the tripwire"
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
tags: [storybook, tripwire, testing, factories]
related_briefs: [BRIEF-bionic-docs-and-skills-audit]
related_research: []
governs: []
---

# ADR-0021 — Story factories and play functions are checked by the tripwire

## Context

Two expected parts of a component were prose only: a factories file that its stories are built from
(ADR-0009), and a `play` function for each interaction worth keeping. The owner decided on 2026-10-10
that both become checked, and asked for the smallest sensible check.

## Decision

1. An interactive component has at least one story with a `play` function. A component is interactive, for
   this check, when its own source declares a callback prop.
2. Where a component has a factories file, its stories are built from it.
3. A dynamic-form widget's stories are built by the shared widget story builder.
4. The three rules join the mandatory-parts tripwire, with the existing misses on its allow-list, under
   ADR-0015's terms.
5. The check stays this small on purpose: it asks for one exercised interaction and for use of the factory,
   not for a `play` per story or a factories file for every component.

## Alternatives Considered

### Option A — Require a factories file and a `play` on every component
- **Why not:** 43 components have no factories file and 82 no `play`; a display-only component has no
  interaction to play.

### Option B — Typecheck or run the stories to prove factory use
- **Why not:** the tripwire reads files only, by design; `pnpm test:storybook` runs them.

## Consequences

**Positive:**
- A new interactive component cannot land with no exercised interaction, nor with a factories file its
  stories ignore.

**Negative:**
- "Declares a callback prop" misses a component whose callbacks come only from an inherited element type.
- One `play` proves one interaction, not coverage.[^m]

[^m]: Informative. On 2026-10-10 the rules added 48 allow-list lines: 33 for `play`, 14 for unused
    factories, 1 widget.

## References

- `packages/core/test/Tripwires/componentParts.ts`
- [[briefs/BRIEF-bionic-docs-and-skills-audit]] section L.2
