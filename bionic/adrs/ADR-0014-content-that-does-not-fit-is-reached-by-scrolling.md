---
id: ADR-0014
title: "Content that does not fit is reached by scrolling, on by default"
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
tags: [components, layout, behaviour]
related_briefs: [BRIEF-bionic-docs-and-skills-audit]
related_research: []
governs: []
---

# ADR-0014 — Content that does not fit is reached by scrolling, on by default

## Context

A Splitter whose panels needed more room than it had cut the last panel off, and a TabsBar with more
tabs than width grew past its container. In both, content became unreachable with no sign that it existed.

## Decision

1. A layout component whose content does not fit keeps that content reachable by scrolling along its own
   axis. Clipping is never the default.
2. The scrolling stays inside the component: it does not grow past what holds it and does not scroll the page.
3. The previous behaviour remains available as an explicit option, and the changelog records the default
   as a behaviour change.
4. Applies today to Splitter and TabsBar, and to any layout component added later.

## Alternatives Considered

### Option A — Keep clipping as the default and add scrolling as an option
- **Why not:** the safe behaviour would be the one a developer has to know to ask for.

## Consequences

**Positive:**
- No content is lost at a narrow width without the app doing anything.

**Negative:**
- A behaviour change for existing consumers; an app that relied on clipping must opt out.

## References

- `CHANGELOG.md` ("Added", Unreleased: Splitter `overflow`, TabsBar `scrollable`)
- Commits `3740f68`, `9bb7843`
