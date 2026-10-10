---
id: ADR-0008
title: "Every input is two layers: a primitive and a field shell"
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
tags: [components, forms, inputs]
related_briefs: [BRIEF-dynamic-form-widget-coverage]
related_research: []
governs: []
---

# ADR-0008 — Every input is two layers: a primitive and a field shell

## Context

An input is used in two places: a hand-built form, where it carries its own label, help and error, and a
schema-driven form, where the form's template draws those around it. One component cannot serve both
without drawing the label twice or not at all.

## Decision

1. Every value-holding input is two components. `XPrimitive` is the bare control: identity, value, change
   callback receiving the value, disabled, required, invalid and its ARIA wiring; no label, help or error.
2. `X` is the primitive inside the shared field chrome (`lib/FieldShell.tsx`): label, description, error,
   required mark, layout.
3. The dynamic form's widgets use the primitive; hand-built forms use the shelled component.
4. An input without a primitive is not finished: it cannot become a widget (ADR-0019).

## Alternatives Considered

### Option A — One component with a "bare" prop
- **Why not:** every input re-implements the switch, and the widget contract leaks into the public props.

## Consequences

**Positive:**
- Label, help, error and required are drawn one way everywhere, and fixed in one place.

**Negative:**
- Two exports per input. Four inputs (Cascader, TreeSelect, Transfer, Mentions) do not meet the pattern yet.

## References

- [[briefs/BRIEF-dynamic-form-widget-coverage]] section B.2
- `packages/core/src/lib/FieldShell.tsx`
