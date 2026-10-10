---
id: ADR-0022
title: "Accessibility is a gate in the Storybook test run, with an allow-list"
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
tags: [accessibility, storybook, gate, tripwire]
related_briefs: [BRIEF-bionic-docs-and-skills-audit, BRIEF-storybook-audit]
related_research: []
governs: []
---

# ADR-0022 — Accessibility is a gate in the Storybook test run, with an allow-list

## Context

OBJ-3 says an accessibility regression cannot land unnoticed. The axe check was configured to fail and
was loaded by no test run, so nothing failed. Measured with it switched on (2026-10-10), 102 of 862
stories fail. The owner decided to turn the gate on now, with an allow-list, and not to wait for the fixes.

## Decision

1. The Storybook test run (ADR-0017) runs the axe check on every story and fails on a violation.
2. The stories that fail when the gate is turned on are written in one allow-list. A listed story is
   reported, not failed.
3. The allow-list is held to ADR-0015's terms: a new story is never added, and a listed story that now
   passes must be removed, so the list only shrinks.
4. The bar and its exception are unchanged: WCAG AA (ADR-0005) and the one recorded colour pair (ADR-0006).
   The allow-list is debt, not an exception.
5. Overview pages stay out of the check: each component is checked in its own stories.

## Alternatives Considered

### Option A — Fix all 102 first, then turn the gate on
- **Why not:** new violations keep landing while the old ones are fixed.

### Option B — Keep the report script as the only check
- **Why not:** a report fails no build; that is the state that let 102 accumulate.

## Consequences

**Positive:**
- A new accessibility violation fails CI from the day the gate lands.

**Negative:**
- The run has no light-theme pass, so light-only violations are still unseen.
- One story is known to measure mid-transition and may flicker.

**Follow-on work:**
- Pay the allow-list down; add a light-theme pass.

## References

- [[briefs/BRIEF-bionic-docs-and-skills-audit]] section K
- [[briefs/BRIEF-storybook-audit]] ("Accessibility")
- `.storybook/vitest.setup.ts`; `.storybook/a11yAllowances.ts`
