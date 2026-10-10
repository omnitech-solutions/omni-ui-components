---
title: "Storybook audit: one example renderer, a table of contents that stays, and overview pages that load"
slug: storybook-audit
type: brief
status: published
created_at: 2026-10-09
updated_at: 2026-10-10
authors: ["claude"]
tags: [storybook, docs, performance, accessibility]
related_adrs: [ADR-0005, ADR-0006, ADR-0009, ADR-0022]
---

# Storybook audit (phase 1 of 2: findings only, no source changed)

Storybook 10.5.0 (`storybook`, `@storybook/react-vite`, `addon-docs`, `addon-a11y`, `addon-themes`), Vite 8.1.4, React 18.3.
Audited against the owner's running dev server on `http://localhost:6006`, 2026-10-09.
Serves OBJ-3 (the a11y check that is meant to catch regressions currently fails on 442 stories) and OBJ-4 (examples
a consumer copies must be real code).

Evidence lives in `storybook-audit/` (gitignored). Re-create it with `node scripts/storybook-inventory.mjs` (see section F).

| File | What |
|---|---|
| `storybook-audit/inventory.json` | all 1,021 entries with measurements |
| `storybook-audit/desktop/<id>.png` | one 1280x900 dark capture per entry (1,021) |
| `storybook-audit/narrow/<id>.png` | 400 px capture: the sample, plus every entry that overflows (436) |
| `storybook-audit/full/<id>.png` | full-page capture of both overview pages |
| `storybook-audit/manager/<id>.png`, `manager.json` | manager UI (sidebar, toolbar, panel) for the four pages the owner named |
| `storybook-audit/detail/*.png` | close-ups: code bar closed and open, docs page at 1280/1140/400, table of contents proof |
| `storybook-audit/sources.json` | the code behind "Show code" for all 825 docs blocks on 162 docs pages |
| `storybook-audit/profile-<id>.json` | warm CPU profile of the two overview pages, Button docs, Button Ghost |
| `storybook-audit/cold-*/` | first loads against a private, freshly started server on port 6107 |

## A. Summary

