import type { Meta, StoryObj } from '@storybook/react';

import { Tag } from '@omnitech/omni-ui-core/Tag';

const meta: Meta<typeof Tag> = {
  title: 'omni-ui-components/Tag',
  component: Tag,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Compact pill surface for statuses, filters, and categorical metadata. Tags should feel lightweight and scannable, with optional dismissal when used for active filters or selections.',
      },
    },
  },
  args: { children: 'In review' },
};
export default meta;

type Story = StoryObj<typeof Tag>;
export const Default: Story = {};

export const Closable: Story = { args: { children: 'Filter', closable: true } };
export const Colored: Story = { args: { children: 'Priority', color: '#c2410c' } };

export const StatusSet: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag>Draft</Tag>
      <Tag color="#2563eb">Published</Tag>
      <Tag color="#15803d">Approved</Tag>
      <Tag color="#c2410c">Needs review</Tag>
    </div>
  ),
};
