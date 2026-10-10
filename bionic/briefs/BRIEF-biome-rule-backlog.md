---
title: "Biome rule backlog: the judgement rules still set to warn, and what promoting each to error takes"
slug: biome-rule-backlog
type: brief
status: draft
created_at: 2026-10-10
updated_at: 2026-10-10
authors: ["claude"]
tags: [tooling, biome, lint, backlog]
related_adrs: [ADR-0010]
---

# Biome rule backlog: the judgement rules still set to warn, and what promoting each to error takes

Filed from the inbox on 2026-10-10 (`inbox/biome-backlog.md`, written at the commit that added the Biome
tooling, before the tree was reformatted). It is the backlog that ADR-0010 and `CONTRIBUTING.md` point to.

**The counts below are those of that commit and are stale.** At `f208942` (2026-10-10) `pnpm check` reported 189
warnings and 21 infos, and 15 rules were still `warn` in `biome.json`. The rule list and the method are still
right: fix a rule's findings, then delete its `warn` entry. Re-count with the command below before planning work.
The open question this brief leaves: in which order to promote the rules, and whether any should stay `warn`.

Source: `pnpm exec biome lint . --max-diagnostics=none --reporter=json` on the unformatted tree.
Totals: 0 errors, 479 warnings, 22 infos.

## A. Judgement rules downgraded to warn in biome.json (promote to error)

These raised errors under the recommended preset and are set to `warn` in `biome.json` so `pnpm lint` exits 0. After fixing a rule's findings, delete its `warn` entry (or set `error`) in `linter.rules`. Counts are in non-test, non-story source only because overrides turn the rules off elsewhere.

| Rule | Findings |
|---|---|
| correctness/useExhaustiveDependencies | 47 |
| a11y/useSemanticElements | 22 |
| suspicious/noArrayIndexKey | 22 |
| a11y/useAriaPropsSupportedByRole | 13 |
| correctness/useHookAtTopLevel | 6 |
| suspicious/useIterableCallbackReturn | 4 |
| a11y/noStaticElementInteractions | 4 |
| a11y/useKeyWithClickEvents | 4 |
| a11y/noAriaHiddenOnFocusable | 4 |
| a11y/noNoninteractiveTabindex | 3 |
| a11y/noAmbiguousAnchorText | 2 |
| suspicious/noShadowRestrictedNames | 2 |
| a11y/noAutofocus | 2 |
| a11y/useValidAriaRole | 1 |
| a11y/useFocusableInteractive | 1 |
| **total** | **137** |

## B. Warnings and infos from preset defaults (no config downgrade)

`noUnusedImports` and `useImportType` are mechanical: `scripts/land-biome-c2.sh` fixes them in C2. The rest are small judgement fixes.

| Rule | Severity | Findings |
|---|---|---|
| style/useImportType | warning | 152 |
| correctness/noUnusedImports | warning | 136 |
| suspicious/noExplicitAny | warning | 23 |
| style/noNonNullAssertion | warning | 19 |
| a11y/noNoninteractiveElementInteractions | info | 10 |
| complexity/useLiteralKeys | info | 5 |
| complexity/noUselessFragments | info | 4 |
| complexity/useOptionalChain | warning | 4 |
| style/useTemplate | info | 3 |
| suspicious/noConfusingVoidType | warning | 3 |
| suspicious/noPrototypeBuiltins | warning | 3 |
| correctness/noUnusedFunctionParameters | warning | 2 |

## Intentionally relaxed (overrides, not backlog)

- Stories, factories, tests, visual tests: noNonNullAssertion, noExplicitAny, noArrayIndexKey, useIterableCallbackReturn, noAssignInExpressions, noCommaOperator, useLiteralKeys, useExhaustiveDependencies, useHookAtTopLevel and the a11y rules that fire on demo markup (useButtonType, useSemanticElements, noStaticElementInteractions, useKeyWithClickEvents, noLabelWithoutControl, noSvgWithoutTitle, noNoninteractiveTabindex, noNoninteractiveElementInteractions, useAriaPropsSupportedByRole, useValidAnchor, noAutofocus).
- `.storybook/**`: the same, plus security/noDangerouslySetInnerHtml.
- CSS: noImportantStyles and noDescendingSpecificity off (owner decision); CSS is not formatted.
