---
title: "Bionic docs and skills audit: what is stale, what was never written down, what drifts, and the tripwires that now hold the build rules"
slug: bionic-docs-and-skills-audit
type: brief
status: published
created_at: 2026-10-10
updated_at: 2026-10-10
authors: ["claude"]
tags: [bionic, crux, documentation, skills, tripwires, storybook, accessibility]
related_adrs: [ADR-0001, ADR-0002, ADR-0003, ADR-0004, ADR-0005, ADR-0006, ADR-0007, ADR-0009, ADR-0010, ADR-0011, ADR-0012, ADR-0013, ADR-0014, ADR-0015, ADR-0016, ADR-0017, ADR-0018, ADR-0021, ADR-0022]
---

# Bionic docs and skills audit (with the safe repairs, the README and the tripwires)

Audited 2026-10-10 on `master` at `f208942`, working tree clean at the start. Read whole: the root `AGENTS.md`,
`README.md`, `CONTRIBUTING.md`, `RELEASING.md`, `USER_GUIDE.md`, `CHANGELOG.md`, `.bionic.yml`, `.crux-flow.yml`,
`.claude/`, `.codex/`, `.opencode/`, `.omp/`, and `bionic/` (objectives, AGENTS, manifest, index, log, ADRs, the
brief, the four reference pages, the journal, the inbox, invariants, observations, promptbooks, `arch/`, `code/`).
Drift was measured with the regenerators of crux 3.25.1 (`~/.claude/plugins/cache/crux/crux/3.25.1/scripts`), each
with `--dry-run`. Serves OBJ-6 (learn a component without reading its source), OBJ-3 (an accessibility regression
cannot land unnoticed) and OBJ-7 (only verified versions are published).

The owner's request: audit the bionic docs and skills, make the README say how things are built and what is
mandatory, and add tripwires so every component has its stories and tests.

## A. Summary

- **The tree is installed and almost empty of decisions.** One ADR (`ADR-0000`, the meta-ADR), no invariants, no
  observations, no promptbooks, no project skill. Every rule of how a component is built lived in an unprocessed
  inbox file, a reference page, the changelog, or the consuming app. An agent arriving cold read six lines in
  `AGENTS.md` that point at `bionic/objectives.md`, and learned nothing about building a component.
- **Eight of nine project drift gates had drifted**, most because no regenerator had run since `init`. Six are
  repaired here; `code/` and `arch/` are left for the owner (section F).
- **Stale facts were in five hand-written files** (section C). The unambiguous ones are fixed.
- **The README now states how things are built** and names the source of each rule. `AGENTS.md` routes to it.
- **A tripwire in `pnpm verify`** fails when a component or a dynamic-form widget lacks a mandatory part. 32
  existing gaps are written in one allow-list (section J).
- **Accessibility can join the Storybook test run with a two-line change and about 30 seconds of run time. It
  would fail 102 of 862 stories today**, so it is not turned on (section K).
- `pnpm verify`: exit 0, 230 test files, 2,291 tests (229 and 2,281 before; the tripwire adds 1 file and 10 tests).
  No story was touched, so `pnpm test:storybook` was not needed for the change; the probe in section K ran it.

## B. What the tree holds

| Concern | State |
|---|---|
| `objectives.md` | Filled in (mission, OBJ-1 to OBJ-7), `maturity: exploring`, reviewed 2026-10-05. Several measures are out of date (C.1) |
| `bionic/AGENTS.md` | Identical to the crux 3.25.1 template apart from the repository name and date: current |
| `USER_GUIDE.md` | The crux template: current |
| `manifest.yml` | Schema 5, nine concerns enabled, `adr.next_number: 1` |
| ADRs | `ADR-0000` only |
| Briefs | `BRIEF-storybook-audit` (a finished two-phase audit, `status: draft`), `BRIEF-dynamic-form-widget-coverage` (written alongside this one), this one |
| Research | 0 sources, 4 reference pages; `research/design/native-panel-cleanup/` (designer boards) |
| Journal | 16 entries, 2026-10-06 to 2026-10-08 |
| `log.md` | The `init` entry only, until this audit |
| Inbox | 8 files, none processed |
| Invariants, observations, promptbooks | Empty |
| `code/`, `arch/` | Never generated |
| Project skills | None. No `.agents/skills`, no `.claude/skills`. `.opencode/skills` and `.omp/skills` each hold the same 54 generated `crux-flow-*` copies (gitignored, per machine) |

