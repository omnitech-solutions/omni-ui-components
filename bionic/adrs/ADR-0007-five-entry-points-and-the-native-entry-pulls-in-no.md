---
id: ADR-0007
title: "Five entry points, and the native entry pulls in no markdown or highlighting engine"
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
tags: [packaging, bundle, entry-points]
related_briefs: [BRIEF-bionic-docs-and-skills-audit]
related_research: [references/bundle-weight]
governs: []
---

# ADR-0007 — Five entry points, and the native entry pulls in no markdown or highlighting engine

## Context

The native app uses a small control set and must not pay for the chat parts' markdown renderer or the
code highlighter's grammars. A single entry point makes that depend on every consumer's tree shaking.

## Decision

1. The package has five entry points, declared in the `exports` map of `packages/core/package.json`: the
   root (everything, with styles), `dynamic-form`, `native`, `chat` and `highlight`.
2. `native` pulls in no markdown and no highlighting engine. A test builds a scratch consumer and asserts it.
3. Highlighting is opt-in: chat parts take a highlight function, and grammars are created on first use.
4. A component new to an entry is added to that entry's exports deliberately.

## Alternatives Considered

### Option A — One entry point and trust tree shaking
- **Why not:** one stray import puts the grammars in every consumer, and nothing would notice.

### Option B — A package per surface
- **Why not:** versions to keep in step for one library and one team.

## Consequences

**Positive:**
- What an entry costs is measured, and a regression fails a test.

**Negative:**
- An export can be forgotten from an entry; the root entry still reaches everything.

## References

- [[research/references/bundle-weight]]
- `packages/core/test/Entries/entries.test.ts`
