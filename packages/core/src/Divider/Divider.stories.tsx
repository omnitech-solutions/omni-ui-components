import type { Meta, StoryObj } from '@storybook/react';

import { Divider } from '@omnitech/omni-ui-core/Divider';

const meta: Meta<typeof Divider> = {
  title: 'omni-ui-components/Divider',
  component: Divider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal or vertical <primary>separator</primary> for <primary>grouping adjacent content</primary>, with optional centered label text.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Divider>;

export const Default: Story = {};
export const WithLabel: Story = { args: { children: 'OR' } };
export const Vertical: Story = {
  render: () => (
    <div className="flex h-20 items-center gap-4">
      <span>Left</span>
      <Divider orientation="vertical" className="h-full" />
      <span>Right</span>
    </div>
  ),
};
