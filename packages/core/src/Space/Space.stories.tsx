import type { Meta, StoryObj } from '@storybook/react';

import { Space } from '@oc-tech/omni-ui-components/Space';

const meta: Meta<typeof Space> = {
  title: 'omni-ui-components/Space',
  component: Space,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Convenience <primary>stack/inline layout wrapper</primary> for <primary>evenly spacing sibling elements</primary> without writing flex utility classes repeatedly.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Space>;
export const Default: Story = {
  render: () => (
    <Space>
      <div className="rounded border p-3">One</div>
      <div className="rounded border p-3">Two</div>
      <div className="rounded border p-3">Three</div>
    </Space>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Space direction="vertical">
      <div className="rounded border p-3">One</div>
      <div className="rounded border p-3">Two</div>
      <div className="rounded border p-3">Three</div>
    </Space>
  ),
};
