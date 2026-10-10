# Library work units (each is self-contained: paste the preamble + one unit into a delegation)

Baseline: `master` at `eabe37c`, `pnpm verify` green (173 test files, 1,405 tests). Orchestration order is at the bottom.
**★ = minimum set to unblock the native app** (publishable, isolated, themeable, portal-safe, matches the redesign).
Estimates are agent working time per unit, from how long comparable work took (15–60 minutes each). "Owns" lists are
disjoint within a wave; shared files follow the additive-edit rule in the preamble. `Port` is the unit's own Storybook port.

Reference material in the repo: `bionic/research/design/native-panel-cleanup/` (designer boards and the T/M/F brief),
`bionic/research/references/native-app-control-variations.md` (what was built and why),
`bionic/inbox/native-app-components-todo.md` (older, partly stale), `bionic/inbox/lib-completion-plan.md` (rationale).

---
## Wave 1 (parallel, disjoint)

### U01 ★ Publish preparation  · ~20 min · no Storybook needed
**Context**: the package is published as `0.0.2`; none of the work since is in a published version. The owner publishes (credentials
are theirs); you prepare the release but never run `npm publish`.
**Do**: set version `0.1.0` in `packages/core/package.json` (version field only; another unit edits `exports`); create
`CHANGELOG.md` summarising the added components (derive from `bionic/journal/2026-10.md` and `git log`); build
`pnpm --filter @oc-tech/omni-ui-components build`; `pnpm pack` inside `packages/core` and list the tarball: it must contain `dist`,
`dist-types`, `dist/styles.css` and `README.md`; add a README section "Install and import" with the exact import line for the
JS and for `@oc-tech/omni-ui-components/styles.css`; write `RELEASING.md` with the owner's exact publish commands
(the repo already has `pnpm publish:package`, which does an npm web login for the `@oc-tech` scope and publishes; run it after the PR
merges, then tag `v0.1.0`). Do not run it yourself.
**Owns**: `packages/core/package.json` (version, files), `CHANGELOG.md`, `RELEASING.md`, `README.md`. **Done when**: tarball
contents verified and pasted in the PR; owner commands written; nothing published.

### U02 ★ Consumer entry points and bundle weight  · ~40 min · Port 6102
**Context**: `packages/core/package.json` `exports` only has `.`, `./styles.css`, `./dynamic-form`; tests import
subpaths through a vitest alias that consumers do not have. `lowlight`, `react-markdown`, `remark-gfm`, `diff` are plain
dependencies, so a consumer that only wants buttons and panels would pull them.
**Do**: build two scratch Vite consumers (outside published files, e.g. `packages/core/fixtures/consumer/`): one importing only
`Button`, `Panel`, `Toolbar`; one importing the chat set; record bundle sizes in `bionic/research/references/bundle-weight.md`.
Add entry points `./native` (Button, IconButton, Toolbar, SplitButton, ActionMenu, Segmented, Panel, Transcript, SessionBar,
StatusClock, Empty, Steps, Progress, Tag, Divider; **no** lowlight/react-markdown), `./chat` (all chat parts) and `./highlight`
(the lowlight highlighter) via small `src/entries/*.ts` files, Vite lib entries, `exports` + `types` for each; `.` keeps
re-exporting everything; keep `sideEffects` correct and the lowlight grammar set lazily created.
**Owns**: `packages/core/vite.config.*`, the `exports` field of `package.json` (another unit edits `version`/`files`), new
`src/entries/`, new fixtures and test, `bundle-weight.md`. **Done when**: a test builds the fixture consumer for each entry and
asserts the `./native` bundle contains neither `lowlight` nor `react-markdown`; every entry type-checks from a consumer.

