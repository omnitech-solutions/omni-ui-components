import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  analysingEntries,
  answeredEntries,
  answeredTurns,
  attachmentTurns,
  ConversationDemo,
  longHistoryTurns,
  failedTurns,
  stoppedTurns,
  streamingTurns,
  type ConversationDemoProps,
  codeEntries,
  ComposerExample,
  editedEntries,
  readyEntries,
  TranscriptPanel,
  userMessageEntries,
  type ComposerExampleProps,
  type TranscriptPanelProps,
} from 'factories/omni-ui-components/Transcript/Transcript.factories';

/** Story-only extras: the see-through level and the callback every control reports through (Actions panel). */
type StoryArgs = TranscriptPanelProps;

const meta: Meta<StoryArgs> = {
  title: 'omni-ui-components/Transcript',
  component: TranscriptPanel as unknown as React.ComponentType<StoryArgs>,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A config-driven <primary>live log</primary> that is the child of a <primary>Panel</primary>. `entries` is a typed union: <primary>speech</primary> (`speaker`, `tone`, `time`, `text`, `edited`, `interim`), <primary>message</primary> (your own bubble, right-aligned, max 85%) and <primary>event</primary> (a centred muted chip with a caller-supplied icon). Labels and times are plain strings. Scrolling and stick-to-bottom belong to the Panel (`scroll={{ stickToBottom: true, lines: entries.length }}`). Each bubble has a <primary>copy control</primary> on hover and keyboard focus: `onCopy(entry)` plus the controlled `copiedId` swap the label to `copiedLabel`. Text stays selectable. The composer under it is the library <primary>Input</primary> (`variant="panel"`, `actions` slot) with two IconButtons: the mic turns red only while dictating and send stays muted until there is text.',
      },
    },
  },
  args: { entries: readyEntries(), seeThrough: 1, composer: true },
  argTypes: {
    entries: {
      control: 'object',
      description: 'Typed entries: { id, kind: "speech" | "message" | "event", ... }. See the stories for each kind.',
    },
    seeThrough: {
      control: 'inline-radio',
      options: [1, 0.6, 0.22],
      description: 'Story-only: sets --oui-panel-see-through on the stage. Bubble, field and surface backgrounds only; text stays opaque.',
    },
    composer: { control: 'boolean', description: 'Story-only: show the composer dock.' },
    copiedId: { control: 'text', description: 'Id of the entry shown as copied (controlled).' },
    onAction: { action: 'transcript', description: 'Story-only: reports copy, send and mic.' },
  },
  render: (args) => (
    <div className="p-6">
      <TranscriptPanel {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<StoryArgs>;

/** Board 1d, ready state: two interviewer lines around the "no question found" event chip, composer under it. */
export const Default: Story = {};

/** Event chips: eye-off for a capture without a question, check-circle for an answered one. Icons are nodes in the entry. */
export const WithEvents: Story = {
  args: { entries: [...readyEntries(), ...answeredEntries().map((entry) => ({ ...entry, id: `x-${entry.id}` }))] },
};

/** A merged phrase flagged `edited` shows the quiet tag by the updated time; the last line is interim (dimmed, italic). */
export const EditedBubble: Story = { args: { entries: editedEntries() } };

/** Your own messages: right-aligned, accent tint, at most 85% wide, no label. */
export const UserMessages: Story = { args: { entries: userMessageEntries() } };

/** Hover or focus a bubble to see its copy control; the second bubble is shown already copied. */
export const CopyPerBubble: Story = {
  args: { entries: analysingEntries(), copiedId: 'b' },
  /** Interaction: the control is tabbable, Enter calls `onCopy` and the label becomes Copied (the demo sets `copiedId`). */
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const first = canvasElement.querySelector('[data-slot="transcript-speech"]') as HTMLElement;
    const button = within(first).getByRole('button', { name: 'Copy' });
    await expect(button).toHaveClass('opacity-0');
    await userEvent.tab();
    await userEvent.tab();
    await waitFor(() => expect(button).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(within(first).getByRole('button', { name: 'Copied' })).toBeVisible());
    await expect(args.onAction).toBeDefined();
    await expect(canvas.getAllByRole('button', { name: 'Copied' }).length).toBeGreaterThan(0);
  },
};

/**
 * Code in a reply: turn on `fences` and the three-backtick blocks in `entry.text` become code blocks with a
 * language label and their own copy control (the bubble's own copy still copies the whole raw text). Long lines
 * scroll sideways; `wrapCode` wraps them. Highlighting is a slot (`renderCode`), not a dependency.
 */
export const CodeBlocks: Story = {
  args: { entries: codeEntries(), fences: true, height: 460 },
  /** Interaction: the code control copies only the code and reads Copied; the bubble's raw text is untouched. */
  play: async ({ canvasElement }) => {
    const code = canvasElement.querySelector('[data-slot="transcript-code"]') as HTMLElement;
    await expect(code).toBeVisible();
    await expect(within(code).getByText('ts')).toBeVisible();
    await userEvent.click(within(code).getByRole('button', { name: 'Copy code' }));
    await waitFor(() => expect(within(code).getByRole('button', { name: 'Copied' })).toBeVisible());
  },
};

/**
 * Syntax highlighting: pass a highlighter (`highlight={highlightLines}`: lowlight / highlight.js grammars, tokens painted from
 * the `--oui-code-*` tokens so light and dark follow the theme). Without it the code stays plain, and the grammars are never imported.
 */
export const HighlightedCodeBlocks: Story = { args: { entries: codeEntries(), fences: true, highlight: true, height: 460 } };

/** Highlighting with a line-number gutter (not selectable, so copy stays clean). */
export const HighlightedWithLineNumbers: Story = {
  args: { entries: codeEntries(), fences: true, highlight: true, codeLineNumbers: true, height: 460 },
};

/** The same reply with `wrapCode`: long lines wrap instead of scrolling. */
export const CodeBlocksWrapped: Story = { args: { entries: codeEntries(), fences: true, wrapCode: true, height: 520, width: 300 } };

/** Without `fences` the same text stays plain: opt in per host. */
export const FencesOff: Story = { args: { entries: codeEntries(), fences: false, height: 460 } };

/** See-through at 22%: bubbles, panel, dock and the composer field all follow the token; text and icons stay opaque. */
export const SeeThrough: Story = { args: { entries: analysingEntries(), seeThrough: 0.22 } };

// ---------------------------------------------------------------------------------------------------------------
// Composer: Input (variant "panel", `actions` slot) + two IconButtons. Not a component of its own.
// ---------------------------------------------------------------------------------------------------------------

const composerMeta = {
  args: { initialValue: '', dictating: false },
  argTypes: {
    initialValue: { control: 'text', description: 'Story-only: text at the start. Empty keeps Send muted.' },
    dictating: { control: 'boolean', description: 'Story-only: the mic is listening (danger tone, pressed).' },
    onAction: { action: 'composer', description: 'Story-only: reports send and mic.' },
  },
};

const ComposerStage: React.FC<ComposerExampleProps & { seeThrough?: number }> = ({ seeThrough = 1, ...props }) => (
  <div className="p-6">
    <div
      className="box-border flex w-[330px] rounded-xl p-3.5"
      style={{ background: '#1a4f96', ['--oui-panel-see-through' as string]: seeThrough }}
    >
      <div className="w-full rounded-[14px] border border-solid border-[color:var(--oui-panel-border)] bg-[color:var(--oui-panel-bg)] px-3 py-2.5">
        <ComposerExample {...props} />
      </div>
    </div>
  </div>
);

/** Composer, empty: the mic is neutral and Send is muted (disabled) until there is text. */
export const ComposerEmpty: StoryObj<ComposerExampleProps> = {
  ...composerMeta,
  render: (args) => <ComposerStage {...args} />,
};

/** Composer, typing: Send takes the accent tone and works (click or Enter). */
export const ComposerTyping: StoryObj<ComposerExampleProps> = {
  ...composerMeta,
  args: { ...composerMeta.args, initialValue: 'Assume the input is sorted' },
  render: (args) => <ComposerStage {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeEnabled();
  },
};

/** Composer, dictating: the mic turns red and pressed only while dictating. */
export const ComposerDictating: StoryObj<ComposerExampleProps> = {
  ...composerMeta,
  args: { ...composerMeta.args, dictating: true },
  render: (args) => <ComposerStage {...args} />,
};

/** The composer on a see-through panel at 22%: the field follows `--oui-panel-see-through` (backgrounds only). */
export const ComposerSeeThrough: StoryObj<ComposerExampleProps & { seeThrough?: number }> = {
  ...composerMeta,
  args: { ...composerMeta.args, seeThrough: 0.22 },
  render: (args) => <ComposerStage {...args} />,
};

/** Interaction: Send is muted while empty, typing enables it, the mic toggles pressed, Enter sends and clears. */
export const ComposerInteraction: StoryObj<ComposerExampleProps> = {
  ...composerMeta,
  args: { ...composerMeta.args, onAction: fn() },
  render: (args) => <ComposerStage {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const send = canvas.getByRole('button', { name: 'Send' });
    const mic = canvas.getByRole('button', { name: 'Dictate' });
    await expect(send).toBeDisabled();
    await userEvent.type(canvas.getByRole('textbox', { name: 'Message' }), 'Hello');
    await expect(send).toBeEnabled();
    await userEvent.click(mic);
    await expect(mic).toHaveAttribute('aria-pressed', 'true');
    await expect(mic).toHaveAttribute('data-tone', 'danger');
    await userEvent.click(send);
    await expect(args.onAction).toHaveBeenCalledWith('send', 'Hello');
    await expect(send).toBeDisabled();
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Conversation mode: `turns` (from `buildTurns(messages, runs)`), slots for the parts built elsewhere, a Composer dock.
// ---------------------------------------------------------------------------------------------------------------

const conversationMeta = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Set <primary>turns</primary> and the Transcript draws a <primary>conversation</primary> (`role="log"`, `aria-live="polite"`): per turn the question (attachment chips, bubble, hover actions) then the assistant reply. The parts built elsewhere plug into <primary>slots</primary> (`slots.timeline`, `thinking`, `sources`, `actions`, `suggestions`, `approvalsBefore`/`approvalsAfter`, `error`, `versions`, `summaryDivider`) and the text goes through `renderMarkdown`. Scrolling stays with the Panel: pass `scroll={conversationScroll(turns, liveText)}`. `Transcript<T, U, V, A>` is generic over your entry, turn, version and attachment types: every callback and slot gets the same object back, never a copy.\n\n**Callbacks**\n\n| Prop | Fires when | Payload |\n| --- | --- | --- |\n| `onCopy` | a bubble’s copy control (entries mode) | `(entry: T)` |\n| `onCopyCode` | a code block’s copy control | `(block, entry: T, index)` |\n| `onCopyUser` | a question’s copy button (turns mode). Absent: no button | `(turn: U)` |\n| `onLoadEarlier` | `Load previous messages` is chosen (with `windowSize` set: once every turn in memory is drawn). Absent: no button | `(oldest: U &#124; undefined)` |\n| `onEditStart` | the edit button is chosen (the editor opens itself when uncontrolled) | `(turn: U)` |\n| `onEditChange` | the editor text changes; controlled or not | `(next: string)` |\n| `onEditSubmit` | Send or Enter in the editor | `(turn: U, text: string)` |\n| `onEditCancel` | Cancel or Escape in the editor | `(turn: U)` |\n| `onRetry` | the default error’s Retry, or `context.retry()` from a slot | `(turn: U)` |\n| `onRegenerate` | `context.regenerate()` from a slot | `(turn: U)` |\n| `onSelectVersion` | the question’s pager, or `context.selectVersion(v)` from a slot | `(turn: U, version: V)` |\n| `onAttachmentClick` | an attachment chip on a question is chosen | `(attachment: A)` |\n| `onAtEndChange` | the scrolling ancestor moves to or from the end (within `atEndThreshold`, default 200) | `(atEnd: boolean)` |\n',
      },
    },
  },
  args: { turns: answeredTurns(), busy: false, composer: true, readOnly: false, hasEarlier: false, empty: false, approval: false, seeThrough: 1 } as ConversationDemoProps,
  argTypes: {
    turns: { control: 'object', description: '`ConversationTurn[]`: { id, user, answer?, run? }. Build them with `buildTurns(messages, runs)`.' },
    busy: { control: 'boolean', description: 'A reply is running: the last turn streams (the demo feeds `live.text` word by word).' },
    waiting: { control: 'boolean', description: 'The run waits for an approval: the last turn is not running.' },
    liveText: { control: 'text', description: 'Story-only: the text streamed while busy.' },
    composer: { control: 'boolean', description: 'Story-only: show the Composer dock.' },
    readOnly: { control: 'boolean', description: 'A shared transcript: no edit, copy, actions, versions, approvals or follow-ups.' },
    hasEarlier: { control: 'boolean', description: 'Show the `Load previous messages` button (`onLoadEarlier`).' },
    empty: { control: 'boolean', description: 'Story-only: no turns, so the `empty` slot shows.' },
    editingId: { control: 'text', description: '`editingId`: id of the turn whose question is being edited.' },
    approval: { control: 'boolean', description: 'Story-only: a pending approval after the last turn (`slots.approvalsAfter`).' },
    seeThrough: { control: 'inline-radio', options: [1, 0.6, 0.22], description: 'Story-only: `--oui-panel-see-through`.' },
    attachmentVariant: { control: 'inline-radio', options: ['chip', 'card'], description: '`attachmentVariant`: how a sent question shows its files, read-only. `chip` (default) or `card`.' },
    onAction: { action: 'conversation', description: 'Story-only: reports edit, copy, retry, suggestions, queue and send.' },
  },
  render: (args: ConversationDemoProps) => (
    <div className="p-6">
      <ConversationDemo {...args} />
    </div>
  ),
};

