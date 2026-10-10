---
title: Bundle weight per entry point (what a consumer of ./native, ./chat and ./highlight pays, measured by the entries test)
category: references
updated: 2026-10-07
---

# Bundle weight per entry point

Measured by `packages/core/test/Entries/entries.test.ts`, which builds the scratch consumers in `packages/core/fixtures/consumer/`
with Vite (minified, tree-shaken, production) against the built package through its `exports` map. Reproduce the numbers with
`BUNDLE_WEIGHT=1 pnpm exec vitest run --config ../../vitest.config.ts test/Entries --disable-console-intercept` from `packages/core`.
Sizes include React and ReactDOM (the consumer bundles them), so read them as deltas between rows, not as the library alone.

| Consumer | Imports | Minified | Gzip | Modules | lowlight | react-markdown |
| --- | --- | --- | --- | --- | --- | --- |
| `native.tsx` | `Button`, `Panel`, `Toolbar` from `./native` | 530,832 B | 160,712 B | 93 | no | no |
| `chat-plain.tsx` | `Transcript`, `Markdown` from `./chat` | 783,720 B | 233,905 B | 302 | no | yes |
| `chat.tsx` | `Transcript`, `Markdown`, `Composer`, `DiffReview` from `./chat` plus `highlightLines` from `./highlight` | 948,073 B | 285,000 B | 344 | yes | yes |
| `highlight.ts` | `createHighlighter` from `./highlight` | 164,909 B | 51,913 B | 45 | yes | no |

## Reading

- `./native` pulls none of `lowlight`, `highlight.js`, `react-markdown`, `remark-gfm` or `diff`: the test asserts it.
- `./chat` carries the markdown renderer but not the highlighter: highlighting stays opt-in (`Markdown`/`DiffReview` take a
  `highlight` function), so a chat consumer that does not highlight never pays for the grammars. Importing `./highlight` adds about 51 kB gzip.
- The lowlight `common` grammar set is still created on first call (`createLowlight(common)` inside `highlight.ts`), not at import.
- The `.` entry keeps re-exporting everything, so importing from it still reaches all of these.

## Open

- `./native` is still about 160 kB gzip with React included; the remaining weight is Radix, `lucide-react` icons used by the shared
  controls and `class-variance-authority`/`tailwind-merge`. Not investigated further here.
- `lowlight`, `react-markdown`, `remark-gfm` and `diff` stay in `dependencies` (the entries still need them); moving them to
  optional peers is a separate decision for the owner.