Every one of the 1,021 entries loads (1,020 ok, 1 play-function failure, 0 timeouts), so nothing is broken outright,
but the presentation layer is three separate things that do not share a renderer. There are two unrelated
"Show code / Copy code" bars: a hand-made one whose buttons were never styled (they show the browser's default
`2px outset` white border because the library deliberately ships no CSS reset), and Storybook's own docs bar; 802 of
859 standalone stories have no code at all, 8 Table docs pages show both bars at once, and 241 of the 825 docs code
blocks print `<Component ... />` with React elements serialised as JSON instead of real code. The table of contents
does not stay in view because its grid cell is only as tall as the list itself, so `position: sticky` has nothing to
travel in; a one-line change makes it stick and scroll on its own. The overview pages are slow because each is ONE
story that mounts everything at once (Component Overview: 136 examples, 13,299 DOM nodes, a page 77,402 px tall),
then the a11y addon runs axe over the whole page, and because the preview loads about 38 MB in about 400 unbundled
requests on every story (all of Prism's languages and the whole of Prettier are pulled in by `.storybook/preview.tsx`).
Warm, Table Overview shows in 1.3 to 2.0 s and Component Overview in 3.6 s (9.0 s until the main thread is free);
on the first open after the server starts they took 16 to 20 s and 12.8 s on a machine under heavy load. The owner's
one minute was not reproduced. Storybook has no official way to defer inline content that is out of view; a small
in-view mount in the shared renderer is recommended.

## B. Architecture as found

### B.1 What renders "an example with its code" today: three renderers, six sources of code

| # | Renderer | File | Used by | Bar |
|---|---|---|---|---|
| R1 | `ShowCodePanel` (hand-made; Prism + Prettier at run time) | `.storybook/internal/support/ShowCodePanel.tsx`, CSS in `overview.css:81-135` | Table Overview rows (`TableOverview.stories.tsx:170`); `CodePanel` (a thin wrapper, `CodePanel.tsx`) used by Component Overview rows (`ComponentOverview.stories.tsx:535`); `ComponentWrapper` (`ComponentWrapper.tsx`, used by 14 Table story files, 57 stories); `Table/Showcase/ShowcaseShell.tsx:39` | centred bar, two default-styled buttons, plus a floating copy icon and a "Hide" footer when open |
| R2 | Storybook docs `Canvas` (via `<Primary />` and `<Stories />`) | `.storybook/internal/support/DocsPage.tsx:248` and `:334` | all 162 docs pages | grey ghost text buttons under the frame (Storybook's own `ActionBar`) |
| R3 | nothing | `.storybook/preview.tsx:101-159` (global decorator: theme, page CSS) | the 802 standalone stories that do not use `ComponentWrapper` | no code, no title, no frame |

Form stories add a fourth wrapper for the preview only (`.storybook/FormStoryShell.tsx`, `DynamicFormStoryShell.tsx`,
built by `defineFormStories.tsx` / `defineDynamicFormStories.tsx`); they show code only through R2.

The code that is shown comes from six different builders:

| # | Source of code | File | Feeds |
|---|---|---|---|
| S1 | AST slice of the original TSX (`buildSourceSnippet`, `mergeImports`) | `internal/support/sourceSnippet.ts` | both overview pages (R1) |
| S2 | `exampleDocs(factoriesRaw, 'Name')`: S1 packaged as `parameters.docs.source` | `sourceSnippet.ts:215` | R2, in 5 story files (OutlineList, Splitter, Descriptions, Collapse, CueCard) |
| S3 | prop introspection (`useDynamicSnippet`, `buildDynamicSnippet`, fixture registry) | `useDynamicSnippet.ts`, `fixtureRegistry.ts`, `tableSnippet.ts` | R1 through `ComponentWrapper` (Table stories) |
| S4 | global `docs.source.transform` (`formatArgs`) | `.storybook/preview.tsx:17-35`, `:61-72` | R2 for every story without its own source: the broken one, see H3 |
| S5 | form snippets | `.storybook/snippets/formSnippet.ts`, `dynamicFormSnippet.ts` | R2 for Form and dynamic-form stories |
| S6 | hand-written `parameters.docs.source.code` | individual stories | R2 |

### B.2 Where stories, overviews and docs diverge

- Overview page row: `Row` / `SubComponentRow` (two near-copies, one per overview file) -> preview in `.pb-overview-row-preview` -> R1 with S1.
- Docs page: `DocsPage` -> Storybook `Primary` / `Stories` -> `Canvas` -> the story through the global decorator -> R2 with S2/S4/S5/S6.
- Standalone story: global decorator only. `#storybook-root` is forced to `display: flex; justify-content: center; align-items: flex-start; padding: 3rem 2rem` with `!important` (`preview.tsx:117-121`), whatever `parameters.layout` says. No code.
- Table stories: `ComponentWrapper` puts R1 inside the story itself, so the docs page shows R1 and R2 for the same example (8 docs pages, for example `omni-ui-components-table-column--docs`: 8 + 8 bars), and R2 there prints `<Component\n\n/>`.

So "one component renderer" is not true today. The same example is drawn by three paths and its code built six ways.

### B.3 Other shared pieces

- `TableOfContents.tsx`: `<nav className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">` inside `<aside>`; active item by `IntersectionObserver`.
- `overview.css`: layout grid (`.pb-overview-layout`), rows, the code panel.
- `DocsPage.tsx`: hero pill, "Preview" (`<Primary />`), hand-made API table, "Playground" (`<Controls />`), "Variants" (`<Stories includePrimary={false} />`).
- `preview.tsx` imports `DocsPage` from the barrel `./internal/support`, which re-exports `ShowCodePanel` and `SignatureCode`; that one import puts `react-syntax-highlighter` (full Prism build) and three Prettier bundles into every preview iframe (section C.3).
- The library ships no CSS reset on purpose (`packages/core/src/styles/tailwind.css:13-25`: preflight is scoped to `[data-slot]` elements). Storybook chrome written with plain `<button>` or relying on `box-sizing: border-box` therefore gets browser defaults. This is the cause of H1 and H5.

## C. Performance

All timings are iframe loads (`/iframe.html?id=...`), Chromium headless, 1280x900. The machine has 16 cores and was
busy with other work during the audit (one-minute load average between 11 and 80). The first 825 entries of the
inventory ran before that was noticed and are consistent (median 538 ms to content, 1,155 ms settled); the 196
entries re-run later carry a `loadAverage` field and are slower for that reason alone.

### C.1 Measurements

| Page | State | Content | Settled (main thread free) | Requests | Decoded | Long tasks | DOM nodes |
|---|---|---|---|---|---|---|---|
| Table Overview | warm server | 1.3 to 2.0 s | 2.7 to 3.7 s | 531 | 42 MB | 1.3 to 2.0 s | 2,819 |
| Table Overview | first load after server start, deps cached, manager UI, load 52 | 20.5 s | n/a | | | | |
| Table Overview | first load, empty dependency cache, load 45 | 16.3 s | 19.6 s | 528 | 41 MB | 3.2 s | |
| Component Overview | warm server | 3.6 to 3.9 s | 9.0 to 11.6 s | 1,223 | 65 MB | 6.6 to 9.1 s (longest 2.9 s) | 13,299 |
| Component Overview | first load after server start, deps cached, load 49 | 12.8 s | 17.8 s | 1,220 | 65 MB | 6.0 s | |
| Button / Ghost (any small story) | warm | 0.4 to 0.7 s | 1.0 to 1.3 s | 406 | 38.6 MB | 0.2 s | 137 |
| Button docs (23 stories) | warm | 0.5 to 0.8 s | 0.9 to 1.2 s | 410 | 39 MB | 0.3 s | 1,588 |
| dynamic-form widget story | warm | 1.0 s | 1.6 s | 1,022 | 62 MB | 0.2 s | about 170 |

In the manager UI the warm numbers are the same (Table Overview content at 1.5 s, Component Overview at 2.5 s):
the manager adds nothing measurable. No iframes are used per row; both overviews are a single story.

### C.2 Root cause of the slow overview pages

1. Everything is mounted at once. Component Overview renders 136 live examples in one pass: 13,299 DOM nodes,
   1,248 SVGs, 94 inputs, 13 textareas, 5 Tiptap editors, 7 tables, 136 code panels, a document 77,402 px tall.
   Table Overview renders 32 rows with 42 live tables (21,947 px). Nothing is deferred or virtualised.
2. The a11y addon then runs axe over the whole page (`parameters.a11y.test: 'error'`, `preview.tsx:81`). Warm CPU
   profile of Component Overview (`profile-getting-started-component-overview--component-overview.json`): 7.1 s
   busy, of which axe-core 3.1 s, native (style, layout, GC) 3.6 s, preview runtime 0.6 s (mostly serialising the
   a11y result to the manager: 1,050 contrast nodes), `Transcript.tsx` `scrollParentOf` 0.37 s,
   `Input/MultilineField.tsx` 0.2 s, Prettier 0.47 s, React 0.2 s. For Table Overview axe is 0.9 s of 2.3 s busy.
3. Every code panel formats its snippet with Prettier on mount, closed or not (`ShowCodePanel.tsx:49-67`): 136
   Prettier runs with the TypeScript parser on Component Overview. Syntax highlighting itself is not eager (it
   renders only when a panel is open; 0 highlighted blocks at load). The snippet text is rebuilt for every row on
   every render (`codeFromVariants(row)` called inside `ComponentOverviewPage`'s render, `ComponentOverview.stories.tsx:551`, not memoised).
4. The module graph is large and unbundled in dev. Component Overview imports every component and, through
   `import.meta.glob('.../*.factories.{ts,tsx}', { query: '?raw', eager: true })` (`ComponentOverview.stories.tsx:10-14`),
   the raw text of all 123 factories files plus its own source: 1,223 requests, 65 MB. A change to any factories
   file invalidates the page. On the first open after `pnpm storybook` Vite transforms all of that on demand,
   which is the 13 to 20 s case.
5. The preview's base cost is paid by every story (section C.3).

No play function runs on either overview page. No per-row iframe. Data is small (the 10,000-row table is virtualised).

The owner's "about a minute" was not reproduced: the worst measured was 20.5 s. It is the first-load path (items 4
and 5) made worse by a loaded machine; every CPU-bound part above scales with load.

### C.3 Base cost of every story: 406 requests, 38.6 MB

Largest dependencies of a single Button story (`omni-ui-components-button--ghost`):

| Dependency | Decoded | Why it is there |
|---|---|---|
| `storybook_internal_preview_runtime.js` | 4.7 MB | Storybook |
| `lucide-react` (whole icon set) | 4.0 MB + 0.7 MB | the library's `Icon` / `icons` export |
| `axe-core.js` | 3.8 MB | a11y addon |
| `react-syntax-highlighter.js` (full Prism) + about 300 language chunks (`zig`, `wren`, `vhdl`, ...) | 3.8 MB + several MB | `preview.tsx` -> `./internal/support` barrel -> `ShowCodePanel`, `SignatureCode` |
| `components-*.js`, `blocks-*.js` | 3.4 MB + 1.1 MB | addon-docs |
| `prettier_plugins_typescript.js`, `prettier_plugins_estree.js`, `prettier_standalone.js` | 2.9 + 0.8 + 0.3 MB | `ShowCodePanel` and `sourceSnippet.ts` |
| `react-syntax-highlighter/dist/esm/styles/prism` (all themes) | 0.6 MB | `oneDark` import |

322 of the 348 dependency requests are small hashed chunks, almost all Prism languages. The code tooling
(Prism + Prettier) is about 8.5 MB plus about 300 requests on every story, used only when a code panel is opened.

### C.4 Slowest 20 (settled time, entries measured before the machine was loaded)

| Settled ms | Content ms | Entry |
|---|---|---|
| 9,037 | 3,570 | `getting-started-component-overview--component-overview` (profile run) |
| 2,854 | 1,477 | `getting-started-table-overview--overview` |
| 2,661 | 537 | `omni-ui-components-toast--interactive` |
| 2,484 | 1,249 | `omni-ui-components-actionmenu--docs` |
| 2,328 | 447 | `omni-ui-components-attachment--uploads` |
| 2,268 | 1,316 | `omni-ui-components-form--validation-errors` |
| 2,166 | 1,322 | `omni-ui-components-form--read-only` |
| 2,165 | 553 | `omni-ui-components-actionmenu--answer-style-select` |
| 2,072 | 1,240 | `omni-ui-components-form--kitchen-sink` |
| 2,013 | 959 | `omni-ui-components-form--docs` |
| 1,971 | 1,103 | `omni-ui-components-form--prefilled` |
| 1,971 | 593 | `omni-ui-components-transcript--conversation-editing` |
| 1,970 | 924 | `omni-ui-components-transcript--conversation-long-history` |
| 1,963 | 1,020 | `omni-ui-components-form--api-error` |
| 1,948 | 1,051 | `omni-ui-components-transcript--conversation-load-earlier` |
| 1,936 | 1,306 | `omni-ui-components-showcase-newexpense--default` |
| 1,915 | 573 | `omni-ui-components-statusclock--live` |
| 1,897 | 1,027 | `omni-ui-components-form--disabled` |
| 1,891 | 532 | `omni-ui-components-statusclock--paused` |
| 1,866 | 998 | `omni-ui-components-form--async-submit` |

Only the two overview pages are slow in a way a user notices. The 143 dynamic-form entries were measured under load
(2 to 12 s) and should be re-measured; unloaded, one of them took 1.0 s. They do request 1,022 modules each,
2.5 times a normal story, because `dynamic-form` imports the whole library.

## D. Deferred rendering: what Storybook 10.5 offers, and the recommendation

What exists (checked in the installed `@storybook/addon-docs@10.5.0/dist/blocks.js` and the Story block documentation):

| Mechanism | What it does | Fits? |
|---|---|---|
| Inline docs stories (default for React, `parameters.docs.story.inline: true`) | `InlineStory` calls `renderStoryToElement` in an effect for every story as soon as the page mounts. The docs say "all stories render simultaneously in docs entries". No intersection observer, no virtualisation. | no deferral |
| `parameters.docs.story.inline: false` (+ `docs.story.height`) | each story in an `<iframe loading="lazy">`: the browser's native lazy loading is the only out-of-view deferral Storybook has | No. Each iframe boots the whole preview (406 requests, 38.6 MB in dev), controls on the docs page stop updating the story, heights are fixed. And it does nothing for the overview pages, which are single stories. |
| `parameters.docs.story.autoplay` | play functions do not run on docs pages unless asked | already the default; keep it |
| Autodocs options (`tags: ['!autodocs']`, `docs.page`, `<Stories includePrimary>`) | choose which stories a docs page lists | reduces, does not defer |
| `React.lazy` / `Suspense` (in MDX or stories) | splits code; the chunk still loads as soon as the element renders | not visibility-based on its own |
| `storybook/internal/components` `content-visibility`, manager `IntersectionObserver` | manager sidebar internals | not for story content |
| Addons | none official for viewport-deferred rendering | none |

Recommendation: build one small in-view mount, about 40 lines, inside the shared example renderer (section F,
step 2), and use it on the overview pages first.

- A row always renders its heading, its anchor `id` and a placeholder with a reserved height (so the table of
  contents and deep links keep working); the live preview mounts when the row comes within about one viewport
  (`IntersectionObserver`, `rootMargin: '100% 0px'`) and stays mounted afterwards.
- The code panel body (highlighter, Prettier, the snippet text) loads on first open through a dynamic `import()`,
  which also removes about 8.5 MB and 300 requests from every story.
- Turn the a11y run off for the two overview pages (`parameters.a11y: { test: 'off' }`): every component is
  already checked in its own stories, and axe over the whole page is the largest single cost.
- Add `content-visibility: auto` with `contain-intrinsic-size` on rows as a free complement (skips layout and
  paint off screen; it does not avoid the React mount, which is why it is not enough alone).

Reasons: it is the only option that removes the dominant cost (mounting 136 examples and running axe over them);
it needs no new dependency (rule: no speculative libraries); it lives in the one renderer the owner asked for, so
docs pages can opt in later with the same prop; and it does not change how single stories or docs controls work.
Row virtualisation (unmounting rows that leave the view) is not recommended: examples hold state, heights vary
from 80 px to 900 px, and anchors need stable positions.

## E. Issues

Severity: blocker = unusable; high = the owner's reported problems and wrong content; medium = visible defect; low = polish.

| Id | Sev | Where | What is wrong | Evidence | Proposed fix | Size |
|---|---|---|---|---|---|---|
| H1 | high | `overview.css:97-105`, `ShowCodePanel.tsx:86-126`; both overview pages, 57 Table stories, 4 showcases | "Show code" / "Copy code" are unstyled `<button>`s: computed `border: 2px outset #fff`, `background: rgb(107,107,107)` (browser defaults, because the library ships no reset). They float centred in a full-width bordered bar. When open there are three copy/hide controls: the bar, a floating copy icon, and a "Hide" footer. The bar is a `div role="button"` containing buttons (axe `nested-interactive`, 144 nodes on Component Overview). | `detail/*--showcode-closed.png`, `detail/*--showcode-open.png`, `manager/getting-started-component-overview--component-overview.png` | Replace with one `CodeDisclosure` built from the library's own `Button` (ghost, small) left-aligned under the preview; one copy control; no `role="button"` wrapper. | M |
| H2 | high | all 162 docs pages (`DocsPage.tsx:244-249`, `:330-335`) | Second design: Storybook's grey ghost text buttons (12 px, bold, `rgb(149,153,157)`). Under the primary preview there are 65 px of empty card (Storybook's 40 px bottom margin on `.sbdocs-preview` plus the card padding), and 25 px of block margin between the "PREVIEW" label and the frame. | `manager/omni-ui-components-button--docs.png`, `detail/button-docs@1280.png`; `gapBelowActions: 65` | Render docs examples through the shared renderer (`<Canvas sourceState="none">` or `<Story>` plus `CodeDisclosure` fed by `useSourceProps`), zero the block margins inside the card. | M |
| H3 | high | `.storybook/preview.tsx:17-35`, `:61-72`; 66 docs pages | Docs code does not match what is rendered. Of 825 code blocks: 241 start with `<Component` (the name is not resolved for `forwardRef` components), 232 contain a React element serialised as JSON (`icon={{ "type": {}, "key": null, ... }}`), 50 print `children="..."` as an attribute, 464 contain `={() => {}}`, 100 are a bare `<Name />`. Example, Button "Destructive": `<Component children="Delete" variant="destructive" buttonSize="default" icon={{"type": {}, ...}} onClick={() => {}} />`. Only 159 blocks on 41 pages show real example code. | `sources.json`, `detail/button-docs-code-open.png` | Delete the global `source.transform` and `formatArgs`; let Storybook's React source (`type: 'auto'`) print the JSX, and move multi-part examples to `exampleDocs`. Verify with `--sources`: all five counters 0. | S to remove, M to backfill |
| H4 | high | `overview.css:14`, `TableOfContents.tsx:48`; both overview pages | The table of contents scrolls away. `.pb-overview-layout { align-items: start }` makes the `<aside>` exactly as tall as the nav (852 px), so the sticky nav has no room to travel: at `scrollY 5000` its top is at -4936. With `align-self: stretch` on the aside it stays at top 24 px and scrolls on its own (list height 5,878 px in an 852 px box). | `detail/*--toc-with-stretch-proof.png`; `tocWhenScrolled` / `tocWithStretch` in the audit output | Remove `align-items: start` (or `align-self: stretch` on the aside). Then keep the active item in view inside the nav (`scrollIntoView({ block: 'nearest' })` on change). | S |
| H5 | high | `DocsPage.tsx:189`; all 162 docs pages | Docs pages are wider than the window below about 1,216 px: the wrapper is `w-full ... px-6 md:px-8` with the browser's `content-box`, so sections are 100% wide and start 32 px in. At 1,140 px (the iframe width in a 1,440 px manager) the page is 1,204 px wide and the right edge of every card is cut off; at 400 px it is 641 px wide. | `manager/omni-ui-components-button--docs.png` (right edge), `detail/button-docs@1140.png`, `narrow/*--docs.png`; flag `overflow-narrow` on 162/162 docs | `box-sizing: border-box` on the docs wrapper and its sections (the reset is not global by design), and let the API table scroll inside its own box. | S |
| H6 | high | Component Overview, Table Overview | Slow: section C. | profiles, `cold-*` | Section F steps 2 to 4. | L |
| H7 | high | `preview.tsx:117-121`; 802 stories | Standalone stories: no code, no title, no frame; the root is a flex row, so block components shrink to their content (177 stories are under 200 px wide, for example Collapse "Default" is 118 px) and everything sits at the top with 48 px padding. `parameters.layout` is ignored: 553 stories are `fullscreen` (the global default), 283 `padded`, 23 `centered`, and all are laid out identically. | `desktop/omni-ui-components-collapse--default.png`, `manager/omni-ui-components-button--ghost.png`; `contentRect` in `inventory.json` | Global decorator renders the shared frame in `viewMode === 'story'` only (never in docs, so nothing is duplicated), with the story's code; opt-out parameter for the overview pages and for stories that already frame themselves; honour `layout`. | M |
| H8 | high | `Table/*.stories.tsx` through `ComponentWrapper`; 8 docs pages | Duplicate code bars: the story's own R1 panel and the docs R2 bar, and R2 prints `<Component\n\n/>`. | `desktop/omni-ui-components-table-column--docs.png`; `showCode.custom` and `showCode.docsBlock` both non-zero | Falls out of H7: the frame is added by the decorator in story mode only; `ComponentWrapper` stops rendering a panel and hands its snippet to `parameters`. | M |
| M1 | medium | Component Overview | The page opens scrolled to the bottom (`scrollY 68,391`). Three examples move the document on mount: `CommandPopover` (`CommandPopover.tsx:107`, `scrollIntoView` twice), `Tabs` (`Tabs.tsx:23`, `scrollIntoView`), and the ConversationHeader "Renaming" example, which focuses its input without `preventScroll`. | traced by patching `focus` / `scrollIntoView`; `manager/getting-started-component-overview--component-overview.png` | Library: scroll the list box, not the document (`scrollIntoView` only when the component, not the page, is the scroller), and `focus({ preventScroll: true })` for the rename field; in-view mounting also hides it. | S |
| M2 | medium | 442 of 859 stories | a11y addon violations, with `test: 'error'` set: `color-contrast` 389 stories (2,905 nodes), `nested-interactive` 67, `aria-allowed-attr` 32 (critical), `aria-input-field-name` 29, `aria-allowed-role` 23, `label` 22 (critical), `button-name` 11 (critical), `scrollable-region-focusable` 11, `landmark-unique` 9, `empty-table-header` 7, `label-title-only` 6, others 16. | `inventory.json` field `a11y`; `pnpm test:storybook` would fail on these | Separate piece of work: triage contrast first (one or two tokens are likely behind most of the 389), then the critical rules. Not part of the presentation fix. | L |
| M3 | medium | `omni-ui-components-outlinelist--custom-labels` | Play function fails: `Unable to find an element with the text: 3 min · läuft` (`OutlineList.stories.tsx:136`; the text is split across elements). The only failing entry of 1,021. | `inventory.json` `channelErrors` | Match with a function or assert on the row's accessible name. | S |
| M4 | medium | 252 stories at 400 px | Horizontal page overflow: 110 form stories (`FormStoryShell.tsx:71`, a `max-w-2xl p-8` card that is `content-box`), 50 Table stories (expected to scroll, but the page scrolls, not the table box), 23 `div.p-6` wrappers, 11 fixed `w-[520px]` wrappers. | `narrow/<id>.png`, `narrowWidest` in `inventory.json` | `box-sizing` and `min-width: 0` in the shared frame; `overflow-x: auto` on the frame's preview box. | M |
| M5 | medium | both overview pages below 900 px | The table of contents is removed (`overview.css:166-173`), leaving no navigation on a page 77,000 px tall. | `narrow/getting-started-component-overview--component-overview.png` | A collapsed "Contents" disclosure at the top at narrow widths. | S |
| M6 | medium | `preview.tsx:4` and the `internal/support` barrel | Prism (all languages) and Prettier load on every story: about 8.5 MB and about 300 requests (section C.3). | dependency breakdown in C.3 | Import `DocsPage` from its own file; `PrismLight` with `tsx` only; dynamic `import()` for highlighter and formatter on first open; format snippets when built, not in the browser. | M |
| M7 | medium | 22 titles | No docs page (no `autodocs` tag): BackTop, Breadcrumb, Calendar, Cascader, ConfigProvider, Icon, Masonry, Message, Notification, Theming, Upload, Util, Table/API, Table/Extendable, Table/Virtualization, four Table/Showcase pages, dynamic-form HiddenWidget, and the two overview pages (intended). | `index.json` | Add `tags: ['autodocs']` where a docs page is wanted. | S |
| M8 | medium | `omni-ui-components-input--docs`, `omni-ui-components-transcript--docs` | React error "The tag `<primary>` is unrecognized": description markup (`<primary>...</primary>`) reaches the DOM as an element somewhere on these two pages; the place was not traced. | `consoleErrors` in `inventory.json` | Find where the raw description is printed (story-level descriptions under "Variants" are the likely place) and run it through `renderCodeAwareText`. | S |
| L1 | low | Table Overview | The table of contents highlights "2.8 Editable" on load instead of the first item. | `detail/getting-started-table-overview--overview--top.png` | Pick the first item whose top is at or above the reading line instead of the first intersecting entry. | S |
| L2 | low | Anchor stories and docs, Component Overview | In-page links to ids that do not exist (`#overview`, `#details`, `#activity`, `#summary`, `#owners`, `#billing`, `#audit`, `#docs`): the Anchor examples have no targets. | `brokenAnchors` in `inventory.json` | Give the examples target sections or mark the links as demo. The overview's own 136 and 38 table-of-contents links all resolve. | S |
| L3 | low | 16 stories | Nothing visible in the story root: portal-only (BackTop, Toast "Default", 5 SettingsDialog, ModelsSettings "In settings dialog", ActionMenu "Answer style short window") or naturally empty at rest (Breadcrumb "Default", Divider "Default", QRCode x2, QueuedList "Empty", Skeleton x2). | flag `blank`; check `desktop/<id>.png` | Review each: a frame with a title would make the intended emptiness obvious; Breadcrumb, QRCode and Skeleton deserve a look. | S |
| L4 | low | 9 entries (RichText, RichTextWidget, Component Overview) | Console warning `[tiptap warn]: Duplicate extension names found: ['underline']`. | `consoleWarnings` | Remove the extra Underline extension (StarterKit 3 includes it). | S |
| L5 | low | `preview.tsx:84-90` | `storySort` lists "Dynamic Form Overview" and "Design Tokens", which do not exist. | `index.json` | Remove or add the pages. | S |
| L6 | low | `ComponentOverview.stories.tsx`, `TableOverview.stories.tsx` | `Row` and `SubComponentRow` are two copies of the same row; `ComponentWrapper` forces `minWidth: 600` (`:157`), which overflows at narrow widths. | source | Fold into the shared frame. | S |
| L7 | low | `omni-ui-components-statusclock--with-dev-build-tag` | Console warning "Accessing the Story Store is deprecated". | `consoleWarnings` | Find the caller. | S |
| L8 | low | `omni-ui-components-upload--default` | Wider than a 1,280 px window. | flag `overflow-desktop` | Constrain the example. | S |

No entry failed a network request, and no docs page lacks its code toggle (825 toggles, 0 "No code available").

## F. Proposed order of work

Re-measure after each step with:

```sh
node scripts/storybook-inventory.mjs --only getting-started-table-overview--overview,getting-started-component-overview--component-overview,omni-ui-components-button--docs,omni-ui-components-button--ghost
node scripts/storybook-inventory.mjs --profile getting-started-table-overview--overview,getting-started-component-overview--component-overview
node scripts/storybook-inventory.mjs --sources      # docs code
node scripts/storybook-inventory.mjs                # everything, about 11 minutes at 4 at a time
```

Compare timings only when the `loadAverage` recorded in `inventory.json` is below about 8.

1. Quick, independent fixes (H4, H5, M1, M3, L1, L5). Done when: on both overview pages the nav's top stays at
   24 px at any scroll position and scrolls on its own (`sticky` entry in `inventory.json`: nav `rect` y equals 24
   after scrolling; add an assertion or check by hand); `overflow-narrow` is absent from all 162 docs entries and
   `detail`-style capture at 1,140 px shows the right edge; Component Overview opens at `scrollY 0`;
   `omni-ui-components-outlinelist--custom-labels` is `ok`.
2. One renderer. A single `ExampleFrame` (preview box + optional title and description + `CodeDisclosure`) in
   `.storybook/internal/support/`, built from library parts (`Button`, `Tabs` for multi-snippet). Props: `code`
   (string, labelled map, or a function called on first open), `layout` (`centered` / `padded` / `fullscreen`),
   `defer` (mount when in view), `showCode`. Replace `ShowCodePanel`, `CodePanel`, `Row`, `SubComponentRow`,
   `ShowcaseShell` and the panel inside `ComponentWrapper`. Done when: `grep -r "pb-showcode"` finds nothing, the
   overview pages render through `ExampleFrame`, and H1's screenshots show library buttons, one copy control.
3. Overview performance (H6): `defer` on overview rows, code loaded on first open, memoised snippets, a11y off for
   the two overview stories, `content-visibility`. Targets, warm, unloaded machine: Table Overview content under
   1.0 s and settled under 1.5 s; Component Overview content under 1.5 s and settled under 2.5 s, long tasks under
   500 ms, DOM nodes at load under 2,500. First load after server start under 8 s for both. Every table-of-contents
   link still lands on its row (click each: target top within 100 px of the viewport top).
4. Preview weight (M6): `DocsPage` imported directly, highlighter and formatter behind `import()`. Target: a
   Button story at under 120 requests (406 now) and under 30 MB decoded; no `zig-*.js` /
   `prettier_plugins_typescript.js` request until a code panel is opened (check `profile-*.json` `requests`).
5. Docs pages through the renderer (H2, H3, H8). `DocsPage` renders primary and variants with `ExampleFrame`;
   the global `source.transform` is removed. Done when `--sources` reports 0 for `unnamedComponent`,
   `reactElementJson`, `childrenAsAttribute` and `bareTag`; no docs entry has both `showCode.custom` and
   `showCode.docsBlock`; the gap under the bar is the card padding only.
6. Standalone stories (H7, M4). Decorator adds `ExampleFrame` when `viewMode === 'story'`; opt out with a
   parameter (for example `parameters.example = { frame: false }`) on the two overview stories and on full-page
   showcases. Done when a standalone story shows its code bar, `layout` is honoured, the docs page of the same
   component shows one bar per example, the overview pages are pixel-identical before and after, and
   `overflow-narrow` on stories drops from 252 to the tables that are meant to scroll (inside their own box).
7. Separate tracks, not blocking: accessibility (M2), missing docs pages (M7), small items (M5, M8, L2 to L8).

## G. Open questions for the owner

1. Standalone stories: should the frame (title, code bar) be on by default with an opt-out, or opt-in per
   component? The audit assumes on by default.
2. Where should the code bar sit and how should it look: left-aligned under the preview with ghost buttons
   (assumed), or inside the preview frame's top-right corner?
3. Docs code: is Storybook's automatic JSX (what the args render) acceptable as the default, with `exampleDocs`
   only for multi-part examples, or should every story show a full consumer example with its imports?
4. May the a11y run be switched off on the two overview pages only? It is the largest single cost there and the
   same components are checked in their own stories.
5. The 442 stories with a11y violations: fix now, or baseline them so new violations fail while the backlog is worked down?
6. Should the 22 titles without a docs page get one?
7. Table of contents at narrow widths: a collapsed "Contents" control, or leave it hidden?
8. The one-minute load was not reproduced (worst case 20.5 s, on a first load with the machine at load 50). Was it
   the first open after starting the server, and was the machine busy? If it recurs once warm, a Chrome performance
   trace of that load would settle it.

## Result (phase 2 of 2: the fix, 2026-10-09)

Built in the working tree on `master`, not committed. Measured against a private dev server on port 6107 with its
own `CACHE_DIR`; the owner's server on 6006 was only read. Evidence is in `storybook-audit/after/` (gitignored):
`inventory.json` (all 1,044 entries), `sources.json` (852 docs code blocks), `a11y/final/a11y-dark.json` and
`a11y-light.json` (every failing node of 862 stories in each theme), `shots/*.png` and `a11y/*.png`. The audit's
own data is kept in `storybook-audit/before/`.

### What was built

One renderer, `ExampleFrame` (`.storybook/internal/support/ExampleFrame.tsx`, with `CodeDisclosure.tsx`,
`exampleStore.ts`, `example.css`): a preview box, an optional title and description, and one code bar attached under
it at the left, made of the library's ghost `Button`s ("Show code", "Copy code"; one copy control, nothing under the
bar). It is used three ways:

