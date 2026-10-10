import { Composer, type ComposerProps, SendButton } from '@oc-tech/omni-ui-components/Composer';
import type { Meta, StoryObj } from '@storybook/react';
import {
  attachmentItem,
  sampleThumbnail,
} from 'factories/omni-ui-components/Attachment/Attachment.factories';
import {
  ComposerDemo,
  type ComposerDemoProps,
  composerPropsFactory,
} from 'factories/omni-ui-components/Composer/Composer.factories';
import { ArrowUp, ListPlus, Square } from 'lucide-react';
import * as React from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

const meta: Meta<ComposerDemoProps> = {
  title: 'omni-ui-components/Composer',
  component: ComposerDemo as unknown as React.ComponentType<ComposerDemoProps>,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The chat <primary>message box</primary>: an auto-growing `<textarea>` (to `maxHeight`, default 200) in a box that follows <primary>--oui-panel-see-through</primary>. Keys: <primary>Enter</primary> sends (Shift+Enter is a newline, IME composition is never interrupted), <primary>ArrowUp</primary> with the caret on the first line recalls an earlier prompt (`onRecallPrevious`), <primary>ArrowDown</primary> on the last line comes forward (`onRecallNext`) and past the newest brings back the draft you left, <primary>Cmd or Ctrl plus Up or Down</primary> recalls from anywhere, typing `/prompts ` searches saved prompts (a `CommandPopover` `source`), <primary>Esc</primary> stops a running reply. While `streaming` the round send button reads <primary>Stop (Esc)</primary> with an empty draft and <primary>Queue message</primary> with one. Variants: <primary>stacked</primary> (field over a toolbar row) and <primary>pill</primary> (one row). Everything else is a slot: `leading` (the `+` menu = ActionMenu through `PlusMenu`), `toolbar`, `trailing`, `attachments` (AttachmentStrip), `above` (QueuedList, ComposerNotice), `popover` (CommandPopover), `dictation` (DictationBar), `hint`. `Input` is a single-line `<input>` and cannot grow or hold a newline, which is why the composer is its own component; it reuses the panel Input tokens. The stories below are the demo wiring around the real parts. `A` and `Q` are your own attachment and queued item types: callbacks hand back the same objects. The host owns `value`: nothing clears it on submit.\n\n**Callbacks**\n\n| Prop | Fires when | Payload |\n| --- | --- | --- |\n| `onChange` | every edit (type, paste, recall); controlled or not | `(next: string)` |\n| `onSubmit` | Enter or send, with text, not streaming (or streaming without `onQueue`) | `({ value, attachments: A[] })`, the full attachment items |\n| `onQueue` | submit while `streaming`. Without it the send button never reads Queue | `({ value, attachments })` |\n| `onStop` | Stop button or Escape while streaming. Absent: no Stop button | none |\n| `onRecallPrevious` | ArrowUp on the first line (or Cmd/Ctrl+Up anywhere). Return the text to recall | `() => string | undefined` |\n| `onRecallNext` | ArrowDown on the last line (or Cmd/Ctrl+Down) after a recall. Nothing returned: the draft comes back | `() => string | undefined` |\n| `onFocus / onBlur` | the textarea gains or loses focus | none |\n| `onFiles` | a drop, paste or picker passed the checks. Absent: no drop, paste or picker | `(files: File[])` |\n| `onReject` | a batch was refused | `(reason)` |\n| `onRemoveAttachment` | a card’s remove button is chosen | `(attachment: A)` |\n| `onAttachmentClick` | a card body is chosen | `(attachment: A)` |\n| `onRemoveQueued` | a queued row’s remove button is chosen | `(item: Q)` |\n| `onTrigger` | a slash or mention trigger starts, its query changes, or it ends | `({ trigger: string &#124; null, query })` |\n| `onDictationStart` | the mic is chosen or the key starts. Absent: no mic | none |\n| `onDictationFinish` | Done is chosen or the key is released after a hold | `(text: string)` |\n| `onDictationCancel` | Cancel is chosen | none |\n| `PlusMenu item onClick` | a `+` menu row is chosen. A row without it is not drawn | none |\n| `ComposerNotice action.onClick` | the notice button is chosen | none |\n',
      },
    },
  },
  args: {
    variant: 'stacked',
    streaming: false,
    attachments: true,
    commands: true,
    mentions: true,
    dictation: true,
    sendOnEnter: true,
    warning: false,
    onAction: fn(),
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['stacked', 'pill'],
      description: '`stacked` or `pill` (Composer `variant`).',
    },
    streaming: {
      control: 'boolean',
      description: 'A reply is running: send becomes Stop or Queue.',
    },
    attachments: { control: 'boolean', description: 'Story-only: file picker, paste and drop.' },
    commands: { control: 'boolean', description: 'Story-only: `/` commands.' },
    mentions: { control: 'boolean', description: 'Story-only: `@` mentions (async source).' },
    dictation: {
      control: 'boolean',
      description: 'Story-only: mic, hold-to-talk key (Right ⌥) and the dictation bar.',
    },
    sendOnEnter: {
      control: 'boolean',
      description: 'Enter sends; Shift+Enter newline. Off: only the button sends.',
    },
    warning: { control: 'boolean', description: 'Story-only: the vision warning callout.' },
    initialValue: { control: 'text' },
    placeholder: { control: 'text' },
    hint: { control: 'text', description: 'Line under the box.' },
    history: { control: 'object', description: 'Story-only: earlier prompts for ArrowUp recall.' },
    onAction: {
      action: 'composer',
      description: 'Story-only: reports send, queue, stop, files, commands and dictation.',
    },
  },
  render: (args) => (
    <div className="max-w-md px-6 pt-56 pb-6">
      <ComposerDemo {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<ComposerDemoProps>;

/** Stacked: the field, then a toolbar row with the `+` menu, the mic and the send button. Send is muted until there is text. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('textbox', { name: 'Message' });
    const send = canvas.getByRole('button', { name: 'Send (Enter)' });
    await expect(send).toBeDisabled();
    await userEvent.type(box, 'Walk me through binary search');
    await expect(send).toBeEnabled();
    await userEvent.type(box, '{Shift>}{Enter}{/Shift}second line');
    await expect(box).toHaveValue('Walk me through binary search\nsecond line');
    await userEvent.keyboard('{Enter}');
    await expect(args.onAction).toHaveBeenCalledWith('send', {
      text: 'Walk me through binary search\nsecond line',
      files: [],
    });
    await expect(box).toHaveValue('');
    // ArrowUp on the empty box recalls the newest prompt, caret at the end.
    await userEvent.keyboard('{ArrowUp}');
    await expect(box).toHaveValue('Walk me through binary search\nsecond line');
  },
};

/** ArrowUp at the first line recalls, ArrowUp again goes further back, ArrowDown on the last line comes forward and past the newest restores the draft. */
export const HistoryRecall: Story = {
  args: {
    history: ['Explain two sum', 'Explain Big O of the hash map'],
    initialValue: 'half-typed idea',
  },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox', {
      name: 'Message',
    }) as HTMLTextAreaElement;
    await userEvent.click(box);
    box.setSelectionRange(box.value.length, box.value.length);
    await userEvent.keyboard('{ArrowUp}');
    await expect(box).toHaveValue('Explain Big O of the hash map');
    await userEvent.keyboard('{ArrowUp}');
    await expect(box).toHaveValue('Explain two sum');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(box).toHaveValue('half-typed idea');
  },
};

