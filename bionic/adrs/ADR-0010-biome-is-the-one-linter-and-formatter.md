---
id: ADR-0010
title: "Biome is the one linter and formatter"
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
tags: [tooling, lint, format]
related_briefs: [BRIEF-bionic-docs-and-skills-audit]
related_research: []
governs: []
---

# ADR-0010 — Biome is the one linter and formatter

## Context

The repository had ESLint and Prettier with separate configurations, and no format gate. A library built
by many parallel workers needs one fast check that every commit passes.

## Decision

1. Biome lints, formats and sorts imports for the whole repository; `biome.json` is the source of truth.
   ESLint is removed and Prettier is not used for the repository.
2. The tree was reformatted in one commit, which `git blame` is configured to skip.
3. Judgement rules that the existing code fails are `warn`, not off; a rule is promoted to `error` once its
   findings are fixed. The backlog is recorded in a brief.
4. The Biome check is part of the gate (ADR-0017) and of the pre-commit hook.

## Alternatives Considered

### Option A — Keep ESLint and Prettier
- **Why not:** two tools, two configurations, slower, and no format gate existed.

## Consequences

**Positive:**
- One command and one configuration; formatting is never a review topic.

**Negative:**
- A standing warning backlog. Prettier stays a dependency because Storybook calls it as a library.
- A branch from before the reformat needs the documented merge procedure.

## References

- `CONTRIBUTING.md`; `biome.json`; `.git-blame-ignore-revs`
- Commits `b015d48`, `2a91f90`, `b184a02`
- [[briefs/BRIEF-biome-rule-backlog]]
