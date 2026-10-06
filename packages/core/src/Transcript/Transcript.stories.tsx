import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  analysingEntries,
  answeredEntries,
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
