---
id: ADR-0013
title: "Only the owner publishes to npm"
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
tags: [release, publishing, process]
related_briefs: [BRIEF-bionic-docs-and-skills-audit]
related_research: []
governs: []
---

# ADR-0013 — Only the owner publishes to npm

## Context

Publishing is irreversible and uses the owner's npm credentials. Agents and CI do most of the work in
this repository, and an unreviewed publish would reach every consumer (OBJ-7).

## Decision

1. A version is published to npm by the owner, by hand, with the owner's credentials.
2. CI never publishes, and no agent publishes, tags a release or pushes to the default branch on its own.
3. `RELEASING.md` is the source of truth for the steps, which include the full gate and an inspection of
   the tarball.
4. A consumer may take an unpublished build as a packed tarball (ADR-0016).

## Alternatives Considered

### Option A — Publish from CI on a tag
- **Pros:** the gate before a publish is enforced, not trusted.
- **Why not:** it puts a publish token in CI and removes the owner's look at the tarball. Revisit when
  there is more than one maintainer.

## Consequences

**Positive:**
- No accidental or automated release.

**Negative:**
- The gate before a publish rests on the procedure being followed: `prepublishOnly` runs typecheck and
  build only.

## References

- `RELEASING.md`
- `bionic/inbox/_dispatched/2026-10-10/lib-delegate-preamble.md` section 1
