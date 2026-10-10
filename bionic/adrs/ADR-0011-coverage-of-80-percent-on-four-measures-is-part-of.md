---
id: ADR-0011
title: "Coverage of 80 percent on four measures is part of the gate"
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
tags: [testing, coverage, gate]
related_briefs: [BRIEF-bionic-docs-and-skills-audit]
related_research: []
governs: []
---

# ADR-0011 — Coverage of 80 percent on four measures is part of the gate

## Context

Fourteen components had no test directory when the objectives were first written, and Table, the largest
component, had none. "Has a test file" says nothing about what the tests reach.

## Decision

1. Unit tests must cover at least 80% of lines, statements, branches and functions of the package source.
2. The threshold is enforced inside the gate (ADR-0017), not in a separate optional command.
3. `vitest.config.ts` is the source of truth for the threshold and what it measures.
4. The threshold is raised deliberately; it is never lowered to land a change.

## Alternatives Considered

### Option A — Report coverage without failing
- **Why not:** it fell while nobody looked.

### Option B — A per-file threshold
- **Why not:** it punishes small files and invites placeholder tests.

## Consequences

**Positive:**
- A large untested change cannot land.

**Negative:**
- A global figure hides an untested component behind well-tested neighbours; the mandatory-parts tripwire
  (ADR-0015) covers the "has a test at all" case.

## References

- Commit `734d959`; `vitest.config.ts`
