import type { Meta, StoryObj } from '@storybook/react';

import { Progress } from '@oc-tech/omni-ui-components/Progress';

const meta: Meta<typeof Progress> = {
  title: 'omni-ui-components/Progress',
  component: Progress,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Linear <primary>progress indicator</primary> with optional status styling and percentage readout. Good for <primary>uploads, syncs, and completion tracking</primary>.',
      },
    },
  },
  args: { percent: 64 },
};
export default meta;

type Story = StoryObj<typeof Progress>;
export const Default: Story = {};

export const Success: Story = { args: { percent: 100, status: 'success' } };
export const Active: Story = { args: { percent: 48, status: 'active' } };
