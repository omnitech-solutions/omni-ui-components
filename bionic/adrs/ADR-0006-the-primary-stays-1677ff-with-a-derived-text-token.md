---
id: ADR-0006
title: "The primary stays #1677ff, with a derived text token and one recorded contrast exception"
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
tags: [accessibility, brand, tokens, contrast]
related_briefs: [BRIEF-bionic-docs-and-skills-audit, BRIEF-storybook-audit]
related_research: [references/theme-contract]
governs: []
---

# ADR-0006 — The primary stays #1677ff, with a derived text token and one recorded contrast exception

## Context

The brand primary `#1677ff` falls short of the AA bar (ADR-0005) in two uses: as text on light and dark
surfaces, and as the fill under white text. A darker primary was applied for contrast and taken back before
any release: the primary is the owner's brand colour (owner, 2026-10-10).

## Decision

1. `--oui-primary` stays `#1677ff`.
2. The primary used as text takes its own token, `--oui-foreground-primary`: a shade of the same hue derived
   from `--oui-primary` on each theme root, so a host's own primary gets its own text shade. It meets AA.
3. White text on the solid primary is an accepted exception. It is recorded in one place,
   `.storybook/a11yAllowances.ts`, scoped to that exact colour pair. The `color-contrast` rule is not
   disabled anywhere.
4. No other exception exists. A new one is the owner's decision and goes in that file.

## Alternatives Considered

### Option A — Darken the primary until white on it passes
- **Pros:** no exception.
- **Why not:** it changes the brand colour; done and reverted on the owner's instruction.

### Option B — Disable `color-contrast` for the components that use the solid primary
- **Why not:** it hides every other contrast failure in those components.

## Consequences

**Positive:**
- The brand is unchanged and primary-coloured text is readable in both themes.

**Negative:**
- The primary Button, the chosen Segmented option and the solid Badge stay under 4.5:1.[^m]
- A component that draws the primary as text with the fill token fails the check: it must use the text token.

[^m]: Informative. White on `#1677ff` measures 4.10:1; the derived text shade is `#1365d9` in light and
    `#5ca0ff` in dark by default.

## References

- `CHANGELOG.md` ("Changed", Unreleased); commit `f208942`
- [[research/references/theme-contract]] ("The primary as a fill and as text")
- `.storybook/a11yAllowances.ts`
