
## L7 Native App showcase

Showcase: `packages/core/src/showcase/NativeApp/` (`NativeApp.stories.tsx`, `NativeApp.factories.tsx`), story title `omni-ui-components/Showcase/Native App`; smoke tests `packages/core/test/showcase/NativeApp.test.tsx`; overview row "Native App (showcase)" in `.storybook/getting-started/ComponentOverview.stories.tsx`.

- [ ] Build tag icons: the board shows a commit glyph before the SHA and a branch glyph before the branch name; `StatusClock` `buildTag.icon` renders both icons before the whole label. Split the tag into two segments (or accept `icon` per part). File: `packages/core/src/StatusClock/StatusClock.tsx`.
- [ ] Mic-lost and screen-problem badge: in the showcase the amber "!" sits over the top-right of the glyph; the board puts it on the top-right corner of the button (overlapping the border). Re-check `status` / `badge` offsets. File: `packages/core/src/IconButton/IconButton.variants.ts` (and SplitButton status slot).
- [ ] Complexity chips (O(n) time / O(n) space) are outlined mono tags; the board shows filled, borderless dark chips. File: `packages/core/src/Panel/Panel.factories.tsx` (`ComplexityChips`) or Tag variant.
- [ ] Panel toggles do not drive the panel row: hiding Code reflows to two panels (mapped to the `answer` state), but hiding Chat or Answer leaves the panel visible. `NativePanelsDemo` takes a fixed `state`, not a list of visible panels. Give it a `visible` prop. Files: `packages/core/src/Panel/Panel.factories.tsx`, `packages/core/src/showcase/NativeApp/NativeApp.factories.tsx` (`NativeAppWindow`).
- [ ] Width 330 is mapped to "the transcript alone" (`TranscriptPanel`); confirm that is what the 330 control means in the design (it may mean the transcript column inside a wider window).
- [ ] 1c boards C2 and C3 are approximations built from `SplitButton` with a composite icon node ("Manual" word; monitor + eye in the main half). The real C3 has three separate segments (capture | eye toggle | caret). They are the options not picked; implement only if the owner revives them. File: `packages/core/src/showcase/NativeApp/NativeApp.factories.tsx` (`captureOptions`).
- [ ] 1c open menus are rendered with `open` + `portal={false}` from an invisible zero-size anchor, so they open below the anchor and look like the board's top-aligned popups; the Radix popper positions them with `position: fixed`, so a screenshot taller than the viewport misplaces them (verified at 1700px viewport). If static docs shots matter, add an `inline` (static) placement to `ActionMenu`. File: `packages/core/src/ActionMenu/ActionMenu.tsx`.
- [ ] At 900px the Answer header meta ("Last capture 08:33 · no ques...") truncates before the actions because the row is narrower than the board (the board is drawn at about 1180). Decide whether the meta should wrap or shorten. File: `packages/core/src/Panel/Panel.tsx`.
- [ ] Journal entry for L7 not written (shared file `bionic/journal/2026-10.md`, left to the lead to avoid colliding with L5 and L6).
- [ ] Check `NativeFooter` (now a thin wrapper over L6's `SessionBarDemo`) still matches if L6 renames `SessionBarDemo` props (`initial`, `devBuild`, `confirmEnd`, `onAction` reporting `pause` and `resume`). File: `packages/core/src/showcase/NativeApp/NativeApp.factories.tsx`.
- [ ] Add a Storybook play test for the window (capture press shows steps, Stop clears them, Pause shows Resume); only a jsdom smoke test exists. File: `packages/core/src/showcase/NativeApp/NativeApp.stories.tsx`.

## L5b Transcript: attachments, markdown, status (from the Legion survey)
Source and priorities: the interview-answers-generator repo `bionic/inbox/redesign/ui-components/agentchat-equivalents.md`.
- [ ] `AttachmentCard` (composer: removable; transcript: read-only): kind icon node, name, `TYPE · SIZE` meta that becomes error text or "Uploading…", remove disabled while uploading. Files: `packages/core/src/Attachment/`.
- [ ] `AttachmentStrip` + `Input` leading strip: scrolling row, picker button with count badge, drag and drop (bounding-rect dragleave), paste images; config for `maxCount`, `maxSize`, `allowedTypes`; one allowlist for picker and upload; rejection callback. Files: `Input/`, `Attachment/`.
- [ ] Transcript shows attachment cards on a bubble (read-only) and "Not sent" on failure. File: `Transcript/`.
- [ ] Markdown reply rendering with a streaming-safe auto-closer and a small highlighter set via `renderCode`. File: `Transcript/`.
- [ ] Stream status line (tool / reasoning / stall, mm:ss timer). Failure card with Retry. Send becomes Stop in the composer.
- [ ] Minor: composer placeholder is clipped without an ellipsis at the 300px minimum width. File: `Input/Input.variants.ts` (panel variant).

## L6 SessionBar
- [ ] Build tag glyphs: the board shows a commit glyph before the SHA and a branch glyph before the branch; `buildTag.icon` is one node before the whole label. Split into two segments or accept an `icon` per part. File: `packages/core/src/StatusClock/StatusClock.tsx`.
- [ ] Pause button border is a little dimmer than the board (neutral-border token vs the board's brighter outline). Decide if the neutral border token or a Button tone needs a stronger outline in dark. File: `packages/core/src/internal/support/controlTone.ts`.
- [ ] Timer red and amber use `--oui-tone-danger-fg` / `--oui-tone-warning-fg` (slightly softer than the board's coral and gold). Confirm against the designer file or add footer-specific tokens. File: `packages/core/src/StatusClock/StatusClock.variants.ts`.
- [ ] Narrow stress widths (330/300): the actions wrap under the clock and the tag truncates; at 300 the whole bar is 84px tall. The real footer spans the panel row (>= 900), so this is a stress case only; revisit if the footer is ever shown inside one panel. File: `packages/core/src/Toolbar/Toolbar.tsx` (`bar` variant).
- [ ] No visual regression or play test for the see-through opacity of the bar; only a computed-colour check was run by hand (alpha 0.22 on the bar, text opaque). File: `packages/core/src/SessionBar/SessionBar.stories.tsx`.
- [ ] Dev-build gating is the caller's job (the tag renders when given); the native app must pass `buildTag` only when `!app.isPackaged`. Not a library change; track in the interview-answers-generator repo.

## W1 message parts
Components: Markdown, Sources, Suggestions, Thinking, StepTimeline, ErrorCard, ApprovalCard, FeedbackPanel, VersionPager, MessageActions, SummaryDivider (`packages/core/src/<Name>/`, tests in `packages/core/test/<Name>/`, overview section "Message parts").
- [ ] Integrate the parts into `Transcript` assistant messages through slots (W2 / owner): Transcript has no assistant-message entry kind yet, so the parts are only composed in `Markdown.stories.tsx` (`AssistantReply`). Files: `packages/core/src/Transcript/`.
- [ ] Markdown: no `renderCode` slot (the `components.pre` override covers it) and no KaTeX/math; add only if a product needs it. File: `packages/core/src/Markdown/Markdown.tsx`.
- [ ] Markdown: the streaming closer handles fences, inline backticks and `**` only; an unclosed `*em*`, `~~strike~~`, link `[text](url` or table row is rendered as the parser sees it. File: `packages/core/src/Markdown/Markdown.streaming.ts`.
- [ ] Markdown: code blocks follow the theme (`--oui-panel-dock-bg`); the original always drew a dark code panel in both themes. Confirm the light look with the owner. File: `packages/core/src/Markdown/Markdown.variants.ts`.
- [ ] Markdown: `@types/mdast` is not a direct dependency, so the citation plugin declares its own minimal node types. If `mdast` types are added to `packages/core`, replace them. File: `packages/core/src/Markdown/Markdown.citations.ts`.
- [ ] Strings were dropped as list items (Suggestions, FeedbackPanel reasons are `{ id, label }` objects); add a `toItems(strings)` helper only if a host asks. File: `packages/core/src/Suggestions/`.
- [ ] MessageActions: arrow keys move focus but every button stays in the Tab order (not a roving tabindex), because custom nodes (VersionPager) own their buttons. Decide if a true roving tabindex is wanted. File: `packages/core/src/MessageActions/MessageActions.tsx`.
- [ ] StepTimeline: no `defaultOpen` auto-open while running for the `summary` variant (the original is also closed while running); the rail opens by itself while working. No arrow-key navigation (rows are not interactive). File: `packages/core/src/StepTimeline/StepTimeline.tsx`.
- [ ] ErrorCard: no built-in error-code to title map (app-specific; shown in `SAMPLE_ERROR_TITLES` in the factories) and no built-in "Switch model" button (pass it in `actions`). File: `packages/core/src/ErrorCard/ErrorCard.factories.tsx`.
- [ ] ApprovalCard / FeedbackPanel: no focus is moved into a freshly shown card or panel (the original does not either); a caller that opens the FeedbackPanel from thumbs-down should focus its first chip. Files: `packages/core/src/ApprovalCard/ApprovalCard.tsx`, `packages/core/src/FeedbackPanel/FeedbackPanel.tsx`.
- [ ] `lib/use-controllable-state.ts` is a new shared hook (not exported from `lib/index.ts`, imported by path); export it or fold it into the lib index when the lead edits that file. File: `packages/core/src/lib/use-controllable-state.ts`.

## W4 shell + settings + utilities
- [ ] `SettingsDialog` focus return is asserted only in Storybook (`FocusReturn` play); the happy-dom test of the same flow fails because Radix returns focus on a timer that happy-dom does not run the same way. Verify in a real browser each release or move the check to a browser test. File: `packages/core/test/SettingsDialog/SettingsDialog.test.tsx`.
- [ ] `Toast` timer restarts when the `toast` item changes by reference; notifying the very same object twice does not restart it (`useToast.notify` stores the object it is given). Pass a fresh object, or add a `nonce` if repeat notices matter. File: `packages/core/src/Toast/Toast.tsx`.
- [ ] `useSpeech` and `printConversation` are covered with stubbed `speechSynthesis` and a stubbed iframe (`test/ChatUtils/speech-print.test.tsx`); a real-browser print dialog and real speech output are still unchecked by hand. File: `packages/core/src/lib/chat/`.
- [ ] The original Models settings tab (endpoint, cloud provider row) and the Shared read-only view were out of scope (ModelPicker is W3, read-only Transcript is W2); a `ModelsSettings` panel is not built. File: `packages/core/src/SettingsDialog/`.
- [ ] `ConversationList` has no keyboard roving between rows (Tab walks every row and its hover actions); consider arrow-key navigation. File: `packages/core/src/ConversationList/ConversationList.tsx`.
- [ ] `ChatShell` story imports `ModelPickerDemo` (W3) and `ComposerExample` (Transcript factories); if those are renamed the story breaks. File: `packages/core/src/PanelShell/PanelShell.factories.tsx`.
- [ ] No `EmptyStarters` variant on `Empty` (kept separate on purpose); revisit if a single empty-state component is wanted. File: `packages/core/src/Empty/`.
- [ ] Overlay sidebar has no backdrop or focus trap (original had none); decide whether it should trap focus on narrow panels. File: `packages/core/src/PanelShell/PanelShell.tsx`.
- [ ] Exports from `src/index.ts` are flat (`download`, `copyText`, `initialsOf`, ...); if another worker exports the same names the barrel will conflict.

## W2 conversation + composer
- [ ] `Composer` is its own component, not an `Input` variation: `Input`/`InputPrimitive` render a single-line `<input>`. A composer needs an auto-growing `<textarea>` (to `maxHeight`), real newlines (Shift+Enter), Enter-sends that respects IME composition, and ArrowUp recall on an empty draft; an `<input>` cannot express any of these and `Input`'s `actions` slot only sits beside the field. If a multi-line `Input` (textarea mode) is added later, fold `Composer` into it. File: `packages/core/src/Composer/Composer.tsx`.
- [ ] Stick-to-bottom threshold: the original follows within 200px of the end, `useFollowLatest` uses `AT_END_PX` (48px) and `Panel` has no `scroll.threshold`. `CONVERSATION_STICK_THRESHOLD` (200) is exported but not applied. Add an optional threshold to `useFollowLatest` and `PanelScroll` (not owned by W2). Files: `packages/core/src/lib/use-follow-latest.ts`, `packages/core/src/Panel/Panel.types.ts`.
- [ ] Original behaviour not ported: `prepareSend`, live relay and approvals logic stay in the app; `+` menu rows for connectors, `/model`, `/prompts`, `/summarise` built-ins are host data (only the generic `/clear`, `/new` demo ones exist in factories). File: `packages/core/src/Composer/Composer.factories.tsx`.
- [ ] Attachment `status`/`progress` are display-only: no hook drives an upload. A `useUpload` wiring is host work. File: `packages/core/src/Attachment/`.
- [ ] Drag-and-drop and paste are covered by happy-dom tests with synthetic events only; verify with a real file drag in a browser once. File: `packages/core/test/Attachment/Attachment.test.tsx`.
- [ ] `CommandPopover` has no portal: it is absolutely positioned inside the composer root, so an ancestor with `overflow: hidden` would clip it. Add a `portal` option if a host needs it. File: `packages/core/src/CommandPopover/CommandPopover.tsx`.
- [ ] No caret-at-edge rule for ArrowUp recall (recall only when the draft is empty, as the original); the Legion rule (first/last line, Cmd+Up/Down anywhere) is not built. File: `packages/core/src/Composer/Composer.tsx`.
- [ ] Message context menu / hide / delete, a stream status line and saved prompts popover are not built (saved prompts can use `ActionMenu` or `CommandPopover` with `source`). File: `packages/core/src/Transcript/`.
- [ ] Visual and interaction run of the stories in Storybook was blocked when W1's `SummaryDivider.stories.tsx` failed to parse (index 404); re-run `.audit/w2-stories.cjs` once it indexes. File: `e2e/live-session/.audit/w2-stories.cjs`.

## W3 diff review + models + context
- [ ] ModelPicker: ArrowUp / ArrowDown moves between model rows (Tab works today). Why: menu-style navigation; the original has none. File: packages/core/src/ModelPicker/ModelPicker.tsx.
- [ ] ModelPicker: the chip cannot show a pending pick because the menu closes at once; no pending state by design. Revisit only if the owner wants it. File: packages/core/src/ModelPicker/ModelPicker.tsx.
- [ ] ModelsSettings (the settings-tab list of models and endpoint, inventory 10) is not ported; it belongs with W4's SettingsDialog. File: new packages/core/src/ModelPicker/ModelsSettings.tsx.
- [ ] DiffReview: preview-state wiring in the host (banner showing the changed content) is app-side and not provided; only the status and actions exist.
- [ ] ContextMeter: the estimate fetch policy (refresh on thread, count or model change, hidden when missing) is host logic and not provided.
- [ ] Stories on the shared Storybook (6006) hit a 404 on the virtual stories module while other workers edited stories; verified on a private instance at 6016 instead.

