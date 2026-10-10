---
id: ADR-0004
title: "Ship one stylesheet in one cascade layer"
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
tags: [css, delivery, isolation]
related_briefs: [BRIEF-bionic-docs-and-skills-audit]
related_research: [references/css-delivery]
governs: []
---

# ADR-0004 — Ship one stylesheet in one cascade layer

## Context

The consuming app has its own hand-written CSS: resets, element rules for `button` and `input`, its own
token scopes. Importing the library must neither restyle the host nor be restyled by it (OBJ-4), and the
host must stay in control of precedence.

## Decision

1. The package ships one stylesheet, and all of it sits in the `omni-ui-components` cascade layer.
2. The stylesheet contains no reset and no element selector that reaches host markup; every component root
   carries `data-slot`.
3. The host puts its own rules in a layer ordered below the library's. The stylesheet declares the layer
   order first, and `css-delivery.md` is the source of truth for what a host does.
4. `test:isolation` proves the built stylesheet inside a host that has its own CSS.

## Alternatives Considered

### Option A — Unlayered CSS with high-specificity selectors
- **Why not:** specificity wars with a host's element rules, in both directions.

### Option B — CSS-in-JS or a stylesheet per component
- **Why not:** a runtime or a bundler requirement the consumer did not ask for; OBJ-4 says no extra build
  configuration.

## Consequences

**Positive:**
- A host's `button { ... }` rule never restyles a library button once the host is layered.

**Negative:**
- A host that leaves its rules unlayered wins over the library's controls. The fix is on the host's side
  and must be documented to every consumer.
- Inherited properties (font, colour, line height) still flow in.

**Follow-on work:**
- `test:isolation` is not part of `verify`.

## References

- [[research/references/css-delivery]]
- `packages/core/src/styles/tailwind.css`
