See `bionic/AGENTS.md` for documentation operations.

Read `bionic/objectives.md` before work of any size, and carry its context through every delegation.
`bionic/AGENTS.md` §5.B is the one statement of what that means — who reads, when, what a delegation carries, how the mission bounds the work, and what to do when the file is missing or still a placeholder.[^objectives]

[^objectives]: rule:objectives-read-before-work, rule:orchestrators-read-objectives-at-startup-and-resume, rule:objectives-shape-the-work-and-authorize-none, rule:objectives-context-travels-with-every-delegation, rule:objectives-populate-gate-never-invents-a-goal

## Building or changing a component or a widget

Before adding, changing or reviewing a component, a story, a factories file, a test or a dynamic-form widget,
invoke the `build-a-component` skill (`.agents/skills/build-a-component/`). It names the ADR that decides each
rule and the README checklist to follow; read only the rows that match what you are about to touch.

## Rules that are decided: do not re-argue them, follow the ADR

The decisions are in `bionic/adrs/` (index: `bionic/adrs/index.md`). The ones an agent meets most:

- A component is generic, typed and prop-driven, with no app knowledge, navigation, fetching or uploading (ADR-0001).
- Style only through `--oui-*` tokens, themed per subtree, one stylesheet in one cascade layer (ADR-0002 to ADR-0004).
- WCAG AA is the bar; the primary stays `#1677ff` with one recorded exception and no other (ADR-0005, ADR-0006).
- Every component and widget has its mandatory parts, enforced by `packages/core/test/Tripwires/` in `pnpm verify`.
  Never add a new component, widget or story to an allow-list; delete a line when its debt is paid (ADR-0015,
  ADR-0018, ADR-0021, ADR-0022).
- A consuming app writes no custom CSS: extend the library first, then re-vendor (ADR-0016).
- Work is complete when the gates it touches are green by their real exit code (ADR-0017). Publishing is the
  owner's alone (ADR-0013).

## Working here

- Do not start, stop or restart the owner's Storybook on port 6006: use another port.
- Workflow: Crux Flow is initialised here (`.crux-flow.yml`); its skills are the Crux skills under a `crux-flow-`
  prefix. A decision is `propose-adr` then `transition-adr`; finished work is `log-work`; a dropped note goes
  through `bionic/inbox/` and `process-inbox`.
- Generated files under `bionic/` (`adrs/index.md`, `adrs/lineage.md`, `adrs/summaries/`, `adrs/doctrine/`,
  `adrs/reviews/index.md`, `journal/index.md`, the `## ADRs` region of `index.md`, `code/`, `arch/`) are written by
  their regenerators only. Check each with `--dry-run` after changing an ADR, the journal or the manifest.
- Project skills live once in `.agents/skills/`; `.claude/skills` links to the directory, `.opencode/skills` and
  `.omp/skills` link to each skill. Edit a skill there and nowhere else.
