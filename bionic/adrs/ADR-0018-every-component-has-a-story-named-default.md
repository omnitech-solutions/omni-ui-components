---
id: ADR-0018
title: "Every component has a story named Default"
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
tags: [storybook, tripwire, documentation]
related_briefs: [BRIEF-bionic-docs-and-skills-audit]
related_research: []
governs: []
---

# ADR-0018 — Every component has a story named Default

## Context

120 of 128 components with stories have a `Default` story; eight written as state-named sets do not. The
overview, the Docs page and a reader all need one predictable place to see a component as it is with no
options chosen. The audit asked whether `Default` is a rule; the owner decided it is (2026-10-10).

## Decision

1. Every component has a story named `Default`: the component with its defaults and the least data that
   makes it meaningful.
2. State-named stories are welcome beside it and do not replace it.
3. The mandatory-parts tripwire (ADR-0015) enforces the name; the components without one are on its
   allow-list until each is given one.

## Alternatives Considered

### Option A — Drop the rule for state-named sets
- **Pros:** no work on the eight.
- **Why not:** "the first story" is not a stable address, and the eight are the newest components: the
  exception would become the habit.

## Consequences

**Positive:**
- One address per component for docs, overview rows and tests.

**Negative:**
- `Default` is a name, not a check of what the story shows. Eight components owe one.

## References

- [[briefs/BRIEF-bionic-docs-and-skills-audit]] sections J and L.3
- `packages/core/test/Tripwires/componentParts.allowlist.ts`
