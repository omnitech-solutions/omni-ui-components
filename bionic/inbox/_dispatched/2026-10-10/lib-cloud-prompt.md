# Prompt for the cloud session (paste everything in the block below)

```
You are the orchestrator for finishing the React component library in this repository (omnitech-solutions/omni-ui-components,
package @oc-tech/omni-ui-components). The work is already split into small, self-contained units. Your job is to delegate them
in parallel, merge them safely, verify them, and report. Do not do the units yourself unless you cannot spawn workers.

READ, in this order, and nothing else first:
1. bionic/inbox/lib-delegate-preamble.md   (rules, git workflow, how to verify, report format; every worker must follow it)
2. bionic/inbox/lib-work-units.md          (every unit: context, steps, owned files, acceptance, Storybook port, wave order)
3. bionic/research/design/native-panel-cleanup/README.md (designer boards and the written T/M/F requirements)
bionic/inbox/lib-completion-plan.md is background rationale only; the units file is the source of truth.

SETUP
- git checkout master && git pull; pnpm install; pnpm verify. Expect green, 173 test files, 1,405 tests. If it is not green,
  stop and report before delegating.
- Create and push the integration branch `lib-completion` from master. All units merge into it, never into master.

DELEGATE (split up the work as much as you can)
- Spawn one worker per unit, as many in parallel as your limits allow, each in its own git worktree or clone and branch
  `lib/<unit-id>-<slug>` off `lib-completion`. Follow the wave order at the bottom of lib-work-units.md: Wave 1 units all at once;
  start a Wave 2 or 3 unit only when the units it depends on have merged into `lib-completion`.
- Each worker's prompt = the full text of lib-delegate-preamble.md + the full text of its unit section from lib-work-units.md,
  verbatim (do not summarise or paraphrase; the unit is written to be self-sufficient), + its branch name and Storybook port.
  Tell each worker to open a PR into `lib-completion` and send you its report in the format the preamble defines.
- If you cannot spawn workers, execute the units yourself in wave order, one at a time, following the same rules.

MERGE AND VERIFY (you own quality)
- Merge each unit's PR into `lib-completion` as it finishes. Shared files (src/index.ts, ComponentOverview.stories.tsx,
  tokens.css, package.json, journal) take additive edits only: on conflict keep both sides; for pnpm-lock.yaml take the base
  and re-run pnpm install. After each batch of merges run `pnpm verify`; if it fails, fix it or send the unit back with the
  failure. Never skip a failing test and never widen a unit's scope.
- Check every report against its unit's "Done when". For every ★ unit, render its stories yourself in dark and light
  (0 console errors) and drive the interaction by hand, as the preamble describes. Reject work that breaks the conventions:
  an `Assistant` name, a React context bus, an async/pending helper or onError, an id-only callback, a non-generic list component,
  Tailwind preflight leaking into a host, or a story file that does not parse.

PRIORITY IF YOU RUN SHORT OF BUDGET
- The ★ units are the minimum for the native app to adopt the library: U01, U02, U03, U04, U05a, U05b, U06, U10, U11, U12, U15.
  Do those first. Then everything else in wave order. Stop at a consistent point (green gate, nothing half-merged) and report
  what is done, what is not started, and what is half-done.

NEVER
- push to master, publish to npm, edit Crux or .claude configuration, edit the .gitignore `!packages/core/src/Icon/` line,
  hand-edit the lockfile, or run unprompted dev servers other than each worker's own Storybook port.

FINISH
- Run the final units (U90 TODO cleanup, U91 integration). Open ONE pull request lib-completion -> master with a report:
  units done and dropped (with reasons), final verify counts, what was driven by hand versus only tested, and the owner-only items
  (run `npm publish` after merge using RELEASING.md; confirm what "width 330" means; keep or drop the Notification/Message
  stubs). Be honest about anything unverified.
```
