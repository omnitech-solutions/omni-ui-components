---
id: ADR-0003
title: "Theme per subtree through data-theme on any ancestor"
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
tags: [theming, tokens]
related_briefs: [BRIEF-bionic-docs-and-skills-audit]
related_research: [references/theme-contract]
governs: []
---

# ADR-0003 — Theme per subtree through data-theme on any ancestor

## Context

The first consumer shows library parts in floating windows and panels whose theme differs from the page
around them. A custom property that reads another is resolved on the element that declares it, so a token
declared once on `:root` is already light when a dark subtree inherits it.

## Decision

1. A host sets `data-theme="light"` or `data-theme="dark"` on any ancestor, and that subtree alone takes the
   theme. Dark inside light and light inside dark both work.
2. Every token whose value differs between themes, or reads one that does, is declared on each theme root,
   not once on `:root`.
3. The library does not follow `prefers-color-scheme` on its own: the host decides.
4. A subtree is re-branded by setting its seed on the element that carries `data-theme`.

## Alternatives Considered

### Option A — One theme per document (a class on `<html>`)
- **Pros:** simpler stylesheet, each token declared once.
- **Why not:** a floating window or a preview pane could not differ from its page.

## Consequences

**Positive:**
- Mixed-theme screens need no wrapper component, only an attribute.

**Negative:**
- The stylesheet repeats derived tokens on every theme root, and a new derived token declared only on
  `:root` is a silent bug in nested themes. The isolation test for nested themes guards it.

## References

- [[research/references/theme-contract]] ("Per-subtree theming")
- Commit `a222cd4` (tokens resolve per `data-theme` subtree)
