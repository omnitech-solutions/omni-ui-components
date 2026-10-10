# Operations log

_Append-only. Newest first._

## [2026-10-10] brief | Bionic docs and skills audit
`bionic/briefs/BRIEF-bionic-docs-and-skills-audit.md`, `status: draft`. Written by hand in the format of its neighbours (not scaffolded by `propose-brief`).

## [2026-10-10] audit | docs and skills audit, drift gates, safe repairs
Ran every project drift gate of crux 3.25.1 with `--dry-run`. Regenerated with their own regenerators: `adrs/index.md`, `adrs/lineage.md`, `adrs/summaries/`, `adrs/doctrine/`, `adrs/reviews/index.md`, `journal/index.md`. Left drifted for the owner: `code/` (960 pages never extracted) and `arch/` (the deriver reads `coverage/` and `dist-types/`).
Hand repairs: four stale rows of `research/references/theme-contract.md`, frontmatter on `bundle-weight.md`, `research/index.md` (4 references), `index.md` (research, briefs, journal).
Findings and what needs the owner's decision: `briefs/BRIEF-bionic-docs-and-skills-audit.md`.

## [2026-10-05] init | crux bootstrap

Created `bionic/` tree at schema_version 5 (seven concerns incl. invariants, plus the arch spine (deferred to first derive/audit) and the observations concern). Detected languages: typescript. Meta-ADR seeded.
