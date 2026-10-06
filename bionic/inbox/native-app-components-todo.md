
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
