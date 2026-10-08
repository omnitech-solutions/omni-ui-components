# Changelog

## Unreleased

### Added

- Splitter `resizable`: a handle per sized panel (drag, arrow keys, Home, End, double-click or Enter to put it back), `orientation`, `sizes` / `defaultSizes` / `onSizesChange` by panel `id`, `minSize` / `maxSize`, `onResizeStart` / `onResizeEnd`, `resetKey`, `handleProps` and `labels`. The static layout is unchanged. A splitter that is not laid out yet keeps a panel's own limits, and a handle never reports an infinite maximum.
- OutlineList: a numbered list of things to jump to (`items`, `value` / `defaultValue` / `onValueChange(item)`, `order="reversed"`, `renderItem(item, state, select)`, `empty`, a `live` row, a `trailing` node per item), generic over `OutlineItem`. It is the rows only: it has no `title` or `hint`, its heading comes from the `Panel` around it, and it is named by `aria-label` or `labels.list`. Built from the library's `List` and `ListItem`, with one tab stop (arrow keys, Home and End) from the shared roving tabindex; a row is named by its own content. The row is exported as `OutlineListItem` and is usable without the list. With factories, stories, tests and a Component Overview row.
- CueCard and HeardLine: what to say next as structured content (`sections` of `say`, `anchors`, `ask`, `caution`, `context`; pieces with a `role`, `grounding` and `source`), `mode="compact"` with `maxAnchors`, `status="pending"`, `onSourceSelect(segment)` generic over `CueSegment`, `cautionIcon`, `labels`. A line is a string with its key words marked (`**cue**`, `==evidence==`, `!!caution!!`), a list of strings and segments, or a full `CueLine`; `toCueLine` turns any form into one and `CueLineText` draws one line on its own. Anchors that follow a `say` or `ask` section are nested under it, with no heading unless they have a `label`. HeardLine draws a heard sentence (`pieces` as a string or a list of strings and `{ text, strong }`, `label`, `tone`, `maxLines`). With factories, stories, tests and Component Overview rows.
- `native` entry: exports OutlineList, CueCard, HeardLine and Splitter.
- Storybook: "Show code" for OutlineList, CueCard, HeardLine and Splitter (each story and the Component Overview rows) is the example as a consumer writes it, read from the factories file that renders it: a type that extends the library's, typed data, state and typed callbacks, composed with `Panel`, `Tag` and `Button`, with one import line from the package. The demo wrappers and `onAction` are gone from these stories.

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
