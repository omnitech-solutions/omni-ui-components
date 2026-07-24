import type { Meta, StoryObj } from '@storybook/react';

import { Skeleton } from '@oc-tech/omni-ui-components/Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'omni-ui-components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Animated <primary>placeholder block</primary> for <primary>loading states</primary>. Combine multiple skeletons to mock text, media, or card layouts.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Skeleton>;
export const Default: Story = { args: { className: 'h-6 w-48' } };

export const CardScaffold: Story = {
  render: () => (
    <div className="space-y-3 rounded border p-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  ),
};
