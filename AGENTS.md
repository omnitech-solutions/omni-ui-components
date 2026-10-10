See `bionic/AGENTS.md` for documentation operations.

Read `bionic/objectives.md` before work of any size, and carry its context through every delegation.
`bionic/AGENTS.md` §5.B is the one statement of what that means — who reads, when, what a delegation carries, how the mission bounds the work, and what to do when the file is missing or still a placeholder.[^objectives]

[^objectives]: rule:objectives-read-before-work, rule:orchestrators-read-objectives-at-startup-and-resume, rule:objectives-shape-the-work-and-authorize-none, rule:objectives-context-travels-with-every-delegation, rule:objectives-populate-gate-never-invents-a-goal

## Building or changing a component

Read the README section "How things are built here" before adding or changing a component, a story, a test or a
dynamic-form widget: what a component is, its folder layout, its mandatory parts, the commands and what each proves,
the accessibility bar and its one accepted exception, and the checklist. The mandatory parts are enforced by
`packages/core/test/Tripwires/componentParts.test.ts` (in `pnpm verify`); never add a new component to its allow-list.
Do not start, stop or restart the owner's Storybook on port 6006: use another port.
