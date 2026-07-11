import type { Meta, StoryObj } from '@storybook/react';

import { Spin } from '@omnitech/omni-ui-core/Spin';

const meta: Meta<typeof Spin> = {
  title: 'omni-ui-components/Spin',
  component: Spin,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '<primary>Loading overlay</primary> for wrapping existing content while <primary>asynchronous work</primary> is in progress.',
      },
    },
  },
  args: { spinning: true, tip: 'Loading records' },
};
export default meta;

type Story = StoryObj<typeof Spin>;
export const Default: Story = {
  render: (args) => (
    <Spin {...args}>
      <div className="h-40 rounded border p-4">Content area</div>
    </Spin>
  ),
};

export const Idle: Story = {
  args: { spinning: false, tip: undefined },
  render: (args) => (
    <Spin {...args}>
      <div className="h-40 rounded border p-4">Content area</div>
    </Spin>
  ),
};
