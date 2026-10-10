# docs/omni-ui-components

_Last updated: 2026-10-10_

## Research (0 sources, 4 synthesis pages)

### References (4)
- [[research/references/theme-contract]] — every `--oui-*` token, per-subtree theming, the see-through contract — sources: 0
- [[research/references/css-delivery]] — the stylesheet inside a host with its own CSS — sources: 0
- [[research/references/bundle-weight]] — what each entry point weighs — sources: 0
- [[research/references/native-app-control-variations]] — Native App controls, message parts, chat shell: conventions and deviations — sources: 0

See [[research/index]].

## ADRs (23)

| id | title | status | date |
|---|---|---|---|
| [[adrs/ADR-0022-accessibility-is-a-gate-in-the-storybook-test-run]] | Accessibility is a gate in the Storybook test run, with an allow-list | Accepted | 2026-10-10 |
| [[adrs/ADR-0021-story-factories-and-play-functions-are-checked-by]] | Story factories and play functions are checked by the tripwire | Accepted | 2026-10-10 |
| [[adrs/ADR-0020-options-before-variants-a-variation-is-an-option-u]] | Options before variants: a variation is an option unless a true variant is cleaner | Accepted | 2026-10-10 |
| [[adrs/ADR-0019-every-form-usable-component-has-a-shallow-data-dri]] | Every form-usable component has a shallow, data-driven widget | Accepted | 2026-10-10 |
| [[adrs/ADR-0018-every-component-has-a-story-named-default]] | Every component has a story named Default | Accepted | 2026-10-10 |
| [[adrs/ADR-0017-each-command-is-a-gate-that-proves-one-stated-thin]] | Each command is a gate that proves one stated thing | Accepted | 2026-10-10 |
| [[adrs/ADR-0016-library-first-then-re-vendor-a-consuming-app-write]] | Library first, then re-vendor: a consuming app writes no custom CSS | Accepted | 2026-10-10 |
| [[adrs/ADR-0015-mandatory-parts-are-enforced-by-a-tripwire-whose-a]] | Mandatory parts are enforced by a tripwire whose allow-list cannot rot | Accepted | 2026-10-10 |
| [[adrs/ADR-0014-content-that-does-not-fit-is-reached-by-scrolling]] | Content that does not fit is reached by scrolling, on by default | Accepted | 2026-10-10 |
| [[adrs/ADR-0013-only-the-owner-publishes-to-npm]] | Only the owner publishes to npm | Accepted | 2026-10-10 |
| [[adrs/ADR-0012-visual-baselines-are-kept-per-platform-and-the-lin]] | Visual baselines are kept per platform, and the Linux ones are made in CI | Accepted | 2026-10-10 |
| [[adrs/ADR-0011-coverage-of-80-percent-on-four-measures-is-part-of]] | Coverage of 80 percent on four measures is part of the gate | Accepted | 2026-10-10 |
| [[adrs/ADR-0010-biome-is-the-one-linter-and-formatter]] | Biome is the one linter and formatter | Accepted | 2026-10-10 |
| [[adrs/ADR-0009-one-example-renderer-and-the-code-shown-is-the-cod]] | One example renderer, and the code shown is the code a consumer writes | Accepted | 2026-10-10 |
| [[adrs/ADR-0008-every-input-is-two-layers-a-primitive-and-a-field]] | Every input is two layers: a primitive and a field shell | Accepted | 2026-10-10 |
| [[adrs/ADR-0007-five-entry-points-and-the-native-entry-pulls-in-no]] | Five entry points, and the native entry pulls in no markdown or highlighting engine | Accepted | 2026-10-10 |
| [[adrs/ADR-0006-the-primary-stays-1677ff-with-a-derived-text-token]] | The primary stays #1677ff, with a derived text token and one recorded contrast exception | Accepted | 2026-10-10 |
| [[adrs/ADR-0005-wcag-aa-is-the-contrast-bar-for-tokens-in-both-the]] | WCAG AA is the contrast bar for tokens in both themes | Accepted | 2026-10-10 |
| [[adrs/ADR-0004-ship-one-stylesheet-in-one-cascade-layer]] | Ship one stylesheet in one cascade layer | Accepted | 2026-10-10 |
| [[adrs/ADR-0003-theme-per-subtree-through-data-theme-on-any-ancest]] | Theme per subtree through data-theme on any ancestor | Accepted | 2026-10-10 |
| [[adrs/ADR-0002-style-only-through-oui-tokens-declared-for-both-th]] | Style only through --oui-* tokens declared for both themes | Accepted | 2026-10-10 |
| [[adrs/ADR-0001-components-are-generic-typed-and-prop-driven-with]] | Components are generic, typed and prop-driven, with no app knowledge | Accepted | 2026-10-10 |
| [[adrs/ADR-0000-record-architecture-decisions]] | Record architectural decisions as ADRs | Accepted | 2026-10-05 |

## Briefs (5)

- [[briefs/BRIEF-native-app-showcase-open-items]] — `draft` — `updated_at: 2026-10-10`
- [[briefs/BRIEF-biome-rule-backlog]] — `draft` — `updated_at: 2026-10-10`
- [[briefs/BRIEF-bionic-docs-and-skills-audit]] — `published` — `updated_at: 2026-10-10`
- [[briefs/BRIEF-dynamic-form-widget-coverage]] — `published` — `updated_at: 2026-10-10`
- [[briefs/BRIEF-storybook-audit]] — `published` — `updated_at: 2026-10-10`

## Journal (1 month)

- [[journal/2026-10]] — 22 entries — first: 2026-10-06 — last: 2026-10-10

See [[journal/index]].

## Promptbooks (0 active, 0 archived)

See [[promptbooks/index]].

## Invariants (0)

No invariant pins yet. See [[invariants/index]]. Pins are proposed as `observed` candidates by `recover-invariants` and ratified by a human via `transition-invariant`; checks live in the `invariants/checks/` subdirectory.

## Observations (0)

No observation records yet. See [[observations/index]]. Records enter `observed` through `propose-observation` or the `transition-decision` observation terminal — both human-invoked, and no scan writes one — and a human ratifies via `transition-observation`; evidence is `path:line-range`, never a code excerpt.

## Code (regenerated: 2026-10-10)

26 pages (`fallback` extractor: shared code, entry points, dynamic-form registries). See [[code/index]].