## C. Stale against the code

### C.1 `bionic/objectives.md` (not changed: the owner's file)

| Where | It says | The code says |
|---|---|---|
| OBJ-1, OBJ-6 | "85 components" | `packages/core/src/index.ts` re-exports 129 component folders |
| OBJ-6 | "71 have test directories and 14 do not (for example Alert, Drawer, Dropdown, Popover, RichText)" | 119 have a test file; 10 do not: Alert, BackTop, Cascader, Drawer, Dropdown, Icon, Masonry, MultiSelect, Upload, Util. Popover and RichText are tested |
| OBJ-7 | "There is no CI and no changelog" | `.github/workflows/verify.yml` runs `verify`, the Storybook build, `test:storybook` and `test:visual`; `CHANGELOG.md` exists |
| OBJ-5 | "there is no visual-regression or per-component theme check" | `pnpm test:visual` (10 Native App captures, both themes) and `test/Theming/themeContract.test.ts` exist. Per component there is still none |
| OBJ-3 | "That check is not yet enforced by CI" | Still true, and now measured: section K |
| OBJ-2 | "tests and stories pass for every registered widget" | 12 of 26 widgets have no test that names them (section J) |

### C.2 `bionic/research/references/theme-contract.md` (fixed)

Four rows predated the contrast work of `cc3eb6c`. Compared mechanically against
`packages/core/src/styles/tokens.css`:

| Token | The page said | `tokens.css` |
|---|---|---|
| `--oui-foreground-placeholder` | 32% of the foreground | 62% |
| `--oui-tone-success-solid-bg` (dark) | `#2f9e55` | `#23874a` |
| `--oui-tone-danger-solid-bg` (dark) | `#d8453f` | `#cf3f39` |
| `--oui-panel-meta-fg` | `#6b7280` / `#7d8aa3` | `#566070` / `#a4afc6` |

Every other row matches. One token is in the stylesheet and not on the page: `--oui-hit-grow` (set on `.oui-hit`
only, internal). Nothing keeps the page and the stylesheet together: see L.6.

### C.3 `CONTRIBUTING.md` (fixed)

It said `pnpm format` "fails until the repo-wide reformat lands", that `verify` is "lint + typecheck + test +
build", and that `test:coverage` "is not in `verify` yet". The reformat landed as `2a91f90`, `verify` runs
`pnpm check`, and coverage is in `verify` with thresholds of 80 (`734d959`). The C1/C2 section described a plan;
it now says both have landed and is kept for an old branch.

### C.4 The inbox: finished or abandoned state, never filed

| File | State |
|---|---|
| `lib-completion-plan.md`, `lib-work-units.md`, `lib-cloud-prompt.md`, `lib-handoff.md` | The plan, units, orchestrator prompt and stopped-run handoff of the library completion, which shipped as 0.1.0 (`4bcaab5`). Baselines they quote (173 test files, 1,405 tests) are long gone. Local branches `lib-completion` and `lib/U*` still exist |
| `lib-delegate-preamble.md` | Section 2 is **the only written statement of how a component is built** (eleven binding conventions). It sits in the inbox as if it were unprocessed input. The README now cites it; it should become an ADR or a reference page (L.1) |
| `biome-backlog.md` | "Counts at commit C1, tree not yet reformatted": 479 warnings, 22 infos. Today `pnpm check` reports 189 warnings and 21 infos; 15 rules are still `warn` in `biome.json` |
| `native-app-components-todo.md` | Open checkboxes against the designer boards; not checked against the code here |
| `2026-10-06-storybook-overview-notes.md` | Notes of an overview rewrite that `cc3eb6c` replaced (`ExampleFrame`) |

### C.5 Smaller

- `bionic/index.md` said 0 briefs and 0 research pages (fixed); its title is still `# docs/omni-ui-components` and
  `ADR-0000` says decisions live under `docs/adrs/`. Both come from the template; the ADR body is frozen.
- `bionic/research/index.md` listed 1 of 4 reference pages (fixed). `bundle-weight.md` had no frontmatter (fixed).
- `.github/workflows/verify.yml` comments: "lint, typecheck, test, build" and "coverage artifact ... is added once
  the coverage gate lands". The gate has landed; no artifact is uploaded. Not changed (CI file).
- `packages/core/README.md` is the file that ships in the tarball. It is the old root README word for word and
  names only two of the five entry points. Not changed: what the published README says is the owner's.