### U03 ★ CSS isolation into a non-Tailwind host  · ~60 min (the one real unknown) · Port 6103
**Context**: the app that will consume the library has **no Tailwind**; it has hand-written CSS with its own resets and token
scopes. The shipped `dist/styles.css` is ~220 KB and declares `@layer base, components, omni-ui-components, properties, theme`
with many `:root{` blocks; importing it unscoped may restyle the host.
**Do**: create a fixture host app `packages/core/fixtures/host-app/` (Vite + a hand-written `host.css` imitating a host: its own
`*{box-sizing}` reset, body font, styled native `<button>`/`<input>`, its own `--ui-*` tokens) with two pages: (A) host-only,
(B) host plus one library `Panel` and `Button`. Screenshot page A with and without importing
`@oc-tech/omni-ui-components/styles.css` (Playwright, pixel diff, threshold 0). Fix until the diff is zero: ship Tailwind
**without preflight** (theme + utilities only), keep every library rule inside `@layer omni-ui-components` or under library
class/attribute selectors, make sure no element selector (`button`, `input`, `*`, `html`, `body`) escapes the layer, and document
the layer order a host should use (`@layer host, omni-ui-components;`). Add a script `pnpm --filter @oc-tech/omni-ui-components test:isolation`.
**Owns**: `packages/core/src/styles/tailwind.css`, `base-palette.css`, the Vite CSS config, new `fixtures/host-app/`, new
`bionic/research/references/css-delivery.md`. (Not `tokens.css`/`theme-tokens.css`: U04 owns their selectors later; if a token
block needs scoping, say so in your report.) **Done when**: zero-pixel diff on the host-only page (shown in the PR) and page B
renders the library correctly in dark and light.

### U05a ★ Portals, part 1 (helper + four primitives)  · ~40 min · Port 6105
**Context**: the native macOS shell treats the page as click-through except drawn areas, using rectangles it reads by selector.
Radix menus, popovers and tooltips render into `document.body`, outside any host container, so their areas are not clickable.
**Current state (checked)**: `ActionMenu` already has `portal` and `container` props; `Popover`, `Tooltip` and `SplitButton` have
neither (they may wrap primitives under `src/components/ui/`: look there); **none** of them marks its portalled content with a
selector the host can read.
**Do**: add `internal/support/PortalContainer.tsx`: a tiny helper that resolves `container?: HTMLElement | null` and exposes the shared
attribute name `data-oui-surface` (no context, no app logic). Add the optional `container` prop to `Popover`, `Tooltip` and
`SplitButton`'s menu, and put `data-oui-surface` on the portalled content of all four (including `ActionMenu`, which already has
`container`). Default behaviour unchanged.
**Owns**: `ActionMenu/`, `Popover/`, `Tooltip/`, `SplitButton/` and their tests, `internal/support/PortalContainer.tsx`.
**Done when**: for each of the four, a test renders it with a custom container and asserts the content mounts there and carries
`data-oui-surface`; the default (no container) still mounts in `body`.

### U10 ★ StatusClock and SessionBar fidelity  · ~35 min · Port 6110
**Context**: boards `board-1e.png` (footer). Known mismatches: the build tag has a commit glyph before the SHA and a branch
glyph before the branch, but `buildTag.icon` is one node before the whole label; the Pause outline is slightly dimmer than the
board; the timer red and amber are softer than the board's coral and gold.
**Do**: change `buildTag` to accept `{ commitIcon, branchIcon }` (keep the full-SHA tooltip and click-to-copy, `copied` controlled);
read the board colours from `board-1e.png` and set `--oui-clock-live`, `--oui-clock-paused` (and a Pause outline token if needed)
in `tokens.css` (additive, light and dark); update stories, factories and tests. Do not change the "footer background never
changes with state" rule (there is a test).
**Owns**: `StatusClock/`, `SessionBar/`, their tests, additive lines in `tokens.css`. **Done when**: side-by-side screenshot with
`board-1e.png` at 2x matches in layout and colours; tests green.

### U11 ★ Panel demo fidelity and the showcase wiring  · ~50 min · Port 6111
**Context**: boards `board-1d.png`; brief M10 (reflow). Known mismatches: complexity chips (`O(n) time`) are outlined mono tags but
the board has filled, borderless dark chips; `NativePanelsDemo` takes a fixed `state`, so hiding Chat or Answer with the toolbar
toggles does nothing (only Code reflows); at 900 px the Answer header meta ("Last capture 08:33 · no ques…") truncates.
**Do**: add a `Tag` variant for the filled chip and use it; make `NativePanelsDemo` take `visible: Record<'chat'|'answer'|'code', boolean>`
and reflow (transcript 330, min 300; other visible panels share the rest equally; the last visible panel cannot be turned off),
and wire the showcase window stories' toolbar toggles to it; fix the header meta truncation (let the title area shrink first, give
the meta a `title` with the full text). Leave "width 330" as is and put the question in your report: does 330 mean the transcript
alone (current) or the transcript column inside a 900 px window?
**Owns**: `Panel/Panel.factories.tsx`, `Tag/`, `showcase/NativeApp/*`, their tests. **Done when**: at 900 and 1180, with 1, 2 and 3
visible panels, nothing is cropped and widths follow the rule (measured in a Playwright check); chips match the board.

