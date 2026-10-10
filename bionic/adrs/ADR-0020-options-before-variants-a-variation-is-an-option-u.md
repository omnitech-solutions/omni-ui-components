---
id: ADR-0020
title: "Options before variants: a variation is an option unless a true variant is cleaner"
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
tags: [components, widgets, api, philosophy]
related_briefs: [BRIEF-dynamic-form-widget-coverage]
related_research: [references/native-app-control-variations]
governs: []
---

# ADR-0020 — Options before variants: a variation is an option unless a true variant is cleaner

## Context

Each new need on a component or widget can be met by another option on the existing part or by a new
variant or a new part. New parts multiply the surface an app must learn and the mandatory parts to
maintain. The owner's instruction (2026-10-10): "handle extra options unless a true variant makes sense
from a clean code point of view".

## Decision

1. A variation of a component or widget is met first by an option on the existing part: a prop value, or
   for a widget a `ui:options` key.
2. A separate variant or a separate part is made only when it is the cleaner code: the variation changes
   the value's type or shape, the element structure or the accessibility pattern, or the option would fork
   most of the implementation.
3. An option is typed and has a default; an option of the wrong type is ignored, never an error at render.
4. The reason for a new variant is stated in its change (changelog or story description).

## Alternatives Considered

### Option A — A new component or widget per variation
- **Why not:** near-duplicates drift, and each owes its own stories, tests and docs.

### Option B — Options only, never a variant
- **Why not:** one part with a dozen interacting flags is worse code than two honest ones.

## Consequences

**Positive:**
- A small surface; an app discovers a variation where it already looks.

**Negative:**
- "Cleaner" is a judgement made in review, not a check.

## References

- [[research/references/native-app-control-variations]]
- [[briefs/BRIEF-dynamic-form-widget-coverage]] sections B.1 and E.2
