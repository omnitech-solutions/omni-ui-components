import { DictationBar, type DictationBarProps } from '@oc-tech/omni-ui-components/DictationBar';
import type { Meta, StoryObj } from '@storybook/react';
import { ComposerDemo } from 'factories/omni-ui-components/Composer/Composer.factories';
import { dictationBarPropsFactory } from 'factories/omni-ui-components/DictationBar/DictationBar.factories';
import * as React from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { describeHoldKey, useHoldToTalk } from '../lib';

const meta: Meta<DictationBarProps> = {
  title: 'omni-ui-components/DictationBar',
  component: DictationBar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Replaces a composer's field while the microphone is listening: a pulsing <primary>record dot</primary> (stacked variant), the <primary>live transcript</primary> or `Listening…` in a polite live region, a 20-bar CSS <primary>waveform</primary> (`aria-hidden`, decorative) and <primary>Cancel</primary> / <primary>Done</primary> buttons. Animation stops under `prefers-reduced-motion`. Pair it with <primary>useHoldToTalk</primary>: tap the key to toggle, hold it for 500 ms to talk, any other key cancels the gesture, leaving the window finishes a hold.\n\n**Callbacks**\n\n| Prop | Fires when | Payload |\n| --- | --- | --- |\n| `onCancel` | Cancel is chosen | none. Absent: no Cancel button |\n| `onDone` | Done is chosen | `(text: string)`, the transcript. Absent: no Done button |\n| `useHoldToTalk onStart` | a tap while idle, or a hold past `holdMs` | none |\n| `useHoldToTalk onFinish` | a tap while active, release after a hold, or window blur mid-hold | none |\n",
      },
    },
  },
  args: dictationBarPropsFactory({ onCancel: fn(), onDone: fn() }),
  argTypes: {
    active: { control: 'boolean', description: 'Not active: nothing renders.' },
    text: { control: 'text', description: 'The words heard so far. Empty shows `Listening…`.' },
    variant: {
      control: 'inline-radio',
      options: ['stacked', 'pill'],
      description: '`stacked` shows the record dot.',
    },
    bars: { control: 'number', description: 'Waveform bars (decorative).' },
    showActions: { control: 'boolean', description: 'Render Cancel and Done inside the bar.' },
    labels: { control: 'object', description: '{ listening, cancel, done }.' },
    onCancel: { action: 'cancel' },
    onDone: { action: 'done' },
  },
  render: (args) => (
    <div className="max-w-md p-6">
      <DictationBar {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<DictationBarProps>;

/** Nothing heard yet: `Listening…` with the pulsing dot and the waveform. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Listening…')).toBeVisible();
    await expect(canvasElement.querySelector('[data-slot="dictation-wave"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(
      canvasElement.querySelectorAll('[data-slot="dictation-wave"] > span'),
    ).toHaveLength(20);
    await userEvent.click(canvas.getByRole('button', { name: 'Done' }));
    await expect(args.onDone).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(args.onCancel).toHaveBeenCalled();
  },
};

export const LiveTranscript: Story = { args: { text: 'walk me through the two pointer approach' } };
export const Pill: Story = { args: { variant: 'pill', text: 'walk me through' } };

const KeyDemo: React.FC = () => {
  const [log, setLog] = React.useState<string[]>([]);
  const [active, setActive] = React.useState(false);
  useHoldToTalk({
    code: 'AltRight',
    enabled: true,
    active,
    onStart: () => {
      setActive(true);
      setLog((all) => [...all, 'start']);
    },
    onFinish: () => {
      setActive(false);
      setLog((all) => [...all, 'finish']);
    },
  });
  return (
    <div className="max-w-md p-6">
      <p className="text-sm">
        Tap {describeHoldKey('AltRight')} to toggle, or hold it for half a second to talk. Log:{' '}
        <output data-testid="log">{log.join(' → ') || 'none'}</output>
      </p>
      <DictationBar active={active} text={active ? 'listening…' : ''} />
    </div>
  );
};

/** The hold-to-talk hook on a real key: tap Right Option, or hold it (the story's play function drives it). */
export const HoldToTalk: StoryObj = {
  render: () => <KeyDemo />,
  play: async ({ canvasElement }) => {
    const press = (type: 'keydown' | 'keyup', code: string) =>
      window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true }));
    press('keydown', 'AltRight');
    press('keyup', 'AltRight');
    await waitFor(() =>
      expect(within(canvasElement).getByTestId('log')).toHaveTextContent('start'),
    );
    press('keydown', 'AltRight');
    press('keyup', 'AltRight');
    await waitFor(() =>
      expect(within(canvasElement).getByTestId('log')).toHaveTextContent('start → finish'),
    );
  },
};

/** Inside the composer: the bar replaces the field and the actions while listening; Done appends the words to the draft. */
export const InComposer: StoryObj = {
  render: () => (
    <div className="max-w-md p-6">
      <ComposerDemo attachments={false} commands={false} mentions={false} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Dictate/ }));
    await expect(canvasElement.querySelector('[data-slot="dictation-bar"]')).not.toBeNull();
    await expect(canvas.queryByRole('combobox', { name: 'Message' })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(canvas.getByRole('combobox', { name: 'Message' })).toBeVisible();
  },
};
