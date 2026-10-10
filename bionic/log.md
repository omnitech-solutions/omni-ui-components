# Operations log

_Append-only. Newest first._

## [2026-10-10] adr | ADR-0019: accept (accepted)

Every form-usable component has a shallow, data-driven widget. Decided by the owner on 2026-10-10.

## [2026-10-10] adr | ADR-0020: accept (accepted)

Options before variants: a variation is an option unless a true variant is cleaner. Decided by the owner on 2026-10-10.

## [2026-10-10] adr | ADR-0021: accept (accepted)

Story factories and play functions are checked by the tripwire. Decided by the owner on 2026-10-10.

## [2026-10-10] adr | ADR-0022: accept (accepted)

Accessibility is a gate in the Storybook test run, with an allow-list. Decided by the owner on 2026-10-10.

## [2026-10-10] audit | 0 broken / 3 drift fixed / 2 warnings

Fixed: brief back-references to ADRs (`related_adrs`), `index.md` journal and code rollups, ADR projections regenerated. Tree checked against the crux 3.25.1 templates (`init-docs` refuses a populated tree): `AGENTS.md`, `manifest.yml` keys and layout match.
Warnings: `arch` is not derived (reason in `manifest.yml`); `objectives.md` `reviewed_at` is still 2026-10-05 (rewritten on instruction, not yet read by the owner).

## [2026-10-10] journal | decision: Objectives, 22 ADRs, the inbox, a component skill and three tripwire rules

Entry in `bionic/journal/2026-10.md` at 2026-10-10T11:10-06:00. Refs: [[briefs/BRIEF-bionic-docs-and-skills-audit]] [[adrs/ADR-0015-mandatory-parts-are-enforced-by-a-tripwire-whose-a]] [[adrs/ADR-0021-story-factories-and-play-functions-are-checked-by]]

## [2026-10-10] extract | code docs regenerated: 26 pages

`extract-code-docs --config bionic/manifest.yml` wrote `bionic/code/` (26 pages, `fallback` extractor) for the first time, from the narrowed glob. `--dry-run` clean.

## [2026-10-10] schema | code extractor glob narrowed; arch left underived, with the reason

`bionic/manifest.yml`: `code.extractors.typescript.glob` is now `lib`, `lib/chat`, the entry points and the dynamic-form registries (was every `.ts` and `.tsx` under `src`: 960 pages, stories and tests included; the `fallback` extractor reads a leading comment only, so component pages were empty).
`arch` stays enabled and is not derived: the deriver cannot exclude `dist-types/`, `coverage/` or `storybook-static/` (comment in the manifest). No `schema_version` change.

## [2026-10-10] brief | BRIEF-dynamic-form-widget-coverage: draft → published

Transitioned BRIEF-dynamic-form-widget-coverage from `draft` to `published`. Body unchanged.

## [2026-10-10] brief | BRIEF-bionic-docs-and-skills-audit: draft → published

Transitioned BRIEF-bionic-docs-and-skills-audit from `draft` to `published`. Body unchanged.

## [2026-10-10] brief | BRIEF-storybook-audit: draft → published

Transitioned BRIEF-storybook-audit from `draft` to `published`. Body unchanged.

## [2026-10-10] skill | authored .agents/skills/build-a-component/

Gap: no project skill routed "add or change a component or widget" to the rules. `.agents/skills/build-a-component/SKILL.md`, linked from `.claude/skills`, `.opencode/skills/build-a-component` and `.omp/skills/build-a-component`.
Self-test: every ADR, path and README heading it names resolves; not run on a live task. Entry: `.agents/skills/forge-log.md` (2026-10-10 11:00).

## [2026-10-10] journal | misc: The library completion plan, units, prompt and handoff are archived

Entry in `bionic/journal/2026-10.md` at 2026-10-10T10:48-06:00. Refs: [[adrs/ADR-0001-components-are-generic-typed-and-prop-driven-with]]

## [2026-10-10] journal | learning: Storybook overview maintenance notes of 2026-10-06, filed from the inbox

