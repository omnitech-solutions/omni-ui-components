import { Progress, type ProgressProps } from '@oc-tech/omni-ui-components/Progress';
import type { Meta, StoryObj } from '@storybook/react';
import { progressRingVariants } from 'factories/omni-ui-components/Progress/Progress.factories';

const meta: Meta<typeof Progress> = {
  title: 'omni-ui-components/Progress',
  component: Progress,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Linear <primary>progress indicator</primary> with optional status styling and percentage readout. Good for <primary>uploads, syncs, and completion tracking</primary>. `shape="ring"` is a circular indicator that fits a control icon slot: determinate with `value`, otherwise a spinning, `aria-busy` ring.',
      },
    },
  },
  args: { percent: 64 },
  argTypes: {
    shape: { control: 'inline-radio', options: ['line', 'ring'] },
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'accent', 'success', 'warning', 'danger', 'dim'],
      description: 'Ring tone.',
    },
    value: {
      control: { type: 'range', min: 0, max: 100 },
      description: 'Ring completion; unset = indeterminate.',
    },
    size: { control: { type: 'number', min: 12, max: 64 }, description: 'Ring diameter in px.' },
  },
};
export default meta;

type Story = StoryObj<typeof Progress>;
export const Default: Story = {};

export const Success: Story = { args: { percent: 100, status: 'success' } };
export const Active: Story = { args: { percent: 48, status: 'active' } };

export const RingIndeterminate: Story = { args: { shape: 'ring', tone: 'accent' } };
export const RingDeterminate: Story = {
  args: { shape: 'ring', value: 65, tone: 'accent', size: 36 },
};

export const RingMatrix: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {progressRingVariants.map((variant) => (
        <Progress key={variant.name} {...(variant.args as ProgressProps)} />
      ))}
    </div>
  ),
};
