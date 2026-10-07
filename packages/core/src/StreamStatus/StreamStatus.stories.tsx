import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { StreamStatus, type StreamStatusProps } from '@oc-tech/omni-ui-components/StreamStatus';
import { streamStatusPropsFactory, streamStatusVariants } from 'factories/omni-ui-components/StreamStatus/StreamStatus.factories';

const meta: Meta<StreamStatusProps> = {
  title: 'omni-ui-components/StreamStatus',
  component: StreamStatus,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'One status line for a streaming reply: <primary>a tool call</primary> (`Calling X…`, `X completed`, `X failed`), <primary>reasoning</primary> (`Reasoning…`) or a <primary>stall</primary> notice, with an `mm:ss` elapsed timer. The timer starts when the component mounts, or at `startedAt`, and stops once a tool call completes or fails. It is a polite live region (`role="status"`) and the timer is not announced. Every string is in `labels`; the icon is a `ReactNode`. Callbacks: none.',
      },
    },
  },
  args: { ...streamStatusPropsFactory() },
  argTypes: {
    kind: { control: 'inline-radio', options: ['tool', 'reasoning', 'stall'] },
    toolName: { control: 'text' },
    status: { control: 'inline-radio', options: ['running', 'completed', 'failed'] },
    message: { control: 'text', description: 'Replaces the generated text.' },
    startedAt: { control: 'number', description: 'Epoch ms the activity began. Default: mount time.' },
    hideTimer: { control: 'boolean' },
    labels: { control: 'object', description: 'Every string (partial): calling, completed, failed, unnamedTool, reasoning, stall.' },
  },
  render: (args) => (
    <div className="p-6">
      <StreamStatus {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<StreamStatusProps>;

/** A running tool call with a ticking timer. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole('status');
    await expect(status).toHaveTextContent('Calling search_docs…');
    await expect(status).toHaveTextContent('00:0');
  },
};

export const Completed: Story = { args: { status: 'completed' } };
export const Failed: Story = { args: { status: 'failed' } };
export const Reasoning: Story = { args: { kind: 'reasoning', toolName: undefined } };
export const Stall: Story = { args: { kind: 'stall', toolName: undefined } };

/** Started 95 seconds ago. */
export const LongRunning: Story = { args: { startedAt: Date.now() - 95_000 } };

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-2 p-6">
      {streamStatusVariants.map((variant) => (
        <StreamStatus key={variant.name} {...streamStatusPropsFactory(variant.args)} />
      ))}
    </div>
  ),
};
