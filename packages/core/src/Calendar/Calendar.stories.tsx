import type { Meta, StoryObj } from '@storybook/react';
import { Calendar } from './Calendar';

const meta = {
  title: 'omni-ui-components/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A month grid for choosing a day, several days or a range (`mode`). It takes the props of `react-day-picker`.',
      },
    },
  },
} satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { mode: 'single', defaultMonth: new Date(2026, 9, 1), selected: new Date(2026, 9, 9) },
};

/** `mode="range"` selects a first and a last day. */
export const Range: Story = {
  args: {
    mode: 'range',
    defaultMonth: new Date(2026, 9, 1),
    selected: { from: new Date(2026, 9, 5), to: new Date(2026, 9, 9) },
  },
};