- Overview pages: each row is an `ExampleFrame` with `defer` (mounted when it comes within a viewport of the window,
  behind a placeholder; the row, its anchor and its pill are in the page from the start).
- Docs pages: `DocsPage` draws the primary story and every variant in an `ExampleFrame` around Storybook's bare
  `Story` block. Storybook's `Canvas` and its bar are no longer used. Variants are deferred too.
- Story view: the preview decorator draws the frame around Storybook's root (`ExampleFrame host`): the header and
  the bar are siblings of `#storybook-root`, and the root itself becomes the preview box. Nothing is added inside
  the story's element, so play functions and the a11y run see the story alone. (A frame inside the root broke
  plays such as `queryByRole('button')` being null.) `parameters.example = { frame: false }` turns it off.

The code shown is resolved in one place (`resolveExampleCode`), first match wins: what a story registered about
itself (`ComponentWrapper`), `parameters.example.code` (`exampleDocs`, built on first open), a hand-written
`parameters.docs.source.code`, the JSX Storybook's React renderer prints from the story's args (received on the
channel in the story view and on docs pages alike), and last the example as written in the story file, reduced to
its JSX (`storySourceToExample`). The highlighter (Prism light, TSX only, class names coloured by `example.css` for
both themes) and the formatter are separate chunks loaded by `import()` on first open.