### U14  Small polish  · ~20 min · Port 6114
**Do**: (1) at the 300 px narrow panel the model chip's chevron touches the new-chat icon: add the gap in
`ConversationHeader/`; (2) the composer placeholder clips without an ellipsis at 300 px: add `text-overflow: ellipsis` to the
`Input` `panel` variant (`Input/Input.variants.ts`). **Owns**: `ConversationHeader/`, `Input/`, their tests. **Done when**: both
are verified in a 300 px screenshot (dark and light) and a computed-style assertion.

### U20  ConversationTranscript wrapper  · ~45 min · Port 6120
**Context**: the chat parts (`Markdown`, `Sources`, `Suggestions`, `Thinking`, `StepTimeline`, `ErrorCard`, `ApprovalCard`,
`FeedbackPanel`, `VersionPager`, `MessageActions`, `SummaryDivider`) only compose inside the `ChatReply` showcase story
(`src/Markdown/Markdown.factories.tsx` `ChatReplyShowcase`). `Transcript` turn mode takes slots.
**Do**: add a new component `ConversationTranscript` (new dir) that renders a `Turn` with the default composition of those parts,
from props only (generic over the turn/step/source item types; callbacks full-item). **Owns**: new `ConversationTranscript/` only.
**Done when**: one story renders the same reply as `markdown--chat-reply` with no composition code, and tests prove each part's
callback fires with the original item.

### U24  Message menu  · ~30 min · Port 6124
**Do**: new `MessageMenu/` (built on `ActionMenu`): copy message, hide/unhide, delete with an inline "cannot be undone" confirm,
optional "download conversation" item (use `lib/chat` `toMarkdown`/`download`), generic over `MessageItem`; callbacks
`onCopy(message)`, `onHide(message)`, `onDelete(message)`; an absent callback hides its item; keyboard and focus return.
**Owns**: new `MessageMenu/`. **Done when**: tests per callback with an extended item (`toBe`), story, Esc closes the confirm only.

### U25  Stream status line and failure text  · ~30 min · Port 6125
**Do**: new `StreamStatus/` (`kind: 'tool' | 'reasoning' | 'stall'`, `toolName`, `status`, `message`, `startedAt`; labels "Calling X…",
"X completed", "X failed", "Reasoning…", stall text; an `mm:ss` elapsed timer that resets on mount); plus a pure
`describeFailure(error)` in `lib/chat/failure.ts` that turns an infrastructure error into a plain `{ title, message }` and never
returns the raw error. **Owns**: new `StreamStatus/`, `lib/chat/failure.ts` and tests. **Done when**: fake-timer tests for the timer;
story; `describeFailure` table test.

### U27  Models settings tab content  · ~30 min · Port 6127
**Do**: new `ModelsSettings/`: endpoint (read-only), "Connected · N models" status, available-models list, cloud-providers row with
`onAddProvider` (absent = row hidden); generic over `ModelInfo`; usable as a `SettingsDialog` tab. **Owns**: new `ModelsSettings/`.
**Done when**: story inside `SettingsDialog`, tests for each callback and the absent-callback rule.

### U40  CI workflow  · ~20 min · no Storybook
**Do**: add `.github/workflows/verify.yml` (pnpm install `--frozen-lockfile`, `pnpm verify`, build Storybook) on pull requests; no
publish automation. **Owns**: `.github/`. **Done when**: the workflow is valid YAML and mirrors the local gate.

### U44  Hygiene  · ~35 min · no Storybook
**Do**: commit a `.prettierrc` (single quotes, width 150) without reformatting the repo; fix the ~12 pre-existing `oxlint` warnings
(`pnpm lint` lists them); add `packages/core/test/barrel.test.ts` that fails on duplicate export names in `src/index.ts`; export
`use-controllable-state` from `lib/index.ts`. **Owns**: root config files, the files carrying warnings, `lib/index.ts`, the new
test. **Done when**: `pnpm lint` has zero warnings and the gate is green.