/** `/prompts ` (or the `+` menu row Saved prompts) opens the saved prompts; typing narrows them and a pick puts the text in the box. */
export const SavedPrompts: Story = {
  args: { initialValue: '/prompts ', history: [] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('textbox', { name: 'Message' });
    await userEvent.click(box);
    await userEvent.keyboard('{End}');
    await waitFor(() =>
      expect(document.querySelector('[role="listbox"][aria-label="Saved prompts"]')).not.toBeNull(),
    );
    await userEvent.type(box, 'edge');
    await waitFor(() => expect(document.querySelectorAll('[role="option"]')).toHaveLength(1));
    await userEvent.keyboard('{Enter}');
    await expect(args.onAction).toHaveBeenCalledWith('saved-prompt', 'edge');
    await expect(box).toHaveValue('List the edge cases for this problem and a test for each.');
  },
};

/** Pill: one row, the `+` menu, the field and the actions. */
export const Pill: Story = { args: { variant: 'pill' } };

/** A reply is running and the draft is empty: the send button is Stop (Esc); Escape in the box calls `onStop`. */
export const Streaming: Story = {
  args: { streaming: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Stop (Esc)' })).toBeEnabled();
    await userEvent.click(canvas.getByRole('textbox', { name: 'Message' }));
    await userEvent.keyboard('{Escape}');
    await expect(args.onAction).toHaveBeenCalledWith('stop');
  },
};