type ConversationStory = StoryObj<ConversationDemoProps>;

/** A finished chat in a Panel: attachment chip, tool timeline, thinking, Markdown with a cited code block, sources, version pagers, action bar, follow-ups and the composer. */
export const Conversation: ConversationStory = {
  ...conversationMeta,
  play: async ({ canvasElement }) => {
    const log = within(canvasElement).getByRole('log', { name: 'Conversation' });
    await expect(log).toHaveAttribute('aria-live', 'polite');
    await expect(canvasElement.querySelectorAll('[data-slot="transcript-turn"]')).toHaveLength(2);
    await expect(within(log).getAllByText('two-sum-notes.md')[0]).toBeVisible();
    await expect(within(log).getByText(/Time is/)).toBeVisible();
  },
};

/** The newest turn is running: live text with the blinking caret, the timeline reads running, no action bar or follow-ups yet. */
export const ConversationStreaming: ConversationStory = {
  ...conversationMeta,
  args: { ...conversationMeta.args, turns: streamingTurns(), busy: true },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector('[data-slot="transcript-cursor"], [data-slot="markdown"] [data-slot="markdown-cursor"]')).not.toBeNull());
    await expect(canvasElement.querySelector('[data-status="running"]')).not.toBeNull();
  },
};

/** Edit and resend: Enter sends the edited text as a new version, Esc cancels and focus returns to the edit button; Send is disabled when empty. */
export const ConversationEditing: ConversationStory = {
  ...conversationMeta,
  args: { ...conversationMeta.args, composer: false, onAction: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvasElement.querySelector('[data-turn-id="u2"]') as HTMLElement);
    const editButton = () => within(canvasElement.querySelector('[data-turn-id="u2"]') as HTMLElement).getByRole('button', { name: 'Edit and resend' });
    await userEvent.click(editButton());
    const box = canvas.getByRole('textbox', { name: 'Edit message' });
    await expect(box).toHaveFocus();
    await userEvent.clear(box);
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeDisabled();
    await userEvent.type(box, 'What about negative numbers?');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('textbox', { name: 'Edit message' })).toBeNull());
    await waitFor(() => expect(editButton()).toHaveFocus());
    await userEvent.click(editButton());
    const again = canvas.getByRole('textbox', { name: 'Edit message' });
    await userEvent.clear(again);
    await userEvent.type(again, 'Same question again{Enter}');
    await expect(args.onAction).toHaveBeenCalledWith('edit-submit', { id: 'u2', text: 'Same question again' });
  },
};

