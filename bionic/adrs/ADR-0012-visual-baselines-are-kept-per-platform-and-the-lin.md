---
id: ADR-0012
title: "Visual baselines are kept per platform, and the Linux ones are made in CI"
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
tags: [testing, visual-regression, ci]
related_briefs: [BRIEF-bionic-docs-and-skills-audit]
related_research: []
governs: []
---

# ADR-0012 — Visual baselines are kept per platform, and the Linux ones are made in CI

## Context

Screenshots differ between macOS and Linux in font rendering, so one baseline set fails on the other
platform. Developers work on macOS; CI runs on Linux; nobody has a Linux container to hand.

## Decision

1. A visual baseline is named for its platform and both sets are committed.
2. CI compares against the Linux baselines on a pinned runner image.
3. Linux baselines are produced by CI itself and downloaded, never drawn on a developer's machine.
4. A baseline changes only with a reviewed image diff.

## Alternatives Considered

### Option A — One baseline set with a pixel tolerance
- **Why not:** a tolerance wide enough for two font renderers hides real regressions.

### Option B — Docker locally for Linux baselines
- **Why not:** a requirement on every contributor for a job CI already does.

## Consequences

**Positive:**
- A visual change fails on the platform where it happened, with no tolerance to tune.

**Negative:**
- Updating Linux baselines is a round trip through CI. Only the Native App set is covered.[^m]

[^m]: Informative. 10 captures, dark and light, on 2026-10-10.

## References

- `README.md` ("Visual regression tests"); `.github/workflows/verify.yml`
- Commits `46f7eb2`, `234ff02`
