import type { Meta, StoryObj } from '@storybook/react';

import { Flex } from '@omnitech/omni-ui-core/Flex';

const meta: Meta<typeof Flex> = {
  title: 'omni-ui-components/Flex',
  component: Flex,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Low-level <primary>flex layout helper</primary> that exposes <primary>direction, gap, alignment, justification, and wrapping</primary> in a concise API.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Flex>;
export const Default: Story = {
  render: () => (
    <Flex gap={12} justify="space-between">
      <div className="rounded border p-3">Left</div>
      <div className="rounded border p-3">Middle</div>
      <div className="rounded border p-3">Right</div>
    </Flex>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Flex vertical gap={12}>
      <div className="rounded border p-3">Header</div>
      <div className="rounded border p-3">Body</div>
      <div className="rounded border p-3">Footer</div>
    </Flex>
  ),
};
