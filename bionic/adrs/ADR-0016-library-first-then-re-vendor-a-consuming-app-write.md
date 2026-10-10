---
id: ADR-0016
title: "Library first, then re-vendor: a consuming app writes no custom CSS"
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
tags: [process, consumers, delivery]
related_briefs: [BRIEF-bionic-docs-and-skills-audit, BRIEF-dynamic-form-widget-coverage]
related_research: []
governs: []
---

# ADR-0016 — Library first, then re-vendor: a consuming app writes no custom CSS

## Context

OmniTech Studio is the first consumer. It grew stylesheets and hand-built controls beside a library that
already had most of the parts, so the same control existed twice and diverged. The owner's rule
(2026-10-08) was written only in the consuming app.

## Decision

1. A consuming app builds its screens from library parts. It writes no custom CSS for them and no markup
   where a library part exists.
2. When a part is missing, the library is extended first: built here from existing parts, generic
   (ADR-0001), with every mandatory part (ADR-0015), through the gate.
3. The app then takes the new build, as a published version or as a packed tarball it vendors, and runs its
   own gate.
4. An app-side workaround "until the library has it" is not an accepted state.

## Alternatives Considered

### Option A — Build in the app, move to the library later
- **Why not:** later does not come; the Studio's hand-written controls are the evidence.

### Option B — Let apps restyle library parts with their own CSS
- **Why not:** every app becomes a fork of the look, and a token change no longer reaches it.

## Consequences

**Positive:**
- One implementation of each control; a fix reaches every app.

**Negative:**
- An app change that needs a new part takes two steps and two gates.
- Re-vendoring a tarball is manual, and nothing proves the vendored build passed the gate (OBJ-10).

## References

- `README.md` ("Library first, then re-vendor")
- [[briefs/BRIEF-dynamic-form-widget-coverage]] section G