- `BRIEF-storybook-audit.md` is `status: draft` and describes itself as "built in the working tree, not
  committed"; it was committed in `9bb7843`, `cc3eb6c` and `f208942`. Its own last line says it is in neither
  index nor log. It is now in the index.

## D. Missing

### D.1 Decisions made in commits and never recorded as an ADR

`adr.next_number` is 1. Each of these is a decision someone will otherwise re-argue. In rough order of weight:

| Decision | Where it lives today |
|---|---|
| The primary stays `#1677ff`; text in the primary takes `--oui-foreground-primary`; white on the solid primary is an accepted contrast exception (owner, 2026-10-10) | `f208942`, `CHANGELOG.md`, `theme-contract.md`, `.storybook/a11yAllowances.ts` |
| WCAG AA (4.5:1 for text) is the contrast bar for tokens in both themes | `cc3eb6c`, `CHANGELOG.md` |
| Theming is per subtree (`data-theme` on any ancestor); every themed token is declared on each theme root | `theme-contract.md` |
| One stylesheet in a cascade layer; the host layers below it | `css-delivery.md` |
| Five entry points; `./native` pulls in no markdown or highlighting engine (a test asserts it) | `bundle-weight.md`, `test/Entries` |
| Components are props-only and generic: no context bus, full item by reference, absent callback means absent control, no pending state and no `onError` | `inbox/lib-delegate-preamble.md` section 2, `native-app-control-variations.md` |
| One example renderer (`ExampleFrame`); "Show code" is the example as a consumer writes it, read from the factories file | `cc3eb6c`, `6705102`, `BRIEF-storybook-audit.md` |
| Biome replaces ESLint and Prettier; one reformat commit ignored by blame | `b015d48`, `2a91f90`, `CONTRIBUTING.md` |
| Coverage gate of 80 on four measures, inside `verify` | `734d959` |
| Visual baselines per platform, Linux ones made in CI | `234ff02`, `README.md` |
| Publishing is by the owner only, never CI or an agent | `RELEASING.md` |
| Splitter and TabsBar scroll by default when content does not fit (a behaviour change) | `3740f68`, `CHANGELOG.md` |

### D.2 Practices followed and written nowhere in this repository

- **A consuming app writes no custom CSS and extends the library first**, then re-vendors a packed tarball. This
  is the owner's rule (2026-10-08) and was written only in the consuming app (its agent memory and its
  `vendor/README.md`). The README now states it, with the pack command.
- **Every component ships with stories, a `Default` story, a Docs page, a test, an overview row and a public
  export.** Followed almost everywhere, enforced nowhere until section J.
- **A dynamic-form widget is registered under its `ui:widget` key and its own name, with fixtures, stories built by
  `defineDynamicFormStories`, and a `DynamicForm.<widget>.test.tsx`.** Now in the README.
- **Agents use their own Storybook port and never the owner's 6006.** Was in the inbox preamble; now in `AGENTS.md`.
- **Journal after work.** The last entry is 2026-10-08 15:00 to 17:00. Six later commits have none:
  `4d956f5`, `4a563eb`, `3740f68`, `9bb7843`, `cc3eb6c`, `f208942` (Collapse and Descriptions, compact
  Typography and Empty, Splitter and Tabs overflow, the Storybook audit and its fix, the primary colour).
  Entries are also not in time order (three dated 2026-10-07 sit below one dated 2026-10-06 23:10).
- **`log.md` after an operation.** Nothing was logged between `init` and this audit, though briefs, reference
  pages and journal entries were written.

## E. Contradictions between files

| One file | Another | Which is right |
|---|---|---|
| `objectives.md` OBJ-7: no CI, no changelog | `.github/workflows/verify.yml`, `CHANGELOG.md` | The files |
| `CONTRIBUTING.md`: coverage not in `verify` | `package.json`: `verify` runs `test:coverage` | `package.json` (fixed) |
| `BRIEF-storybook-audit.md` phase 2: six visual baselines differ "because of the token changes" | The same brief's follow-up: the cause was Empty's line heights (`4a563eb`) | The follow-up; the brief corrects itself |
| `objectives.md` OBJ-3: the a11y check "runs at `test: 'error'` over every component's stories" | `.storybook/vitest.setup.ts`: the test run does not load the a11y addon | The check is configured and not executed by any gate (section K) |
| `.claude/settings.json`, `.codex/config.toml`: `crux@crux` off, `crux-flow@crux-flow` on | `bionic/AGENTS.md`, `USER_GUIDE.md`: name the plugin `crux` and bare skill names | Not a defect (the skills are the same set under a `crux-flow-` prefix), but a reader looking for `propose-adr` finds `crux-flow-propose-adr` |
| `inbox/lib-delegate-preamble.md`: "width 150" | `biome.json`: `lineWidth: 100` | `biome.json` |

