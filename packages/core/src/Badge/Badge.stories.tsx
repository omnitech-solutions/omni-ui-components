import type { Meta, StoryObj } from '@storybook/react';

import { Badge } from '@oc-tech/omni-ui-components/Badge';
import { badgePropsFactory } from 'factories/omni-ui-components/Badge/Badge.factories';

const meta: Meta<typeof Badge> = {
  title: 'omni-ui-components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Small <primary>pill-style metadata marker</primary> for <primary>statuses, labels, and categorical states</primary>.',
      },
    },
  },
  args: badgePropsFactory(),
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'secondary', 'destructive', 'outline'] },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: 'secondary', children: 'Pending' } };
export const Destructive: Story = { args: { variant: 'destructive', children: 'Blocked' } };
export const Outline: Story = { args: { variant: 'outline', children: 'Draft' } };

export const Matrix: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};
