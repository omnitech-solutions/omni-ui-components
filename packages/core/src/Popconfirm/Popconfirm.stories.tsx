import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@oc-tech/omni-ui-components/Button';
import { Popconfirm } from '@oc-tech/omni-ui-components/Popconfirm';

const meta: Meta<typeof Popconfirm> = {
  title: 'omni-ui-components/Popconfirm',
  component: Popconfirm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Confirmation popover for <primary>destructive or irreversible actions</primary>. It wraps a trigger and shows a <primary>lightweight confirm/cancel decision surface</primary>.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Popconfirm>;
export const Default: Story = {
  render: () => (
    <Popconfirm title="Delete record?" description="This cannot be undone.">
      <Button variant="destructive">Delete</Button>
    </Popconfirm>
  ),
};

export const Archive: Story = {
  render: () => (
    <Popconfirm title="Archive project?" description="You can restore it later from archives." confirmText="Archive">
      <Button variant="outline">Archive</Button>
    </Popconfirm>
  ),
};
