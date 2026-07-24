import type { Meta, StoryObj } from '@storybook/react';

import { Watermark } from '@oc-tech/omni-ui-components/Watermark';

const meta: Meta<typeof Watermark> = {
  title: 'omni-ui-components/Watermark',
  component: Watermark,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Decorative <primary>overlay</primary> for marking <primary>sensitive or internal content</primary> with a repeated centered watermark treatment.',
      },
    },
  },
  args: { content: 'CONFIDENTIAL' },
};
export default meta;

type Story = StoryObj<typeof Watermark>;
export const Default: Story = {
  render: (args) => (
    <Watermark {...args}>
      <div className="h-40 rounded border p-4">Protected content</div>
    </Watermark>
  ),
};

export const Internal: Story = {
  args: { content: 'INTERNAL' },
  render: (args) => (
    <Watermark {...args}>
      <div className="h-40 rounded border p-4">Internal planning notes</div>
    </Watermark>
  ),
};
