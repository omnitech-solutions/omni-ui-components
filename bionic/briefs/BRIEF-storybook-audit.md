---
title: "Storybook audit: one example renderer, a table of contents that stays, and overview pages that load"
slug: storybook-audit
type: brief
status: draft
created_at: 2026-10-09
updated_at: 2026-10-09
authors: ["claude"]
tags: [storybook, docs, performance, accessibility]
related_adrs: []
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

## Not checked

- Light theme (one dark capture per entry, as asked).
- A production build (`storybook build`): bundle and chunk sizes there are not measured; all numbers are the dev server.
- Firefox and Safari.
- Interactive states beyond load (opening every menu, every control in the Controls panel).
- This brief is not yet listed in `bionic/index.md` or `bionic/log.md` (the audit was limited to this file, the script and one `.gitignore` line).