/** The question open in the editor, as it first appears. */
export const ConversationEditorOpen: ConversationStory = {
  ...conversationMeta,
  args: { ...conversationMeta.args, composer: false, editingId: 'u2' },
};

/** A failed run: the `error` slot (the ErrorCard) with Retry; the question stays and no assistant block is drawn. */
export const ConversationFailed: ConversationStory = {
  ...conversationMeta,
  args: { ...conversationMeta.args, turns: failedTurns(), onAction: fn() },
  play: async ({ canvasElement, args }) => {
    const retry = within(canvasElement).getByRole('button', { name: /retry/i });
    await userEvent.click(retry);
    await expect(args.onAction).toHaveBeenCalledWith('retry', 'u2');
  },
};

/** A cancelled run: the partial text, the stopped banner, and the action bar (copy still works). */
export const ConversationStopped: ConversationStory = {
  ...conversationMeta,
  args: { ...conversationMeta.args, turns: stoppedTurns() },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Stopped. Nothing has been applied.')).toBeVisible();
  },
};

/** The run waits for an approval: the last turn is not running (no caret) and the pending ApprovalCard follows it. */
export const ConversationApproval: ConversationStory = {
  ...conversationMeta,
  args: { ...conversationMeta.args, turns: streamingTurns(), busy: true, waiting: true, approval: true },
};

