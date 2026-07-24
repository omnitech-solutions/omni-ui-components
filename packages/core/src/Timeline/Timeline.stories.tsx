import type { Meta, StoryObj } from '@storybook/react';

import { Timeline } from '@oc-tech/omni-ui-components/Timeline';

const meta: Meta<typeof Timeline> = {
  title: 'omni-ui-components/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Vertical <primary>milestone list</primary> for <primary>activity feeds, audit trails, and process steps</primary>.',
      },
    },
  },
  args: {
    items: [
      { children: 'Contract drafted' },
      { children: 'Legal review complete' },
      { children: 'Awaiting signature' },
    ],
  },
};
export default meta;

type Story = StoryObj<typeof Timeline>;
export const Default: Story = {};

export const ColoredMarkers: Story = {
  args: {
    items: [
      { color: '#2563eb', children: 'Opened' },
      { color: '#16a34a', children: 'Approved' },
      { color: '#dc2626', children: 'Closed' },
    ],
  },
};
