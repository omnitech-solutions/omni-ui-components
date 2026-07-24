import type { Meta, StoryObj } from '@storybook/react';

import { Empty } from '@oc-tech/omni-ui-components/Empty';

const meta: Meta<typeof Empty> = {
  title: 'omni-ui-components/Empty',
  component: Empty,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Empty state surface for <primary>blank tables, filters with no matches, and initial setup states</primary>. Supports a <primary>custom image/icon, description, and actions</primary>.',
      },
    },
  },
  args: { description: 'No matching records' },
};
export default meta;

type Story = StoryObj<typeof Empty>;
export const Default: Story = {};

export const WithAction: Story = {
  render: () => <Empty description="No projects yet"><button className="rounded border px-3 py-1.5 text-sm">Create project</button></Empty>,
};