/** A shared, read-only transcript: no hover actions, no edit, no action bar, no follow-ups. Reading parts stay. */
export const ConversationReadOnly: ConversationStory = {
  ...conversationMeta,
  args: { ...conversationMeta.args, readOnly: true, composer: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="transcript-edit"]')).toBeNull();
    await expect(canvasElement.querySelector('[data-slot="transcript-user-actions"]')).toBeNull();
  },
};

/** No turns and nothing running: the `empty` slot (an empty state, or a "no longer shared" notice). */
/** A sent question with its files as read-only cards (`attachmentVariant="card"`): thumbnail, name, status line ("Uploading…", "Not sent"), no remove button; choosing one calls `onAttachmentClick`. */
export const ConversationAttachmentCards: ConversationStory = {
  ...conversationMeta,
  args: { ...conversationMeta.args, turns: attachmentTurns(), attachmentVariant: 'card', composer: false, onAction: fn() },
  play: async ({ canvasElement, args }) => {
    const log = within(canvasElement).getByRole('log', { name: 'Conversation' });
    await expect(within(log).queryByRole('button', { name: /^Remove/ })).toBeNull();
    await expect(within(log).getByText('Not sent')).toBeVisible();
    await userEvent.click(within(log).getByRole('button', { name: /whiteboard\.png/ }));
    await expect(args.onAction).toHaveBeenCalledWith('attachment', 'att-2');
  },
};

