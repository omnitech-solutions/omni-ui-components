import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button';
import { ConfigProvider } from './ConfigProvider';

const meta = {
  title: 'omni-ui-components/ConfigProvider',
  component: ConfigProvider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Sets the theme (`theme.mode`, brand tokens) and the text `direction` for everything inside it.',
      },
    },
  },
} satisfies Meta<typeof ConfigProvider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ConfigProvider>
      <Button>Configured content</Button>
    </ConfigProvider>
  ),
};

/** `direction="rtl"` lays its content out from right to left. */
export const RightToLeft: Story = {
  render: () => (
    <ConfigProvider direction="rtl">
      <div className="flex gap-2">
        <Button>First</Button>
        <Button variant="outline">Second</Button>
      </div>
    </ConfigProvider>
  ),
};
