# Changelog

## Unreleased

### Added

- Splitter `resizable`: a handle per sized panel (drag, arrow keys, Home, End, double-click or Enter to put it back), `orientation`, `sizes` / `defaultSizes` / `onSizesChange` by panel `id`, `minSize` / `maxSize`, `onResizeStart` / `onResizeEnd`, `resetKey`, `handleProps` and `labels`. The static layout is unchanged.
- OutlineList: a numbered list of things to jump to (`items`, `value` / `defaultValue` / `onValueChange(item)`, `order="reversed"`, `title`, `hint`, `empty`, a `live` row, arrow keys, Home and End), generic over `OutlineItem`, with factories, stories, tests and a Component Overview row.
- CueCard and HeardLine: what to say next as structured content (`sections` of `say`, `anchors`, `ask`, `caution`, `context`; pieces with a `role`, `grounding` and `source`), `mode="compact"` with `maxAnchors`, `status="pending"`, `onSourceSelect(segment)` generic over `CueSegment`, `cautionIcon`, `labels`; HeardLine draws a heard sentence (`pieces`, `label`, `tone`, `maxLines`). With factories, stories, tests and Component Overview rows.
- `native` entry: exports OutlineList, CueCard, HeardLine and Splitter.

## 0.1.0 - 2026-10-06

First release since 0.0.2. Everything below is new in a published version.

### Added

- Component library expansion (85 components) with Storybook coverage and a `dynamic-form` entry point.
- Native App controls: Button and IconButton (tone, control sizes, badge, loading, pressed, shortcut, working `asChild`), Toolbar, SplitButton, data-driven ActionMenu, Panel with `useFollowLatest`, Transcript, Input `actions` and `panel` variant, SessionBar and StatusClock.
- Variations on existing components: Progress `ring`, Segmented `multiple` and `control`, Empty `tile`, Steps `checklist`, Tag `mono` / `copyValue`, Divider control separator.
- Conversation and composer: Transcript turn mode, Composer, Attachment, CommandPopover (`useCommandTrigger`), DictationBar, QueuedList, `useHoldToTalk`.
- Message parts: Markdown, Sources, Suggestions, Thinking, StepTimeline, ErrorCard, ApprovalCard, FeedbackPanel, VersionPager, MessageActions, SummaryDivider.
- Chat shell and settings: ConversationList, ConversationHeader, EmptyStarters, SettingsDialog, SettingRow, Toast and `useToast`, PanelShell, PreferencesForm, DataPrivacyPanel, IntegrationList, ShortcutList, and the chat utilities (`groupByRecency`, `useHotkeys`, export helpers, `copyText`, `useSpeech`, `initialsOf`, `useDebouncedCallback`).
- DiffReview, ModelPicker / ModelMenu and ContextMeter.
- Shared `useControllableState`; `--oui-*` panel tokens including `--oui-panel-see-through`.

### Changed

- Package metadata prepared for npm (`files`, `exports`, `publishConfig`).

### Fixed

- Chat panel header layout, popover portal and focus return, SplitButton status badge, Toolbar menu overlap, Storybook docs rendering.