## F. Generated outputs: drift, and the regenerator that repairs each

Run from the repository root as `uv run --no-config <plugin>/scripts/<name>`. Plain `python3` fails for most
(they need PyYAML or httpx from their PEP 723 block): that is an environment crash, not drift.

| Output | Verdict before | Regenerator | Now |
|---|---|---|---|
| `bionic/adrs/index.md` | DRIFT | `generate-adr-index.py` | regenerated, clean |
| `bionic/adrs/lineage.md` | DRIFT (absent) | `generate-lineage.py` (skill `link-adr-graph`) | regenerated, clean |
| `bionic/adrs/summaries/` (4 files) | DRIFT (absent) | `summarize-adrs.py` | regenerated, clean |
| `bionic/adrs/doctrine/` (2 files) | DRIFT (absent) | `compile-doctrine.py` | regenerated, clean |
| `bionic/adrs/reviews/index.md` | DRIFT (absent) | `generate-reviews-index.py` | regenerated, clean |
| `bionic/journal/index.md` | DRIFT (said 0 entries) | `generate-journal-index.py` | regenerated: 16 entries |
| `bionic/index.md`, `## ADRs` region | clean | `generate-index-rollup.py` | clean |
| `bionic/code/` | DRIFT: 960 pages to add, 0 on disk | `extract-code-docs.py --config bionic/manifest.yml` | **left**: L.4 |
| `bionic/arch/` | DRIFT: spine never derived | `derive-arch.py --docs-dir bionic` | **left**: L.4 |

Guards and validation, all clean: `check_observations.py`, `check_invariants.py`, `check-promptbook-index.py`,
`check-record-numbers.py`, `lint-governs-references.py` (16 `rule:` citations, all resolve). The eight
plugin-authoring gates do not apply to a consuming project and were not run.

Why `code/` and `arch/` were left. The manifest's glob takes every `.ts` and `.tsx` under `packages/*/src`, stories,
factories and tests included, through the `fallback` extractor: 960 generated pages in one change. The arch
deriver's dry run reads `coverage/*.js` and `packages/core/dist-types/**` as inputs (2,236 of them): build output
and a coverage report, not source. `.bionic.yml` sets no `arch_stack`. Both want a decision about inputs before
the first run.

## G. Skills and routing

- **There is no project skill.** Nothing under `.agents/skills` or `.claude/skills`, so nothing can fail to
  trigger and nothing duplicates. The 54 `crux-flow-*` copies under `.opencode/skills` and `.omp/skills` are the
  plugin's own, generated per machine and gitignored; the two sets hold the same names.
- **Routing from the root was one hop to documentation operations and nothing else.** `AGENTS.md` pointed at
  `bionic/AGENTS.md` and `bionic/objectives.md`. It did not mention components, Storybook, tests, the verify gate
  or the README. It now has a section that sends an agent to the README before it builds anything.
- **Two skills this repository would use and does not have** (L.3): one that routes "add or change a component"
  to the README's rules and checklist, and one for regeneration (what is generated, which regenerator, the
  `uv run` requirement, the `code/` and `arch/` caveats above). The sibling repository
  `omnitech-interview-answers-generator` has the second as `bionic-regeneration`.
- In Claude Code both the generated `.claude/agents/crux-flow-*.md` files and the enabled `crux-flow` plugin
  describe the same nine roles. Whether a session lists each role twice was not tested.

## H. Would an agent arriving cold learn how a component must be built?

Before: no. The path was `AGENTS.md` to `objectives.md` (goals, no method). The method was in
`bionic/inbox/lib-delegate-preamble.md`, which nothing links to, and in the habits visible in neighbouring folders.

Now: `AGENTS.md` names the README section; the README states what a component is, the layout, the mandatory
parts, the widget steps, the commands and what each proves, the accessibility bar and a checklist; and a component
that skips a checked part fails `pnpm verify` with a message that names the part. What is still only prose:
factories, `exampleDocs`, descriptions, play functions, tokens, changelog and journal (L.2).

