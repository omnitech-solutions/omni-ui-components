import { Toolbar, type ToolbarProps } from '@oc-tech/omni-ui-components/Toolbar';
import type { Meta, StoryObj } from '@storybook/react';
import {
  NativeToolbarDemo,
  type NativeToolbarDemoProps,
  toolbarLabelledVariants,
  toolbarVariants,
  WindowDotsSample,
} from 'factories/omni-ui-components/Toolbar/Toolbar.factories';
import type * as React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

/** Story-only extras: the demo state and the callback every control reports through (Actions panel). */
type StoryArgs = ToolbarProps & Partial<NativeToolbarDemoProps>;

/** The designer gallery's backdrop behind a floating toolbar (story-only chrome). */
const Backdrop: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="overflow-x-auto p-8">
    <div className="mx-auto w-max rounded-xl px-4 py-3.5" style={{ background: '#1a4f96' }}>
      {children}
    </div>
  </div>
);

const meta: Meta<StoryArgs> = {
  title: 'omni-ui-components/Toolbar',
  component: Toolbar as unknown as React.ComponentType<StoryArgs>,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A thin <primary>role="toolbar"</primary> row that gives its controls one <primary>size</primary> (36px, or 52px labelled), groups them with <primary>20px separators</primary> and offers <primary>leading</primary> / <primary>trailing</primary> slots. The stories compose the Native App toolbar from SplitButton, Button, Segmented, IconButton and ActionMenu, with working state.',
      },
    },
  },
  args: {
    label: 'Live session controls',
    size: 'control',
    separators: true,
    variant: 'floating',
    capture: { mode: 'manual' },
    mic: { status: 'listening' },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['control', 'control-labelled'],
      description: 'Control size handed to children through context.',
    },
    variant: { control: 'inline-radio', options: ['plain', 'floating', 'bar'] },
    separators: { control: 'boolean' },
    label: { control: 'text', description: 'aria-label of the toolbar.' },
    leading: { control: false },
    trailing: { control: false },
    groups: { control: false },
    capture: {
      control: 'object',
      description: 'Demo: { mode, display, analysing, problem, paused }.',
    },
    mic: { control: 'object', description: 'Demo: { status, device }.' },
    panels: { control: 'object', description: 'Demo: visible panels.' },
    style: { control: 'text', description: 'Demo: initial answer style id.' },
    onAction: {
      action: 'toolbar',
      description: 'Story-only: reports presses, menu choices, panel changes and menu open state.',
    },
  },
  render: (args) => (
    <Backdrop>
      <NativeToolbarDemo
        capture={args.capture ?? { mode: 'manual' }}
        mic={args.mic ?? { status: 'listening' }}
        panels={args.panels}
        style={args.style}
        size={args.size}
        variant={args.variant}
        separators={args.separators}
        onAction={args.onAction}
      />
    </Backdrop>
  ),
};
export default meta;

type Story = StoryObj<StoryArgs>;

export const LiveManual: Story = {};
export const LiveAuto: Story = { args: { capture: { mode: 'auto' } } };
export const Analysing: Story = { args: { capture: { mode: 'manual', analysing: true } } };
export const MicLostRetrying: Story = { args: { mic: { status: 'lost' } } };
export const ScreenPermissionLost: Story = { args: { capture: { mode: 'manual', problem: true } } };
export const MicMuted: Story = { args: { mic: { status: 'muted' } } };
export const PausedCodeHidden: Story = {
  args: {
    capture: { mode: 'manual', paused: true },
    mic: { status: 'paused' },
    panels: ['chat', 'answer'],
  },
};
export const Labelled: Story = { args: { size: 'control-labelled' } };

export const AllStates: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4 overflow-x-auto p-8">
      {[...toolbarVariants, ...toolbarLabelledVariants].map((variant) => (
        <div key={variant.name} className="flex w-max flex-col gap-1.5">
          <span className="font-mono text-[11.5px] text-[var(--oui-foreground-muted)]">
            {variant.name}
          </span>
          <div className="w-max rounded-xl px-4 py-3.5" style={{ background: '#1a4f96' }}>
            <NativeToolbarDemo {...variant.args} size={variant.args.size ?? args.size} />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const PlainGroups: Story = {
  args: { variant: 'plain' },
  render: (args) => (
    <div className="p-8">
      <Toolbar
        label={args.label}
        size={args.size}
        variant={args.variant}
        separators={args.separators}
        leading={<WindowDotsSample />}
        groups={[
          { id: 'one', label: 'Group one', children: <span className="text-sm">Group one</span> },
          { id: 'two', label: 'Group two', children: <span className="text-sm">Group two</span> },
        ]}
        trailing={<span className="text-sm">Trailing</span>}
      />
    </div>
  ),
};

/** Interaction: choose another answer style; the trigger shows the full chosen name. */
export const ChooseAnswerStyle: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByTestId('answer-style-trigger');
    await expect(trigger).toHaveTextContent('Data Structures & Algorithms');
    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitemradio', { name: 'DevOps & Infrastructure' }),
    );
    await waitFor(() => expect(trigger).toHaveTextContent('DevOps & Infrastructure'));
    await userEvent.click(trigger);
    await expect(
      await body.findByRole('menuitemradio', { name: 'DevOps & Infrastructure' }),
    ).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{Escape}');
  },
};
