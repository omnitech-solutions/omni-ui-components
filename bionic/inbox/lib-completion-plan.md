# omni-ui-components: completion plan (brief for a Crux dev cycle)

> **Execution moved.** To run this work, use `bionic/inbox/lib-cloud-prompt.md` and `bionic/inbox/lib-work-units.md` (self-contained,
> parallel units with a shared preamble). This file is kept as the rationale and the long-form description of each item.

Written 2026-10-06 against library `master` at `5ab7ba6` (pushed). This is the work that remains in the library
package before the Interview Studio native app and web app can adopt it, plus the quality work worth doing while
the context is fresh. A second brief covers the app side:
`omnitech-interview-answers-generator/bionic/inbox/redesign/native-ui-swap-plan.md`. Do the P0 items here first;
the app cannot start until P0-1 (a published version) exists.

Read first, in this order: `bionic/objectives.md`, `bionic/AGENTS.md`, `AGENTS.md`, then this file, then
`bionic/inbox/native-app-components-todo.md` (the workers' own open list, partly stale: see section 6) and
`bionic/research/references/native-app-control-variations.md` (what was built and why).

## 1. State today

- Package `@oc-tech/omni-ui-components`, source in `packages/core/src/<Component>/`. Published to the registry as
  `0.0.2`; **none of the work below is in a published version** (the package.json is still `0.0.2`).
- `pnpm verify` is green at `5ab7ba6`: 173 test files, 1,405 tests, lint, typecheck, build. About 12 pre-existing lint
  warnings remain (spread fallbacks, unused imports in old files); they are not new.
- Built since the start of this effort (all committed and pushed):
  - Native App set: `Button`/`IconButton` tones and control sizes, `Progress` ring, `Segmented`, `Empty` tile, `Steps`
    checklist, `Tag`, `Divider`, `ActionMenu`, `SplitButton`, `Toolbar`, `Panel` + `useFollowLatest`, `Transcript`
    (entries mode), `Highlight` (lowlight), `StatusClock`, `SessionBar`, and the showcase
    `omni-ui-components/Showcase/Native App` (boards 1a, 1c, 1d, 1e, window 1180/900).
  - Chat parts ported from `omnitech-assistant`: `Markdown`, `Sources`, `Suggestions`, `Thinking`, `StepTimeline`,
    `ErrorCard`, `ApprovalCard`, `FeedbackPanel`, `VersionPager`, `MessageActions`, `SummaryDivider`, `Transcript`
    turn mode, `Composer`, `Attachment`, `CommandPopover`, `DictationBar`, `QueuedList`, `useHoldToTalk`,
    `DiffReview`, `ModelPicker`, `ContextMeter`, `PanelShell`, `ConversationList`, `ConversationHeader`,
    `SettingsDialog`, `Toast`, `PreferencesForm`, `DataPrivacyPanel`, `IntegrationList`, `ShortcutList`,
    `EmptyStarters`, and `lib/chat/*` utilities.
- Storybook: `pnpm storybook` serves on 6006 (`/index.json` lists stories). About 950 entries.

## 2. Binding conventions (do not break these; reviewers will check)

1. **Props only.** No React context bus, no `Assistant` root component, no app/server types. Names must not contain
   `Assistant` (the demo wrapper is `ChatShell`, the layout is `PanelShell`, utils are `lib/chat/`).
2. **One folder per component**: `X.tsx`, `X.types.ts`, `X.variants.ts` (cva, when styled), `X.factories.tsx`
   (demos, props factories, lucide icons live here only), `X.stories.tsx`, `index.ts`; tests in `test/<X>/`; an
   overview row in `.storybook/getting-started/ComponentOverview.stories.tsx`; export via `src/index.ts`.
3. **Icons are `ReactNode` props.** Never an icon-name union; lucide is imported only in factories and stories.
4. **Every user-visible string goes through a `labels` prop** with exported `DEFAULT_<X>_LABELS`.
5. **Callbacks are plain optional props named `on` + Verb.** They receive the **full item by reference** first and
   extra context after (`onOpen(conversation)`, `onToggle(integration, enabled)`). Value callbacks (`onSearchChange(q)`,
   `onThemeChange(theme)`) receive the value. Never an id alone. A callback may return a promise; the component
   ignores it. **No pending state, no `onError`, no async helper** (an earlier `use-async-runner` was removed on the
   owner's instruction; do not reintroduce it).
6. **An absent callback means the control that exists for it is not rendered.** Purely informational callbacks are
   simply not called.
7. **List-like components are generic over an extendable base item type** (`X<T extends XItem = XItem>`); items pass
   through untouched. Each has a test with an extended item asserting the callback argument is `toBe` the original and
   (type-level) that the extra fields are visible.
8. **Controlled and uncontrolled state** (`open`, `value`, `selected`, tabs, search) go through
   `lib/use-controllable-state.ts` and always fire their change callback.
9. **Styling only through `--oui-*` tokens** (`styles/tokens.css`, light and dark). Backgrounds that must follow the
   see-through setting use `color-mix(... var(--oui-panel-see-through, 1) ...)` on backgrounds only, never on text.
   Respect `prefers-reduced-motion`.
10. **Storybook docs are not Markdown.** `.storybook/internal/support/DocsPage.tsx` renders descriptions through
    `renderCodeAwareText`: it understands only `` `inline code` ``, `<primary>emphasis</primary>` and `<code>signature</code>`.
    No tables, bold, italics or line breaks in `parameters.docs.description`. (The Native App page was broken by this once.)
11. **Story files must stay syntactically valid at every save.** One parse error makes Storybook's indexer cache the
    failure and every story times out until the server is restarted. Parse-check with
    `pnpm exec esbuild <file> --loader:.tsx=tsx --log-level=error` before moving on. If the index returns 200 but stories
    time out, restart Storybook.
12. **Do not delete the `Icon` re-include** in the repo `.gitignore` (`!packages/core/src/Icon/`). A common global gitignore
    entry named `Icon` (meant for a macOS file) used to hide that folder from git entirely.

## 3. How to verify (copy these habits)

- Gate: `pnpm verify` at the repo root (lint, typecheck, tests, build). Run one directory's tests with
  `cd packages/core && pnpm exec vitest run --config ../../vitest.config.ts test/<Dir>`.
- Render stories headlessly with Playwright: `waitUntil: 'domcontentloaded'` (never `networkidle`: HMR keeps it busy),
  then `waitForSelector('#storybook-root > :not(style)', { state: 'attached' })`, and add an init script
  `window.__name=function(f){return f};` (tsx injects `__name` calls that break `page.evaluate`). Wrap long runs with
  `perl -e 'alarm N; exec @ARGV'` (macOS has no `timeout`). Check 0 console errors in dark **and** light
  (`&globals=theme:dark`). iframe URL: `/iframe.html?id=<story-id>&viewMode=story`.
- **Drive interactions by hand** (click, keyboard, hover, Esc, focus) and read computed colours; do not rely on a story's
  own `play` function alone, and read focus a beat after Esc (Radix restores it asynchronously).
- Compare Native App stories against the designer boards at
  `omnitech-interview-answers-generator/e2e/live-session/.audit/out/design/boards/*.png` (regenerate with
  `design-boards.mts`, ignoring the Zoom board 1b and dropping board 1f). The gallery file and the 2x board images are
  committed in the app repo at `omnitech-interview-answers-generator/bionic/inbox/redesign/ui-components/design/`; the
  written T/M/F requirements are in `.../ui-components/native-panel-cleanup-brief.md` (all 26, verbatim) and are mapped to
  phases and acceptance checks in `.../redesign/native-ui-swap-plan.md` section 4A.

## 4. P0: blocks the app from adopting the library

### P0-1. A consumable version (publish path)  *(owner action needed for the publish itself)*
- **Why**: the app cannot depend on `0.0.2`; it lacks everything above. A cloud session cannot use a local `link:`.
- **Do**: add a changelog entry; decide the next version (`0.1.0`: new components and a changed `--oui-border-field`);
  confirm `pnpm --filter @oc-tech/omni-ui-components build` output is complete (`dist`, `dist-types`, `dist/styles.css`);
  `pnpm pack` and inspect the tarball contents; then **stop and ask the owner to run `npm publish`** (credentials are
  theirs). Write the exact commands in the PR description. Do not publish yourself.
- **Done when**: `npm view @oc-tech/omni-ui-components version` shows the new version and a fresh `pnpm add` in a scratch
  directory can `import { Transcript, Panel, SessionBar } from '@oc-tech/omni-ui-components'` and render one in a Vite app.

### P0-2. Consumer entry points and bundle weight
- **Why**: `exports` only offers `.`, `./styles.css` and `./dynamic-form`. Tests import subpaths through a vitest alias, which
  consumers cannot. Chat-only dependencies (`lowlight`, `react-markdown`, `remark-gfm`, `diff`) are plain `dependencies`, so
  the native app would pull them even if it never renders a code block.
- **Do**: measure the app-side cost (build a scratch Vite app importing only `Button`/`Panel`/`Toolbar`, then the chat set);
  if the cost is significant, add entry points (`./native`, `./chat`, `./highlight`) with matching `exports`, `types`,
  `typesVersions` if needed, and tree-shake-safe barrels; keep `.` re-exporting everything. Confirm `sideEffects` is still
  correct (lowlight's grammar set is created lazily on first call; keep it that way).
- **Done when**: a test builds a fixture consumer importing each entry and asserts the bundle for `./native` excludes
  `lowlight`/`react-markdown`.

### P0-3. CSS delivery into a host that does not use Tailwind
- **Why**: the app (`omnitech-interview-answers-generator`) has no Tailwind; it has hand-written CSS with its own resets and
  per-surface token scopes. `dist/styles.css` is 220 KB and declares `@layer base`, `components`, `omni-ui-components`,
  `properties`, `theme`, with many `:root{` declarations. Importing it unscoped may restyle the host.
- **Do**: spike with the real host stylesheet order: import `styles.css` into a copy of the app's Studio page and diff
  screenshots outside library components. Fix by whichever is least invasive: strip Tailwind's preflight from the shipped
  CSS (`@layer base` reset), scope token declarations under `:where([data-oui-root])` or a documented class, and keep the
  cascade layer name stable so the host can order it (`@layer omni-ui-components` must be orderable below host styles).
  Document the exact import line and layer order in the README.
- **Done when**: importing `@oc-tech/omni-ui-components/styles.css` into the app's `studio/tokens.css` entry changes zero
  pixels on pages that render no library component (screenshot diff in the app repo), and library components render
  correctly inside the host.

### P0-4. Theme contract for a host with its own tokens
- **Why**: the app maps its own `--ui-*`, `--pn-*`, `--ov-*` tokens per surface (overlay, native panels, Studio), and the
  native panels are translucent glass over the interviewed window. The library's light/dark switch is `data-theme` on
  `<html>` in Storybook; the app needs to drive tokens per **subtree**, not per document.
- **Do**: write the token contract as a table in `bionic/research/references/` (every `--oui-*` the components read, its
  meaning, light and dark default), make every token overridable on any ancestor (no reliance on `:root` or `<html>`),
  and make theme switching work from `data-theme` on any ancestor (`[data-theme='dark'] .x` selectors, not `html[...]`).
  Add a story that renders the same component set in two sibling containers with different themes and different
  overrides. Provide the see-through contract (`--oui-panel-see-through` 0.22 to 1, background only).
- **Done when**: that story passes a computed-style test (two subtrees, two palettes) and the doc lists the full contract.

### P0-5. Portals, hit regions and the native shell
- **Why**: the native macOS shell makes the panel click-through everywhere except drawn areas, driven by a hit-region
  tracker that reads element rectangles by selector (`HIT_SELECTORS` in the app). Radix menus, popovers, tooltips, dialogs
  and the new popover/toast render into `document.body` (portals), outside any app container, so their areas are not
  clickable in the native window.
- **Do**: add a portal container strategy: a `container`/`portalContainer` prop (or a tiny `PortalContainer` provider that
  is just a prop-carrying wrapper, no app logic) on `ActionMenu`, `Popover`, `Tooltip`, `SplitButton`, `ModelPicker`,
  `ContextMeter`, `CommandPopover`, `Toast`, `SettingsDialog`, plus a stable data attribute on every portalled surface
  (`data-oui-surface`) that the host can add to its hit selectors. Default behaviour unchanged.
- **Done when**: a test renders each in a custom container and asserts content mounts there with the attribute; the README
  documents the host recipe.

### P0-6. Control hit area (36 px visuals, 40 px target)
- **Why**: the Native App controls are 36 px tall by design; the app's accessibility rule wants at least a 40 px hit area.
- **Do**: add a token (`--oui-control-hit`, default 40px) and a `::before` hit-area expansion on `Button`, `IconButton`,
  `SplitButton` segments and `Segmented` items that does not change layout; make the 52 px labelled mode unaffected.
- **Done when**: a test measures the hit rectangle (pseudo-element via computed style or a hit-test helper) at 40 px and
  Storybook shows the expansion with a debug outline control.

## 5. P1: finish the chat and native-app set

### P1-1. Close the designer mismatches (Native App showcase)
Each item has a board reference in `bionic/inbox/redesign/ui-components/native-panel-cleanup-brief.md` (app repo).
1. **Build tag glyphs** (`StatusClock`): the board has a commit glyph before the SHA and a branch glyph before the branch.
   Today `buildTag.icon` is one node before the whole label. Make it `{ commitIcon, branchIcon }` (or a parts array); keep
   the tooltip with the full SHA and click-to-copy.
2. **Complexity chips** (`Panel.factories.tsx` `Complexity`): the board shows filled, borderless dark chips; today they are
   outlined mono `Tag`s. Add a `Tag` variant (`filled` or `chip`) instead of a local style.
3. **Panel toggles** hide the panel: `NativePanelsDemo` takes a fixed `state`, so hiding Chat or Answer does nothing and only
   Code reflows. Change the demo to take `visible: Record<'chat'|'answer'|'code', boolean>` and reflow with the 330/min 300
   rule and equal sharing of the rest; keep "the last visible panel cannot be turned off".
4. **Board 1c options C2 and C3** are approximations (a split button with a composite icon). Build the real C3 (three
   separate segments: capture, eye toggle, caret) as a `SplitButton` variation with `segments`, and C2 as `main.label`
   shown inline; they are the options not picked, so keep them low effort but accurate.
5. **Pause outline** is slightly dimmer than the board and the timer red/amber are softer than the board's coral/gold:
   read the board colours (`design-colours.mts`) and adjust tokens or add `--oui-clock-*` tokens.
6. **Width 330** currently means "the transcript alone". Confirm with the owner whether it means the transcript column
   inside a 900 px window; adjust the control if not.
7. **Answer header meta truncates at 900** ("no ques…"): let the meta shrink-wrap with `title` for the full text and
   prefer truncating the title area, or reflow meta below at narrow widths.
8. **300 px narrow header**: the model chip chevron touches the new-chat icon; add the missing gap. **Composer placeholder**
   clips without an ellipsis at 300 px; add `text-overflow: ellipsis` in the `Input` `panel` variant.
9. **Play test for the window** (capture press shows steps, Stop clears them, Pause shows Resume and dims the toolbar).
10. **Journal entry for L7** and tidy `bionic/journal/2026-10.md`.

### P1-2. Make `Transcript` render a whole reply (wire the parts together)
- **Why**: the W1 parts (`Markdown`, `Sources`, `StepTimeline`, ...) compose only inside the `ChatReply` showcase story.
  `Transcript` entries mode has `speech | message | event`; turn mode takes slots. There is no reusable default.
- **Do**: add a `ConversationTranscript` wrapper (new component, not a change to `Transcript`) that renders a `Turn` with the
  default part composition (thinking, timeline, markdown with `highlight`, sources, diff slot, actions, suggestions, error,
  approvals) from props only. Add an assistant `reply` entry kind to entries mode that carries `blocks`, `sources`, `steps`,
  or document clearly that turn mode is the supported path. Keep callbacks full-item.
- **Done when**: one story renders the same reply as `ChatReply` through the wrapper with no composition code, and a test
  proves each part's callback fires with the original item.

### P1-3. Items the survey flagged as missing (see `agentchat-equivalents.md` in the app repo)
- Caret-at-edge arrow-up recall in `Composer` (first/last line; Cmd+Up/Down anywhere).
- Message context menu (copy message, hide, delete with inline confirm) and "download conversation" (`lib/chat` has
  `toMarkdown` and `download`; wire the menu).
- Stream status line (`kind: tool | reasoning | stall`, mm:ss timer, "Calling X…", completed, failed, stall text).
- Saved-prompts popover (can reuse `ActionMenu` or `CommandPopover` with `source`).
- History windowing with "Load earlier" that preserves scroll (the turn mode has `onLoadEarlier`; add windowing helper).
- Models settings tab content (`ModelsSettings`: endpoint, available models, cloud providers row) for `SettingsDialog`.
- Roving tabindex and arrow-key navigation in `MessageActions`, `ConversationList` rows and `ModelPicker` rows.
- Math rendering in `Markdown` only if a product needs it (KaTeX adds weight: make it an optional entry).
- Focus management: move focus into a freshly shown `FeedbackPanel` or `ApprovalCard`; focus trap and backdrop for the
  overlay sidebar on narrow panels; unit test for `SettingsDialog` focus return (Storybook asserts it today, happy-dom cannot).

### P1-4. Fold `Composer` into `Input` (or justify)
`Composer` is a separate component because `Input` renders a single-line `<input>`. Decide: add a multi-line `Input` mode
(auto-grow `<textarea>`, IME-safe Enter, newline on Shift+Enter) and make `Composer` a thin preset, or keep both and
document why. Either way keep the `Input` `panel` variant (see-through background) as the shared look.

### P1-5. Attachments end to end (the owner named this feature)
`Attachment`, `AttachmentStrip`, drop/paste/picker and `validateFiles` exist. Remaining:
- Real-browser verification of drag and drop (only synthetic events are tested): add a Playwright check against Storybook.
- Upload status and progress are display-only; add a documented example hook (`useAttachmentUploads`) in factories, not in
  the component, showing `uploading`/`extracting`/`failed` transitions and the "Not sent" rewrite on a failed send.
- Read-only attachment card on a sent bubble in `Transcript` (kind icon, name, `TYPE · SIZE`), with `onAttachmentClick`.
- One allowlist shared by the picker `accept` and validation (it is by construction; add a test that pins it).
- Privacy note for hosts: never log attachment contents (app rule 8).

## 6. P2: quality, tooling and hygiene

1. **Clean `bionic/inbox/native-app-components-todo.md`.** 58 items are open there; many are done (CommandPopover portal,
   stick threshold, badge placement, L5b attachments/markdown, "stories blocked"). Re-verify each and delete the done ones;
   fold what remains into this plan.
2. **Run `play` functions in CI.** Today only vitest (happy-dom) runs in `pnpm verify`; Storybook interaction tests are run
   by hand. Add `@storybook/addon-vitest` or `test-storybook` against a static build so every `play` runs in a real browser.
3. **Visual regression** for the Native App showcase against stored screenshots of the designer boards (Playwright
   `toHaveScreenshot` with a tolerance), dark and light.
4. **Accessibility checks**: axe on every story (violations fail the run) and a contrast check of the token pairs.
5. **CI**: the repo has no `.github/workflows`. Add a workflow running `pnpm verify` on pull requests and a build of
   Storybook; do not add publish automation without the owner's decision.
6. **Formatting config**: there is no prettier config; workers formatted with `--single-quote --print-width 150`. Commit a
   `.prettierrc` (or biome/oxfmt equivalent) so formatting is reproducible.
7. **Lint backlog**: the ~12 pre-existing oxlint warnings.
8. **Barrel conflicts**: `src/index.ts` is flat; add a test that fails on duplicate export names (`download`, `copyText`,
   `initialsOf`, ...).
9. **Export `use-controllable-state`** from `lib/index.ts` or keep it internal on purpose and say so.
10. **Notification/Message stubs** (`window.alert`) predate this work; `Toast` replaces them for chat. Decide whether to
    delete the stubs or make them thin wrappers over `Toast`.
11. **Docs renderer**: either upgrade `renderCodeAwareText` to support tables and bold (then relax convention 10) or leave
    it. A "Callbacks" table exists per story in the supported subset.
12. **i18n**: all strings are `labels`; add pluralisation helpers and an RTL pass if a product needs them.

## 7. Out of scope here (belongs in the app repo)

`prepareSend`, relay and on-device models, approvals logic, proposal apply/undo wiring, connector OAuth, the
`useAssistant` engine, model catalog fetching, and the adapter hooks that turn app data into component props.

## 8. Working agreement for the cloud session

- Branch from `master` (for example `lib-completion`), commit per item with the repo's message style, open a PR; **do not
  push to `master`, do not publish, do not edit Crux/`.claude` configuration**.
- Run the full gate before each commit; keep every commit green.
- Review your own work the way section 3 describes. Report honestly what was driven by hand and what was only tested.
- If a decision belongs to the owner (width 330 meaning, publish, a visual choice), write it as a question in the PR and
  continue with the other items.