---
## Wave 2 (start each when its dependency has merged into `lib-completion`)

### U04 ★ Theme contract for subtree theming  · ~40 min · Port 6104 · after U03
**Context**: the host maps its own tokens per surface and drives themes per subtree; the library currently switches via `data-theme`
on `<html>` in Storybook. **Do**: write `bionic/research/references/theme-contract.md` (every `--oui-*` the components read:
meaning, light and dark default); make every token overridable on any ancestor (no `:root`/`html`-only selectors; theme from
`data-theme` on any ancestor); add a `Theming` story rendering one component set in two sibling containers with different themes
and overrides; document the see-through contract (`--oui-panel-see-through`, 0.22–1, backgrounds only).
**Owns**: `styles/tokens.css`, `styles/theme-tokens.css` (selectors), new `Theming/` stories, the doc. **Done when**: a
computed-style test shows two subtrees with two palettes in one document.

### U05b ★ Portals, part 2  · ~30 min · Port 6155 · after U05a
**Current state (checked)**: `CommandPopover` already has `portal` and `container`, `ModelPicker` mentions `container`, `SettingsDialog` portals
through `ModalPortal`; `ContextMeter` and `Toast` have no `container`; none sets `data-oui-surface`.
**Do**: use U05a's helper in `ModelPicker`, `ContextMeter`, `CommandPopover`, `Toast`, `SettingsDialog`: optional `container` where
missing, `data-oui-surface` on all portalled content. **Owns**: those five dirs and tests. **Done when**: per-component test mounts in a custom
container with the attribute; default unchanged.

### U06 ★ 40 px hit area  · ~30 min · Port 6106 · after U05a
**Do**: add `--oui-control-hit` (40px) and a `::before` hit-area expansion on `Button`, `IconButton`, `SplitButton` segments and
`Segmented` items without changing layout; the 52 px labelled mode is unaffected; add a Storybook control that outlines the hit area.
**Owns**: `Button/`, `IconButton/`, `Segmented/`, `SplitButton/` (after U05a), additive lines in `tokens.css`. **Done when**: a test
measures a 40 px hit rectangle for a 36 px control; screenshots with the outline on.

### U12 ★ SplitButton board variants  · ~35 min · Port 6112 · after U06 and U11
**Context**: board `board-1c.png`: C2 (mode word on the button) and C3 (capture + eye toggle + caret, three segments) are only
approximated today. **Do**: add `segments` to `SplitButton` for a real C3, and an inline `main.label` presentation for C2; update
the showcase `ToolbarVariations` story. **Owns**: `SplitButton/`, the `ToolbarVariations` story. **Done when**: stories match
`board-1c.png`; tests per segment callback.

### U15 ★ Showcase play test and journal  · ~25 min · Port 6115 · after U11 and U12
**Do**: add a Storybook `play` for the Native App window (capture press shows steps, Stop clears them, Pause shows Resume and dims
the toolbar); write the missing journal entry for the showcase in `bionic/journal/2026-10.md` (additive). **Owns**:
`showcase/NativeApp/NativeApp.stories.tsx` (play only), the journal. **Done when**: the play passes in a real browser.

### U21  Multi-line Input (fold `Composer` into `Input`)  · ~45 min · Port 6121 · after U14
**Do**: add a multiline mode to `Input` (auto-growing `<textarea>` to `maxHeight` 200, IME-safe Enter to send, Shift+Enter newline,
the `panel` see-through look) and make `Composer` a thin preset over it, **or** keep both and state in `Composer.tsx` exactly what
`Input` cannot express. **Owns**: `Input/`, `Composer/`. **Done when**: all Composer tests still pass unchanged.

### U22  Attachments end to end  · ~40 min · Port 6122 · after U21
**Do**: a Playwright check of a real drag-and-drop against Storybook (today only synthetic events are tested); an example
`useAttachmentUploads` in `Attachment.factories.tsx` showing `uploading → extracting → failed` and "Not sent"; a read-only
attachment card on a sent `Transcript` bubble (`onAttachmentClick(attachment)`); a test pinning one allowlist for picker and
validation. **Owns**: `Attachment/`, the attachment parts of `Transcript/`. **Done when**: the browser drop test passes.