Entry in `bionic/journal/2026-10.md` at 2026-10-10T10:46-06:00. Refs: [[briefs/BRIEF-storybook-audit]]

## [2026-10-10] journal | review: The Storybook audit, contrast to WCAG AA, and the primary that stays

Entry in `bionic/journal/2026-10.md` at 2026-10-10T10:44-06:00. Refs: [[briefs/BRIEF-storybook-audit]] [[adrs/ADR-0006-the-primary-stays-1677ff-with-a-derived-text-token]]

## [2026-10-10] journal | implementation: Splitter and TabsBar reach content that does not fit by scrolling

Entry in `bionic/journal/2026-10.md` at 2026-10-10T10:42-06:00. Refs: [[adrs/ADR-0014-content-that-does-not-fit-is-reached-by-scrolling]]

## [2026-10-10] journal | implementation: Collapse descriptions, Descriptions sizes, and a compact Typography and Empty

Entry in `bionic/journal/2026-10.md` at 2026-10-10T10:40-06:00.

## [2026-10-10] brief | scaffolded BRIEF-native-app-showcase-open-items

Native App showcase: open items against the designer boards. `bionic/briefs/BRIEF-native-app-showcase-open-items.md`, `status: draft`. Body carried from the inbox item `native-app-components-todo.md` (process-inbox, on the owner's instruction to turn inbox items into briefs).

## [2026-10-10] brief | scaffolded BRIEF-biome-rule-backlog

Biome rule backlog: the judgement rules still set to warn, and what promoting each to error takes. `bionic/briefs/BRIEF-biome-rule-backlog.md`, `status: draft`. Body carried from the inbox item `biome-backlog.md` (process-inbox, on the owner's instruction to turn inbox items into briefs).

## [2026-10-10] adr | ADR-0022: Accessibility is a gate in the Storybook test run, with an allow-list

Proposed. File `bionic/adrs/ADR-0022-accessibility-is-a-gate-in-the-storybook-test-run.md`. Tags: accessibility, storybook, gate, tripwire.

## [2026-10-10] adr | ADR-0021: Story factories and play functions are checked by the tripwire

Proposed. File `bionic/adrs/ADR-0021-story-factories-and-play-functions-are-checked-by.md`. Tags: storybook, tripwire, testing, factories.

## [2026-10-10] adr | ADR-0020: Options before variants: a variation is an option unless a true variant is cleaner

Proposed. File `bionic/adrs/ADR-0020-options-before-variants-a-variation-is-an-option-u.md`. Tags: components, widgets, api, philosophy.

## [2026-10-10] adr | ADR-0019: Every form-usable component has a shallow, data-driven widget

Proposed. File `bionic/adrs/ADR-0019-every-form-usable-component-has-a-shallow-data-dri.md`. Tags: dynamic-form, widgets, forms.

## [2026-10-10] adr | ADR-0018: accept (accepted)

Every component has a story named Default. Already in force in the code; recorded on the owner's instruction (2026-10-10).

## [2026-10-10] adr | ADR-0018: Every component has a story named Default

Proposed. File `bionic/adrs/ADR-0018-every-component-has-a-story-named-default.md`. Tags: storybook, tripwire, documentation.

## [2026-10-10] adr | ADR-0017: accept (accepted)

Each command is a gate that proves one stated thing. Already in force in the code; recorded on the owner's instruction (2026-10-10).

## [2026-10-10] adr | ADR-0017: Each command is a gate that proves one stated thing

Proposed. File `bionic/adrs/ADR-0017-each-command-is-a-gate-that-proves-one-stated-thin.md`. Tags: testing, gate, ci, process.

## [2026-10-10] adr | ADR-0016: accept (accepted)

Library first, then re-vendor: a consuming app writes no custom CSS. Already in force in the code; recorded on the owner's instruction (2026-10-10).

## [2026-10-10] adr | ADR-0016: Library first, then re-vendor: a consuming app writes no custom CSS

Proposed. File `bionic/adrs/ADR-0016-library-first-then-re-vendor-a-consuming-app-write.md`. Tags: process, consumers, delivery.

## [2026-10-10] adr | ADR-0015: accept (accepted)

Mandatory parts are enforced by a tripwire whose allow-list cannot rot. Already in force in the code; recorded on the owner's instruction (2026-10-10).

## [2026-10-10] adr | ADR-0015: Mandatory parts are enforced by a tripwire whose allow-list cannot rot

Proposed. File `bionic/adrs/ADR-0015-mandatory-parts-are-enforced-by-a-tripwire-whose-a.md`. Tags: testing, tripwire, components, process.

## [2026-10-10] adr | ADR-0014: accept (accepted)

Content that does not fit is reached by scrolling, on by default. Already in force in the code; recorded on the owner's instruction (2026-10-10).

## [2026-10-10] adr | ADR-0014: Content that does not fit is reached by scrolling, on by default

Proposed. File `bionic/adrs/ADR-0014-content-that-does-not-fit-is-reached-by-scrolling.md`. Tags: components, layout, behaviour.

## [2026-10-10] adr | ADR-0013: accept (accepted)

Only the owner publishes to npm. Already in force in the code; recorded on the owner's instruction (2026-10-10).

## [2026-10-10] adr | ADR-0013: Only the owner publishes to npm

Proposed. File `bionic/adrs/ADR-0013-only-the-owner-publishes-to-npm.md`. Tags: release, publishing, process.

## [2026-10-10] adr | ADR-0012: accept (accepted)

Visual baselines are kept per platform, and the Linux ones are made in CI. Already in force in the code; recorded on the owner's instruction (2026-10-10).

## [2026-10-10] adr | ADR-0012: Visual baselines are kept per platform, and the Linux ones are made in CI

Proposed. File `bionic/adrs/ADR-0012-visual-baselines-are-kept-per-platform-and-the-lin.md`. Tags: testing, visual-regression, ci.

## [2026-10-10] adr | ADR-0011: accept (accepted)

Coverage of 80 percent on four measures is part of the gate. Already in force in the code; recorded on the owner's instruction (2026-10-10).

## [2026-10-10] adr | ADR-0011: Coverage of 80 percent on four measures is part of the gate

Proposed. File `bionic/adrs/ADR-0011-coverage-of-80-percent-on-four-measures-is-part-of.md`. Tags: testing, coverage, gate.

## [2026-10-10] adr | ADR-0010: accept (accepted)

Biome is the one linter and formatter. Already in force in the code; recorded on the owner's instruction (2026-10-10).

## [2026-10-10] adr | ADR-0010: Biome is the one linter and formatter

Proposed. File `bionic/adrs/ADR-0010-biome-is-the-one-linter-and-formatter.md`. Tags: tooling, lint, format.

## [2026-10-10] adr | ADR-0009: accept (accepted)

One example renderer, and the code shown is the code a consumer writes. Already in force in the code; recorded on the owner's instruction (2026-10-10).

## [2026-10-10] adr | ADR-0009: One example renderer, and the code shown is the code a consumer writes

Proposed. File `bionic/adrs/ADR-0009-one-example-renderer-and-the-code-shown-is-the-cod.md`. Tags: storybook, documentation, factories.

## [2026-10-10] adr | ADR-0008: accept (accepted)

Every input is two layers: a primitive and a field shell. Already in force in the code; recorded on the owner's instruction (2026-10-10).

## [2026-10-10] adr | ADR-0008: Every input is two layers: a primitive and a field shell

Proposed. File `bionic/adrs/ADR-0008-every-input-is-two-layers-a-primitive-and-a-field.md`. Tags: components, forms, inputs.

## [2026-10-10] adr | ADR-0007: accept (accepted)

Five entry points, and the native entry pulls in no markdown or highlighting engine. Already in force in the code; recorded on the owner's instruction (2026-10-10).

## [2026-10-10] adr | ADR-0007: Five entry points, and the native entry pulls in no markdown or highlighting engine

Proposed. File `bionic/adrs/ADR-0007-five-entry-points-and-the-native-entry-pulls-in-no.md`. Tags: packaging, bundle, entry-points.

## [2026-10-10] adr | ADR-0006: accept (accepted)

The primary stays #1677ff, with a derived text token and one recorded contrast exception. Already in force in the code; recorded on the owner's instruction (2026-10-10).

## [2026-10-10] adr | ADR-0006: The primary stays #1677ff, with a derived text token and one recorded contrast exception

Proposed. File `bionic/adrs/ADR-0006-the-primary-stays-1677ff-with-a-derived-text-token.md`. Tags: accessibility, brand, tokens, contrast.

## [2026-10-10] adr | ADR-0005: accept (accepted)

WCAG AA is the contrast bar for tokens in both themes. Already in force in the code; recorded on the owner's instruction (2026-10-10).

## [2026-10-10] adr | ADR-0005: WCAG AA is the contrast bar for tokens in both themes

Proposed. File `bionic/adrs/ADR-0005-wcag-aa-is-the-contrast-bar-for-tokens-in-both-the.md`. Tags: accessibility, tokens, contrast.

## [2026-10-10] adr | ADR-0004: accept (accepted)

Ship one stylesheet in one cascade layer. Already in force in the code; recorded on the owner's instruction (2026-10-10).

## [2026-10-10] adr | ADR-0004: Ship one stylesheet in one cascade layer

Proposed. File `bionic/adrs/ADR-0004-ship-one-stylesheet-in-one-cascade-layer.md`. Tags: css, delivery, isolation.

## [2026-10-10] adr | ADR-0003: accept (accepted)

Theme per subtree through data-theme on any ancestor. Already in force in the code; recorded on the owner's instruction (2026-10-10).

## [2026-10-10] adr | ADR-0003: Theme per subtree through data-theme on any ancestor

Proposed. File `bionic/adrs/ADR-0003-theme-per-subtree-through-data-theme-on-any-ancest.md`. Tags: theming, tokens.

## [2026-10-10] adr | ADR-0002: accept (accepted)

Style only through --oui-* tokens declared for both themes. Already in force in the code; recorded on the owner's instruction (2026-10-10).

## [2026-10-10] adr | ADR-0002: Style only through --oui-* tokens declared for both themes

Proposed. File `bionic/adrs/ADR-0002-style-only-through-oui-tokens-declared-for-both-th.md`. Tags: theming, tokens, css.

## [2026-10-10] adr | ADR-0001: accept (accepted)

Components are generic, typed and prop-driven, with no app knowledge. Already in force in the code; recorded on the owner's instruction (2026-10-10).

## [2026-10-10] adr | ADR-0001: Components are generic, typed and prop-driven, with no app knowledge

Proposed. File `bionic/adrs/ADR-0001-components-are-generic-typed-and-prop-driven-with.md`. Tags: components, philosophy, api.

## [2026-10-10] brief | Bionic docs and skills audit
`bionic/briefs/BRIEF-bionic-docs-and-skills-audit.md`, `status: draft`. Written by hand in the format of its neighbours (not scaffolded by `propose-brief`).

## [2026-10-10] audit | docs and skills audit, drift gates, safe repairs
Ran every project drift gate of crux 3.25.1 with `--dry-run`. Regenerated with their own regenerators: `adrs/index.md`, `adrs/lineage.md`, `adrs/summaries/`, `adrs/doctrine/`, `adrs/reviews/index.md`, `journal/index.md`. Left drifted for the owner: `code/` (960 pages never extracted) and `arch/` (the deriver reads `coverage/` and `dist-types/`).
Hand repairs: four stale rows of `research/references/theme-contract.md`, frontmatter on `bundle-weight.md`, `research/index.md` (4 references), `index.md` (research, briefs, journal).
Findings and what needs the owner's decision: `briefs/BRIEF-bionic-docs-and-skills-audit.md`.

## [2026-10-05] init | crux bootstrap

Created `bionic/` tree at schema_version 5 (seven concerns incl. invariants, plus the arch spine (deferred to first derive/audit) and the observations concern). Detected languages: typescript. Meta-ADR seeded.
