---
id: ADR-0017
title: "Each command is a gate that proves one stated thing"
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
tags: [testing, gate, ci, process]
related_briefs: [BRIEF-bionic-docs-and-skills-audit]
related_research: []
governs: []
---

# ADR-0017 — Each command is a gate that proves one stated thing

## Context

"Green" was claimed on the strength of whichever command had been run. `pnpm verify` runs nothing in a
browser; the Storybook run checked no accessibility; visual tests cover one set. A claim needs to name
the command that proves it.

## Decision

1. Three commands are gates, and each proves a stated thing:
   - `pnpm verify`: lint and format, types of the package source, unit tests with the coverage threshold
     (ADR-0011), the build, and the mandatory-parts tripwire (ADR-0015). Nothing in a real browser.
   - `pnpm test:storybook`: every story renders in a real browser and every `play` function passes; with
     ADR-0022, accessibility too.
   - `pnpm test:visual`: the captured stories match their platform's baselines (ADR-0012).
2. CI runs all three, and the Storybook build, on every push and pull request.
3. Work is complete when the gates its change touches are green by their real exit code: `verify` always,
   the Storybook run when a story changed, the visual run when a captured part changed.
4. The README table "Commands: what each proves, and what it does not" is the source of truth, including
   what each command does not prove. A report script is not a gate.

## Alternatives Considered

### Option A — One command that runs everything
- **Why not:** the browser runs take minutes and need a browser; the pre-push hook would be skipped.

## Consequences

**Positive:**
- "Verified" names a command, and its limits are written beside it.

**Negative:**
- Three commands to remember; test, story and factories files are not typechecked by any of them.

## References

- `README.md` ("Commands: what each proves, and what it does not")
- `.github/workflows/verify.yml`; `package.json` scripts
