---
id: ADR-0002
title: "Style only through --oui-* tokens declared for both themes"
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
tags: [theming, tokens, css]
related_briefs: [BRIEF-bionic-docs-and-skills-audit]
related_research: [references/theme-contract]
governs: []
---

# ADR-0002 — Style only through --oui-* tokens declared for both themes

## Context

A consumer themes the library once and expects every component to follow (OBJ-5), and writes no CSS of
its own for library parts (OBJ-1). Both require that every colour, radius, size and motion value a component
uses be a named token an app can set, with a value for light and for dark.

## Decision

1. A component takes every colour, radius, spacing, size and motion value from an `--oui-*` token. No raw
   colour appears in component source.
2. Every token that differs between themes has a light and a dark value.
3. `packages/core/src/styles/tokens.css` is the source of truth for the tokens and their defaults;
   `theme-contract.md` describes them and `test/Theming/themeContract.test.ts` holds the contract.
4. A see-through surface mixes its background only; text and icons stay opaque. Motion respects
   `prefers-reduced-motion`.
5. A new token arrives with both values and a row in the theme contract.

## Alternatives Considered

### Option A — Tailwind palette classes or literal colours in components
- **Pros:** faster to write.
- **Why not:** a host cannot re-brand what it cannot name, and dark mode becomes a per-component patch
  (the history holds one such fix: "normalize collapse and theme surfaces").

## Consequences

**Positive:**
- Re-branding and theming are one place for the app, and a contrast fix is one token change.

**Negative:**
- The token set grows and must be documented; the reference page went stale within a day of a token change.

**Follow-on work:**
- A test, or generation, that keeps `theme-contract.md` equal to `tokens.css` (audit brief L.6).
- A per-component theme check (OBJ-5).

## References

- [[research/references/theme-contract]]
- `bionic/inbox/_dispatched/2026-10-10/lib-delegate-preamble.md` section 2, rule 8
- `packages/core/src/styles/tokens.css`
