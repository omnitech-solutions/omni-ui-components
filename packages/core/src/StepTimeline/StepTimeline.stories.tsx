import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { StepTimeline, type StepTimelineProps } from '@oc-tech/omni-ui-components/StepTimeline';
import { failedSteps, runningSteps, stepTimelinePropsFactory } from 'factories/omni-ui-components/StepTimeline/StepTimeline.factories';

const meta: Meta<StepTimelineProps> = {
  title: 'omni-ui-components/StepTimeline',
  component: StepTimeline,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The work a reply did, from plain <primary>steps</primary> `{ id, icon, label, activeLabel, detail, state, parallel }` (`pending | running | done | failed`). <primary>summary</primary> (default): a collapsible button (spinner while running, check once done) over a list of rows. <primary>rail</primary>: a vertical dotted timeline shown while a step runs, or when opened. The summary line comes from the states and `status` (`running | waiting | stopped | done`): `Drafting a change + 1 more…`, `Waiting for your approval`, `Stopped while working`, `Used 3 tools · 4.2s`. Strings are in `labels` (functions and `{n}` templates), icons are nodes in `icons` and each step.\n\n**Callbacks**\n\n| Callback | Fires | Arguments |\n|---|---|---|\n| `onOpenChange` | the summary disclosure opens or closes, controlled or not | `(open: boolean)` |',
      },
    },
  },
  args: stepTimelinePropsFactory(),
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['summary', 'rail'],
      description: 'Summary list or vertical rail.',
    },
    status: {
      control: 'select',
      options: [undefined, 'running', 'waiting', 'stopped', 'done'],
      description: 'Overrides the derived summary state.',
    },
    steps: { control: 'object', description: 'Steps with their state.' },
    seconds: {
      control: 'number',
      description: 'Whole-run duration for the done summary.',
    },
    open: { control: 'boolean', description: 'Expanded (controlled).' },
    defaultOpen: { control: 'boolean', description: 'Initially expanded.' },
    labels: {
      control: 'object',
      description: 'Partial strings and templates.',
    },
    onOpenChange: { action: 'openChange' },
  },
  render: (args) => (
    <div className="max-w-[560px]">
      <StepTimeline {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<StepTimelineProps>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Done: the summary line, click it for the rows with the parallel tag.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Used 3 tools/ }));
    await expect(canvas.getAllByText('parallel')).toHaveLength(2);
    await expect(canvas.getByText('Drafted a change')).toBeVisible();
  },
};
export const SummaryRunning: Story = {
  args: { steps: runningSteps(), defaultOpen: true },
};
export const SummaryWaiting: Story = {
  args: { steps: runningSteps(), status: 'waiting' },
};
export const SummaryStopped: Story = {
  args: { steps: runningSteps(), status: 'stopped' },
};
export const RailRunning: Story = {
  args: { variant: 'rail', steps: runningSteps() },
  parameters: {
    docs: {
      description: {
        story: 'Rail while working: the dotted timeline is shown and the summary button is hidden.',
      },
    },
  },
};
export const RailDone: Story = {
  args: { variant: 'rail' },
  parameters: {
    docs: {
      description: {
        story: 'Rail when done: the summary button opens the timeline.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Used 3 tools/ }));
    await expect(canvas.getByText('Drafted a change')).toBeVisible();
  },
};
export const RailFailed: Story = {
  args: { variant: 'rail', steps: failedSteps(), defaultOpen: true },
};