### U23  Composer history and saved prompts  · ~30 min · Port 6123 · after U21 and U05b
**Do**: caret-at-edge arrow-up recall (first/last line; Cmd+Up/Down anywhere) in `Composer`; a saved-prompts popover using
`CommandPopover` `source`. **Owns**: `Composer/`, `CommandPopover/`. **Done when**: tests for the edge rule and an extended-item
`onSelect`.

### U26  History windowing  · ~30 min · Port 6126 · after U20
**Do**: a windowing helper (last N turns, "Load earlier" that preserves the scroll offset from the bottom) for `Transcript` turn
mode. **Owns**: `Transcript.conversation*`, `lib/chat/window.ts`. **Done when**: a test proves scroll offset is preserved.

### U41  Storybook `play` in CI  · ~40 min · Port 6141 · after U40
**Do**: run every story's `play` in a real browser (`@storybook/addon-vitest` or `test-storybook`) against a static build, wired into
the workflow. Adds dev dependencies (the lockfile merge rule applies). **Owns**: Storybook/vitest config, the workflow.
**Done when**: CI runs plays; list any story whose `play` fails.

### U42  Visual regression  · ~35 min · Port 6142 · after U41
**Do**: Playwright `toHaveScreenshot` baselines for the Native App showcase stories, dark and light, small tolerance.
**Owns**: new `visual/` tests and baselines. **Done when**: stable across two runs.

### U43  Accessibility checks  · ~35 min · Port 6143 · after U41
**Do**: axe on every story (violations fail) and a contrast check of token pairs; record and fix easy violations (report the
rest). **Owns**: a new a11y test file; fixes in components only when trivial (list them). **Done when**: the report lists
violations fixed and deferred.

---
## Wave 3

### U28  Roving tabindex  · ~35 min · Port 6128 · after U05b and U20
**Do**: arrow-key navigation and one tab stop in `MessageActions`, `ConversationList` rows and `ModelPicker` rows.
**Owns**: those three dirs. **Done when**: tests drive arrows/Home/End; Tab leaves the group.

### U29  Focus management  · ~35 min · Port 6129 · after U05b
**Do**: optional auto-focus into a newly shown `FeedbackPanel` and `ApprovalCard`; a focus trap and backdrop for the overlay
sidebar in `PanelShell`; a unit test for `SettingsDialog` focus return (Storybook asserts it today; happy-dom cannot).
**Owns**: `FeedbackPanel/`, `ApprovalCard/`, `PanelShell/`, `SettingsDialog/`. **Done when**: tests for each.

---
## Final (orchestrator)

### U90  TODO cleanup  · ~30 min · after everything
Re-verify each open item in `bionic/inbox/native-app-components-todo.md` (about 58; many done), delete the done ones, move what
remains to `bionic/inbox/lib-open-items.md`, and update the README status. **Owns**: those files only.

### U91  Integration and report
Run `pnpm verify` on `lib-completion`, render the Native App showcase and the chat stories in dark and light (0 console errors),
open **one PR `lib-completion` → `master`**, and write the report: units done, units dropped (with reason), counts, what was
driven by hand, **owner-only items** (run `npm publish` after merge; confirm what "width 330" means; keep or drop the
`Notification`/`Message` stubs).

## Orchestration order

- **Wave 1** all at once: U01, U02, U03, U05a, U10, U11, U14, U20, U24, U25, U27, U40, U44.
- **Wave 2** as dependencies merge: U04 (after U03), U05b and U06 (after U05a), U12 (after U06 and U11), U15 (after U11/U12),
  U21 (after U14), U22 and U23 (after U21; U23 also after U05b), U26 (after U20), U41 (after U40), then U42 and U43.
- **Wave 3**: U28, U29 (after U05b; U28 also after U20). **Final**: U90, U91.
- **If effort must be cut**, stop after the ★ units (U01, U02, U03, U04, U05a, U05b, U06, U10, U11, U12, U15): that is the
  minimum for the native app. Everything else is optional and independent.