### Per issue

| Id | State | What was done |
|---|---|---|
| H1 | done | The hand-made bar is gone (`grep -r pb-showcode` finds nothing). Library ghost buttons, left-aligned, one copy control, no `role="button"` wrapper. |
| H2 | done | Docs examples go through `ExampleFrame`; no Storybook bar, no empty card space under the bar. |
| H3 | done | The global `docs.source.transform` and `formatArgs` are deleted. `--sources`: `unnamedComponent` 241 -> 0, `reactElementJson` 232 -> 0, `childrenAsAttribute` 50 -> 0, `bareTag` 100 -> 0, and no block prints a story object. 13 stories that render a demo component now show its real source through `exampleDocs`. |
| H4 | done | The aside stretches, so the sticky list travels; it scrolls on its own and keeps the active link in view. All 38 + 136 links were clicked by script: the nav's top stays at 24 px and each target lands within 16 px of the top. |
| H5 | done | `box-sizing` on the docs wrapper and sections; the API table, the controls table and the hero signature scroll or wrap in their own box. `overflow-narrow` on docs: 162 -> 2 (see Not done). |
| H6 | done | See the timing table. In-view mounting, code on first open (the 124 raw factories files and the parser are requested on first open, not with the page), a11y off on the two overview stories, `content-visibility` on rows far from the window. |
| H7 | done | Frame on by default in the story view; `layout` honoured (`padded` is now the stated default, `centered` centres, `fullscreen` has no padding and the full width). 854 of 862 stories show a code bar (57 before). Opted out: the two overview pages, the Native App showcase, Table Design Tokens, Table API, and the four Table showcases (which draw their own `ExampleFrame`). |
| H8 | done | No entry has two bars (8 before). `ComponentWrapper` draws no panel: it registers its title, description and snippet with the frame. `ShowCodePanel`, `CodePanel`, `ShowcaseShell`, `Row` and `SubComponentRow` are deleted or folded in. |
| M1 | done | Component Overview opens at `scrollY 0`. `CommandPopover` scrolls its own list, `ConversationHeader` focuses with `preventScroll`; both with tests. |
| M2 | partly | See "Accessibility". Stories with violations 442 -> 108 (dark), 102 (light). |
| M3 | done | The OutlineList play function asserts the live word and its meta line's text. 0 entries fail (1 before). |
| M4 | done | `overflow-narrow` on stories: 252 -> 1. The preview box scrolls sideways and holds what an example positions absolutely. |
| M5 | done | Below 900 px the table of contents is a sticky "Contents" control that opens the list. |
| M6 | done | A Button story: 406 -> 107 requests, 38 -> 26 MB. No Prism language or Prettier request until a code panel is opened. |
| M7 | done | The 20 titles have a docs page (the two overview pages stay without one, as intended): 182 docs entries, all load clean. Stub stories were given real examples (BackTop, Breadcrumb, Calendar, ConfigProvider, Icon, Message, Notification, Upload, HiddenWidget). |
| M8 | done | Story descriptions are drawn through `renderCodeAwareText`; the `<primary>` console error is gone (0 console errors in the inventory). |
| L1 | done | The active item is the last section at or above the reading line; the first item at the top of the page. |
| L2 | not done | The Anchor examples still link to ids that do not exist (3 entries). |
| L3 | partly | The frame's title makes an empty-at-rest story obvious; Divider "Default" now shows a rule between two lines. 14 entries still draw nothing in the root (portal-only or empty at rest). |
| L4 | done | RichText no longer adds the underline extension twice (tested). |
| L5 | done | `storySort` lists only the pages that exist. |
| L6 | done | One row component; `ComponentWrapper`'s `minWidth: 600` is gone. |
| L7 | not done | "Accessing the Story Store is deprecated" on StatusClock "With dev build tag": caller not traced. |
| L8 | done | Upload "Default" no longer widens the page (`overflow-desktop` 1 -> 0). |