export const ConversationEmpty: ConversationStory = { ...conversationMeta, args: { ...conversationMeta.args, empty: true } };

/** Older messages exist: `Load previous messages` sits at the top and reports `onLoadEarlier`. */
export const ConversationLoadEarlier: ConversationStory = {
  ...conversationMeta,
  args: { ...conversationMeta.args, hasEarlier: true, onAction: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Load previous messages' }));
    await expect(args.onAction).toHaveBeenCalledWith('load-earlier', 'u1');
  },
};

/** Three thousand turns, only the newest 40 drawn. `Load previous messages` reveals 40 more and the reading position stays put; the jump pill and stick-to-bottom work as usual. */
export const ConversationLongHistory: ConversationStory = {
  ...conversationMeta,
  args: { ...conversationMeta.args, turns: longHistoryTurns(3000), windowSize: 40, windowStep: 40, composer: false, onAction: fn() },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-slot="transcript-turn"]')).toHaveLength(40);
    await expect(within(canvasElement).getByRole('button', { name: 'Load previous messages' })).toBeEnabled();
  },
};

/** The same chat on a see-through Panel at 22%: bubbles, field and surfaces follow the token. */
export const ConversationSeeThrough: ConversationStory = { ...conversationMeta, args: { ...conversationMeta.args, seeThrough: 0.22 } };
