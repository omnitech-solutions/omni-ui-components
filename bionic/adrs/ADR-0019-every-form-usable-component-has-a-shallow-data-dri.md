---
id: ADR-0019
title: "Every form-usable component has a shallow, data-driven widget"
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
tags: [dynamic-form, widgets, forms]
related_briefs: [BRIEF-dynamic-form-widget-coverage]
related_research: []
governs: []
---

# ADR-0019 — Every form-usable component has a shallow, data-driven widget

## Context

Forms are meant to come from a schema (OBJ-2), and apps are meant to build from the library exclusively
(OBJ-1). On 2026-10-10, 21 of 30 value-holding components were reachable from a schema. The widget
coverage brief recommended adding three widgets and listed components not to add. The owner decided
otherwise on 2026-10-10: every component a form can use gets a widget. This ADR overrides that brief's
"What not to add" list for value-holding components.

## Decision

1. Every value-holding component of the library is available to the dynamic form as a widget.
2. A widget is shallow: an adapter between the form engine's widget props and one primitive (ADR-0008). It
   holds no styling, no state of its own and no behaviour the primitive lacks.
3. A widget is data-driven: bounds and choices come from the schema, presentation from `ui:options`, and
   lists that are not in the schema from the form's context. It never fetches.
4. Label, help and error are the template's job, not the widget's.
5. A component that cannot yet be a widget because it has no primitive is finished first (ADR-0008); it is
   not skipped.
6. Every widget has the mandatory parts (ADR-0015).

## Alternatives Considered

### Option A — Add only the widgets a consumer has asked for (the brief's recommendation)
- **Pros:** less work now; four of the missing components are stubs.
- **Why not:** the owner's decision. A form author should not have to learn which controls exist only for
  hand-built forms, and a gap sends the app back to hand-built markup.

## Consequences

**Positive:**
- Anything a hand-built form can hold, a schema can hold.

**Negative:**
- Cascader, TreeSelect, Transfer and Mentions must first meet the library's own rules.
- More widgets to keep in step with their primitives.

**Follow-on work:**
- The widgets for the nine components without one, and the shared-contract fixes of the brief's section D.3.
- Chat and non-input components are out of scope: they hold no form value.

## References

- [[briefs/BRIEF-dynamic-form-widget-coverage]] sections B.4, E and H
- `packages/core/src/dynamic-form/registries/widgets.ts`