### Numbers

Full inventory (`node scripts/storybook-inventory.mjs`), 4 at a time, dark theme:

| | Audit | Now |
|---|---|---|
| Entries | 1,021 | 1,044 (20 new docs pages, 3 new stories) |
| ok / error / timeout | 1,020 / 1 / 0 | 1,044 / 0 / 0 |
| Console errors, page errors | 1, 0 | 0, 0 |
| Blank root | 16 | 14 |
| Zero height | 2 | 0 |
| Wider than a 1,280 px window | 1 | 0 |
| Wider than a 400 px window: docs | 162 | 2 |
| Wider than a 400 px window: stories | 252 | 1 |
| Entries with two code bars | 8 | 0 |
| Stories with a code bar | 57 | 854 |
| Broken in-page anchors | 4 | 3 |
| Stories with a11y violations | 442 | 108 |
| Median content / settled, all entries | 572 / 1,193 ms | 344 / 962 ms (machine load 18) |
| Median requests a story | 427 | 125 |

Docs code (`--sources`): 825 blocks on 162 pages before, 852 on 182 now.

| Counter | Audit | Now |
|---|---|---|
| `unnamedComponent` | 241 | 0 |
| `reactElementJson` | 232 | 0 |
| `childrenAsAttribute` | 50 | 0 |
| `bareTag` | 100 | 0 |
| story object printed as code | 0 | 0 |
| blocks with no code or no bar | 0 | 0 |
| `={() => {}}` placeholder handler | 464 | 447 (Storybook's own print of a function prop; left) |

The four pages the owner named, warm, one at a time, load average 6.3 to 7.0 (three runs, all within 40 ms):

| Page | Content | Settled | Requests | Decoded | Long tasks | DOM nodes |
|---|---|---|---|---|---|---|
| Table Overview, audit | 1.3 to 2.0 s | 2.7 to 3.7 s | 531 | 42 MB | 1.3 to 2.0 s | 2,819 |
| Table Overview, now | 0.25 s | 0.76 s | 228 | 26 MB | 0.10 s | 1,299 |
| Component Overview, audit | 3.6 to 3.9 s | 9.0 to 11.6 s | 1,223 | 65 MB | 6.6 to 9.1 s | 13,299 |
| Component Overview, now | 0.62 to 0.65 s | 1.12 to 1.14 s | 784 | 47 MB | 0.10 s | 2,612 |
| Button docs, audit | 0.5 to 0.8 s | 0.9 to 1.2 s | 410 | 39 MB | 0.3 s | 1,588 |
| Button docs, now | 0.23 s | 0.75 s | 123 | 23 MB | 0.10 s | 726 |
| Button "Ghost", audit | 0.4 to 0.7 s | 1.0 to 1.3 s | 406 | 38.6 MB | 0.2 s | 137 |
| Button "Ghost", now | 0.21 s | 0.84 s | 107 | 26 MB | 0.16 s | 154 |

First load after a server start (dependency cache kept, load average 15): Table Overview 2.0 s, Component Overview
4.5 s (audit: 20.5 s and 12.8 s). All targets of section F are met except "DOM nodes at load under 2,500" on
Component Overview (2,612: 136 rows of header and placeholder plus the 136-link list).

### Accessibility (M2)

Measured with `node scripts/storybook-inventory.mjs --a11y --theme dark|light` (new: every failing node with the
colour pair the rule measured). The audit counted the dark theme only; light was as bad (415 stories).

| Rule (stories / nodes) | Audit, dark | Now, dark | Now, light |
|---|---|---|---|
| Stories with any violation | 442 | 107 | 102 |
| `color-contrast` | 389 / 2,905 | 51 / 81 | 43 / 112 |
| `nested-interactive` | 67 / 246 | 10 / 10 | 10 / 10 |
| `aria-allowed-attr` (critical) | 32 / 69 | 1 / 4 | 1 / 4 |
| `aria-input-field-name` | 29 / 38 | 2 / 2 | 2 / 2 |
| `aria-allowed-role` | 23 / 25 | 22 / 22 | 22 / 22 |
| `label` (critical) | 22 / 36 | 0 | 0 |
| `button-name` (critical) | 11 / 34 | 0 | 0 |
| `scrollable-region-focusable` | 11 / 18 | 10 / 10 | 10 / 10 |
| `landmark-unique` | 9 / 18 | 5 / 7 | 5 / 7 |
| `empty-table-header` | 7 / 9 | 6 / 6 | 6 / 6 |
| `label-title-only` | 6 / 9 | 0 | 0 |
| `heading-order` | 3 / 3 | 3 / 3 | 3 / 3 |
| `aria-conditional-attr` | 3 / 3 | 2 / 2 | 2 / 2 |
| `landmark-no-duplicate-banner` | 3 / 3 | 0 | 0 |
| `aria-dialog-name` | 2 / 2 | 2 / 2 | 2 / 2 |
| `aria-required-children` | 2 / 2 | 1 / 1 | 1 / 1 |
| `select-name` | 2 / 2 | 0 | 0 |
| `aria-valid-attr-value` | 1 / 1 | 1 / 1 | 1 / 1 |

No rule was disabled, on any story or globally, and `a11y.test` is still `'error'`. The only switch is the audit's
decision 4: the a11y run is off on the two overview stories.

Tokens changed (the bulk of the contrast failures; ratios are WCAG contrast, 4.5 needed for text):

| Token | Theme | Was | Now | Contrast before -> after |
|---|---|---|---|---|
| `--oui-primary` (the seed; `--color-primary` follows) | both | `#1677ff` | `#1677ff`: kept, by the owner's decision (2026-10-10). `#146ceb` was tried in `cc3eb6c` and taken back | white text on it 4.10: an accepted exception, recorded once in `.storybook/a11yAllowances.ts` and scoped to that colour pair. As text 3.93 on `#fafafa`, 4.10 on `#ffffff`, 3.26 on a dark panel: text no longer uses it, see the next row |
| `--oui-foreground-primary` (new: the primary as text) | light | `--color-primary`, `#1677ff` | 85% of `--oui-primary` over black, `#1365d9` | on `#fafafa` 3.93 -> 5.17; on `#ffffff` 4.10 -> 5.40 |
| same | dark | `--color-primary`, `#1677ff` | 70% of `--oui-primary` over white, `#5ca0ff` | on a panel `#2f2f2f` 3.26 -> 5.05; on `#1a1c1d` 4.16 -> 6.46 |
| `--color-primary-contrast` | dark | `#ffffffe0` | `#ffffff` | button text on the primary 3.52 -> 4.80 |
| `--text-muted`, `--text-muted-alt`, `--text-semi-transparent-muted` | light | `#00000073` (45%) | `#0000008c` (55%) | on `#ffffff` 3.36 -> 4.74; on `#fafafa` 3.35 -> 4.68 |
| same | dark | `#ffffff73` (45%) | `#ffffff96` (59%) | on `#1a1c1d` 4.44 -> 6.68; on a panel `#2f2f2f` 4.03 -> 5.70; on `#404040` 3.51 -> 4.78 |
| `--oui-foreground-placeholder` | both | 32% of the foreground | 62% | dark on `#1d1d1d` 2.56 -> 5.84; light on `#fafafa` 2.01 -> 4.61 |
| `--color-danger`, `--danger` (`--color-destructive` follows, now on every theme root) | light | `#ff4d4f` | `#d32f35` | as text on `#ffffff` 3.27 -> 4.97, on `#fafafa` 3.13 -> 4.76; white on it 3.27 -> 4.97 |
| same | dark | `#ff4d4f` | `#ff6b6d` | as text on a panel `#2f2f2f` 4.10 -> 4.83 |
| `--oui-panel-meta-fg` | light | `#6b7280` | `#566070` | on `#e4ebfb` 4.05 -> 5.32 |
| same | dark | `#7d8aa3` | `#a4afc6` | on `#2f2f2f` 3.84 -> 6.07; on `#374054` 2.98 -> 4.71 |
| `--oui-tone-success-solid-bg` | dark | `#2f9e55` | `#23874a` | white on it 3.42 -> 4.53 |
| `--oui-tone-danger-solid-bg` | dark | `#d8453f` | `#cf3f39` | white on it 4.34 -> 4.75 |

Before and after captures of Button, Tag, Badge, Input, Typography, a Table, CueCard, HeardLine (in the CueCard
story), OutlineList and Panel, in both themes: `storybook-audit/after/a11y/before-*.png` and `after-*.png`.

Two thirds of the failing nodes the first measurement found were not components at all but the Storybook's own
chrome (inline code in the theme's primary, quiet text in the theme's muted colour): the chrome now has its own
two colours (`--pb-chrome-muted`, `--pb-chrome-accent` in `example.css`), which read on the page and on a card.

Component defects fixed, each with a test:

- `aria-required` on an element whose role cannot carry it (Select, MultiSelect, DatePicker, ColorPicker, Slider,
  Stepper): removed; a required control is described by a hidden "Required" hint from `FieldShell`
  (`useFieldChrome({ required, requiredHint: true })`). RichText carries it on its textbox.
- No name: the Slider thumb, the InputOTP input, the TagInput input, DateTimePicker's time field and date button,
  the RichText textbox, the Rate stars, the Carousel buttons, and the dynamic-form checkbox (which had no label at
  all) and range slider.
- Contrast in a component rather than a token: TagInput and MultiSelect chips use the accent tone's text colour on
  their tint; StreamStatus's timer lost its 80% opacity.

Visual baselines: `pnpm test:visual` fails 6 of 10 (PanelsInThreeStates, Window1180, Window900, each in dark and
light; 1% to 2% of pixels, same size). These are the token changes (muted text, panel meta text, placeholder).
ToolbarStates and FooterStates still match. The baselines were NOT updated: that is the owner's decision. The
actual and diff images are in `.vitest-attachments/` (untracked).

### Not done, and what remains

- M2 remainder, by rule (dark; light is the same within a few nodes):
  - `color-contrast`, 51 stories / 81 nodes. Table rows at 50% opacity while dragged or disabled (20 nodes, 4
    stories); the Button shortcut hint at 70% opacity on a solid accent button (7); the theme's primary used as
    text on a dark surface (the dynamic-form label action link, Button "Link", Steps: 8; a single primary cannot be
    both a fill for white text and text on a dark panel, so these want `--color-primary-dark` or a text token);
    panel meta text on a selected row `#194580` (6); `--oui-tone-dim-fg` (2, dim on purpose); white on
    `bg-destructive` in dark (2); the see-through Panel stories in light, whose backdrop axe reads as the
    background (about 40 nodes, 5 stories, likely false positives that should be looked at one by one); the rest
    are singles.
  - `aria-allowed-role`, 22: the Composer textarea with `role="combobox"` in the examples that use the command
    trigger (ARIA in HTML allows no other role on a textarea). It is what the factories pass through
    `inputProps`; changing it changes what the library recommends, so it was left for a decision.
  - `nested-interactive`, 10: the DatePicker trigger holds its "Clear date" button.
  - `scrollable-region-focusable`, 10: ActionMenu's list, DataPrivacyPanel's log, the Splitter with `overflow`,
    and three examples.
  - `empty-table-header`, 6 (Table's expand and selection columns); `landmark-unique`, 5 (two DiffReviews or
    Panels with the same name on one page); `heading-order`, 3 (dynamic-form array title is an `h5`);
    `aria-conditional-attr`, 2 (Table's "select all" native checkbox with `aria-checked="mixed"`);
    `aria-dialog-name`, 2 (Tour); `aria-input-field-name`, 2; `aria-allowed-attr`, 1 story (Radix's hidden menu
    anchor in the Native App showcase); `aria-required-children`, 1; `aria-valid-attr-value`, 1.
- The "Required" hint is the English word, with no prop to translate it yet.
- dynamic-form widgets built on Select, MultiSelect, DatePicker, ColorPicker and Stepper lost the invalid
  `aria-required` and do not yet get the hint (the dynamic-form field template would have to draw it).
- H5/M4: three entries are still wider than a 400 px window: the Native App showcase docs page and one of its
  stories (a desktop window by design, 15 px over), and OutlineList docs (a long signature in the hero).
- Docs page in the light theme: the frame and code bar are right, but Storybook's own docs theme is fixed to dark
  (`docs.theme: themes.dark`), so the API table's stripes and some headings are dark-on-light there. Not part of
  this round.
- Stories whose render wraps the component in a local helper print the helper (`<Renderer …>`, `<Stage>`), which
  is what runs but not what a consumer writes: about 30 blocks (FileUpload, InputOTP, TagInput, DiffReview). They
  want `exampleDocs` like the others.
- L2, L7, and the rest of L3, as in the table.
- Checks run at the end: `pnpm verify` passes (229 test files, 2,279 tests, typecheck, Biome, build);
  `pnpm test:storybook` passes (184 files, 862 stories, every play function); `pnpm test:visual` fails 6 of 10 as
  described above.
- Not checked: Firefox and Safari, and a production `storybook build`.

### Follow-up, 2026-10-10: the primary stays `#1677ff`

The owner decided the primary colour stays `#1677ff`. Every other token change above is kept, and so is every
component fix. Built in the working tree on `master`, not committed; measured against a private server on port 6107.

What the brand blue costs, and how each case is handled:

- The primary as text (8 stories: the dynamic-form label action in 6, Button "Link", Steps "Default"; 3.93:1 on
  `#fafafa`, 4.10:1 on `#ffffff`, 3.26:1 on a dark panel, 4.16:1 on the dark page). Fixed in the library with no
  change to the brand fill: a new token, `--oui-foreground-primary`, a shade of the same hue derived from
  `--oui-primary` on each theme root (the two rows in the token table). Button `variant="link"`, Steps (current and
  finished), the dynamic-form label action and collapsible title hover, and Select's footer action use it. This also
  clears the 8 dark-theme nodes the first round left as "the theme's primary used as text on a dark surface".
  Icons, borders, rings and fills keep `--color-primary` (3:1 is what a non-text mark needs, and it has it).
- White text on the solid primary (4.10:1; 99 nodes in 82 stories, the same 82 in both themes). The colour is the
  owner's, so this is an accepted exception. It is recorded once, in `.storybook/a11yAllowances.ts`, which the
  preview hands to the a11y addon as `parameters.a11y.config.rules`: an element is left out of `color-contrast`
  only when axe itself measures its text as exactly `#ffffff` on exactly `#1677ff`. Any other pair in the same
  story is still checked. The rule is not disabled on any story or globally, and `a11y.test` is still `'error'`.

Stories with accessibility violations (`node scripts/storybook-inventory.mjs --a11y --theme dark|light`, 862 stories):

| | Dark | Light |
|---|---|---|
| With `#146ceb` (`cc3eb6c`) | 107 (`color-contrast` 51 stories / 81 nodes) | 102 (43 / 112) |
| `#1677ff` restored, nothing else | 176 (126 / 183) | 175 (125 / 219) |
| `#1677ff`, the text token and the exception | 102 (43 / 73) | 102 (43 / 112) |

Every other rule's count is unchanged. One dark run counted 103: ConfigProvider "Right To Left" was measured in
the middle of its outline button's colour transition (a different grey pair each time); alone it passed 4 runs of 4.

The 82 stories the exception covers (69 of them have no other violation; 13 still fail on another rule):
DynamicForm (Add Address, Api Error, Async Submit, Automation Text Fields, Kitchen Sink, Validation Errors);
the dynamic-form showcases NewCompany, NewContact, NewExpense, NewTimesheet; the "Validation Error" story of
CheckboxesWidget, CheckboxWidget, RadioWidget, SegmentedWidget, SelectWidget, TextareaWidget and TextWidget;
SegmentedWidget (Plain, Two Options); Badge (Default, Matrix); Button (Default, Sizes Matrix, With Leading Icon,
With Trailing Icon); Card (Default); ConfigProvider (Default, Right To Left); ConversationTranscript (Chat Reply);
DataPrivacyPanel (Activity Log, Default, Delete Needs Confirmation, Log Empty, Log Loading, Log Open, Log Scrolls,
Retention Only); DiffReview (Checklist Two Changes, Default, Every Status, Fallback When Empty, Keyboard Tabs, Long
Diff, Translated Labels); Drawer (Default); ErrorCard (Default); FeedbackPanel (Default, Two Chosen); FloatButton
(Text Button); Form (Add Address, Api Error, Async Submit, Contact, Kitchen Sink, Prefilled, Validation Errors);
IntegrationList (OAuth Accounts); Markdown (Chat Reply); Modal (Default); ModelPicker (Hosted Model, Local Only,
Menu Only, Non Reasoning Model, Open Menu, Translated Labels); Navigation/Wizard (Custom Labels, Default, Start On
Middle Step); Segmented (Default, Horizontal Sidebar, Required, Two Options); SettingsDialog (Arrow Key Tabs, Data
And Privacy Tab, Default, Two Tabs); Theming (See Through, Subtree Themes, Token Overrides); Tour (Default);
Transcript (Conversation Approval, Conversation Failed). The ids are in
`storybook-audit/after/a11y/primary-kept/covered-by-exception.json`, with the three measurements beside it.

Visual baselines, corrected. The six that differ (PanelsInThreeStates, Window1180, Window900, dark and light) were
put down to the token changes above. They are not: the diff images show no colour change at all, only the Empty
tile's block (icon, title, two-line description, button) sitting 3 to 4 px off. The cause is `4a563eb` (Empty's
compact size), before `cc3eb6c`: the title's `leading-snug` and the description's `leading-normal` were moved in
front of the text size in a `cn()` call, where tailwind-merge drops them, so a default tile's description was 16 px
a line, not 19.5 px. With the two classes put back after the text size (and a test), `pnpm test:visual` passes
10 of 10 against the committed baselines. No baseline was updated: the token changes (muted text, panel meta
text, placeholder) are under the comparator's threshold in these stories. The six actual and diff images from
before the Empty fix are in `storybook-audit/after/a11y/primary-kept/visual-before-empty-fix/`.

Checks: `pnpm verify` passes (229 test files, 2,281 tests, typecheck, Biome, build); `pnpm test:storybook` passes
(184 files, 862 stories); `pnpm test:visual` passes 10 of 10. `pnpm test:storybook` runs the stories and their play
functions but not the accessibility check (its set-up loads the preview's annotations only), so the exception and
the counts above are exercised by the story view and the inventory script, not by that command. The Linux
baselines were not run (macOS here; CI runs them).

## Not checked

- Light theme (one dark capture per entry, as asked).
- A production build (`storybook build`): bundle and chunk sizes there are not measured; all numbers are the dev server.
- Firefox and Safari.
- Interactive states beyond load (opening every menu, every control in the Controls panel).
- This brief is not yet listed in `bionic/index.md` or `bionic/log.md` (the audit was limited to this file, the script and one `.gitignore` line).
