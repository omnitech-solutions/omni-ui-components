---
id: ADR-0015
title: "Mandatory parts are enforced by a tripwire whose allow-list cannot rot"
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
tags: [testing, tripwire, components, process]
related_briefs: [BRIEF-bionic-docs-and-skills-audit]
related_research: []
governs: []
---

# ADR-0015 — Mandatory parts are enforced by a tripwire whose allow-list cannot rot

## Context

Every component was expected to ship with stories, a Docs page, a test, an overview row and a public
export, and widgets with a registry entry, stories and a test. It was followed almost everywhere and
enforced nowhere, so the gaps were found only by audit (OBJ-9).

## Decision

1. A test in the gate (ADR-0017) fails when a component or a dynamic-form widget lacks a mandatory part.
   The README section "The mandatory parts of every component" is the source of truth for the list.
2. The set of components and widgets is derived from the public entry point and the widget registry, never
   kept by hand.
3. Gaps that exist when a rule is added are written in one allow-list, each with what is missing and since
   when. The rule itself is never weakened.
4. The allow-list is exact. The test fails for a gap that is not listed, for a listed gap that no longer
   exists, and for a duplicate, so the list cannot outlive the debt.
5. A new component or widget is never added to the allow-list, and no placeholder story or test is written
   to shorten it.
6. A new rule joins the same tripwire with its existing misses on the same list.

## Alternatives Considered

### Option A — A checklist in the README
- **Why not:** that was the state before: followed, unenforced, drifting.

### Option B — Fix every gap before turning the check on
- **Why not:** the check would wait for weeks of unrelated work while new gaps kept landing.

## Consequences

**Positive:**
- A new component cannot land without its parts, and the debt is a counted list (OBJ-9's measure).

**Negative:**
- The tripwire proves a part exists, not that it is good.
- Whoever pays a debt must delete its line, or the gate fails: intended, and occasionally surprising.

## References

- `packages/core/test/Tripwires/`
- [[briefs/BRIEF-bionic-docs-and-skills-audit]] section J
