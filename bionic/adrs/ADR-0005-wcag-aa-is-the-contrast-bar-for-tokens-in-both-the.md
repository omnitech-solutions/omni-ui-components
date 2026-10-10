---
id: ADR-0005
title: "WCAG AA is the contrast bar for tokens in both themes"
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
tags: [accessibility, tokens, contrast]
related_briefs: [BRIEF-bionic-docs-and-skills-audit, BRIEF-storybook-audit]
related_research: [references/theme-contract]
governs: []
---

# ADR-0005 — WCAG AA is the contrast bar for tokens in both themes

## Context

The Storybook audit measured text contrast across every story in both themes and found muted text,
placeholders and the danger colour under 4.5:1. OBJ-3 needs a stated bar that a token either meets or
does not.

## Decision

1. Text drawn from a library token meets WCAG 2 AA contrast (4.5:1 for normal-size text) against the
   surfaces it is drawn on, in the light and the dark theme.
2. A token that fails is changed at the token, not worked around in a component.
3. An exception is the owner's decision, is recorded once, and is scoped to an exact colour pair. One
   exists (ADR-0006).

## Alternatives Considered

### Option A — AAA (7:1)
- **Why not:** it rules out the brand palette and most muted text; no consumer asked for it.

### Option B — No stated bar, fix on report
- **Why not:** contrast regresses silently with every token change.

## Consequences

**Positive:**
- A contrast finding has one answer: the token.

**Negative:**
- Apps see token values change when a default is corrected (the changelog lists each).[^m]

[^m]: Informative. On 2026-10-10: muted text 55% black in light and 59% white in dark (was 45%), placeholder
    62% of the foreground (was 32%), `--color-danger` `#d32f35` / `#ff6b6d`. Any values meeting the bar conform.

## References

- `CHANGELOG.md` ("Changed", Unreleased)
- [[briefs/BRIEF-storybook-audit]] ("Accessibility")
- Commit `cc3eb6c`
