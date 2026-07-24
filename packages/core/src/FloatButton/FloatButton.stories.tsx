import type { Meta, StoryObj } from '@storybook/react';
import { Plus } from 'lucide-react';

import { FloatButton } from '@oc-tech/omni-ui-components/FloatButton';

const meta: Meta<typeof FloatButton> = {
  title: 'omni-ui-components/FloatButton',
  component: FloatButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Floating action button for <primary>persistent primary actions</primary>. The story constrains it inside a relative container so the button is visible in Storybook.',
      },
    },
  },
  args: { icon: <Plus />, 'aria-label': 'Create' },
};
export default meta;

type Story = StoryObj<typeof FloatButton>;
export const Default: Story = {
  render: (args) => (
    <div className="relative h-64 rounded border">
      <FloatButton {...args} style={{ position: 'absolute', bottom: 16, right: 16 }} />
    </div>
  ),
};

export const TextButton: Story = {
  render: (args) => (
    <div className="relative h-64 rounded border">
      <FloatButton {...args} style={{ position: 'absolute', bottom: 16, right: 16 }} icon={undefined}>
        New
      </FloatButton>
    </div>
  ),
};