/** Typing while a reply runs turns the button into Queue message; sending adds a `Queued` row above and clears the box. */
export const QueueWhileStreaming: Story = {
  args: { streaming: true, queued: [{ id: 'q0', text: 'And the space trade-off?' }] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Message' }),
      'Then the sorted version',
    );
    await expect(canvas.getByRole('button', { name: 'Queue message' })).toBeEnabled();
    await userEvent.keyboard('{Enter}');
    await expect(args.onAction).toHaveBeenCalledWith('queue', 'Then the sorted version');
    await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(2));
  },
};

/** The vision warning callout (an image is attached and the model cannot see it) with its Switch action. */
export const CapabilityWarning: Story = {
  args: { warning: true },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Switch' }));
    await expect(args.onAction).toHaveBeenCalledWith('switch-model');
  },
};

/** Files attached already: a ready file, an upload with progress, an extraction and a failure. */
export const WithAttachmentStates: Story = {
  args: {
    initialItems: [
      attachmentItem({ id: '1', name: 'resume.pdf' }),
      attachmentItem({ id: '2', name: 'portfolio.pdf', status: 'uploading', progress: 40 }),
      attachmentItem({
        id: '3',
        name: 'screenshot.png',
        kind: 'image',
        meta: 'Image',
        previewUrl: sampleThumbnail,
      }),
      attachmentItem({
        id: '4',
        name: 'scan.pdf',
        status: 'failed',
        error: 'Could not read this PDF',
      }),
    ],
  },
};

/** Enter adds a newline and only the button sends (`sendOnEnter` off). */
export const EnterIsNewline: Story = {
  args: { sendOnEnter: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('textbox', { name: 'Message' });
    await userEvent.type(box, 'line one{Enter}line two');
    await expect(box).toHaveValue('line one\nline two');
    await expect(args.onAction).not.toHaveBeenCalledWith('send', expect.anything());
    await userEvent.click(canvas.getByRole('button', { name: 'Send (Enter)' }));
    await expect(args.onAction).toHaveBeenCalledWith('send', {
      text: 'line one\nline two',
      files: [],
    });
  },
};

/** The box grows with its text up to 200px, then scrolls inside. */
export const AutoGrow: Story = {
  args: { initialValue: Array.from({ length: 14 }, (_, i) => `line ${i + 1}`).join('\n') },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox', {
      name: 'Message',
    }) as HTMLTextAreaElement;
    await waitFor(() => expect(parseInt(box.style.height, 10)).toBeLessThanOrEqual(200));
  },
};

/** On a see-through Panel at 22% the box background follows `--oui-panel-see-through` (backgrounds only). */
export const SeeThrough: Story = {
  render: (args) => (
    <div className="p-6">
      <div
        className="box-border flex max-w-md rounded-xl p-3.5 pt-56"
        style={{ background: '#1a4f96', ['--oui-panel-see-through' as string]: 0.22 }}
      >
        <div className="w-full rounded-[14px] border border-solid border-[color:var(--oui-panel-border)] bg-[color:color-mix(in_srgb,var(--oui-panel-bg)_22%,transparent)] px-3 py-2.5">
          <ComposerDemo {...args} />
        </div>
      </div>
    </div>
  ),
};

/** The send button states on their own: idle (disabled), ready, streaming (stop), queue. */
export const SendButtonStates: StoryObj = {
  render: () => (
    <div className="flex items-center gap-3 p-6">
      {(['idle', 'ready', 'streaming', 'queue'] as const).map((state) => (
        <SendButton
          key={state}
          state={state}
          sendIcon={<ArrowUp />}
          stopIcon={<Square />}
          queueIcon={<ListPlus />}
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Stop (Esc)' })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: 'Queue message' })).toBeEnabled();
    await expect(canvas.getAllByRole('button', { name: 'Send (Enter)' })[0]).toBeDisabled();
  },
};

/** The bare Composer with plain props (no demo wiring): controlled `value`, `onChange`, `onSubmit`. */
export const Bare: StoryObj<ComposerProps> = {
  render: () => {
    const Bare = () => {
      const [value, setValue] = React.useState('');
      return (
        <div className="max-w-md p-6">
          <Composer
            {...composerPropsFactory({ value, onChange: setValue, onSubmit: () => setValue('') })}
          />
        </div>
      );
    };
    return <Bare />;
  },
};
