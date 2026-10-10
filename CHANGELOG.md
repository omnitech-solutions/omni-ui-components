# Changelog

## Unreleased

### Added

- Splitter `overflow` (`scroll` the default, `clip`): a resizable splitter whose panels need more room than it has (kept sizes from a larger container, floors that do not fit) now scrolls along its orientation with a thin scrollbar, so the last panel is reached and no longer cut off; the root carries `data-overflow`. `clip` is the old behaviour.
- TabsBar `scrollable` (on by default): tabs that do not fit the bar's width are reached by scrolling it sideways (no scrollbar is drawn), the bar never grows past what holds it, and the chosen tab is brought into view; the bar carries `data-scrollable`. `scrollable={false}` is the old behaviour.
- Splitter `resizable`: a handle per sized panel (drag, arrow keys, Home, End, double-click or Enter to put it back), `orientation`, `sizes` / `defaultSizes` / `onSizesChange` by panel `id`, `minSize` / `maxSize`, `onResizeStart` / `onResizeEnd`, `resetKey`, `handleProps` and `labels`. The static layout is unchanged. A splitter that is not laid out yet keeps a panel's own limits, and a handle never reports an infinite maximum.
- Splitter outer edges: `edges` (`start`, `end`; needs `resizable`) draws a handle at an outer edge, slot `splitter-edge`. It resizes no panel: it reports the size wanted for whatever holds the splitter through `onExtentChange(extent, edge)` and the caller applies it. `extent` (the splitter's own measured size when absent), `minExtent` / `maxExtent`, `edgeAnchor` (`opposite`, or `centre` for twice the distance), `onExtentReset(edge)` on double-click or Enter, arrow keys by `keyboardStep`, `onResizeStart` / `onResizeEnd` with the id `edge:start` or `edge:end`, `labels.edge(edge, orientation)`, and the exported type `SplitterEdge`. With two stories that show their code (a card resized from both side edges about its centre, a stacked one from its bottom edge) and tests.
- CueCard `size` (`sm`, `md` the default, `lg`, `xl`; type `CueCardSize`): the root sets the base text size (14, 16, 19 or 22px) and carries `data-size`, and every part is sized in `em` from it, so the card scales as one. With a `Sizes` story that shows its code (a `SegmentedPrimitive` in the `Panel`'s `actions` switching the size held in state) and tests.
- CueCard `meta` (a quiet line above the sections, slot `cue-card-meta`) and `inset` (indents the card to the text column of a `HeardLine` above it). HeardLine `title`, `status` (a polite status line), `variant="boxed"` (a tinted notice), `tone="accent"` and `size` (scales with a `CueCard` of the same size); `pieces` is now optional.
- OutlineList row look: the chosen row is the only filled one (an accent bar and tint from `--oui-tone-accent-fg` / `--oui-tone-accent-bg`, a semibold label, an accent number) and carries `data-current`. A `live` row is no longer filled: its number is green and the word from `labels.live` in its meta line is green and semibold with a small dot before it. A row that is both chosen and live has the chosen fill with the green number and word.
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
