import type { Meta, StoryObj } from '@storybook/react';

import { Descriptions } from '@omnitech/omni-ui-core/Descriptions';

const meta: Meta<typeof Descriptions> = {
  title: 'omni-ui-components/Descriptions',
  component: Descriptions,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Structured <primary>key-value display</primary> for <primary>record summaries, profile details, and readonly metadata</primary>. Use columns to tune density.',
      },
    },
  },
  args: {
    title: 'Record summary',
    items: [
      { label: 'Owner', children: 'Alex Morgan' },
      { label: 'Status', children: 'Active' },
      { label: 'Region', children: 'North America' },
      { label: 'Renewal', children: '2026-10-01' },
    ],
  },
};
export default meta;

type Story = StoryObj<typeof Descriptions>;
export const Default: Story = {};

export const SingleColumn: Story = {
  args: {
    columns: 1,
    items: [
      { label: 'Account owner', children: 'Alex Morgan' },
      { label: 'Plan', children: 'Enterprise' },
      { label: 'Next renewal', children: 'October 1, 2026' },
    ],
  },
};