## I. Repaired in this pass

- Regenerated the six drifted outputs in section F with their own regenerators.
- `theme-contract.md`: the four rows in C.2. `bundle-weight.md`: frontmatter.
- `bionic/research/index.md`: 4 references. `bionic/index.md`: research, briefs, journal, date.
- `bionic/log.md`: an `audit` and a `brief` entry.
- `CONTRIBUTING.md`: the three stale statements in C.3.
- `AGENTS.md`: a section "Building or changing a component".
- `README.md`: rewritten around "How things are built here" (the visual-regression section is kept as it was; the
  duplicated install block is merged; the `native`, `chat` and `highlight` entry points are named).

Not touched: `objectives.md`, `ADR-0000`, the inbox files, the journal, `packages/core/README.md`, the CI
workflow, any story, any component, `BRIEF-dynamic-form-widget-coverage.md`.

## J. The tripwires

`packages/core/test/Tripwires/` (three files), run by `pnpm verify` through `pnpm test:coverage`:

- `componentParts.ts`: reads files only. Components are the PascalCase folders `packages/core/src/index.ts`
  re-exports (read from the file's export statements); widgets are the folders under `dynamic-form/widgets` plus
  every widget `registries/widgets.ts` imports and uses in `appWidgets`. Overview rows are the strings inside
  `SECTIONS` of `ComponentOverview.stories.tsx`, read from its syntax tree.
- `componentParts.allowlist.ts`: the one allow-list (name, what is missing, the date the folder was first committed).
- `componentParts.test.ts`: the rules against this repository, and the tripwire against a fixture library written
  to a temporary directory (a component with no story fails it; so do one with no `Default`, no Docs page, no
  test, no overview row, no export, and a widget with no story, no test or no registry entry).

| Rule | Checked for | Existing gaps on the allow-list |
|---|---|---|
| Has stories | 129 components | 1: Highlight |
| Has a story named `Default` | the 128 with stories | 8: ActionMenu, ApprovalCard, ConversationTranscript, CurrencyInput, Panel, SessionBar, StatusClock, Toolbar |
| Has a Docs page (`tags: ['autodocs']`) | the 128 with stories | 0 |
| Has a test file in `packages/core/test/<Name>/` | 129 components | 10: Alert, BackTop, Cascader, Drawer, Dropdown, Icon, Masonry, MultiSelect, Upload, Util |
| Is a row of the Component Overview, or has its own overview page | 129 components | 1: Highlight |
| A folder with component source is re-exported from the public entry point | every PascalCase folder in `src` | 0 |
| Widget is registered in `appWidgets`, and the registry is exported | 26 widgets | 0 |
| Widget has stories with a Docs page | 26 widgets | 0 |
| A test under `dynamic-form` names the widget | 26 widgets | 12: Color, Currency, DateTime, FileUpload, Hidden, InputOTP, MultiSelect, NumberInput, Phone, RichText, TagInput, Time |

20 component lines and 12 widget lines. The test fails for a gap that is not listed (a new component cannot land
without its parts), for a listed gap that no longer exists (the list cannot rot), and for a duplicate line.
No placeholder story or test was written.

Limits, stated: the tripwire proves a part exists, not that it is good. A test file with one assertion passes it.
The widget rule accepts any test file that names the widget. `Default` is a name, not a check of what it shows.

## K. Accessibility in the Storybook test run

**Why it does not run.** `.storybook/vitest.setup.ts` calls `setProjectAnnotations([previewAnnotations])`. Since
Storybook 10.3 `@storybook/addon-vitest` provides the preview and every addon's annotations by itself, unless a
setup file calls `setProjectAnnotations`, in which case it prints "Skipping automatic provisioning of preview
annotations" and loads only what the file passes. The a11y addon's annotations (which run axe after each story and
fail it under `a11y.test: 'error'`) are therefore never loaded.

**How to turn it on (not done).** Either delete the call (and the setup file, if nothing else is in it), or pass
the addon first:

```ts
import * as a11yAnnotations from '@storybook/addon-a11y/preview';
setProjectAnnotations([a11yAnnotations, previewAnnotations]);
```

`.storybook/a11yAllowances.ts` and `a11y.test: 'error'` already apply, and the two overview stories already opt out.

