# Forge log

_Written by forge-skill. Entries newest-first. Events: authored | revised | used | evaluated | fallback | escalated | pruned. forge-skill is the sole writer of the lifecycle events (authored, revised, pruned); the usage events (used, evaluated, fallback, escalated) are written by the session that used the forged skill, in forge-skill's locked format._

## [2026-10-10 11:05] evaluated | build-a-component
- verdict: mixed | gap: partial | recommend: keep
- evidence: every ADR, reference page and README heading the router names resolves on the day it was written, but it was not run on a live component task, so whether its description triggers and its rows are the right ones is unproven.

## [2026-10-10 11:00] authored | build-a-component
- Gap: an agent arriving to add or change a component or widget had no skill, and the rules were spread over 22 ADRs, the README and four reference pages; the skill is a table from "what you are about to touch" to the ADR that decides it, with no rule text of its own.
- Self-test: a script resolved every ADR id, path and README heading the skill names against the tree (none unresolved); the skill was not exercised on a live task.
- Learned: the repository links skills per host differently from its sibling, because `.opencode/skills` and `.omp/skills` are real directories of gitignored plugin copies, so the link is one per skill there and one for the whole directory under `.claude`.
