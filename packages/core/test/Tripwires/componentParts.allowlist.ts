import type { ComponentPart, KnownGap, WidgetPart } from './componentParts';

/**
 * THE ONE ALLOW-LIST of `componentParts.test.ts`: every component and dynamic-form widget that is missing a
 * mandatory part TODAY. Recorded 2026-10-10, when the tripwire was added, so that the suite is green and the debt
 * is written down in one place. The rules themselves are not weakened by this file.
 *
 * - A NEW component or widget is never added here: it ships with its parts (README, "The mandatory parts of
 *   every component"). The test fails for any gap that is not on this list.
 * - A line is REMOVED when its debt is paid (the story, the Docs page or the test is written). The test also
 *   fails for a line whose gap no longer exists, so the list cannot outlive the debt.
 * - No placeholder story or test is written to shorten the list.
 *
 * `missing` is what the tripwire found absent; `since` is the day the folder was first committed
 * (`git log --diff-filter=A -- <folder>`), which is how long the gap has existed.
 */

/** Components of the public entry point (`packages/core/src/index.ts`). 20 lines: 10 tests, 8 `Default` stories, 2 for Highlight. */
export const KNOWN_COMPONENT_GAPS: KnownGap<ComponentPart>[] = [
  // --- No test file under `packages/core/test/<Name>/` (10). ---
  { name: 'Alert', missing: 'test', since: '2026-07-11' },
  { name: 'BackTop', missing: 'test', since: '2026-07-28' },
  { name: 'Cascader', missing: 'test', since: '2026-07-28' },
  { name: 'Drawer', missing: 'test', since: '2026-07-11' },
  { name: 'Dropdown', missing: 'test', since: '2026-07-11' },
  { name: 'Icon', missing: 'test', since: '2026-10-06' },
  { name: 'Masonry', missing: 'test', since: '2026-07-28' },
  { name: 'MultiSelect', missing: 'test', since: '2026-07-10' },
  { name: 'Upload', missing: 'test', since: '2026-07-28' },
  {
    name: 'Util',
    missing: 'test',
    since: '2026-07-28',
    note: 'Three helpers (`warning`, `isNil`, `clamp`), not a component, but a public export with behaviour.',
  },

  // --- Stories exist, but none is named `Default` (8). 120 of the 128 components with stories have one. ---
  // Whether these are renamed or the rule is dropped for state-named sets is the owner's decision: see
  // `bionic/briefs/BRIEF-bionic-docs-and-skills-audit.md`, "Needs the owner's decision".
  {
    name: 'ActionMenu',
    missing: 'default-story',
    since: '2026-10-06',
    note: 'First story: CaptureModes.',
  },
  {
    name: 'ApprovalCard',
    missing: 'default-story',
    since: '2026-10-06',
    note: 'First story: Pending.',
  },
  {
    name: 'ConversationTranscript',
    missing: 'default-story',
    since: '2026-10-07',
    note: 'First story: ChatReply.',
  },
  {
    name: 'CurrencyInput',
    missing: 'default-story',
    since: '2026-07-10',
    note: 'First story: USD.',
  },
  {
    name: 'Panel',
    missing: 'default-story',
    since: '2026-10-06',
    note: 'First story: ReadyNothingAnalysed.',
  },
  { name: 'SessionBar', missing: 'default-story', since: '2026-10-06', note: 'First story: Live.' },
  {
    name: 'StatusClock',
    missing: 'default-story',
    since: '2026-10-06',
    note: 'First story: Live.',
  },
  {
    name: 'Toolbar',
    missing: 'default-story',
    since: '2026-10-06',
    note: 'First story: LiveManual.',
  },

  // --- Highlight (`TokenLines`, `createHighlighter`): tested, but it has no story of its own, so no Docs page
  // and no overview row either. It is shown only inside Markdown, DiffReview and Transcript stories. ---
  { name: 'Highlight', missing: 'overview', since: '2026-10-06' },
  { name: 'Highlight', missing: 'stories', since: '2026-10-06' },
];

/**
 * Widgets of `appWidgets` (`dynamic-form/registries/widgets.ts`). 12 lines, all the same gap: no test file under
 * `packages/core/src/dynamic-form` names the widget. All 26 widgets are registered and have stories with a Docs
 * page; the other 14 have a `DynamicForm.<widget>.test.tsx`.
 */
export const KNOWN_WIDGET_GAPS: KnownGap<WidgetPart>[] = [
  { name: 'ColorWidget', missing: 'test', since: '2026-07-10' },
  { name: 'CurrencyWidget', missing: 'test', since: '2026-07-10' },
  { name: 'DateTimeWidget', missing: 'test', since: '2026-07-10' },
  { name: 'FileUploadWidget', missing: 'test', since: '2026-07-10' },
  { name: 'HiddenWidget', missing: 'test', since: '2026-07-10' },
  { name: 'InputOTPWidget', missing: 'test', since: '2026-07-10' },
  { name: 'MultiSelectWidget', missing: 'test', since: '2026-07-10' },
  { name: 'NumberInputWidget', missing: 'test', since: '2026-07-10' },
  { name: 'PhoneWidget', missing: 'test', since: '2026-07-10' },
  { name: 'RichTextWidget', missing: 'test', since: '2026-07-10' },
  { name: 'TagInputWidget', missing: 'test', since: '2026-07-10' },
  { name: 'TimeWidget', missing: 'test', since: '2026-07-10' },
];