**Cost and reliability.** Measured with the second form in a temporary config (own cache directory, own port,
both files deleted afterwards): the 862 stories ran in about 29 seconds of test time, the same order as today's
run. All failures were `toHaveNoViolations`; no play function failed and nothing timed out. The count equals the
inventory script's dark-theme figure (102), so the two measurements agree. One story is known to flicker
(ConfigProvider "Right To Left", measured mid-transition, per the Storybook brief); it passed here.

**What it would fail on today: 102 of 862 stories, in 47 of 184 story files** (dark theme; the run has no
light pass).

| Rule | Stories |
|---|---|
| `color-contrast` | 43 |
| `aria-allowed-role` | 22 |
| `nested-interactive` | 10 |
| `scrollable-region-focusable` | 9 |
| `empty-table-header` | 6 |
| `landmark-unique` | 5 |
| `aria-dialog-name` | 4 |
| `heading-order` | 3 |
| `aria-conditional-attr`, `aria-input-field-name` | 2 each |
| `aria-allowed-attr`, `aria-required-children`, `aria-valid-attr-value` | 1 each |

By story file: Composer 11, Transcript 8, Panel 7, Table (seven files) 17, Native App showcase 4, DiffReview 3,
Tag 3, DynamicForm 3, then 2 each for Badge, Button, CommandPopover, DataPrivacyPanel, DatePicker, Empty, Form,
MultiSelect, SessionBar, Steps, Tour, Watermark and RichTextWidget, and 1 each for 20 more.

The `color-contrast` count (43) is the inventory's figure with the white-on-primary exception applied (it is 126
without it), so the allowance holds in this run too. To turn the check on without a red suite, the same pattern as section J would serve: one allow-list of
the 102 story ids, read by the preview (`a11y: { test: 'todo' }` for a listed story), failing when a listed story
passes. That is a rule about accessibility debt, so it is the owner's call (L.5).

## L. Needs the owner's decision

1. **Record the decisions in D.1 as ADRs** (`propose-adr`, then `transition-adr`). The first three (the primary
   and its exception, AA as the bar, the component conventions of the inbox preamble) are the ones the README
   leans on without an ADR to cite. Move `lib-delegate-preamble.md` section 2 out of the inbox as part of that.
2. **Which of the README's "expected" parts become checked.** A factories file (85 of 129 components have one),
   a component description, a `play` function, `exampleDocs`. Each would start with a long allow-list.
3. **Whether `Default` is a rule.** 120 of 128 have it; the eight that do not are mostly state-named sets written
   this month (Panel, Toolbar, SessionBar, StatusClock). The tripwire enforces it and lists the eight; striking the
   rule is deleting one check and eight lines.
4. **`code/` and `arch/`.** Narrow the extractor glob (drop stories, factories and tests) and run
   `extract-code-docs`, or disable the `code` concern. Give the arch deriver real inputs (exclude `coverage/` and
   `dist-types/`) before the first `derive-arch`, or disable `arch`.
5. **Accessibility as a gate.** Turn it on with an allow-list of the 102 (section K), or fix first. Until then
   OBJ-3's "cannot land unnoticed" is not met.
6. **A test that keeps `theme-contract.md` and `tokens.css` together**, since the page went stale within a day of
   the token change. Or generate the token tables.
7. **Project skills** (`forge-skill`): component authoring, and regeneration.
8. **`objectives.md` measures** (C.1) and a `Shifts` row if the counts change the goals.
9. **The inbox** (`process-inbox`): file or discard the eight items; delete the merged `lib/*` branches.
10. **`packages/core/README.md`**: keep it short for consumers, or generate it from the root README's first part.
11. **Journal the six commits of 2026-10-09 and 2026-10-10** (`log-work`), and set `BRIEF-storybook-audit` to its
    real status (`transition-brief`).
12. **The widget test rule.** It asks for a test that names the widget. `BRIEF-dynamic-form-widget-coverage`
    looks at widgets in depth and may want a stricter one.

## Not checked

- Whether the reference pages other than `theme-contract.md` are still accurate line by line (sizes in
  `bundle-weight.md` and `css-delivery.md` were not re-measured).
- `native-app-components-todo.md` against the code.
- The light theme in the Storybook test run (it has no light pass), Firefox and Safari.
- `pnpm test:visual` (nothing visual changed).
- The `crux-flow` 0.2.0 plugin's own checks: the drift gates here are those of `crux` 3.25.1, as asked.
- Whether a Claude Code session in this repository lists each role agent twice.
